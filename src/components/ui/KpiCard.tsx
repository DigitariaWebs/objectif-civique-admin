import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number | null;
  trendLabel?: string;
};

export function KpiCard({ icon: Icon, label, value, trend = null, trendLabel = "vs 30j" }: Props) {
  const trendKind: "up" | "down" | "flat" =
    trend == null ? "flat" : trend > 0 ? "up" : trend < 0 ? "down" : "flat";
  const TrendIcon = trendKind === "up" ? TrendingUp : trendKind === "down" ? TrendingDown : Minus;
  return (
    <div className="kpi-card">
      <div className="kpi-head">
        <div className="kpi-icon"><Icon size={16} /></div>
        <div className="kpi-label">{label}</div>
      </div>
      <div className="kpi-value">{value}</div>
      {trend != null && (
        <div className={cn("kpi-trend", trendKind)}>
          <TrendIcon size={13} />
          {trend > 0 ? "+" : ""}{trend}%
          <span className="kpi-trend-label">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
