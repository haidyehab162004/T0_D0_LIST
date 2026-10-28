import { and, asc, count, eq } from "drizzle-orm";

import { db } from "../../db";
import { categories, tasks } from "../../db/schema";

async function listCategories(userId: number) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(
      tasks,
      and(eq(tasks.categoryId, categories.id), eq(tasks.userId, userId)),
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.name), asc(categories.id));
}

async function findCategory(userId: number, categoryId: number) {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, categoryId)))
    .limit(1);

  return category;
}

async function createCategory(userId: number, name: string) {
  const [category] = await db
    .insert(categories)
    .values({ userId, name })
    .returning({ id: categories.id, name: categories.name });

  if (!category) throw new Error("Failed to create category.");
  return { ...category, taskCount: 0 };
}

async function updateCategory(userId: number, categoryId: number, name: string) {
  const [category] = await db
    .update(categories)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(categories.userId, userId), eq(categories.id, categoryId)))
    .returning({ id: categories.id, name: categories.name });

  return category;
}

async function countCategoryTasks(userId: number, categoryId: number) {
  const [result] = await db
    .select({ total: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.categoryId, categoryId)));

  return result?.total ?? 0;
}

async function deleteCategory(userId: number, categoryId: number) {
  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, categoryId)))
    .returning({ id: categories.id });

  return Boolean(deleted);
}

export const categoryRepository = {
  listCategories,
  findCategory,
  createCategory,
  updateCategory,
  countCategoryTasks,
  deleteCategory,
};
