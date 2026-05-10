"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
};

export function Checkbox({ checked, onChange, ariaLabel }: Props) {
  return (
    <span
      className={cn("checkbox", checked && "checked")}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      {checked && <Check size={11} color="white" strokeWidth={3} />}
    </span>
  );
}
