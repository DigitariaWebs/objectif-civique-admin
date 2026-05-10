"use client";
import { createEntityStore } from "./_entityStore";
import { CENTERS } from "@/data/centers";
import type { Center } from "@/types";

export const useCenters = createEntityStore<Center>("centers", CENTERS);
