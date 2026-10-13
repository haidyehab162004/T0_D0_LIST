export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  categoryId?: number | null;
  isImportant?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  categoryId?: number | null;
  isCompleted?: boolean;
  isImportant?: boolean;
}

export interface ListTasksQuery {
  completed?: unknown;
  important?: unknown;
  categoryId?: unknown;
  q?: unknown;
  sort?: unknown;
  order?: unknown;
  page?: unknown;
  limit?: unknown;
}
