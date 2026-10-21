"use client";

import { createContext, useContext } from "react";

import type { UserRole } from "@/lib/user-rules";

export interface SessionUser {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

const CurrentUserContext = createContext<SessionUser | null>(null);

/** Hands the signed-in user (resolved on the server) to client components. */
export function CurrentUserProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): SessionUser {
  const user = useContext(CurrentUserContext);
  if (!user) throw new Error("useCurrentUser precisa estar dentro de <CurrentUserProvider>.");
  return user;
}
