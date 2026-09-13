import type { NoteMode } from './db';

const NOVITA_BASE_URL = 'https://api.novita.ai/openai';

export class NoteGenerationError extends Error {}

export interface GeneratedNote {
  title: string;
  subject?: string;
  tags: string[];
  summary: string;
  keyConcepts: string[];
  detailedNotes: { heading: string; content: string }[];
  definitions: { term: string; definition: string }[];
  formulas: { formula: string; description?: string }[];
  examples: string[];
  importantPoints: string[];
  examFocus: string[];
  questionsToReview: string[];
  flashcards: { question: string; answer: string }[];
  additionalContext?: string;
}

const MODE_INSTRUCTIONS: Record<NoteMode, string> = {
  lecture:
    'Produce detailed, well-organized lecture notes. Break the material into logical sections in "detailedNotes". Be thorough but do not pad content that was not discussed.',
  quick_summary:
    'Produce only a short, high-signal summary. Keep "summary" concise (3-5 sentences), keep other arrays short (1-3 items) or empty when not clearly present in the transcript.',
  exam:
    'Focus on exam preparation: prioritize "definitions", "formulas", "importantPoints" and "examFocus". Keep "detailedNotes" brief.',
  flashcards:
    'Focus primarily on producing many high-quality "flashcards" (aim for as many as the content supports). Keep other sections brief.',
  study_guide:
    'Produce a structured revision guide: clear "detailedNotes" sections ordered logically, plus concise "keyConcepts" and "importantPoints" for quick review.',
  brain_dump:
    'The transcript is unstructured, rambling speech. Your main job is to find the underlying structure and organize it clearly into logical "detailedNotes" sections and "keyConcepts", without inventing structure that isn\'t implied by the content.',
};

const SYSTEM_PROMPT = `You are VoiceNote AI, an assistant that turns a student's spoken, informal explanation into organized study notes.

Rules you must follow strictly:
- The transcript is the primary source of truth. Do not invent facts, examples, or corrections that are not implied by the transcript.
- If the student's statement is uncertain or possibly wrong, preserve that uncertainty rather than confidently "fixing" it.
- Only add outside explanation in the "additionalContext" field, clearly separated from the student's own material. Never blend invented facts into the other fields.
- Leave arrays empty ([]) or omit optional fields when the transcript does not contain that kind of information. Do not pad with generic filler.
- Write like a genuine student's study note, not a generic AI summary.
- Output ONLY valid JSON matching the requested schema. No markdown, no commentary, no code fences.`;

function buildUserPrompt(transcript: string, mode: NoteMode): string {
  return `Transcript (from a student's spoken voice note):
"""
${transcript}
"""

Mode: ${mode}
Mode-specific instructions: ${MODE_INSTRUCTIONS[mode]}

Return a single JSON object with exactly this shape:
{
  "title": string,
  "subject": string | null,
  "tags": string[],
  "summary": string,
  "keyConcepts": string[],
  "detailedNotes": [{ "heading": string, "content": string }],
  "definitions": [{ "term": string, "definition": string }],
  "formulas": [{ "formula": string, "description": string | null }],
  "examples": string[],
  "importantPoints": string[],
  "examFocus": string[],
  "questionsToReview": string[],
  "flashcards": [{ "question": string, "answer": string }],
  "additionalContext": string | null
}

"subject" should be your best-guess academic subject/topic (e.g. "Physics", "Electrical Engineering", "C++", "Mathematics") if it can be confidently inferred, otherwise null.
"tags" should be 1-4 short topic tags.
Keep every field grounded in the transcript above.`;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  const jsonSlice = start >= 0 && end >= 0 ? candidate.slice(start, end + 1) : candidate;
  return JSON.parse(jsonSlice);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeNote(data: any): GeneratedNote {
  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled Voice Note',
    subject: typeof data.subject === 'string' && data.subject.trim() ? data.subject.trim() : undefined,
    tags: asStringArray(data.tags),
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    keyConcepts: asStringArray(data.keyConcepts),
    detailedNotes: Array.isArray(data.detailedNotes)
      ? data.detailedNotes
          .filter((s: any) => s && typeof s.heading === 'string' && typeof s.content === 'string')
          .map((s: any) => ({ heading: s.heading.trim(), content: s.content.trim() }))
      : [],
    definitions: Array.isArray(data.definitions)
      ? data.definitions
          .filter((d: any) => d && typeof d.term === 'string' && typeof d.definition === 'string')
          .map((d: any) => ({ term: d.term.trim(), definition: d.definition.trim() }))
      : [],
    formulas: Array.isArray(data.formulas)
      ? data.formulas
          .filter((f: any) => f && typeof f.formula === 'string')
          .map((f: any) => ({
            formula: f.formula.trim(),
            description: typeof f.description === 'string' && f.description.trim() ? f.description.trim() : undefined,
          }))
      : [],
    examples: asStringArray(data.examples),
    importantPoints: asStringArray(data.importantPoints),
    examFocus: asStringArray(data.examFocus),
    questionsToReview: asStringArray(data.questionsToReview),
    flashcards: Array.isArray(data.flashcards)
      ? data.flashcards
          .filter((f: any) => f && typeof f.question === 'string' && typeof f.answer === 'string')
          .map((f: any) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      : [],
    additionalContext:
      typeof data.additionalContext === 'string' && data.additionalContext.trim() ? data.additionalContext.trim() : undefined,
  };
}

export async function generateNoteFromTranscript(
  transcript: string,
  mode: NoteMode,
  apiKey: string,
  model: string
): Promise<GeneratedNote> {
  if (!apiKey) {
    throw new NoteGenerationError('AI note generation is not configured yet. Add your Novita API key in the dashboard config.');
  }

  let response: Response;
  try {
    response = await fetch(`${NOVITA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(transcript, mode) },
        ],
      }),
    });
  } catch {
    throw new NoteGenerationError('We could not reach the AI service. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new NoteGenerationError('We could not generate notes from that transcript. Please try again.');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new NoteGenerationError('The AI did not return any notes. Please try again.');
  }

  try {
    const parsed = extractJson(content);
    return normalizeNote(parsed);
  } catch {
    throw new NoteGenerationError('We had trouble understanding the AI response. Please try again.');
  }
}
