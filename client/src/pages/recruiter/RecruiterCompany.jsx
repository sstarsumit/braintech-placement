import { useEffect, useState } from 'react';
import api from '../../api';

const INDUSTRIES = ['IT', 'Electronics', 'Mining', 'FMCG', 'Wire Manufacturing', 'Infrastructure', 'Other'];

export default function RecruiterCompany() {
  const [c, setC] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/companies/me').then((r) => setC(r.data)).catch((e) => setMsg(e.message));
  }, []);

  if (!c) return <div className="spin" />;
  const set = (k) => (e) => setC({ ...c, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const r = await api.put('/companies/me', c);
      setC(r.data);
      setMsg('Company profile saved ✓');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Company Profile</h1>
          <p>This information appears on your job postings.</p>
        </div>
        <span className={`badge ${c.verificationStatus}`} style={{ fontSize: 14, padding: '8px 16px' }}>
          {c.verificationStatus}
        </span>
      </div>
      {msg && <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <form onSubmit={save} className="panel" style={{ marginTop: 0 }}>
        <div className="form-grid">
          <div className="field"><label>Company Name *</label><input required value={c.companyName || ''} onChange={set('companyName')} /></div>
          <div className="field">
            <label>Industry</label>
            <select value={c.industry || ''} onChange={set('industry')}>
              <option value="">Select</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="field"><label>Website</label><input value={c.website || ''} onChange={set('website')} placeholder="https://…" /></div>
          <div className="field">
            <label>Company Size</label>
            <select value={c.size || ''} onChange={set('size')}>
              <option value="">Select</option>
              {['1-10', '11-50', '50-200', '200-500', '500+'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>Founded Year</label><input value={c.foundedYear || ''} onChange={set('foundedYear')} placeholder="e.g. 2015" /></div>
          <div className="field"><label>HR Contact Name</label><input value={c.hrName || ''} onChange={set('hrName')} /></div>
          <div className="field"><label>HR Phone</label><input value={c.hrPhone || ''} onChange={set('hrPhone')} /></div>
          <div className="field"><label>State</label><input value={c.state || ''} onChange={set('state')} /></div>
          <div className="field"><label>City</label><input value={c.city || ''} onChange={set('city')} /></div>
          <div className="field"><label>Address</label><input value={c.address || ''} onChange={set('address')} /></div>
        </div>
        <div className="field"><label>About Company</label><textarea rows={5} value={c.about || ''} onChange={set('about')} placeholder="What does your company do?" /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Company Profile'}</button>
      </form>
    </>
  );
}
