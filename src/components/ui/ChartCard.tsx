import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, action, children }: Props) {
  return (
    <div className="chart-card">
      <div className="head">
        <div>
          <h3>{title}</h3>
          {subtitle && <div className="sub">{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
