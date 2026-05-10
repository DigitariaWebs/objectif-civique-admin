"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = "super-admin" | "editor" | "moderator";

type AuthState = {
  email: string | null;
  name: string;
  initials: string;
  role: AdminRole;
  signIn: (email: string) => void;
  signOut: () => void;
  switchRole: (role: AdminRole) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      name: "Camille Lefèvre",
      initials: "CL",
      role: "super-admin",
      signIn: (email) => set({ email }),
      signOut: () => set({ email: null }),
      switchRole: (role) => set({ role }),
    }),
    { name: "oc-admin-auth" },
  ),
);

export function canDo(role: AdminRole, action: "manage-content" | "moderate-forum" | "manage-admins" | "manage-billing" | "manage-branding"): boolean {
  if (role === "super-admin") return true;
  if (role === "editor") return action === "manage-content" || action === "moderate-forum";
  if (role === "moderator") return action === "moderate-forum";
  return false;
}
