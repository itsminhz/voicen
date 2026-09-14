import { BookOpen, Sparkles, GraduationCap, Layers, ListChecks, Shuffle, Users } from 'lucide-react';

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

export const MODE_META: Record<NoteMode, { label: string; description: string; icon: typeof BookOpen }> = {
  lecture: {
    label: 'Lecture Notes',
    description: 'Detailed, structured notes from a lecture or explanation.',
    icon: BookOpen,
  },
  quick_summary: {
    label: 'Quick Summary',
    description: 'Just the most important points, short and sweet.',
    icon: Sparkles,
  },
  exam: {
    label: 'Exam Notes',
    description: 'Definitions, formulas, and likely exam-relevant points.',
    icon: GraduationCap,
  },
  flashcards: {
    label: 'Flashcards',
    description: 'Turn your speech mainly into question/answer flashcards.',
    icon: Layers,
  },
  study_guide: {
    label: 'Study Guide',
    description: 'A structured guide organized for revision.',
    icon: ListChecks,
  },
  brain_dump: {
    label: 'Brain Dump',
    description: 'Unstructured rambling, organized into logical sections.',
    icon: Shuffle,
  },
  meeting: {
    label: 'Meeting',
    description: 'Summary, action items and key decisions from a conversation.',
    icon: Users,
  },
};
