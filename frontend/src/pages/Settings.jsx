import React from "react";
import { API } from "../lib/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

export default function Settings() {
  const reseed = async () => {
    try {
      const r = await axios.post(`${API}/admin/seed?force=true`);
      toast.success(`Reseeded: ${r.data.mills} mills, ${r.data.farmers} farmers`);
    } catch (e) {
      toast.error("Reseed failed");
    }
  };

  return (
    <div data-testid="page-settings" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">Settings</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Platform configuration</h2>
      </div>

      <div className="gcard p-6 space-y-4">
        <div>
          <div className="text-[14px] font-semibold">Platform</div>
          <div className="text-[12px] text-[#66736d]">Ganna Analytics 2.0 · Western UP</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#f0ecdf] rounded-lg p-3">
            <div className="mono text-[9.5px] uppercase text-[#66736d]">Region</div>
            <div className="text-[13px] font-semibold mt-1">Western UP</div>
          </div>
          <div className="bg-[#f0ecdf] rounded-lg p-3">
            <div className="mono text-[9.5px] uppercase text-[#66736d]">Season</div>
            <div className="text-[13px] font-semibold mt-1">2024–25</div>
          </div>
          <div className="bg-[#f0ecdf] rounded-lg p-3">
            <div className="mono text-[9.5px] uppercase text-[#66736d]">API Base</div>
            <div className="mono text-[10.5px] mt-1 break-all">{API}</div>
          </div>
          <div className="bg-[#f0ecdf] rounded-lg p-3">
            <div className="mono text-[9.5px] uppercase text-[#66736d]">Status</div>
            <Badge className="mt-1 bg-[#dff7e9] text-[#0f5132] border-0">Live</Badge>
          </div>
        </div>
      </div>

      <div className="gcard p-6 space-y-4">
        <div>
          <div className="text-[14px] font-semibold">Data</div>
          <div className="text-[12px] text-[#66736d]">
            Realistic Western UP synthetic dataset · Reseed will wipe and regenerate all farmers, mills, complaints.
          </div>
        </div>
        <Button data-testid="btn-reseed" onClick={reseed} className="bg-[#0b1712] text-[#f7f4ec] hover:bg-[#1a2a22]">
          Reseed Database
        </Button>
      </div>

      <div className="gcard p-6">
        <div className="text-[14px] font-semibold mb-2">Health Score Formula</div>
        <div className="mono text-[11px] bg-[#0b1712] text-[#d8ff73] rounded-lg p-4">
          score = 0.40 · payment_efficiency<br />
          &nbsp;&nbsp;&nbsp;&nbsp; + 0.25 · min(100, recovery × 8)<br />
          &nbsp;&nbsp;&nbsp;&nbsp; + 0.15 · complaint_score<br />
          &nbsp;&nbsp;&nbsp;&nbsp; + 0.10 · delay_penalty<br />
          &nbsp;&nbsp;&nbsp;&nbsp; + 0.10 · capacity_utilization
        </div>
      </div>
    </div>
  );
}
