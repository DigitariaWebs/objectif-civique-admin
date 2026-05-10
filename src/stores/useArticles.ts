"use client";
import { createEntityStore } from "./_entityStore";
import { ARTICLES } from "@/data/articles";
import type { Article } from "@/types";

export const useArticles = createEntityStore<Article>("articles", ARTICLES);
