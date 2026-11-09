import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Overview from "./pages/Overview";
import Interventions from "./pages/Interventions";
import Evaluation from "./pages/Evaluation";
import ImpactEquity from "./pages/ImpactEquity";
import Diagnosis from "./pages/Diagnosis";
import Reports from "./pages/Reports";

function Placeholder({ title }) {
  return (
    <div className="placeholder-page">
      <div className="eyebrow">EVALADAPT WORKSPACE</div>
      <h1>{title}</h1>
      <p>This module will be connected to the evaluation engine.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/interventions" element={<Interventions />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/equity" element={<ImpactEquity />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
