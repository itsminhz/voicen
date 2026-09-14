import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo, Store, schema, getConfig } from 'modelence/server';

const GENDERS = ['male', 'female'] as const;

const dbProfiles = new Store('userProfiles', {
  schema: {
    userId: schema.userId(),
    gender: schema.enum(GENDERS).optional(),
    displayName: schema.string().optional(),
    bio: schema.string().optional(),
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

      // The shared demo account defaults to "Alex" until it sets its own name.
      const demoEmail = getConfig('example.modelenceDemoUsername') as string;
      const defaultName = user.handle === demoEmail ? 'Alex' : '';

      return {
        gender: profile?.gender ?? null,
        displayName: profile?.displayName || defaultName,
        bio: profile?.bio ?? '',
      };
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

    update: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }
      const { displayName, bio, gender } = z
        .object({
          displayName: z.string().max(60).optional(),
          bio: z.string().max(300).optional(),
          gender: z.enum(GENDERS).optional(),
        })
        .parse(args);

      const $set: Record<string, unknown> = { updatedAt: new Date() };
      if (displayName !== undefined) $set.displayName = displayName.trim();
      if (bio !== undefined) $set.bio = bio.trim();
      if (gender !== undefined) $set.gender = gender;

      await dbProfiles.upsertOne({ userId: new ObjectId(user.id) }, { $set });
    },
  },
});
