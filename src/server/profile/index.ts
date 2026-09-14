import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo, Store, schema } from 'modelence/server';

const GENDERS = ['male', 'female'] as const;

const dbProfiles = new Store('userProfiles', {
  schema: {
    userId: schema.userId(),
    gender: schema.enum(GENDERS),
    updatedAt: schema.date(),
  },
  indexes: [{ key: { userId: 1 }, unique: true }],
});

export default new Module('profile', {
  stores: [dbProfiles],

  queries: {
    get: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }
      const profile = await dbProfiles.findOne({ userId: new ObjectId(user.id) });
      return { gender: profile?.gender ?? null };
    },
  },

  mutations: {
    setGender: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }
      const { gender } = z.object({ gender: z.enum(GENDERS) }).parse(args);

      await dbProfiles.upsertOne(
        { userId: new ObjectId(user.id) },
        { $set: { gender, updatedAt: new Date() } }
      );
    },
  },
});
