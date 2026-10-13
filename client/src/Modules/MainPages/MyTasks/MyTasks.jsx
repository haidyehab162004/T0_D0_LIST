import { useEffect, useState } from "react";
import { addTodo, getTodos } from "./todoService.js";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodos()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const newTask = await addTodo({ title, description, category, dueDate });
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setCategory("Personal");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">My Tasks</h1>

      <form onSubmit={handleSubmit} className="app-card mt-6 space-y-4 rounded-xl p-6 shadow">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          className="app-input w-full rounded-lg border p-3"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add more details..."
          className="app-input w-full rounded-lg border p-3"
        />

        <div className="flex gap-4">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="app-input rounded-lg border p-3"
          >
            <option>Personal</option>
            <option>Work</option>
            <option>Study</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="app-input rounded-lg border p-3"
          />
        </div>

        <button type="submit" className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white">
          Add Task
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <h2 className="mt-8 text-xl font-bold">Tasks</h2>

      {loading ? (
        <p className="mt-3">Loading tasks…</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="app-card rounded-lg p-4 shadow">
              <strong>{task.title}</strong>
              {task.category && <span className="ml-3 text-sm text-violet-700">{task.category}</span>}
              {task.description && <p className="app-muted mt-1">{task.description}</p>}
              {task.due_date && <p className="mt-1 text-sm">Due: {task.due_date}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
