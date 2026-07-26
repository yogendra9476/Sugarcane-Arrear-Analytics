import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import { exportCSV, exportExcel, exportPDF } from "../lib/exports";
import { Search, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";

const useDebounced = (v, ms = 350) => {
  const [x, setX] = useState(v);
  useEffect(() => { const t = setTimeout(() => setX(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return x;
};

export default function MillSearch() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [district, setDistrict] = useState("all");
  const [minHealth, setMinHealth] = useState("all");
  const [page, setPage] = useState(1);
  const nav = useNavigate();
  const dq = useDebounced(q);
  const limit = 20;

  const districts = useQuery({ queryKey: ["districts-list"], queryFn: endpoints.districts });

  const params = useMemo(() => ({
    q: dq || undefined,
    type: type !== "all" ? type : undefined,
    district: district !== "all" ? district : undefined,
    min_health: minHealth !== "all" ? Number(minHealth) : undefined,
    page, limit,
  }), [dq, type, district, minHealth, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["mills-list", params],
    queryFn: () => endpoints.mills(params),
    keepPreviousData: true,
  });

  const rows = data?.items || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / limit);

  const exportRows = () => rows.map((m) => ({
    Code: m.code, Name: m.name, District: m.district_name, Type: m.type,
    Capacity_TCD: m.capacity_tcd, Recovery: m.recovery_pct,
    Payment_Eff: m.payment_efficiency, Delay_Days: m.avg_payment_delay_days,
    Pending_Cr: m.pending_amount_cr, Health: m.health_score, Status: m.status,
  }));

  return (
    <div data-testid="page-mill-search" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">Mill Search</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          {fmt.num(total)} mills across Western UP
        </h2>
      </div>

      <div className="gcard p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" />
            <Input data-testid="mill-search-input" placeholder="Mill name, code or district…"
                   value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9 bg-white/70" />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="bg-white/70"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Cooperative">Cooperative</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={(v) => { setDistrict(v); setPage(1); }}>
            <SelectTrigger className="bg-white/70"><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {(districts.data || []).map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={minHealth} onValueChange={(v) => { setMinHealth(v); setPage(1); }}>
            <SelectTrigger className="bg-white/70"><SelectValue placeholder="Health" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Health</SelectItem>
              <SelectItem value="90">Excellent (≥90)</SelectItem>
              <SelectItem value="75">Good (≥75)</SelectItem>
              <SelectItem value="60">Fair (≥60)</SelectItem>
              <SelectItem value="40">Poor (≥40)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => exportCSV(exportRows(), "mills.csv")}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportExcel(exportRows(), "mills.xlsx", "Mills")}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(exportRows(), "mills.pdf", "Mill Report")}>
            <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
          </Button>
        </div>
      </div>

      <div className="gcard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full gtable text-[12.5px]">
            <thead className="bg-[#0b1712] text-[#f7f4ec]">
              <tr>
                {["Mill", "District", "Type", "Capacity TCD", "Recovery %", "Pay Eff %", "Delay", "Pending ₹Cr", "Health"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 mono text-[10px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="p-8 text-center text-[#66736d]">Loading…</td></tr>}
              {!isLoading && rows.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-[#66736d]">No mills match.</td></tr>}
              {rows.map((m) => (
                <tr key={m.id} data-testid={`row-mill-${m.id}`} className="border-t border-[#0b1712]/06 cursor-pointer"
                    onClick={() => nav(`/mill-analytics?mill=${m.id}`)}>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold">{m.name}</div>
                    <div className="mono text-[9.5px] text-[#66736d] uppercase">{m.code}</div>
                  </td>
                  <td className="px-3 py-2.5">{m.district_name}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={`border-0 text-[10px] ${m.type === "Private" ? "bg-[#dff7e9] text-[#0f5132]" : "bg-[#d8ff73] text-[#0b1712]"}`}>
                      {m.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 mono text-right">{fmt.num(m.capacity_tcd)}</td>
                  <td className="px-3 py-2.5 mono text-right">{m.recovery_pct}%</td>
                  <td className="px-3 py-2.5 mono text-right">{m.payment_efficiency}%</td>
                  <td className="px-3 py-2.5 mono text-right">{m.avg_payment_delay_days}d</td>
                  <td className="px-3 py-2.5 mono text-right">₹{m.pending_amount_cr}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#0b1712]/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                             style={{
                               width: `${m.health_score}%`,
                               background: m.health_score >= 75 ? "#187a4c" : m.health_score >= 60 ? "#e9c46a" : "#e76f51"
                             }} />
                      </div>
                      <span className="mono text-[11px]">{m.health_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-[#0b1712]/08 text-[11px] text-[#66736d]">
          <span>Page {page} of {pages || 1} · {fmt.num(total)} total</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
