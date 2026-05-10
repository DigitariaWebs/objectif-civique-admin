"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

type Props<T extends string> = {
  field: T;
  sortField: T;
  sortDir: "asc" | "desc";
  onSort: (field: T) => void;
  children: ReactNode;
  style?: CSSProperties;
};

export function Th<T extends string>({ field, sortField, sortDir, onSort, children, style }: Props<T>) {
  const active = sortField === field;
  return (
    <th onClick={() => onSort(field)} style={style}>
      <span className="th-inner">
        {children}
        {active ? (
          sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
        ) : (
          <ChevronsUpDown size={11} color="var(--outline-variant)" />
        )}
      </span>
    </th>
  );
}
