const DICTATION_URL = 'https://dictation.assemblyai.com/v1/transcribe/live';

export class TranscriptionError extends Error {}

interface DictationResult {
  text: string;
  llm_response: string | null;
  llm_error: string | null;
  audio_duration_ms: number;
}

/**
 * Sends a WAV audio buffer to the AssemblyAI Dictation API and returns the
 * cleaned-up transcript (falling back to the verbatim transcript if the
 * rewrite step failed).
 */
export async function transcribeAudioWav(audioBuffer: Buffer, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new TranscriptionError('Speech-to-text is not configured yet. Add your AssemblyAI API key in the dashboard config.');
  }

  const config = {
    // Describes the situation to the ASR model (per AssemblyAI Dictation docs) —
    // helps it transcribe academic/study vocabulary more accurately.
    stt_prompt: 'A student dictating study notes about an academic topic, possibly including technical terms, definitions, and formulas.',
  };

  const form = new FormData();
  form.append('config', new Blob([JSON.stringify(config)], { type: 'application/json' }));
  form.append('audio', new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' }), 'audio.wav');

  let response: Response;
  try {
    response = await fetch(DICTATION_URL, {
      method: 'POST',
      headers: { Authorization: apiKey },
      body: form,
    });
  } catch (err) {
    console.error('[voice] AssemblyAI request failed:', err);
    throw new TranscriptionError('We could not reach the transcription service. Check your connection and try again.');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error(`[voice] AssemblyAI returned ${response.status}: ${errorBody.slice(0, 500)}`);
    if (response.status === 404) {
      throw new TranscriptionError('Speech-to-text is not configured correctly. Check the AssemblyAI API key in the dashboard config.');
    }
    if (response.status === 415) {
      throw new TranscriptionError('That recording format is not supported. Please try recording again.');
    }
    throw new TranscriptionError('We could not transcribe that recording. Please try again.');
  }

  const result = (await response.json()) as DictationResult;

  const transcript = result.llm_response || result.text;
  if (!transcript || !transcript.trim()) {
    throw new TranscriptionError('We could not hear anything in that recording. Please try again.');
  }

  return transcript.trim();
}
