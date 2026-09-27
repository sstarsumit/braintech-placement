import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Standalone admin entry point at /admin/login. Deliberately outside the
 * public Shell: no navbar, no footer, no Google button, no registration
 * link — the only way in is an admin email + password.
 */
export default function AdminLogin() {
  const { user, loading, adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (!loading && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-portal">
      <form className="admin-portal-card" onSubmit={submit}>
        <div className="admin-portal-brand">🛡️</div>
        <h1>Braintech Admin</h1>
        <p className="admin-portal-sub">Administration Portal</p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Admin Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@braintech.com"
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Admin Login'}
        </button>
      </form>
    </div>
  );
}
