"use client";
import { createEntityStore } from "./_entityStore";
import { QUESTIONS } from "@/data/questions";
import type { Question } from "@/types";

export const useQuestions = createEntityStore<Question>("questions", QUESTIONS);
