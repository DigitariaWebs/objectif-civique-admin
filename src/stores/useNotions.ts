"use client";
import { createEntityStore } from "./_entityStore";
import { SEED_NOTIONS } from "@/data/library";
import type { DetailedNotion } from "@/types";

export const useNotions = createEntityStore<DetailedNotion>("notions", SEED_NOTIONS);
