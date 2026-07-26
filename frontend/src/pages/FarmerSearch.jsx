import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import { exportCSV, exportExcel, exportPDF, printSection } from "../lib/exports";
import { Search, Download, FileSpreadsheet, FileText, Printer, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../components/ui/dialog";

const useDebounced = (v, ms = 350) => {
  const [x, setX] = useState(v);
  useEffect(() => { const t = setTimeout(() => setX(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return x;
};

const riskColor = (r) => ({
  Low: "bg-[#dff7e9] text-[#0f5132]",
  Medium: "bg-[#e9c46a]/40 text-[#5a3f0a]",
  High: "bg-[#f4a261]/45 text-[#7a2d0f]",
  Critical: "bg-[#e76f51]/40 text-[#6b1409]",
}[r] || "bg-slate-100");

const payColor = (s) => ({
  Paid: "bg-[#dff7e9] text-[#0f5132]",
  Partial: "bg-[#e9c46a]/40 text-[#5a3f0a]",
  Delayed: "bg-[#f4a261]/45 text-[#7a2d0f]",
  Pending: "bg-[#e76f51]/40 text-[#6b1409]",
}[s] || "bg-slate-100");

export default function FarmerSearch() {
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("distress_score");
  const [sortDir, setSortDir] = useState(-1);
  const [selected, setSelected] = useState(null);
  const dq = useDebounced(q);
  const limit = 25;

  const districts = useQuery({ queryKey: ["districts-list"], queryFn: endpoints.districts });

  const params = useMemo(() => ({
    q: dq || undefined,
    district: district !== "all" ? district : undefined,
    payment_status: status !== "all" ? status : undefined,
    risk_level: risk !== "all" ? risk : undefined,
    sort_by: sortBy, sort_dir: sortDir, page, limit,
  }), [dq, district, status, risk, sortBy, sortDir, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["farmers", params],
    queryFn: () => endpoints.farmers(params),
    keepPreviousData: true,
  });

  const detail = useQuery({
    queryKey: ["farmer-detail", selected],
    queryFn: () => endpoints.farmerDetail(selected),
    enabled: !!selected,
  });

  const rows = data?.items || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / limit);

  const exportRows = () => rows.map((r) => ({
    Code: r.farmer_code, Name: r.name, Phone: r.phone,
    Village: r.village_name, District: r.district_name, Mill: r.mill_name,
    "Supply (qtl)": r.supply_qtl, "Paid (₹)": r.paid_amount,
    "Pending (₹)": r.pending_amount, "Delay (d)": r.avg_delay_days,
    Status: r.payment_status, Risk: r.risk_level, Distress: r.distress_score,
  }));

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(-sortDir);
    else { setSortBy(col); setSortDir(-1); }
  };

  return (
    <div data-testid="page-farmer-search" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">
          Farmer Search Engine
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Find any farmer across Western UP
        </h2>
        <p className="text-[13px] text-[#0b1712]/65 mt-2">
          {fmt.num(total)} matching records · Real-time debounced search · Export CSV / Excel / PDF
        </p>
      </div>

      {/* Filters */}
      <div className="gcard p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0b1712]/65" />
            <Input
              data-testid="farmer-search-input"
              placeholder="Search by name, code, phone or village…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="pl-9 bg-white/70"
            />
          </div>
          <Select value={district} onValueChange={(v) => { setDistrict(v); setPage(1); }}>
            <SelectTrigger data-testid="filter-district" className="bg-white/70"><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {(districts.data || []).map((d) => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger data-testid="filter-status" className="bg-white/70"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={(v) => { setRisk(v); setPage(1); }}>
            <SelectTrigger data-testid="filter-risk" className="bg-white/70"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button data-testid="btn-csv" variant="outline" size="sm" onClick={() => exportCSV(exportRows(), "farmers.csv")}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
          <Button data-testid="btn-xlsx" variant="outline" size="sm" onClick={() => exportExcel(exportRows(), "farmers.xlsx", "Farmers")}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
          </Button>
          <Button data-testid="btn-pdf" variant="outline" size="sm" onClick={() => exportPDF(exportRows(), "farmers.pdf", "Farmer Report")}>
            <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
          </Button>
          <Button data-testid="btn-print" variant="outline" size="sm" onClick={printSection}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="gcard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full gtable text-[12.5px]">
            <thead className="bg-[#0b1712] text-[#f7f4ec]">
              <tr>
                {[
                  ["farmer_code", "Code"],
                  ["name", "Name"],
                  ["village_name", "Village"],
                  ["district_name", "District"],
                  ["mill_name", "Mill"],
                  ["supply_qtl", "Supply (qtl)"],
                  ["pending_amount", "Pending ₹"],
                  ["avg_delay_days", "Delay"],
                  ["payment_status", "Status"],
                  ["risk_level", "Risk"],
                ].map(([k, label]) => (
                  <th key={k} className="text-left px-3 py-3 mono text-[10px] uppercase tracking-widest cursor-pointer hover:text-[#d8ff73]"
                      onClick={() => toggleSort(k)}>
                    {label}{sortBy === k ? (sortDir === -1 ? " ↓" : " ↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="p-8 text-center text-[#0b1712]/65">Loading…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-[#0b1712]/65">No farmers match.</td></tr>
              )}
              {rows.map((f) => (
                <tr key={f.id} data-testid={`row-farmer-${f.id}`}
                    className="border-t border-[#0b1712]/06 cursor-pointer"
                    onClick={() => setSelected(f.id)}>
                  <td className="px-3 py-2.5 mono text-[10.5px]">{f.farmer_code}</td>
                  <td className="px-3 py-2.5 font-semibold">{f.name}</td>
                  <td className="px-3 py-2.5">{f.village_name}</td>
                  <td className="px-3 py-2.5">{f.district_name}</td>
                  <td className="px-3 py-2.5 text-[#0f5132]">{f.mill_name}</td>
                  <td className="px-3 py-2.5 mono text-right">{f.supply_qtl}</td>
                  <td className="px-3 py-2.5 mono text-right">₹{fmt.num(Math.round(f.pending_amount))}</td>
                  <td className="px-3 py-2.5 mono text-right">{f.avg_delay_days}d</td>
                  <td className="px-3 py-2.5">
                    <Badge className={`${payColor(f.payment_status)} border-0 text-[10px]`}>{f.payment_status}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={`${riskColor(f.risk_level)} border-0 text-[10px]`}>{f.risk_level}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-[#0b1712]/08 text-[11px] text-[#0b1712]/65">
          <span>Page {page} of {pages || 1} · {fmt.num(total)} total</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl" data-testid="farmer-detail-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {detail.data?.farmer?.name || "Farmer"}
            </DialogTitle>
          </DialogHeader>
          {detail.data?.farmer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ["Code", detail.data.farmer.farmer_code],
                  ["Phone", detail.data.farmer.phone],
                  ["Village", detail.data.farmer.village_name],
                  ["District", detail.data.farmer.district_name],
                  ["Mill", detail.data.farmer.mill_name],
                  ["Land", `${detail.data.farmer.land_acres} acres`],
                  ["Supply", `${detail.data.farmer.supply_qtl} qtl`],
                  ["Paid", `₹${fmt.num(Math.round(detail.data.farmer.paid_amount))}`],
                  ["Pending", `₹${fmt.num(Math.round(detail.data.farmer.pending_amount))}`],
                  ["Delay", `${detail.data.farmer.avg_delay_days} days`],
                  ["Distress", detail.data.farmer.distress_score],
                  ["Risk", detail.data.farmer.risk_level],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[#f0ecdf] rounded-lg p-3">
                    <div className="mono text-[9.5px] uppercase text-[#0b1712]/65 tracking-widest">{l}</div>
                    <div className="text-[13px] font-semibold mt-1">{v}</div>
                  </div>
                ))}
              </div>
              {detail.data.complaints?.length > 0 && (
                <div>
                  <div className="mono text-[10px] uppercase text-[#0b1712]/65 tracking-widest mb-2">Complaints</div>
                  <div className="space-y-2">
                    {detail.data.complaints.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-[#f0ecdf] rounded-lg px-3 py-2 text-[12px]">
                        <span>{c.category}</span>
                        <span className="chip chip-amber text-[9.5px]">{c.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
