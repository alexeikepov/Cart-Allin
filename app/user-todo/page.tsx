import MainComp from "@/todos/todo";
import { getUserFullData } from "@/todos/action";

export default async function UserTodoPage() {
  const { username, categories, todos } = await getUserFullData();

  return <MainComp username={username} categories={categories} todos={todos} />;
}
