/**
 * Encodes a decoded AudioBuffer as a 16-bit PCM mono WAV Blob.
 * AssemblyAI's Dictation API only accepts WAV or raw PCM, so recordings
 * captured via MediaRecorder (webm/opus) must be decoded and re-encoded
 * before upload.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1; // downmix to mono for a smaller, simpler upload
  const sampleRate = buffer.sampleRate;
  const channelData = buffer.getChannelData(0);
  const length = channelData.length;

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

const TARGET_SAMPLE_RATE = 16000; // speech-quality; keeps uploads well under the server body limit

/** Resample an AudioBuffer to mono 16kHz using OfflineAudioContext. */
async function resampleToMono16k(buffer: AudioBuffer): Promise<AudioBuffer> {
  if (buffer.sampleRate === TARGET_SAMPLE_RATE && buffer.numberOfChannels === 1) {
    return buffer;
  }
  const length = Math.ceil((buffer.duration * TARGET_SAMPLE_RATE));
  const offlineCtx = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  return offlineCtx.startRendering();
}

export async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const resampled = await resampleToMono16k(audioBuffer);
    return audioBufferToWav(resampled);
  } finally {
    audioContext.close();
  }
}

/**
 * Splits a mono 16-bit PCM WAV blob into multiple valid WAV blobs of at most
 * `chunkSeconds` each. AssemblyAI's Dictation API caps each request at 120s of
 * audio, so long recordings are transcribed chunk by chunk.
 */
export async function sliceWavBlob(wavBlob: Blob, chunkSeconds: number): Promise<Blob[]> {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const view = new DataView(arrayBuffer);
  const sampleRate = view.getUint32(24, true);
  const blockAlign = view.getUint16(32, true);
  const dataSize = view.getUint32(40, true);

  const bytesPerChunk = Math.floor(chunkSeconds * sampleRate) * blockAlign;
  if (dataSize <= bytesPerChunk) {
    return [wavBlob];
  }

  const header = new Uint8Array(arrayBuffer.slice(0, 44));
  const chunks: Blob[] = [];
  for (let offset = 0; offset < dataSize; offset += bytesPerChunk) {
    const size = Math.min(bytesPerChunk, dataSize - offset);
    const chunkHeader = new Uint8Array(header); // copy
    const headerView = new DataView(chunkHeader.buffer);
    headerView.setUint32(4, 36 + size, true);
    headerView.setUint32(40, size, true);
    const data = arrayBuffer.slice(44 + offset, 44 + offset + size);
    chunks.push(new Blob([chunkHeader, data], { type: 'audio/wav' }));
  }
  return chunks;
}

const CHUNK_SECONDS = 100; // stay safely under AssemblyAI's 120s-per-request cap

/**
 * Transcribes a WAV blob of any length by slicing it into <=100s chunks and
 * transcribing them sequentially, joining the resulting text.
 */
export async function transcribeWavInChunks(
  wavBlob: Blob,
  transcribeChunk: (audioBase64: string) => Promise<{ transcript: string }>,
  onProgress?: (done: number, total: number) => void
): Promise<string> {
  const chunks = await sliceWavBlob(wavBlob, CHUNK_SECONDS);
  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i, chunks.length);
    const audioBase64 = await blobToBase64(chunks[i]);
    const { transcript } = await transcribeChunk(audioBase64);
    if (transcript?.trim()) {
      parts.push(transcript.trim());
    }
    onProgress?.(i + 1, chunks.length);
  }
  return parts.join(' ');
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the "data:...;base64," prefix
      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
