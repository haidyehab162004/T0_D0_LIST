import { and, eq, sql } from "drizzle-orm";

import { db } from "../../db";
import { authAccounts, users } from "../../db/schema";
import type {
  LocalAuthRecord,
  PublicUser,
  RegisterInput,
} from "./auth.types";
import type { GoogleProfile } from "../../integrations/google/google-auth.service";

const publicUserSelection = {
  id: users.id,
  name: users.name,
  email: users.email,
  emailVerified: users.emailVerified,
};

async function findUserByEmail(email: string): Promise<PublicUser | undefined> {
  const [user] = await db
    .select(publicUserSelection)
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);

  return user;
}

async function findUserById(userId: number): Promise<PublicUser | undefined> {
  const [user] = await db
    .select(publicUserSelection)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

async function findLocalAccountByEmail(
  email: string,
): Promise<LocalAuthRecord | undefined> {
  const [record] = await db
    .select({
      ...publicUserSelection,
      passwordHash: authAccounts.passwordHash,
    })
    .from(authAccounts)
    .innerJoin(users, eq(authAccounts.userId, users.id))
    .where(
      and(
        eq(authAccounts.provider, "local"),
        sql`lower(${users.email}) = ${email.toLowerCase()}`,
      ),
    )
    .limit(1);

  return record;
}

async function findGoogleAccountByProviderId(
  providerAccountId: string,
): Promise<PublicUser | undefined> {
  const [user] = await db
    .select(publicUserSelection)
    .from(authAccounts)
    .innerJoin(users, eq(authAccounts.userId, users.id))
    .where(
      and(
        eq(authAccounts.provider, "google"),
        eq(authAccounts.providerAccountId, providerAccountId),
      ),
    )
    .limit(1);

  return user;
}

async function createLocalUser(
  input: RegisterInput,
  passwordHash: string,
): Promise<PublicUser> {
  return db.transaction(async (transaction) => {
    const [user] = await transaction
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        emailVerified: false,
      })
      .returning(publicUserSelection);

    if (!user) {
      throw new Error("Failed to create user.");
    }

    await transaction.insert(authAccounts).values({
      userId: user.id,
      provider: "local",
      providerAccountId: null,
      passwordHash,
    });

    return user;
  });
}

async function createGoogleUser(
  profile: GoogleProfile,
): Promise<PublicUser> {
  return db.transaction(async (transaction) => {
    const [user] = await transaction
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        emailVerified: true,
      })
      .returning(publicUserSelection);

    if (!user) {
      throw new Error("Failed to create Google user.");
    }

    await transaction.insert(authAccounts).values({
      userId: user.id,
      provider: "google",
      providerAccountId: profile.providerAccountId,
      passwordHash: null,
    });

    return user;
  });
}

async function markEmailVerified(
  userId: number,
): Promise<PublicUser | undefined> {
  const [user] = await db
    .update(users)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(publicUserSelection);

  return user;
}

async function updateLocalPassword(
  userId: number,
  passwordHash: string,
): Promise<boolean> {
  const [account] = await db
    .update(authAccounts)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(authAccounts.userId, userId),
        eq(authAccounts.provider, "local"),
      ),
    )
    .returning({
      id: authAccounts.id,
    });

  return Boolean(account);
}

export const authRepository = {
  findUserByEmail,
  findUserById,
  findLocalAccountByEmail,
  findGoogleAccountByProviderId,
  createLocalUser,
  createGoogleUser,
  markEmailVerified,
  updateLocalPassword,
};
