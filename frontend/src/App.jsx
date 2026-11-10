import { useEffect, useState } from "react";
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

function SplashScreen({ exiting }) {
  return (
    <div className={`splash-screen${exiting ? " splash-screen-exit" : ""}`}>
      <style>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 24px;
          color: #fffdf9;
          background: radial-gradient(circle at 50% 42%, #29364b 0%, #172234 48%, #101827 100%);
          opacity: 1;
          transition: opacity 500ms ease, transform 500ms ease;
        }
        .splash-screen::before,
        .splash-screen::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border: 1px solid rgba(141, 106, 140, .2);
          border-radius: 50%;
          animation: splash-orbit 7s linear infinite;
        }
        .splash-screen::after {
          width: 470px;
          height: 470px;
          animation-direction: reverse;
          border-color: rgba(141, 169, 190, .12);
        }
        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(100%, 650px);
          text-align: center;
          animation: splash-content-in 800ms ease both;
        }
        .splash-mark {
          display: grid;
          place-items: center;
          width: 62px;
          height: 62px;
          margin-bottom: 22px;
          border: 1px solid rgba(234, 215, 228, .35);
          border-radius: 18px;
          color: #ead7e4;
          background: rgba(120, 91, 118, .22);
          font: 800 25px 'Manrope', sans-serif;
          letter-spacing: -1px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, .18);
        }
        .splash-title {
          margin: 0;
          color: #fffdf9;
          font: 800 clamp(38px, 7vw, 58px)/1.1 'Manrope', sans-serif;
          letter-spacing: 2px;
        }
        .splash-eyebrow {
          margin-top: 13px;
          color: #c8b4c7;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
        }
        .splash-divider {
          width: 54px;
          height: 3px;
          margin: 27px 0 24px;
          border-radius: 10px;
          background: #a57d9a;
          animation: splash-line-in 900ms 250ms ease both;
        }
        .splash-tagline {
          margin: 0;
          color: #fffdf9;
          font: 700 clamp(21px, 4vw, 29px)/1.35 'Manrope', sans-serif;
        }
        .splash-description {
          max-width: 490px;
          margin: 13px 0 0;
          color: #b8c4d3;
          font-size: 14px;
          line-height: 1.8;
        }
        .splash-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 42px;
          color: #aab8ca;
          font-size: 11px;
          letter-spacing: .5px;
        }
        .splash-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(170, 184, 202, .25);
          border-top-color: #c8b4c7;
          border-radius: 50%;
          animation: splash-spin 900ms linear infinite;
        }
        .splash-screen-exit {
          opacity: 0;
          transform: scale(1.015);
          pointer-events: none;
        }
        @keyframes splash-content-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-line-in {
          from { opacity: 0; transform: scaleX(.25); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes splash-orbit {
          from { transform: rotate(0deg) scale(.96); }
          to { transform: rotate(360deg) scale(1.04); }
        }
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-screen, .splash-content, .splash-divider,
          .splash-screen::before, .splash-screen::after, .splash-spinner {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div className="splash-content">
        <div className="splash-mark" aria-hidden="true">EA</div>
        <h1 className="splash-title">EVALADAPT</h1>
        <div className="splash-eyebrow">EVIDENCE-DRIVEN EVALUATION</div>
        <div className="splash-divider" />
        <h2 className="splash-tagline">Turning Data Into Meaningful Insights.</h2>
        <p className="splash-description">
          Evaluating interventions. Understanding impact. Supporting better decisions.
        </p>
        <div className="splash-loading">
          <span className="splash-spinner" aria-hidden="true" />
          <span>Preparing your evaluation workspace...</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setSplashExiting(true), 4000);
    const finishTimer = window.setTimeout(() => setShowSplash(false), 4500);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen exiting={splashExiting} />;
  }

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
