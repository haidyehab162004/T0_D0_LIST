import { supabase } from "../../../lib/supabase.js";

export async function getTodos() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addTodo({
  title,
  description = "",
  category = "Personal",
  dueDate = "",
  isImportant = false,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("سجّلي الدخول أولًا");

  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      category,
      due_date: dueDate || null,
      is_important: isImportant,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}