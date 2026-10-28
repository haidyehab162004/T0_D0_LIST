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

// Raw URL query values are strings; the validator enforces their allowed values.
export interface ListTasksQuery {
  completed?: "true" | "false";
  important?: "true" | "false";
  categoryId?: string;
  q?: string;
  sort?: "createdAt" | "dueDate" | "title";
  order?: "asc" | "desc";
  page?: string;
  limit?: string;
}
