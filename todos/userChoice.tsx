"use client";

import { getFormData } from "zvijude/form/funcs";
import { Input } from "zvijude/form";
import { Btn } from "zvijude/btns";
import { connectUser } from "./action";

export default function UserChoice() {
  async function handleConnect(e) {
    const data = getFormData(e);
    await connectUser(data);
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleConnect}
        className="flex flex-col gap-4 bg-white p-8 rounded-xl shadow-md w-80"
      >
        <h1 className="text-2xl font-bold text-center">Connect User</h1>
        <Input
          lbl="Username"
          name="username"
          placeholder="Enter your Username"
          required
        />
        <Btn className="bg-blue-600 hover:bg-blue-700" lbl="Continue" />
      </form>
    </main>
  );
}
