import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';

const DEMOS = [
  { label: 'Candidate', email: 'sumit@example.com', password: 'candidate123' },
  { label: 'Recruiter', email: 'hr@abctech.com', password: 'recruiter123' }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  // Which workspace is the user entering? Drives the Google loginType and copy.
  const asCompany = params.get('as') === 'company';
  const loginType = asCompany ? 'company' : 'candidate';

  const switchTab = (tab) => {
    setError('');
    setParams(tab === 'company' ? { as: 'company' } : {});
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(location.state?.from || dashboardPath(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Login Account</h1>
          <p className="sub">Welcome back! Please enter your details.</p>

          <div className="login-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={!asCompany} className={!asCompany ? 'on' : ''} onClick={() => switchTab('candidate')}>
              🧑‍💻 Candidate Login
            </button>
            <button type="button" role="tab" aria-selected={asCompany} className={asCompany ? 'on' : ''} onClick={() => switchTab('company')}>
              🏢 Company Login
            </button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
          </form>

          <div className="auth-divider"><span>OR</span></div>
          <GoogleLoginButton loginType={loginType} />
          {asCompany && (
            <p className="hint text-center" style={{ marginTop: 8 }}>
              Google sign-in is for existing company accounts. New here? <Link to="/register">Register your company</Link>.
            </p>
          )}

          <p className="auth-alt">New here? <Link to="/register">Create account</Link></p>

          <div className="mt-2">
            <p className="hint text-center">Demo accounts (after seeding):</p>
            <div className="flex gap-1 mt-1 wrap" style={{ justifyContent: 'center' }}>
              {DEMOS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => { setEmail(d.email); setPassword(d.password); }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
