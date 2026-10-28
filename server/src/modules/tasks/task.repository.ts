import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "../../db";
import { categories, tasks } from "../../db/schema";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.types";

const taskSelection = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  dueDate: tasks.dueDate,
  isCompleted: tasks.isCompleted,
  isImportant: tasks.isImportant,
  completedAt: tasks.completedAt,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
  categoryId: categories.id,
  categoryName: categories.name,
};

function toPublicTask(row: {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  isImportant: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number | null;
  categoryName: string | null;
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    isCompleted: row.isCompleted,
    isImportant: row.isImportant,
    completedAt: row.completedAt,
    category: row.categoryId === null ? null : {
      id: row.categoryId,
      name: row.categoryName!,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const categoryJoinCondition = and(
  eq(categories.id, tasks.categoryId),
  eq(categories.userId, tasks.userId),
);

async function listTasks(userId: number, query: ListTasksQuery) {
  const page = Number(query.page ?? "1");
  const limit = Math.min(Number(query.limit ?? "20"), 100);

  const conditions: SQL[] = [eq(tasks.userId, userId)];
  if (query.completed !== undefined) {
    conditions.push(eq(tasks.isCompleted, query.completed === "true"));
  }
  if (query.important !== undefined) {
    conditions.push(eq(tasks.isImportant, query.important === "true"));
  }
  if (query.categoryId !== undefined) {
    conditions.push(eq(tasks.categoryId, Number(query.categoryId)));
  }
  if (query.q?.trim()) {
    const term = `%${query.q.trim().replace(/[\\%_]/g, "\\$&")}%`;
    const search = or(ilike(tasks.title, term), ilike(tasks.description, term));
    if (search) conditions.push(search);
  }

  const where = and(...conditions);
  const sortColumn = query.sort === "title"
    ? tasks.title
    : query.sort === "dueDate"
      ? tasks.dueDate
      : tasks.createdAt;
  const sortOrder = query.order === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [rows, totals] = await Promise.all([
    db
      .select(taskSelection)
      .from(tasks)
      .leftJoin(categories, categoryJoinCondition)
      .where(where)
      .orderBy(sortOrder, desc(tasks.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count() }).from(tasks).where(where),
  ]);

  const total = totals[0]?.value ?? 0;
  return {
    data: rows.map(toPublicTask),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findTask(userId: number, taskId: number) {
  const [row] = await db
    .select(taskSelection)
    .from(tasks)
    .leftJoin(categories, categoryJoinCondition)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .limit(1);

  return row ? toPublicTask(row) : undefined;
}

async function createTask(userId: number, input: CreateTaskInput) {
  const [created] = await db
    .insert(tasks)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      categoryId: input.categoryId ?? null,
      isImportant: input.isImportant ?? false,
    })
    .returning({ id: tasks.id });

  if (!created) throw new Error("Failed to create task.");
  const task = await findTask(userId, created.id);
  if (!task) throw new Error("Failed to retrieve created task.");
  return task;
}

async function updateTask(userId: number, taskId: number, input: UpdateTaskInput) {
  // Undefined fields are omitted by Drizzle; explicit null clears a field.
  const changes: Partial<typeof tasks.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.title !== undefined) changes.title = input.title;
  if (input.description !== undefined) changes.description = input.description;
  if (input.dueDate !== undefined) changes.dueDate = input.dueDate;
  if (input.categoryId !== undefined) changes.categoryId = input.categoryId;
  if (input.isImportant !== undefined) changes.isImportant = input.isImportant;
  if (input.isCompleted !== undefined) {
    changes.isCompleted = input.isCompleted;
    // Keep the timestamp of an already completed task on idempotent updates.
    changes.completedAt = input.isCompleted
      ? (await getCompletedAt(userId, taskId)) ?? new Date()
      : null;
  }

  const [updated] = await db
    .update(tasks)
    .set(changes)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .returning({ id: tasks.id });

  if (!updated) return undefined;
  return findTask(userId, updated.id);
}

async function getCompletedAt(userId: number, taskId: number): Promise<Date | null> {
  const [row] = await db
    .select({ completedAt: tasks.completedAt })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .limit(1);

  return row?.completedAt ?? null;
}

async function deleteTask(userId: number, taskId: number) {
  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
    .returning({ id: tasks.id });

  return Boolean(deleted);
}

export const taskRepository = {
  listTasks,
  findTask,
  createTask,
  updateTask,
  deleteTask,
};
