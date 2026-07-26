import React from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import KPI from "../components/KPI";
import ChartCard, { CHART_TOOLTIP_STYLE } from "../components/ChartCard";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell,
} from "recharts";

const RISK_COLOR = { Low: "#187a4c", Medium: "#e9c46a", High: "#f4a261", Critical: "#e76f51" };

export default function DistressIndex() {
  const summary = useQuery({ queryKey: ["dist-sum"], queryFn: endpoints.distressSummary });
  const byDist = useQuery({ queryKey: ["dist-by-dist"], queryFn: endpoints.distressByDistrict });
  const radar = useQuery({ queryKey: ["dist-radar"], queryFn: () => endpoints.distressRadar("Shamli,Muzaffarnagar,Meerut,Bijnor") });

  const s = summary.data || {};

  return (
    <div data-testid="page-distress" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#e76f51] mb-3">Farmer Distress Index</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          A composite score for {fmt.num(s.total_farmers)} farmers
        </h2>
        <p className="text-[13px] text-[#0b1712]/65 mt-2">
          At-risk pending amount: <b>{fmt.crore(s.at_risk_pending_cr)}</b>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(s.levels || []).map((l) => (
          <KPI
            key={l.level}
            testId={`fdi-kpi-${l.level.toLowerCase()}`}
            label={`${l.level} Risk`}
            value={fmt.num(l.count)}
            sub={`${l.share_pct}% · avg score ${l.avg_score}`}
            tone={l.level === "Critical" ? "ink" : l.level === "Low" ? "mint" : "default"}
          />
        ))}
      </div>

      <div className="gcard p-5">
        <div className="mono text-[10px] uppercase tracking-widest text-[#0b1712]/65 mb-2">Methodology</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(s.methodology?.components || []).map((c) => (
            <div key={c.name} className="bg-[#f0ecdf] rounded-lg p-3">
              <div className="text-[12px] font-semibold">{c.name}</div>
              <div className="mono text-[16px] mt-1">{(c.weight * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div className="mt-3 mono text-[10.5px] text-[#0b1712]/65">
          Thresholds → Low &lt; 35 · Medium 35–55 · High 55–75 · Critical ≥ 75
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="fdi-radar" title="District Comparison" subtitle="Distress components (0–100)">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={[
              { component: "Payment Delay" },
              { component: "Arrear Severity" },
              { component: "Low Supply" },
              { component: "Complaints" },
              { component: "Transport" },
            ].map((row) => {
              (radar.data || []).forEach((d) => { row[d.district] = d[row.component]; });
              return row;
            })}>
              <PolarGrid stroke="rgba(11,23,18,.15)" />
              <PolarAngleAxis dataKey="component" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              {(radar.data || []).map((d, i) => (
                <Radar key={d.district} name={d.district} dataKey={d.district}
                       stroke={["#e76f51", "#0f5132", "#2563eb", "#e9c46a"][i]}
                       fill={["#e76f51", "#0f5132", "#2563eb", "#e9c46a"][i]}
                       fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="fdi-by-district" title="District Distress Ranking" subtitle="Avg score">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byDist.data || []} layout="vertical" margin={{ top: 4, right: 20, left: 40, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="avg_score" radius={[0, 6, 6, 0]}>
                {(byDist.data || []).map((r, i) => (
                  <Cell key={i} fill={
                    r.avg_score >= 75 ? "#e76f51" :
                    r.avg_score >= 55 ? "#f4a261" :
                    r.avg_score >= 35 ? "#e9c46a" : "#187a4c"
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="gcard overflow-hidden">
        <div className="p-4 border-b border-[#0b1712]/08">
          <div className="text-[14px] font-semibold">District Risk Breakdown</div>
        </div>
        <table className="w-full gtable text-[12.5px]">
          <thead className="bg-[#0b1712] text-[#f7f4ec]">
            <tr>
              {["District", "Avg Score", "Critical", "High", "Medium", "Low", "Total"].map((h) => (
                <th key={h} className="text-left px-3 py-3 mono text-[10px] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(byDist.data || []).map((r) => (
              <tr key={r.district} className="border-t border-[#0b1712]/06">
                <td className="px-3 py-2.5 font-semibold">{r.district}</td>
                <td className="px-3 py-2.5 mono">{r.avg_score}</td>
                <td className="px-3 py-2.5 mono text-[#991b1b]">{r.critical}</td>
                <td className="px-3 py-2.5 mono text-[#b03a1e]">{r.high}</td>
                <td className="px-3 py-2.5 mono text-[#7a5a12]">{r.medium}</td>
                <td className="px-3 py-2.5 mono text-[#0f5132]">{r.low}</td>
                <td className="px-3 py-2.5 mono">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
