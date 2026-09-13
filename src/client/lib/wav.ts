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
