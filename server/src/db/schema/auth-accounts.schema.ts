import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const authProviderEnum = pgEnum("auth_provider", ["local", "google"]);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: authProviderEnum("provider").notNull(),

    providerAccountId: text("provider_account_id"),

    passwordHash: text("password_hash"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_accounts_user_provider_unique").on(
      table.userId,
      table.provider,
    ),

    uniqueIndex("auth_accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),

    check(
      "auth_accounts_local_fields_check",
      sql`
        ${table.provider} <> 'local'
        OR (
          ${table.passwordHash} IS NOT NULL
          AND ${table.providerAccountId} IS NULL
        )
      `,
    ),

    check(
      "auth_accounts_google_fields_check",
      sql`
        ${table.provider} <> 'google'
        OR (
          ${table.providerAccountId} IS NOT NULL
          AND ${table.passwordHash} IS NULL
        )
      `,
    ),
  ],
);
