import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeKind = "neutral" | "success" | "warning" | "error" | "info" | "outline";

type Props = {
  kind?: StatusBadgeKind;
  children: ReactNode;
  dot?: boolean;
};

export function StatusBadge({ kind = "neutral", children, dot = true }: Props) {
  return <span className={cn("badge", kind, dot && "dot")}>{children}</span>;
}
