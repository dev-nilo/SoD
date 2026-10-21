"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return "code" in err && err.code === "inactive"
        ? "Usuário desativado. Fale com um administrador."
        : "Usuário ou senha inválidos.";
    }
    throw err; // o redirect de sucesso chega aqui como exceção e precisa seguir adiante
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
