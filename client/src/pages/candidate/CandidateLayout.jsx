import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/candidate', label: '🏠 Dashboard', end: true },
  { to: '/candidate/profile', label: '👤 My Profile' },
  { to: '/candidate/applications', label: '📋 My Applications' },
  { to: '/candidate/saved', label: '♥ Saved Jobs' }
];

export default function CandidateLayout() {
  const { user } = useAuth();
  return (
    <div className="page">
      <div className="container dash-layout">
        <aside className="dash-side">
          <div className="me">
            <b>{user.name}</b>
            <span>Candidate · {user.email}</span>
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
