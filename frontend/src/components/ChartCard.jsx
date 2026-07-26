import React from "react";

export default function ChartCard({ title, subtitle, action, children, testId, className = "" }) {
  return (
    <div data-testid={testId} className={`gcard p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="mono text-[10.5px] uppercase tracking-[0.15em] text-[#66736d]">
            {title}
          </div>
          {subtitle && (
            <div className="text-[13px] font-semibold mt-1 tracking-tight">{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

export const CHART_COLORS = [
  "#0f5132", "#2d6a4f", "#52b788", "#e9c46a", "#f4a261",
  "#e76f51", "#60a5fa", "#a78bfa", "#187a4c", "#b8860b",
];

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0b1712",
    color: "#f7f4ec",
    borderRadius: 10,
    border: "none",
    fontSize: 11,
    fontFamily: "DM Mono, monospace",
    padding: "8px 12px",
  },
  labelStyle: { color: "#d8ff73", fontSize: 10, textTransform: "uppercase" },
  itemStyle: { color: "#f7f4ec" },
};
