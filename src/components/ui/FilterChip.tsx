"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number;
  type?: "button";
};

export function FilterChip({ active, onClick, children, count }: Props) {
  return (
    <button type="button" className={cn("filter-chip", active && "active")} onClick={onClick}>
      {children}
      {count != null && <span style={{ opacity: 0.7, fontSize: 11 }}>· {count}</span>}
    </button>
  );
}
