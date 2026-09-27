import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/companies', label: '🏢 Companies' },
  { to: '/admin/jobs', label: '💼 Jobs' },
  { to: '/admin/candidates', label: '🧑‍💻 Candidates' },
  { to: '/admin/applications', label: '📋 Applications' },
  { to: '/admin/contacts', label: '✉️ Contact Requests' },
  { to: '/admin/stories', label: '💬 Placement Stories' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };
  return (
    <div className="page">
      <div className="container dash-layout">
        <aside className="dash-side">
          <div className="me">
            <b>{user.name}</b>
            <span>Administrator</span>
          </div>
          <Link to="/" className="back-to-site">← Back to Site</Link>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
          <button type="button" className="dash-logout" onClick={handleLogout}>Logout</button>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
