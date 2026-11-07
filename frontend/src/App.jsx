import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import './App.css'

function Overview() {
  return (
    <div className="welcome-section">
      <span className="eyebrow">CLIMATE ADAPTATION MONITORING</span>
      <h2>Evaluate. Understand. Adapt.</h2>
      <p>
        Monitor the effectiveness, distribution and long-term
        outcomes of climate adaptation interventions.
      </p>
    </div>
  )
}

function Placeholder({ title }) {
  return (
    <div className="welcome-section">
      <span className="eyebrow">EVALADAPT MODULE</span>
      <h2>{title}</h2>
      <p>This module is being developed.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/interventions" element={<Placeholder title="Interventions & Data" />} />
          <Route path="/evaluation" element={<Placeholder title="Impact Evaluation" />} />
          <Route path="/equity" element={<Placeholder title="Impact & Equity" />} />
          <Route path="/diagnosis" element={<Placeholder title="AI-Assisted Diagnosis" />} />
          <Route path="/reports" element={<Placeholder title="Reports & Decisions" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
