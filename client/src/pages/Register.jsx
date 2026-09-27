import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';

export default function Register() {
  const [role, setRole] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role });
      navigate(dashboardPath(user.role));
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
          <h1>Create Account</h1>
          <p className="sub">Join Braintech Education &amp; Placement.</p>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="role-pick">
            <button type="button" className={role === 'candidate' ? 'on' : ''} onClick={() => setRole('candidate')}>
              <span className="t">🧑‍💻 I'm a Candidate</span>
              <span className="d">Find jobs and apply</span>
            </button>
            <button type="button" className={role === 'recruiter' ? 'on' : ''} onClick={() => setRole('recruiter')}>
              <span className="t">🏢 I'm Hiring</span>
              <span className="d">Post jobs and hire</span>
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="field">
              <label>Full Name</label>
              <input required value={form.name} onChange={set('name')} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Mobile</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Password</label>
                <input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input required type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create Account'}</button>
          </form>
          <p className="auth-alt">
            Already registered? <Link to="/login">Login</Link>
            {role === 'candidate' ? <> · <Link to="/submit-resume">full resume form</Link></> : <> · <Link to="/post-job">post a job instead</Link></>}
          </p>
        </div>
      </div>
    </div>
  );
}
