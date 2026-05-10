"use client";
import { createEntityStore } from "./_entityStore";
import { USERS } from "@/data/users";
import type { User } from "@/types";

export const useUsers = createEntityStore<User>("users", USERS);
