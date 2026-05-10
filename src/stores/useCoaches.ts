"use client";
import { createEntityStore } from "./_entityStore";
import { COACHES } from "@/data/coaches";
import type { Coach } from "@/types";

export const useCoaches = createEntityStore<Coach>("coaches", COACHES);
