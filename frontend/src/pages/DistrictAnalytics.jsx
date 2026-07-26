import React from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import ChartCard, { CHART_TOOLTIP_STYLE } from "../components/ChartCard";
import {
  ResponsiveContainer, Treemap, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

export default function DistrictAnalytics() {
  const list = useQuery({ queryKey: ["district-analytics"], queryFn: endpoints.districtAnalytics });

  const treemapData = (list.data || []).map((d) => ({
    name: d.district,
    size: d.farmers,
    fill: d.avg_distress_score >= 75 ? "#e76f51" :
          d.avg_distress_score >= 55 ? "#f4a261" :
          d.avg_distress_score >= 35 ? "#e9c46a" : "#187a4c",
  }));

  return (
    <div data-testid="page-districts" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">District Analytics</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          14 districts of Western UP
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="dist-treemap" title="Farmer Footprint by District" subtitle="Color = distress score">
          <ResponsiveContainer width="100%" height={380}>
            <Treemap data={treemapData} dataKey="size" stroke="#f7f4ec" fill="#0f5132" content={<CustomizedContent />} />
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="dist-pending-chart" title="Pending Amount by District" subtitle="₹ Cr">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={list.data || []} layout="vertical" margin={{ top: 4, right: 30, left: 40, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="total_pending_cr" fill="#e76f51" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="gcard overflow-hidden">
        <table className="w-full gtable text-[12.5px]">
          <thead className="bg-[#0b1712] text-[#f7f4ec]">
            <tr>
              {["District", "Farmers", "Mills", "Avg Health", "Recovery %", "Supply L qtl", "Pending ₹Cr", "Distress", "Critical"].map((h) => (
                <th key={h} className="text-left px-3 py-3 mono text-[10px] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(list.data || []).map((d) => (
              <tr key={d.district} className="border-t border-[#0b1712]/06">
                <td className="px-3 py-2.5 font-semibold">{d.district}</td>
                <td className="px-3 py-2.5 mono">{fmt.num(d.farmers)}</td>
                <td className="px-3 py-2.5 mono">{d.mills}</td>
                <td className="px-3 py-2.5 mono">{d.avg_health_score}</td>
                <td className="px-3 py-2.5 mono">{d.avg_recovery_pct}%</td>
                <td className="px-3 py-2.5 mono">{d.total_supply_lakh_qtl}</td>
                <td className="px-3 py-2.5 mono text-[#991b1b]">₹{d.total_pending_cr}</td>
                <td className="px-3 py-2.5 mono">{d.avg_distress_score}</td>
                <td className="px-3 py-2.5 mono">{fmt.num(d.critical_farmers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CustomizedContent = ({ x, y, width, height, name, size, fill }) => (
  <g>
    <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#f7f4ec" strokeWidth={2} />
    {width > 60 && height > 40 && (
      <>
        <text x={x + 8} y={y + 20} fill="#f7f4ec" fontSize={12} fontWeight={700}>{name}</text>
        <text x={x + 8} y={y + 36} fill="#f7f4ec" fontSize={10} fontFamily="DM Mono">
          {size?.toLocaleString("en-IN")} farmers
        </text>
      </>
    )}
  </g>
);
