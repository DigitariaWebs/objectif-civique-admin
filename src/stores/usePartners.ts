"use client";
import { createEntityStore } from "./_entityStore";
import { PARTNERS } from "@/data/partners";
import type { Partner } from "@/types";

export const usePartners = createEntityStore<Partner>("partners", PARTNERS);
