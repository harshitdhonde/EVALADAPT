import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ChartNoAxesCombined,
  Map,
  BrainCircuit,
  FileText,
  Leaf,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Interventions', path: '/interventions', icon: Building2 },
  { name: 'Impact Evaluation', path: '/evaluation', icon: ChartNoAxesCombined },
  { name: 'Impact & Equity', path: '/equity', icon: Map },
  { name: 'AI Diagnosis', path: '/diagnosis', icon: BrainCircuit },
  { name: 'Reports & Decisions', path: '/reports', icon: FileText },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Leaf size={23} />
        </div>
        <div>
          <h2>EVALADAPT</h2>
          <span>Climate Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="status-dot" />
        <span>Prototype Environment</span>
      </div>
    </aside>
  )
}

export default Sidebar
