import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import { dbNotes, dbStickies, NOTE_MODES, STUDY_MODES, STICKY_COLORS } from './db';
import { transcribeAudioWav } from './assemblyai';
import {
  generateNoteFromTranscript,
  generateMeetingNoteFromTranscript,
  generateStickiesFromTranscript,
} from './novita';

function requireUser(user: UserInfo | null): asserts user is UserInfo {
  if (!user) {
    throw new AuthError('Not authenticated');
  }
}

const noteModeSchema = z.enum(NOTE_MODES);
const studyModeSchema = z.enum(STUDY_MODES);

const actionItemZod = z.object({
  text: z.string(),
  owner: z.string().optional(),
  due: z.string().optional(),
  done: z.boolean(),
});

const meetingFieldsZod = {
  attendees: z.array(z.string()).optional(),
  actionItems: z.array(actionItemZod).optional(),
  decisions: z.array(z.string()).optional(),
  followUps: z.array(z.string()).optional(),
};

const voiceModule = new Module('voice', {
  configSchema: {
    assemblyaiApiKey: {
      type: 'secret',
      default: '',
      isPublic: false,
    },
    novitaApiKey: {
      type: 'secret',
      default: '',
      isPublic: false,
    },
    novitaModel: {
      type: 'string',
      default: 'moonshotai/kimi-k3',
      isPublic: false,
    },
  },

  stores: [dbNotes, dbStickies],

  queries: {
    getNotes: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);

      const notes = await dbNotes.fetch(
        { userId: new ObjectId(user.id) },
        { sort: { updatedAt: -1 } }
      );

      return notes.map((note) => ({
        _id: note._id.toString(),
        title: note.title,
        mode: note.mode,
        subject: note.subject ?? null,
        tags: note.tags ?? [],
        summary: note.summary ?? '',
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
    },

    getNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { noteId } = z.object({ noteId: z.string() }).parse(args);

      const note = await dbNotes.requireOne({ _id: new ObjectId(noteId) });
      if (note.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      return { ...note, _id: note._id.toString() };
    },

    getStickies: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);

      const stickies = await dbStickies.fetch(
        { userId: new ObjectId(user.id) },
        { sort: { pinned: -1, updatedAt: -1 } }
      );

      return stickies.map((sticky) => ({
        _id: sticky._id.toString(),
        title: sticky.title,
        color: sticky.color,
        items: sticky.items,
        pinned: sticky.pinned,
        createdAt: sticky.createdAt,
        updatedAt: sticky.updatedAt,
      }));
    },
  },

  mutations: {
    transcribeAudio: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { audioBase64 } = z.object({ audioBase64: z.string().min(1) }).parse(args);

      const apiKey = voiceModule.getConfig('assemblyaiApiKey');
      const audioBuffer = Buffer.from(audioBase64, 'base64');

      if (audioBuffer.byteLength < 1000) {
        throw new Error('That recording was too short. Please try again.');
      }

      const transcript = await transcribeAudioWav(audioBuffer, apiKey);
      return { transcript };
    },

    generateNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { transcript, mode } = z
        .object({ transcript: z.string().min(1), mode: studyModeSchema })
        .parse(args);

      const apiKey = voiceModule.getConfig('novitaApiKey');
      const model = voiceModule.getConfig('novitaModel');

      const note = await generateNoteFromTranscript(transcript, mode, apiKey, model);
      return note;
    },

    generateMeetingNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { transcript } = z.object({ transcript: z.string().min(1) }).parse(args);

      const apiKey = voiceModule.getConfig('novitaApiKey');
      const model = voiceModule.getConfig('novitaModel');

      const note = await generateMeetingNoteFromTranscript(transcript, apiKey, model);
      return note;
    },

    generateStickies: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { transcript } = z.object({ transcript: z.string().min(1) }).parse(args);

      const apiKey = voiceModule.getConfig('novitaApiKey');
      const model = voiceModule.getConfig('novitaModel');

      const stickies = await generateStickiesFromTranscript(transcript, apiKey, model);

      const now = new Date();
      const created = [];
      for (const sticky of stickies) {
        const { insertedId } = await dbStickies.insertOne({
          userId: new ObjectId(user.id),
          title: sticky.title,
          color: sticky.color,
          items: sticky.items,
          pinned: false,
          createdAt: now,
          updatedAt: now,
        });
        created.push(insertedId.toString());
      }

      return { stickyIds: created, count: created.length };
    },

    createSticky: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { title, color } = z
        .object({ title: z.string().default(''), color: z.enum(STICKY_COLORS).default('yellow') })
        .parse(args ?? {});

      const now = new Date();
      const { insertedId } = await dbStickies.insertOne({
        userId: new ObjectId(user.id),
        title: title || 'New list',
        color,
        items: [],
        pinned: false,
        createdAt: now,
        updatedAt: now,
      });

      return { stickyId: insertedId.toString() };
    },

    updateSticky: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { stickyId, ...rest } = z
        .object({
          stickyId: z.string(),
          title: z.string().optional(),
          color: z.enum(STICKY_COLORS).optional(),
          items: z.array(z.object({ text: z.string(), done: z.boolean() })).optional(),
          pinned: z.boolean().optional(),
        })
        .parse(args);

      const sticky = await dbStickies.requireOne({ _id: new ObjectId(stickyId) });
      if (sticky.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      await dbStickies.updateOne(
        { _id: new ObjectId(stickyId) },
        { $set: { ...rest, updatedAt: new Date() } }
      );
      return { success: true };
    },

    deleteSticky: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { stickyId } = z.object({ stickyId: z.string() }).parse(args);

      const sticky = await dbStickies.requireOne({ _id: new ObjectId(stickyId) });
      if (sticky.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      await dbStickies.deleteOne({ _id: new ObjectId(stickyId) });
      return { success: true };
    },

    saveNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const input = z
        .object({
          mode: noteModeSchema,
          title: z.string().min(1),
          subject: z.string().optional(),
          tags: z.array(z.string()).optional(),
          transcript: z.string(),
          summary: z.string().optional(),
          keyConcepts: z.array(z.string()).optional(),
          detailedNotes: z.array(z.object({ heading: z.string(), content: z.string() })).optional(),
          definitions: z.array(z.object({ term: z.string(), definition: z.string() })).optional(),
          formulas: z.array(z.object({ formula: z.string(), description: z.string().optional() })).optional(),
          examples: z.array(z.string()).optional(),
          importantPoints: z.array(z.string()).optional(),
          examFocus: z.array(z.string()).optional(),
          questionsToReview: z.array(z.string()).optional(),
          flashcards: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
          additionalContext: z.string().optional(),
          ...meetingFieldsZod,
        })
        .parse(args);

      const now = new Date();
      const { insertedId } = await dbNotes.insertOne({
        userId: new ObjectId(user.id),
        ...input,
        createdAt: now,
        updatedAt: now,
      });

      return { noteId: insertedId.toString() };
    },

    updateNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { noteId, ...rest } = z
        .object({
          noteId: z.string(),
          title: z.string().min(1).optional(),
          subject: z.string().optional(),
          tags: z.array(z.string()).optional(),
          summary: z.string().optional(),
          keyConcepts: z.array(z.string()).optional(),
          detailedNotes: z.array(z.object({ heading: z.string(), content: z.string() })).optional(),
          definitions: z.array(z.object({ term: z.string(), definition: z.string() })).optional(),
          formulas: z.array(z.object({ formula: z.string(), description: z.string().optional() })).optional(),
          examples: z.array(z.string()).optional(),
          importantPoints: z.array(z.string()).optional(),
          examFocus: z.array(z.string()).optional(),
          questionsToReview: z.array(z.string()).optional(),
          flashcards: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
          additionalContext: z.string().optional(),
          ...meetingFieldsZod,
        })
        .parse(args);

      const note = await dbNotes.requireOne({ _id: new ObjectId(noteId) });
      if (note.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      await dbNotes.updateOne({ _id: new ObjectId(noteId) }, { $set: { ...rest, updatedAt: new Date() } });
      return { success: true };
    },

    deleteNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { noteId } = z.object({ noteId: z.string() }).parse(args);

      const note = await dbNotes.requireOne({ _id: new ObjectId(noteId) });
      if (note.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      await dbNotes.deleteOne({ _id: new ObjectId(noteId) });
      return { success: true };
    },

    duplicateNote: async (args: unknown, { user }: { user: UserInfo | null }) => {
      requireUser(user);
      const { noteId } = z.object({ noteId: z.string() }).parse(args);

      const note = await dbNotes.requireOne({ _id: new ObjectId(noteId) });
      if (note.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      const now = new Date();
      const { _id, createdAt, updatedAt, ...rest } = note;
      const { insertedId } = await dbNotes.insertOne({
        ...rest,
        title: `${note.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      });

      return { noteId: insertedId.toString() };
    },
  },
});

export default voiceModule;
