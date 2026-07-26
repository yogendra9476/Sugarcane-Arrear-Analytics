import React from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import ChartCard, { CHART_TOOLTIP_STYLE } from "../components/ChartCard";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function Ecosystem() {
  const eco = useQuery({ queryKey: ["ecosystem"], queryFn: endpoints.ecosystem });
  const d = eco.data;

  return (
    <div data-testid="page-ecosystem" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">Sugar Ecosystem</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Value chain: farmer → factory → consumer
        </h2>
      </div>

      {d && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {d.value_chain.map((row) => (
              <div key={row.actor} className="gcard p-4">
                <div className="mono text-[9.5px] uppercase tracking-widest text-[#66736d]">{row.actor}</div>
                <div className="kpi-value text-[1.5rem] mt-2" style={{ color: row.color }}>₹{row.value_per_qtl}</div>
                <div className="text-[11px] text-[#66736d] mt-1">{row.share_pct}% of chain</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard testId="eco-value-chart" title="Value Captured per Actor" subtitle="₹ per quintal equivalent">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={d.value_chain} layout="vertical" margin={{ top: 4, right: 30, left: 60, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(11,23,18,.07)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="actor" type="category" tick={{ fontSize: 10 }} width={140} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value_per_qtl" radius={[0, 6, 6, 0]}>
                    {d.value_chain.map((row, i) => <Cell key={i} fill={row.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard testId="eco-shg-chart" title="SHG Seedling Contribution" subtitle="Crore units">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "SHG Seedlings", value: d.shg.seedlings_cr },
                      { name: "Other Nurseries", value: d.shg.other_nurseries_cr },
                    ]}
                    dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3}
                  >
                    <Cell fill="#d8ff73" />
                    <Cell fill="#0f5132" />
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="gcard p-5">
              <div className="mono text-[10px] uppercase tracking-widest text-[#66736d]">Khandsari Growth (2024-25)</div>
              <div className="kpi-value text-2xl mt-2">{fmt.num(d.khandsari.new_units_2024_25)}</div>
              <div className="text-[12px] text-[#66736d]">New units added · {fmt.num(d.khandsari.capacity_tcd)} TCD capacity</div>
              <div className="mt-3 pt-3 border-t border-[#0b1712]/08 text-[11px]">
                Total new crushing capacity (mills + khandsari): <b>{fmt.num(d.khandsari.total_new_capacity_tcd)} TCD</b>
              </div>
            </div>
            <div className="gcard p-5">
              <div className="mono text-[10px] uppercase tracking-widest text-[#66736d]">Women SHGs</div>
              <div className="kpi-value text-2xl mt-2">{fmt.num(d.shg.shg_count)}</div>
              <div className="text-[12px] text-[#66736d]">Groups active in UP cane sector</div>
              <div className="mt-3 pt-3 border-t border-[#0b1712]/08 text-[11px]">
                {d.shg.seedlings_cr} Cr seedlings produced across nurseries.
              </div>
            </div>
            <div className="gcard p-5">
              <div className="mono text-[10px] uppercase tracking-widest text-[#66736d]">Credit Access</div>
              <div className="kpi-value text-2xl mt-2">{d.credit.crop_loan_rate_pct_min}–{d.credit.crop_loan_rate_pct_max}%</div>
              <div className="text-[12px] text-[#66736d]">Formal crop loan rate</div>
              <div className="mt-3 pt-3 border-t border-[#0b1712]/08 text-[11px] text-[#991b1b]">
                Moneylender rate: {d.credit.moneylender_rate_pct_min}–{d.credit.moneylender_rate_pct_max}%
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
