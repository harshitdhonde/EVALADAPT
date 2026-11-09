import { NavLink } from "react-router-dom";
import {
  Leaf, LayoutDashboard, Database, ChartNoAxesCombined,
  Users, BrainCircuit, FileText, FlaskConical
} from "lucide-react";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/interventions", label: "Interventions & Data", icon: Database },
  { to: "/evaluation", label: "Impact Evaluation", icon: ChartNoAxesCombined },
  { to: "/equity", label: "Impact & Equity", icon: Users },
  { to: "/diagnosis", label: "AI Diagnosis", icon: BrainCircuit },
  { to: "/reports", label: "Reports & Decisions", icon: FileText }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Leaf size={34} />
        <div>
          <h2>EVALADAPT</h2>
          <span>Climate Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="prototype-box">
        <FlaskConical size={24} />
        <div>
          <strong>Prototype Environment</strong>
          <p>All data shown are simulated for prototype and research demonstration only.</p>
        </div>
      </div>
    </aside>
  );
}
