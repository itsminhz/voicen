import { Store, schema } from 'modelence/server';

export const STUDY_MODES = [
  'lecture',
  'quick_summary',
  'exam',
  'flashcards',
  'study_guide',
  'brain_dump',
] as const;

export const NOTE_MODES = [...STUDY_MODES, 'meeting'] as const;

export type StudyMode = (typeof STUDY_MODES)[number];
export type NoteMode = (typeof NOTE_MODES)[number];

const flashcardSchema = schema.object({
  question: schema.string(),
  answer: schema.string(),
});

const definitionSchema = schema.object({
  term: schema.string(),
  definition: schema.string(),
});

const formulaSchema = schema.object({
  formula: schema.string(),
  description: schema.string().optional(),
});

const sectionSchema = schema.object({
  heading: schema.string(),
  content: schema.string(),
});

const actionItemSchema = schema.object({
  text: schema.string(),
  owner: schema.string().optional(),
  due: schema.string().optional(),
  done: schema.boolean(),
});

export const STICKY_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange', 'gray'] as const;
export type StickyColor = (typeof STICKY_COLORS)[number];

export const dbStickies = new Store('stickyNotes', {
  schema: {
    userId: schema.userId(),
    title: schema.string(),
    color: schema.enum(STICKY_COLORS),
    items: schema.array(
      schema.object({
        text: schema.string(),
        done: schema.boolean(),
      })
    ),
    pinned: schema.boolean(),
    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [{ key: { userId: 1, pinned: -1, updatedAt: -1 } }],
});

export const dbNotes = new Store('voiceNotes', {
  schema: {
    userId: schema.userId(),
    mode: schema.enum(NOTE_MODES),
    title: schema.string(),
    subject: schema.string().optional(),
    tags: schema.array(schema.string()).optional(),

    transcript: schema.string(),

    summary: schema.string().optional(),
    keyConcepts: schema.array(schema.string()).optional(),
    detailedNotes: schema.array(sectionSchema).optional(),
    definitions: schema.array(definitionSchema).optional(),
    formulas: schema.array(formulaSchema).optional(),
    examples: schema.array(schema.string()).optional(),
    importantPoints: schema.array(schema.string()).optional(),
    examFocus: schema.array(schema.string()).optional(),
    questionsToReview: schema.array(schema.string()).optional(),
    flashcards: schema.array(flashcardSchema).optional(),
    additionalContext: schema.string().optional(),

    // Meeting mode fields
    attendees: schema.array(schema.string()).optional(),
    actionItems: schema.array(actionItemSchema).optional(),
    decisions: schema.array(schema.string()).optional(),
    followUps: schema.array(schema.string()).optional(),

    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, updatedAt: -1 } },
  ],
});
