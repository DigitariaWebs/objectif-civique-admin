"use client";
import { createEntityStore } from "./_entityStore";
import { SEED_ACHIEVEMENTS } from "@/data/achievements";
import type { Achievement } from "@/types";

export const useAchievements = createEntityStore<Achievement>("achievements", SEED_ACHIEVEMENTS);
