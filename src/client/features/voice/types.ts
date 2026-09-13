import type { NoteMode } from './modes';

export interface DetailedSection {
  heading: string;
  content: string;
}

export interface Definition {
  term: string;
  definition: string;
}

export interface Formula {
  formula: string;
  description?: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface GeneratedNote {
  title: string;
  subject?: string;
  tags: string[];
  summary: string;
  keyConcepts: string[];
  detailedNotes: DetailedSection[];
  definitions: Definition[];
  formulas: Formula[];
  examples: string[];
  importantPoints: string[];
  examFocus: string[];
  questionsToReview: string[];
  flashcards: Flashcard[];
  additionalContext?: string;
}

export interface NoteSummary {
  _id: string;
  title: string;
  mode: NoteMode;
  subject: string | null;
  tags: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullNote extends GeneratedNote {
  _id: string;
  mode: NoteMode;
  transcript: string;
  createdAt: string;
  updatedAt: string;
}
