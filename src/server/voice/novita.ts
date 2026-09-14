import { STICKY_COLORS, type StudyMode, type StickyColor } from './db';

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

// Each mode must produce a clearly different note. Fields not listed as
// "fill" MUST be left empty ([] / null) so the output shape matches the mode.
const MODE_INSTRUCTIONS: Record<StudyMode, string> = {
  lecture:
    'Produce detailed, well-organized lecture notes. FILL: "detailedNotes" (thorough logical sections — this is the core output), "summary", "keyConcepts", plus "definitions"/"formulas"/"examples" when present in the transcript. LEAVE EMPTY: "flashcards", "examFocus". Do not pad content that was not discussed.',
  quick_summary:
    'Produce ONLY a short, high-signal summary. FILL: "summary" (3-5 concise sentences) and "importantPoints" (3-6 bullets max). LEAVE EMPTY ([]): "keyConcepts", "detailedNotes", "definitions", "formulas", "examples", "examFocus", "questionsToReview", "flashcards".',
  exam:
    'Focus strictly on exam preparation. FILL: "definitions", "formulas", "importantPoints", "examFocus" and "questionsToReview" as fully as the content supports. Keep "summary" to 2-3 sentences. LEAVE EMPTY ([]): "detailedNotes", "examples", "flashcards".',
  flashcards:
    'Your PRIMARY and almost only output is "flashcards": produce as many high-quality question/answer cards as the content supports (typically 8-25; cover every fact, definition and concept in the transcript). Keep "summary" to 1-2 sentences and "keyConcepts" to at most 5. LEAVE EMPTY ([]): "detailedNotes", "definitions", "formulas", "examples", "importantPoints", "examFocus", "questionsToReview".',
  study_guide:
    'Produce a structured revision guide. FILL: "detailedNotes" (clear sections ordered logically for revision), "keyConcepts", "importantPoints" and "questionsToReview". LEAVE EMPTY ([]): "flashcards", "examFocus".',
  brain_dump:
    'The transcript is unstructured, rambling speech. Find the underlying structure and organize it into logical "detailedNotes" sections plus "keyConcepts" and a short "summary", without inventing structure that isn\'t implied. LEAVE EMPTY ([]) unless clearly present: "definitions", "formulas", "examFocus", "questionsToReview", "flashcards".',
};

const SYSTEM_PROMPT = `You are Voicen AI, an assistant that turns a student's spoken, informal explanation into organized study notes.

Rules you must follow strictly:
- The transcript is the primary source of truth. Do not invent facts, examples, or corrections that are not implied by the transcript.
- If the student's statement is uncertain or possibly wrong, preserve that uncertainty rather than confidently "fixing" it.
- Only add outside explanation in the "additionalContext" field, clearly separated from the student's own material. Never blend invented facts into the other fields.
- Leave arrays empty ([]) or omit optional fields when the transcript does not contain that kind of information. Do not pad with generic filler.
- Write like a genuine student's study note, not a generic AI summary.
- Output ONLY valid JSON matching the requested schema. No markdown, no commentary, no code fences.`;

function buildUserPrompt(transcript: string, mode: StudyMode): string {
  return `Transcript (from a student's spoken voice note):
"""
${transcript}
"""

Mode: ${mode}
Mode-specific instructions (follow these EXACTLY — each mode must produce a visibly different note, including which fields stay empty): ${MODE_INSTRUCTIONS[mode]}

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

async function callNovita(
  messages: { role: string; content: string }[],
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) {
    throw new NoteGenerationError('AI note generation is not configured yet. Add your Novita API key in the dashboard config.');
  }

  const body = JSON.stringify({
    model,
    temperature: 0.3,
    // kimi-k3 is a reasoning model — it spends tokens on reasoning before the
    // answer, so give it generous headroom to avoid truncated/empty content.
    max_tokens: 8000,
    messages,
  });

  // Novita intermittently returns 429 "server_overload" — retry with backoff.
  const MAX_ATTEMPTS = 3;
  let response: Response | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      response = await fetch(`${NOVITA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
      });
    } catch (err) {
      console.error(`[voice] Novita request failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, err);
      if (attempt === MAX_ATTEMPTS) {
        throw new NoteGenerationError('We could not reach the AI service. Check your connection and try again.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      continue;
    }

    if (response.ok) break;

    const errorBody = await response.text().catch(() => '');
    console.error(
      `[voice] Novita returned ${response.status} (attempt ${attempt}/${MAX_ATTEMPTS}): ${errorBody.slice(0, 500)}`
    );

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS) {
      if (response.status === 401 || response.status === 403) {
        throw new NoteGenerationError('The AI service rejected the API key. Check your Novita API key in the dashboard config.');
      }
      if (response.status === 429 || response.status >= 500) {
        throw new NoteGenerationError('The AI service is temporarily overloaded. Please wait a moment and try again.');
      }
      throw new NoteGenerationError('We could not generate notes from that transcript. Please try again.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    response = null;
  }

  if (!response || !response.ok) {
    throw new NoteGenerationError('The AI service is temporarily overloaded. Please wait a moment and try again.');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    console.error(
      '[voice] Novita returned no content. finish_reason:',
      payload?.choices?.[0]?.finish_reason,
      'usage:',
      JSON.stringify(payload?.usage ?? {})
    );
    throw new NoteGenerationError('The AI did not return any notes. Please try again.');
  }

  return content;
}

export async function generateNoteFromTranscript(
  transcript: string,
  mode: StudyMode,
  apiKey: string,
  model: string
): Promise<GeneratedNote> {
  const content = await callNovita(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(transcript, mode) },
    ],
    apiKey,
    model
  );

  try {
    const parsed = extractJson(content);
    return normalizeNote(parsed);
  } catch (err) {
    console.error('[voice] Failed to parse Novita JSON response:', err, 'content snippet:', content.slice(0, 300));
    throw new NoteGenerationError('We had trouble understanding the AI response. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Meeting mode
// ---------------------------------------------------------------------------

export interface GeneratedMeetingNote {
  title: string;
  tags: string[];
  summary: string;
  attendees: string[];
  keyConcepts: string[]; // discussion topics
  actionItems: { text: string; owner?: string; due?: string; done: boolean }[];
  decisions: string[];
  followUps: string[];
  additionalContext?: string;
}

const MEETING_SYSTEM_PROMPT = `You are Voicen AI, an assistant that turns a transcribed meeting or conversation into professional, structured meeting notes.

Rules you must follow strictly:
- The transcript is the only source of truth. Do not invent participants, decisions, dates, or tasks that were not stated or clearly implied.
- If ownership or deadlines of a task are unclear, leave "owner"/"due" null rather than guessing.
- Attendee names should only be included when actually mentioned in the conversation.
- Leave arrays empty ([]) when the transcript contains no such information. Do not pad with filler.
- Write in clear, neutral, professional language.
- Output ONLY valid JSON matching the requested schema. No markdown, no commentary, no code fences.`;

function buildMeetingPrompt(transcript: string): string {
  return `Transcript of a meeting / conversation (recorded and transcribed, speakers are not labeled):
"""
${transcript}
"""

Return a single JSON object with exactly this shape:
{
  "title": string,                      // short descriptive meeting title
  "tags": string[],                     // 1-4 short topic tags
  "summary": string,                    // 3-6 sentence overview of what was discussed
  "attendees": string[],                // names of people mentioned as present/speaking, [] if none identifiable
  "topics": string[],                   // main discussion topics covered
  "actionItems": [{ "text": string, "owner": string | null, "due": string | null }],
  "decisions": string[],                // decisions that were made
  "followUps": string[],                // open questions / items to revisit next time
  "additionalContext": string | null    // anything else worth noting, or null
}

Keep every field grounded in the transcript above.`;
}

export async function generateMeetingNoteFromTranscript(
  transcript: string,
  apiKey: string,
  model: string
): Promise<GeneratedMeetingNote> {
  const content = await callNovita(
    [
      { role: 'system', content: MEETING_SYSTEM_PROMPT },
      { role: 'user', content: buildMeetingPrompt(transcript) },
    ],
    apiKey,
    model
  );

  try {
    const data: any = extractJson(content);
    return {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled Meeting',
      tags: asStringArray(data.tags),
      summary: typeof data.summary === 'string' ? data.summary.trim() : '',
      attendees: asStringArray(data.attendees),
      keyConcepts: asStringArray(data.topics),
      actionItems: Array.isArray(data.actionItems)
        ? data.actionItems
            .filter((item: any) => item && typeof item.text === 'string' && item.text.trim())
            .map((item: any) => ({
              text: item.text.trim(),
              owner: typeof item.owner === 'string' && item.owner.trim() ? item.owner.trim() : undefined,
              due: typeof item.due === 'string' && item.due.trim() ? item.due.trim() : undefined,
              done: false,
            }))
        : [],
      decisions: asStringArray(data.decisions),
      followUps: asStringArray(data.followUps),
      additionalContext:
        typeof data.additionalContext === 'string' && data.additionalContext.trim()
          ? data.additionalContext.trim()
          : undefined,
    };
  } catch (err) {
    console.error('[voice] Failed to parse Novita meeting JSON:', err, 'content snippet:', content.slice(0, 300));
    throw new NoteGenerationError('We had trouble understanding the AI response. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Sticky Notes mode
// ---------------------------------------------------------------------------

export interface GeneratedSticky {
  title: string;
  color: StickyColor;
  items: { text: string; done: boolean }[];
}

const STICKY_SYSTEM_PROMPT = `You are Voicen AI, an assistant that turns rambling spoken thoughts into clean, Google Keep-style sticky note lists.

Rules you must follow strictly:
- The transcript is the only source of truth. Do not invent items that were not mentioned.
- Group related items into separate sticky notes with short, clear titles (e.g. "Groceries", "Weekend Plans", "Call List").
- Each item should be a short, actionable or scannable phrase — clean up filler words, keep the meaning.
- Create between 1 and 6 sticky notes depending on how many distinct topics the transcript actually contains. One topic = one note.
- Pick a fitting color per note from: ${STICKY_COLORS.join(', ')}.
- Output ONLY valid JSON matching the requested schema. No markdown, no commentary, no code fences.`;

function buildStickyPrompt(transcript: string): string {
  return `Transcript of spoken thoughts:
"""
${transcript}
"""

Return a single JSON object with exactly this shape:
{
  "notes": [
    {
      "title": string,           // short list title
      "color": string,           // one of: ${STICKY_COLORS.join(', ')}
      "items": string[]          // the list items, cleaned up
    }
  ]
}

Keep every item grounded in the transcript above.`;
}

export async function generateStickiesFromTranscript(
  transcript: string,
  apiKey: string,
  model: string
): Promise<GeneratedSticky[]> {
  const content = await callNovita(
    [
      { role: 'system', content: STICKY_SYSTEM_PROMPT },
      { role: 'user', content: buildStickyPrompt(transcript) },
    ],
    apiKey,
    model
  );

  try {
    const data: any = extractJson(content);
    const notes = Array.isArray(data.notes) ? data.notes : [];
    const stickies: GeneratedSticky[] = notes
      .filter((n: any) => n && typeof n.title === 'string' && Array.isArray(n.items))
      .map((n: any) => ({
        title: n.title.trim() || 'Untitled',
        color: (STICKY_COLORS as readonly string[]).includes(n.color) ? (n.color as StickyColor) : 'yellow',
        items: n.items
          .filter((item: any) => typeof item === 'string' && item.trim())
          .map((item: string) => ({ text: item.trim(), done: false })),
      }))
      .filter((n: GeneratedSticky) => n.items.length > 0);

    if (stickies.length === 0) {
      throw new Error('No lists produced');
    }
    return stickies;
  } catch (err) {
    console.error('[voice] Failed to parse Novita sticky JSON:', err, 'content snippet:', content.slice(0, 300));
    throw new NoteGenerationError('We could not turn that into lists. Please try again.');
  }
}
