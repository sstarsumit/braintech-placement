import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/recruiter', label: '🏠 Dashboard', end: true },
  { to: '/recruiter/jobs', label: '💼 My Jobs' },
  { to: '/recruiter/company', label: '🏢 Company Profile' }
];

export default function RecruiterLayout() {
  const { user } = useAuth();
  return (
    <div className="page">
      <div className="container dash-layout">
        <aside className="dash-side">
          <div className="me">
            <b>{user.name}</b>
            <span>Recruiter · {user.email}</span>
          </div>
          <Link to="/" className="back-to-site">← Back to Site</Link>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
