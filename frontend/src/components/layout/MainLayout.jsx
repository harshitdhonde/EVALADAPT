import { Outlet, useLocation } from 'react-router-dom'
import { MapPin, CalendarDays } from 'lucide-react'
import Sidebar from './Sidebar'

const pageTitles = {
  '/': 'Overview Dashboard',
  '/interventions': 'Interventions & Data',
  '/evaluation': 'Impact Evaluation',
  '/equity': 'Impact & Equity',
  '/diagnosis': 'AI-Assisted Diagnosis',
  '/reports': 'Reports & Decisions',
}

function MainLayout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'EVALADAPT'

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">EVALADAPT / WORKSPACE</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-info">
            <div className="location-info">
              <MapPin size={16} />
              <span>Pune, Maharashtra</span>
            </div>
            <div className="project-info">
              <CalendarDays size={16} />
              <span>Urban Heat Adaptation</span>
            </div>
          </div>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default MainLayout
