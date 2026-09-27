import { useState } from 'react';
import SkillsInput from '../components/SkillsInput.jsx';
import Autocomplete from '../components/Autocomplete.jsx';
import { SKILLS, CITIES, STATES, PREFERENCES } from '../lib/suggestions.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageBanner from '../components/PageBanner.jsx';
import api from '../api';

const STEPS = ['Account', 'Profile', 'Resume', 'Preferences'];

export default function SubmitResume() {
  const { user, register } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const [parsedNote, setParsedNote] = useState('');
  const [f, setF] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    city: '', state: '', country: 'India',
    highestQualification: '', experienceYears: 0, currentDesignation: '', industry: 'IT',
    skills: '', expectedSalary: 3, noticePeriod: 'Immediate', workingStatus: 'fresher',
    resumeFile: null, resumeName: '',
    preferredRoles: '', preferredLocations: '', preferredJobTypes: ['Full Time'], workModePreference: 'onsite',
    terms: false
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const next = () => { setError(''); setStep((s) => Math.min(s + 1, 3)); };
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  const validateStep = () => {
    if (step === 0) {
      if (!f.name || !f.email || !f.password) return 'Please fill all required fields';
      if (f.password.length < 6) return 'Password must be at least 6 characters';
      if (f.password !== f.confirm) return 'Passwords do not match';
    }
    return '';
  };

  const handleNext = () => {
    const v = validateStep();
    if (v) { setError(v); return; }
    next();
  };

  const uploadResume = async (file) => {
    if (!user) return false;
    const fd = new FormData();
    fd.append('resume', file);
    const r = await api.post('/candidates/me/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  };

  const handleResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    // preview locally even before account exists
    setF((prev) => ({ ...prev, resumeFile: file, resumeName: file.name }));
    if (user) {
      setBusy(true);
      try {
        const data = await uploadResume(file);
        // Auto-apply parsed fields to the wizard (empty ones only — the server
        // already skipped non-empty profile values, and here we skip anything
        // the user typed in earlier steps).
        setF((prev) => {
          const u = { ...prev };
          const pf = data.parsedFields || {};
          if (!u.city && pf.city) u.city = pf.city;
          if (!u.state && pf.state) u.state = pf.state;
          if (!u.highestQualification && pf.highestQualification) u.highestQualification = pf.highestQualification;
          if (!Number(u.experienceYears) && pf.experienceYears !== undefined) u.experienceYears = pf.experienceYears;
          if (!u.currentDesignation && pf.currentDesignation) u.currentDesignation = pf.currentDesignation;
          if (pf.skills?.length && !u.skills) u.skills = pf.skills.join(', ');
          if (pf.workingStatus) u.workingStatus = pf.workingStatus;
          return u;
        });
        if (data.parseNote) {
          setParsedNote(data.parseNote);
        }
        setBusy(false);
      } catch (err) {
        setBusy(false);
        setError(err.message);
      }
    }
  };

  const finalSubmit = async (e) => {
    e.preventDefault();
    if (!f.terms) { setError('Please accept the terms to continue'); return; }
    setBusy(true);
    setError('');
    try {
      let u = user;
      if (!u) {
        u = await register({ name: f.name, email: f.email, phone: f.phone, password: f.password, role: 'candidate' });
      }
      await api.put('/candidates/me', {
        city: f.city, state: f.state, country: f.country,
        highestQualification: f.highestQualification,
        experienceYears: Number(f.experienceYears) || 0,
        currentDesignation: f.currentDesignation,
        industry: f.industry,
        skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
        expectedSalary: Number(f.expectedSalary) || 0,
        noticePeriod: f.noticePeriod,
        workingStatus: f.workingStatus,
        preferredRoles: f.preferredRoles.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLocations: f.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
        preferredJobTypes: f.preferredJobTypes,
        workModePreference: f.workModePreference
      });
      if (f.resumeFile && u) await uploadResume(f.resumeFile);
      navigate('/candidate');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const toggleJobType = (t) => {
    setF((prev) => ({
      ...prev,
      preferredJobTypes: prev.preferredJobTypes.includes(t)
        ? prev.preferredJobTypes.filter((x) => x !== t)
        : [...prev.preferredJobTypes, t]
    }));
  };

  return (
    <>
      <PageBanner title="Submit Resume" sub="Create your candidate profile in 4 quick steps." crumbs={[{ label: 'Submit Resume' }]} />
      <div className="page">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="form-card">
            {user && (
              <div className="alert alert-info">Logged in as {user.name} — steps will update your existing profile.</div>
            )}
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s} className={`st ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}>{i + 1}. {s}</div>
              ))}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {step === 0 && (
              <>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Create account</h2>
                <div className="form-grid">
                  <div className="field"><label>Name *</label><input value={f.name} onChange={set('name')} placeholder="Full name" disabled={!!user} /></div>
                  <div className="field"><label>Email *</label><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" disabled={!!user} /></div>
                  <div className="field"><label>Mobile</label><input value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" disabled={!!user} /></div>
                </div>
                {!user && (
                  <div className="form-grid">
                    <div className="field"><label>Password *</label><input type="password" value={f.password} onChange={set('password')} placeholder="Min 6 characters" /></div>
                    <div className="field"><label>Confirm Password *</label><input type="password" value={f.confirm} onChange={set('confirm')} placeholder="Repeat password" /></div>
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleNext}>Next Step →</button>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Professional profile</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>City</label>
                    <Autocomplete value={f.city} onChange={(v) => setF({ ...f, city: v })} suggestions={suggest(CITIES, f.city, 8)} placeholder="Jaipur" />
                  </div>
                  <div className="field">
                    <label>State</label>
                    <Autocomplete value={f.state} onChange={(v) => setF({ ...f, state: v })} suggestions={suggest(STATES, f.state, 8)} placeholder="Rajasthan" />
                  </div>
                  <div className="field"><label>Highest Qualification</label><input value={f.highestQualification} onChange={set('highestQualification')} placeholder="B.Tech CSE" /></div>
                  <div className="field"><label>Experience (years)</label><input type="number" min="0" max="50" value={f.experienceYears} onChange={set('experienceYears')} /></div>
                  <div className="field"><label>Current Designation</label><input value={f.currentDesignation} onChange={set('currentDesignation')} placeholder="Junior Developer" /></div>
                  <div className="field">
                    <label>Industry</label>
                    <select value={f.industry} onChange={set('industry')}>
                      {['IT', 'Electronics', 'Mining', 'FMCG', 'Wire Manufacturing', 'Infrastructure', 'Other'].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Skills</label><SkillsInput value={f.skills} onChange={(v) => setF({ ...f, skills: v })} staticList={SKILLS} placeholder="React, Node.js, MongoDB" /></div>
                  <div className="field"><label>Working Status</label>
                    <select value={f.workingStatus} onChange={set('workingStatus')}>
                      <option value="fresher">Fresher</option>
                      <option value="working">Currently working</option>
                      <option value="experienced">Experienced (not working)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost" onClick={back}>← Back</button>
                  <button className="btn btn-primary" onClick={handleNext}>Next Step →</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Resume</h2>
                <div className="field">
                  <label>Upload Resume (PDF / DOC / image)</label>
                  <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleResume} />
                  <span className="hint">Max 5 MB. {f.resumeName ? `Selected: ${f.resumeName}` : 'No file selected yet.'}</span>
                </div>
                {f.resumeName && <div className="alert alert-success">✓ Resume ready: {f.resumeName}</div>}
                {parsedNote && <div className="alert alert-info">🤖 {parsedNote}</div>}
                <div className="flex gap-1">
                  <button className="btn btn-ghost" onClick={back}>← Back</button>
                  <button className="btn btn-primary" onClick={handleNext} disabled={busy}>{busy ? 'Uploading…' : 'Next Step →'}</button>
                </div>
              </>
            )}

            {step === 3 && (
              <form onSubmit={finalSubmit}>
                <h2 className="mb-2" style={{ fontSize: 20 }}>Job preferences</h2>
                <div className="form-grid">
                  <div className="field"><label>Preferred Roles</label><SkillsInput value={f.preferredRoles} onChange={(v) => setF({ ...f, preferredRoles: v })} staticList={PREFERENCES.roles} placeholder="Frontend Developer, MERN Developer" /></div>
                  <div className="field"><label>Preferred Locations</label><SkillsInput value={f.preferredLocations} onChange={(v) => setF({ ...f, preferredLocations: v })} staticList={CITIES} placeholder="Jaipur, Remote" /></div>
                  <div className="field"><label>Expected Salary (LPA)</label><input type="number" min="0" step="0.5" value={f.expectedSalary} onChange={set('expectedSalary')} /></div>
                  <div className="field"><label>Notice Period</label>
                    <select value={f.noticePeriod} onChange={set('noticePeriod')}>
                      {['Immediate', '15 days', '30 days', '60 days', '90 days'].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Work Mode Preference</label>
                    <select value={f.workModePreference} onChange={set('workModePreference')}>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Employment Type</label>
                  <div className="flex gap-1 wrap">
                    {['Full Time', 'Part Time', 'Internship', 'Contract'].map((t) => (
                      <label key={t} className="chip" style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="checkbox" checked={f.preferredJobTypes.includes(t)} onChange={() => toggleJobType(t)} /> {t}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} />
                  <span>I agree to the Braintech <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a> and confirm the information provided is accurate.</span>
                </label>
                <div className="flex gap-1">
                  <button type="button" className="btn btn-ghost" onClick={back}>← Back</button>
                  <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Complete Profile ✓'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
