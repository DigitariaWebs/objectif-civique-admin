"use client";
import { createEntityStore } from "./_entityStore";
import { SEED_COURS } from "@/data/library";
import type { CoursLesson } from "@/types";

export const useCours = createEntityStore<CoursLesson>("cours", SEED_COURS);
