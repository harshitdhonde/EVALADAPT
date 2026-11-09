import { Outlet, useLocation } from "react-router-dom";
import { MapPin, CalendarDays } from "lucide-react";
import Sidebar from "./Sidebar";

const titles = {
  "/": "Dashboard",
  "/interventions": "Interventions & Data",
  "/evaluation": "Impact Evaluation",
  "/equity": "Impact & Equity",
  "/diagnosis": "AI Diagnosis",
  "/reports": "Reports & Decisions"
};

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{titles[location.pathname] || "Workspace"}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{location.pathname === "/" ? "Dashboard" : "Workspace"}</strong>
          </div>
          <div className="topbar-meta">
            <span><MapPin size={17} /> Pune, Maharashtra</span>
            <i />
            <span><CalendarDays size={17} /> Urban Heat Adaptation</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
