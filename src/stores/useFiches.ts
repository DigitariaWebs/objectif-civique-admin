"use client";
import { createEntityStore } from "./_entityStore";
import { SEED_FICHES } from "@/data/library";
import type { RevisionFiche } from "@/types";

export const useFiches = createEntityStore<RevisionFiche>("fiches", SEED_FICHES);
