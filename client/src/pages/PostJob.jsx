import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import PageBanner from '../components/PageBanner.jsx';
import SkillsInput from '../components/SkillsInput.jsx';
import Autocomplete from '../components/Autocomplete.jsx';
import api from '../api';
import { SKILLS, CITIES, STATES, INDUSTRY_OPTIONS, suggest } from '../lib/suggestions.js';

export default function PostJob() {
  const { user, register } = useAuth();
  const [mode, setMode] = useState('company'); // company | job
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Step 1 — company + account
  const [c, setC] = useState({
    hrName: '', companyName: '', email: '', phone: '', password: '',
    industry: 'IT', website: '', size: '11-50', state: '', city: '', address: ''
  });
  const setCk = (k) => (e) => setC({ ...c, [k]: e.target.value });

  // Step 2 — job details
  const [j, setJ] = useState({
    title: '', department: '', industry: 'IT', location: '',
    employmentType: 'Full Time', workMode: 'On-site',
    experienceMin: 0, experienceMax: 2, salaryMin: 3, salaryMax: 6,
    education: '', openings: 1, deadline: '',
    description: '', responsibilities: '', requirements: '', skills: ''
  });
  const setJk = (k) => (e) => setJ({ ...j, [k]: e.target.value });

  const list = (s) => s.split('\n').map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      let u = user;
      if (!u) {
        u = await register({
          name: c.hrName || c.companyName, email: c.email, phone: c.phone,
          password: c.password, role: 'recruiter'
        });
      }
      await api.put('/companies/me', {
        companyName: c.companyName, industry: c.industry, website: c.website,
        size: c.size, hrName: c.hrName, hrPhone: c.phone,
        state: c.state, city: c.city, address: c.address
      });
      await api.post('/jobs', {
        title: j.title, department: j.department, industry: j.industry,
        location: j.location, employmentType: j.employmentType, workMode: j.workMode,
        experienceMin: Number(j.experienceMin) || 0, experienceMax: Number(j.experienceMax) || 0,
        salaryMin: Number(j.salaryMin) || 0, salaryMax: Number(j.salaryMax) || 0,
        education: j.education, openings: Number(j.openings) || 1,
        deadline: j.deadline || undefined,
        description: j.description,
        responsibilities: list(j.responsibilities),
        requirements: list(j.requirements),
        skills: j.skills.split(',').map((s) => s.trim()).filter(Boolean)
      });
      navigate(dashboardPath('recruiter') + '/jobs');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <PageBanner
        title="Post Jobs"
        sub="Register your company, then publish your vacancy. Admin verifies new companies before jobs go live."
        crumbs={[{ label: 'Post Job' }]}
      />
      <div className="page">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="form-card">
            {!user && (
              <div className="steps">
                <div className={`st ${mode === 'company' ? 'on' : 'done'}`}>1. Company</div>
                <div className={`st ${mode === 'job' ? 'on' : ''}`}>2. Job Details</div>
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}

            {mode === 'company' && (
              <>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Company details</h2>
                {user && user.role === 'recruiter' && (
                  <div className="alert alert-info">Logged in as {user.name} — your existing company profile will be updated.</div>
                )}
                <div className="form-grid">
                  <div className="field"><label>HR / Owner Name *</label><input value={c.hrName} onChange={setCk('hrName')} placeholder="e.g. Rakesh Nair" disabled={!!user} /></div>
                  <div className="field"><label>Company Name *</label><input value={c.companyName} onChange={setCk('companyName')} placeholder="e.g. ABC Technologies" /></div>
                  {!user && (
                    <>
                      <div className="field"><label>Email *</label><input type="email" value={c.email} onChange={setCk('email')} placeholder="hr@company.com" /></div>
                      <div className="field"><label>Password *</label><input type="password" minLength={6} value={c.password} onChange={setCk('password')} placeholder="Min 6 characters" /></div>
                    </>
                  )}
                  <div className="field"><label>Phone</label><input value={c.phone} onChange={setCk('phone')} placeholder="+91 98765 43210" /></div>
                  <div className="field">
                    <label>Industry</label>
                    <select value={c.industry} onChange={setCk('industry')}>
                      {['IT', 'Electronics', 'Mining', 'FMCG', 'Wire Manufacturing', 'Infrastructure', 'Other'].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Website</label><input value={c.website} onChange={setCk('website')} placeholder="https://…" /></div>
                  <div className="field">
                    <label>Company Size</label>
                    <select value={c.size} onChange={setCk('size')}>
                      {['1-10', '11-50', '50-200', '200-500', '500+'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>State</label><Autocomplete value={c.state} onChange={(v) => setC({ ...c, state: v })} suggestions={suggest(STATES, c.state, 8)} placeholder="Rajasthan" /></div>
                  <div className="field"><label>City</label><Autocomplete value={c.city} onChange={(v) => setC({ ...c, city: v })} suggestions={suggest(CITIES, c.city, 8)} placeholder="Jaipur" /></div>
                </div>
                <div className="field"><label>Company Address</label><input value={c.address} onChange={setCk('address')} placeholder="Street, Area" /></div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!c.companyName) { setError('Company name is required'); return; }
                    if (!user && (!c.email || !c.password || !c.hrName)) { setError('HR name, email and password are required'); return; }
                    setError(''); setMode('job');
                  }}
                >
                  Continue to Job Details →
                </button>
              </>
            )}

            {mode === 'job' && (
              <form onSubmit={submit}>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Job details</h2>
                <div className="form-grid">
                  <div className="field"><label>Job Title *</label><input required value={j.title} onChange={setJk('title')} placeholder="e.g. Frontend Developer" /></div>
                  <div className="field"><label>Department</label><input value={j.department} onChange={setJk('department')} placeholder="e.g. Engineering" /></div>
                  <div className="field">
                    <label>Location *</label>
                    <Autocomplete
                      required
                      value={j.location}
                      onChange={(v) => setJ({ ...j, location: v })}
                      suggestions={suggest(CITIES, j.location, 8)}
                      placeholder="e.g. Jaipur, Rajasthan"
                    />
                  </div>
                  <div className="field">
                    <label>Employment Type</label>
                    <select value={j.employmentType} onChange={setJk('employmentType')}>
                      {['Full Time', 'Part Time', 'Internship', 'Contract'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Work Mode</label>
                    <select value={j.workMode} onChange={setJk('workMode')}>
                      {['On-site', 'Hybrid', 'Remote'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Education</label>
                    <Autocomplete value={j.education} onChange={(v) => setJ({ ...j, education: v })} placeholder="e.g. B.Tech / BCA / MCA" suggestions={[]} />
                  </div>
                  <div className="field"><label>Experience Min (years)</label><input type="number" min="0" value={j.experienceMin} onChange={setJk('experienceMin')} /></div>
                  <div className="field"><label>Experience Max (years)</label><input type="number" min="0" value={j.experienceMax} onChange={setJk('experienceMax')} /></div>
                  <div className="field"><label>Salary Min (LPA)</label><input type="number" min="0" step="0.5" value={j.salaryMin} onChange={setJk('salaryMin')} /></div>
                  <div className="field"><label>Salary Max (LPA)</label><input type="number" min="0" step="0.5" value={j.salaryMax} onChange={setJk('salaryMax')} /></div>
                  <div className="field"><label>Number of Openings</label><input type="number" min="1" value={j.openings} onChange={setJk('openings')} /></div>
                  <div className="field"><label>Application Deadline</label><input type="date" value={j.deadline} onChange={setJk('deadline')} /></div>
                </div>
                <div className="field"><label>Skills Required</label><SkillsInput value={j.skills} onChange={(v) => setJ({ ...j, skills: v })} staticList={SKILLS} placeholder="React, JavaScript, HTML" /></div>
                <div className="field"><label>Job Description *</label><textarea required rows={5} value={j.description} onChange={setJk('description')} placeholder="About the role…" /></div>
                <div className="field"><label>Responsibilities (one per line)</label><textarea rows={4} value={j.responsibilities} onChange={setJk('responsibilities')} placeholder={'- Develop new features\n- Review code'} /></div>
                <div className="field"><label>Requirements (one per line)</label><textarea rows={4} value={j.requirements} onChange={setJk('requirements')} placeholder={'- 1+ years React\n- REST APIs'} /></div>
                <div className="flex gap-1">
                  {!user && <button type="button" className="btn btn-ghost" onClick={() => setMode('company')}>← Back</button>}
                  <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit Job ✓'}</button>
                </div>
                <p className="hint mt-1">Your job goes to the admin approval queue and appears on the site once approved.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
