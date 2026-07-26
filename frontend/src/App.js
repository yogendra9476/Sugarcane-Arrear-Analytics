import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Overview from "@/pages/Overview";
import MillAnalytics from "@/pages/MillAnalytics";
import FarmerSearch from "@/pages/FarmerSearch";
import MillSearch from "@/pages/MillSearch";
import ArrearTracker from "@/pages/ArrearTracker";
import DistressIndex from "@/pages/DistressIndex";
import DistrictAnalytics from "@/pages/DistrictAnalytics";
import Ecosystem from "@/pages/Ecosystem";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import Settings from "@/pages/Settings";
import { Toaster } from "sonner";
import "@/App.css";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/mill-analytics" element={<MillAnalytics />} />
            <Route path="/farmers" element={<FarmerSearch />} />
            <Route path="/mill-search" element={<MillSearch />} />
            <Route path="/arrears" element={<ArrearTracker />} />
            <Route path="/distress" element={<DistressIndex />} />
            <Route path="/districts" element={<DistrictAnalytics />} />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}
