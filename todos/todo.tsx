"use client";

import { getFormData } from "zvijude/form/funcs";
import { Input } from "zvijude/form";
import { Btn } from "zvijude/btns";

import {
  addCategory,
  addTask,
  deleteTask,
  toggleComplete,
  updateTaskCategory,
  deleteCategory,
} from "./action";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  categoryId?: number;
  createdAt: string;
  completedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function MainComp({
  username = "User",
  todos = [],
  categories = [],
}: {
  username?: string;
  todos?: Todo[];
  categories?: Category[];
}) {
  const uniqueTodos = todos.filter(
    (todo, index, self) => index === self.findIndex((t) => t.id === todo.id)
  );

  const grouped = uniqueTodos.reduce((acc, t) => {
    const cat = categories.find((c) => c.id === Number(t.categoryId));
    const name = cat ? cat.name : "Uncategorized";
    (acc[name] ||= []).push(t);
    return acc;
  }, {} as Record<string, Todo[]>);

  async function handleAddTask(e: any) {
    e.preventDefault();
    const data = getFormData(e);
    await addTask(data);
    e.target.reset();
  }

  async function handleAddCategory(e: any) {
    e.preventDefault();
    const data = getFormData(e);
    await addCategory(data);
    e.target.reset();
  }

  async function handleDeleteCategory(categoryId: number) {
    await deleteCategory(categoryId);
  }

  async function handleToggleCompleted(id: number, completed: boolean) {
    await toggleComplete(id, completed);
  }

  async function handleDeleteTask(id: number) {
    await deleteTask(id);
  }

  async function handleUpdateCategory(id: number, categoryId: number) {
    await updateTaskCategory(id, categoryId);
  }

  return (
    <main className="flex flex-col items-start rounded-md border max-w-[600px] border-black m-5 p-10">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, <span className="text-blue-600">{username}</span> 👋
      </h1>

      <form
        className="flex flex-col border-2 rounded-md border-green-200 bg-green-50 p-3 w-full mb-6"
        onSubmit={handleAddTask}
      >
        <h2 className="text-lg font-semibold mb-2">Add a new task:</h2>
        <div className="flex gap-2">
          <Input
            name="text"
            placeholder="Enter task..."
            required
            className="flex-1"
          />

          <select
            name="categoryId"
            required
            className="flex items-center px-3 py-2 border rounded-lg"
            defaultValue=""
          >
            <option value="" disabled>
              Select category...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Btn className="bg-blue-400" lbl="Add Task" />
        </div>
      </form>

      <form
        className="border-2 rounded-md border-green-200 bg-green-50 p-3 w-full mb-6"
        onSubmit={handleAddCategory}
      >
        <h2 className="text-lg font-semibold mb-2">Create New Category:</h2>
        <div className="flex gap-2">
          <Input name="name" placeholder="New category..." required />
          <Btn className="bg-green-400" lbl="Add Category" />
        </div>
      </form>

      <h2 className="font-bold mb-2">All Todos ({uniqueTodos.length})</h2>
      {uniqueTodos.length === 0 ? (
        <p className="text-gray-500 italic">No todos yet</p>
      ) : (
        <div className="space-y-6 w-full">
          {Object.entries(grouped).map(([categoryName, tasks]) => (
            <div key={categoryName}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">
                  {categoryName} ({tasks.length})
                </h3>

                {categoryName !== "Uncategorized" && (
                  <Btn
                    onClick={() =>
                      handleDeleteCategory(
                        categories.find((c) => c.name === categoryName)!.id
                      )
                    }
                    lbl="🗑 Delete Category"
                    className="bg-red-500 text-white text-sm px-2 py-1"
                  />
                )}
              </div>

              <div className="space-y-2">
                {tasks.map(({ id, text, completed, categoryId }) => (
                  <div
                    key={`${categoryName}-${id}`}
                    className={`flex gap-3 p-2 border rounded items-center ${
                      completed ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <Btn
                      onClick={() => handleToggleCompleted(id, completed)}
                      lbl={completed ? "✓" : "○"}
                      className={`w-8 h-8 text-sm ${
                        completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    />

                    <span
                      className={`flex-1 ${
                        completed
                          ? "line-through text-gray-500 rounded-md pl-1 bg-green-200"
                          : ""
                      }`}
                    >
                      {text}
                    </span>

                    <select
                      value={categoryId ?? ""}
                      onChange={(e) =>
                        handleUpdateCategory(id, Number(e.target.value))
                      }
                      className="px-3 py-1 border rounded text-sm min-w-[120px]"
                    >
                      <option value="" disabled>
                        Select category...
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <Btn
                      onClick={() => handleDeleteTask(id)}
                      lbl="×"
                      className="bg-red-500 pb-1 text-white w-8 h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
