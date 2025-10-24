"use server";

import { db } from "@/scripts/db_conn";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface User {
  id: number;
  user: string;
  createdAt: string;
}

export async function getUserFullData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) redirect("/");

  const rows = await db("users")
    .leftJoin("categories", "categories.user_id", "users.id")
    .leftJoin("todos", "todos.user_id", "users.id")
    .select(
      "users.id as userId",
      "users.user as username",
      "categories.id as categoryId",
      "categories.name as categoryName",
      "todos.id as todoId",
      "todos.text as todoText",
      "todos.completed",
      "todos.createdAt",
      "todos.completedAt",
      "todos.categoryId as todoCategoryId"
    )
    .where("users.id", userId)
    .orderBy("categories.id", "asc");

  if (!rows.length) {
    const user = await db<User>("users").where("id", userId).first();
    return { username: user?.user || "User", categories: [], todos: [] };
  }

  const username = rows[0].username;

  const categoriesMap = new Map();
  for (const row of rows) {
    if (row.categoryId && !categoriesMap.has(row.categoryId)) {
      categoriesMap.set(row.categoryId, {
        id: row.categoryId,
        name: row.categoryName,
      });
    }
  }

  const categories = Array.from(categoriesMap.values());

  const todos: any[] = [];
  for (const row of rows) {
    if (row.todoId) {
      todos.push({
        id: row.todoId,
        text: row.todoText,
        completed: row.completed,
        createdAt: row.createdAt,
        completedAt: row.completedAt,
        categoryId: row.todoCategoryId,
      });
    }
  }

  return { username, categories, todos };
}

export async function connectUser(data: any) {
  const username = data.username?.trim();
  if (!username) throw new Error("Username required");

  let user = await db<User>("users").where("user", username).first();

  if (!user) {
    const [newUser] = await db<User>("users")
      .insert({ user: username })
      .returning("*");
    user = newUser;
  }

  const cookieStore = await cookies();
  cookieStore.set("user_id", String(user.id), {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/user-todo");
}

export async function addTask(data: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  const text = String(data.text ?? "").trim();
  const categoryIdStr = String(data.categoryId ?? "");
  const categoryIdNum = Number(categoryIdStr);

  if (!text) throw new Error("Task text is required");
  if (!categoryIdStr || Number.isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw new Error("Valid category is required");
  }

  await db("todos").insert({
    text,
    categoryId: categoryIdNum,
    user_id: Number(userId),
  });

  revalidatePath("/user-todo");
}

export async function deleteTask(taskId: number) {
  await db("todos").where("id", taskId).del();
  revalidatePath("/user-todo");
}

export async function toggleComplete(taskId: number, completed: boolean) {
  const updateData = {
    completed: !completed,
    completedAt: !completed ? new Date() : null,
  };
  await db("todos").where("id", taskId).update(updateData);
  revalidatePath("/user-todo");
}

export async function addCategory(data: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  await db("categories").insert({
    ...data,
    user_id: Number(userId),
  });
  revalidatePath("/user-todo");
}

export async function deleteCategory(categoryId: number) {
  await db("categories").where("id", categoryId).del();
  revalidatePath("/user-todo");
}

export async function updateTaskCategory(taskId: number, categoryId: number) {
  const categoryIdNum = Number(categoryId);
  if (!categoryIdNum || Number.isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw new Error("Valid category is required");
  }

  await db("todos").where("id", taskId).update({ categoryId: categoryIdNum });
  revalidatePath("/user-todo");
}
