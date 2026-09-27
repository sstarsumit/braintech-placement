import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '';

  return (
    <nav className={`navbar ${open ? 'open' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)} aria-label="Braintech Education & Placement — Home">
          <img src="/logo-full-alpha.png" alt="Braintech Education & Placement" className="brand-img" />
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/placement-story">Placement Story</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        <div className="nav-cta">
          {/* Role-based actions: visitors get the two entry flows, each role only
              sees its own workspace links (mirrored by route guards + API authz). */}
          {!user && (
            <>
              <NavLink to="/submit-resume">Submit Resume</NavLink>
              <NavLink to="/post-job">Post Job</NavLink>
            </>
          )}
          {user?.role === 'candidate' && (
            <>
              <NavLink to="/candidate/applications">My Applications</NavLink>
              <NavLink to="/candidate/profile">Profile</NavLink>
            </>
          )}
          {user?.role === 'recruiter' && (
            <>
              <NavLink to="/post-job">Post Job</NavLink>
              <NavLink to="/recruiter">My Jobs</NavLink>
              <NavLink to="/recruiter/company">Company</NavLink>
            </>
          )}
          {user?.role === 'admin' && <NavLink to="/admin">Dashboard</NavLink>}

          <span className="divider" />
          {user ? (
            <span className="nav-user">
              <span className="avatar">{initials}</span>
              <span className="who">
                <Link to={dashboardPath(user.role)} style={{ padding: 0, fontWeight: 600 }}>{user.name.split(' ')[0]}</Link>
                <small>{user.role}</small>
              </span>
              <button className="btn btn-sm btn-outline" style={{ borderColor: '#9fd4cf', color: '#fff', marginLeft: 8 }} onClick={handleLogout}>
                Logout
              </button>
            </span>
          ) : (
            <div className="login-drop" tabIndex={0}>
              <NavLink to="/login">Login Account ▾</NavLink>
              <div className="login-drop-menu">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <span className="t">🧑‍💻 Candidate Login</span>
                  <span className="d">Find jobs &amp; manage applications</span>
                </Link>
                <Link to="/login?as=company" onClick={() => setOpen(false)}>
                  <span className="t">🏢 Company Login</span>
                  <span className="d">Post jobs &amp; manage applicants</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      </div>
    </nav>
  );
}
