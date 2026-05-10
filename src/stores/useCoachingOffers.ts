"use client";
import { createEntityStore } from "./_entityStore";
import { SEED_OFFERS } from "@/data/plans";
import type { CoachOffer } from "@/types";

export const useCoachingOffers = createEntityStore<CoachOffer>("coaching-offers", SEED_OFFERS);
