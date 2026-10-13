import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { categories } from "./categories.schema";
import { users } from "./users.schema";

export const tasks = pgTable(
  "tasks",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    categoryId: integer("category_id"),

    title: text("title").notNull(),

    description: text("description"),

    dueDate: date("due_date"),

    isCompleted: boolean("is_completed").notNull().default(false),

    isImportant: boolean("is_important").notNull().default(false),

    completedAt: timestamp("completed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "tasks_user_category_fk",
      columns: [table.userId, table.categoryId],
      foreignColumns: [categories.userId, categories.id],
    }).onDelete("no action"),

    check(
      "tasks_completion_state_check",
      sql`
        (
          ${table.isCompleted} = false
          AND ${table.completedAt} IS NULL
        )
        OR
        (
          ${table.isCompleted} = true
          AND ${table.completedAt} IS NOT NULL
        )
      `,
    ),

    index("tasks_user_created_at_idx").on(table.userId, table.createdAt),

    index("tasks_user_completed_idx").on(table.userId, table.isCompleted),

    index("tasks_user_important_idx").on(table.userId, table.isImportant),

    index("tasks_user_category_idx").on(table.userId, table.categoryId),

    index("tasks_user_due_date_idx").on(table.userId, table.dueDate),
  ],
);
