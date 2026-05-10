"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  total: number;
  pageSize: number;
  onPageSizeChange: (s: number) => void;
};

export function Pagination({ page, totalPages, onChange, total, pageSize, onPageSizeChange }: Props) {
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="data-table-footer">
      <div className="row" style={{ gap: 14 }}>
        <span>{total.toLocaleString("fr-FR")} résultats</span>
        <span style={{ color: "var(--text-tertiary)" }}>·</span>
        <select
          className="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        >
          <option value={25}>25 par page</option>
          <option value={50}>50 par page</option>
          <option value={100}>100 par page</option>
        </select>
      </div>
      <div className="pagination">
        <button onClick={() => onChange(1)} disabled={page === 1} aria-label="Première page">
          <ChevronsLeft size={14} />
        </button>
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Page précédente">
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button key={p} className={cn(p === page && "active")} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight size={14} />
        </button>
        <button onClick={() => onChange(totalPages)} disabled={page === totalPages} aria-label="Dernière page">
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
