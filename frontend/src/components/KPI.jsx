import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Info } from "lucide-react";

export default function KPI({ label, value, sub, testId, tone = "default", tooltip }) {
  const toneClass = {
    default: "",
    ink: "bg-[#0b1712] text-[#f7f4ec]",
    lime: "bg-[#d8ff73]",
    mint: "bg-[#dff7e9]",
  }[tone];

  return (
    <div
      data-testid={testId}
      className={`gcard p-4 md:p-5 relative ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`mono text-[9.5px] uppercase tracking-[0.14em] ${
            tone === "ink" ? "text-[#d8ff73]" : "text-[#66736d]"
          }`}
        >
          {label}
        </div>
        {tooltip && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 opacity-60" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[280px] text-[11px]">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="kpi-value text-[1.7rem] md:text-[1.9rem] font-medium mt-3 leading-none">
        {value}
      </div>
      {sub && (
        <div className={`text-[11px] mt-2 ${tone === "ink" ? "text-[#f7f4ec]/70" : "text-[#66736d]"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}
