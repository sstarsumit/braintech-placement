import { useEffect, useRef, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import SkillsInput from '../../components/SkillsInput.jsx';
import Autocomplete from '../../components/Autocomplete.jsx';
import { SKILLS, CITIES, STATES, DESIGNATIONS, QUALIFICATIONS, INDUSTRY_OPTIONS, PREFERENCES, suggest } from '../../lib/suggestions.js';

const INDUSTRIES = INDUSTRY_OPTIONS;

export default function CandidateProfile() {
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [skillsText, setSkillsText] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.get('/candidates/me').then((r) => {
      setP(r.data);
      setSkillsText((r.data.skills || []).join(', '));
    }).catch((e) => setMsg(e.message));
  }, []);

  if (!p) return <div className="spin" />;

  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const r = await api.put('/candidates/me', {
        ...p,
        skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(p.experienceYears) || 0,
        expectedSalary: Number(p.expectedSalary) || 0
      });
      setP(r.data);
      setSkillsText((r.data.skills || []).join(', '));
      setMsg('Profile updated successfully ✓');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const r = await api.post('/candidates/me/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { parsedFields, autofill, parseNote, ...profile } = r.data;
      setP(profile);
      // Reflect auto-filled values in the form immediately.
      if (parsedFields?.skills?.length) {
        setSkillsText((profile.skills || []).join(', '));
      }
      setMsg(
        parseNote ||
          (file.name.match(/\.(png|jpe?g|webp)$/i)
            ? 'Resume uploaded ✓ (image resumes are stored but not auto-read — please fill your details manually)'
            : 'Resume uploaded ✓')
      );
      if (autofill?.length) {
        // Nudge the user to review the auto-filled sections.
        setTimeout(() => document.querySelector('.dash-head')?.scrollIntoView({ behavior: 'smooth' }), 300);
      }
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
          <h1>My Profile</h1>
          <p>Keep your details up to date — recruiters see this when you apply.</p>
        </div>
        <div style={{ minWidth: 220 }}>
          <div className="flex between center">
            <span className="muted">Completion</span>
            <b style={{ color: 'var(--orange)' }}>{p.completion}%</b>
          </div>
          <div className="progress mt-1"><div style={{ width: `${p.completion}%` }} /></div>
        </div>
      </div>

      {msg && <div className={`alert ${msg.includes('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <form onSubmit={save}>
        <div className="panel" style={{ marginTop: 0 }}>
          <h2>Personal details</h2>
          <div className="form-grid">
            <div className="field"><label>Full Name</label><input value={user.name} disabled /></div>
            <div className="field"><label>Email</label><input value={user.email} disabled /></div>
            <div className="field"><label>Date of Birth</label><input type="date" value={p.dob || ''} onChange={set('dob')} /></div>
            <div className="field">
              <label>Gender</label>
              <select value={p.gender || ''} onChange={set('gender')}>
                <option value="">Select</option><option value="male">Male</option>
                <option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div className="field"><label>Phone</label><input value={p.phone || ''} readOnly placeholder="Set at registration" /></div>
            <div className="field"><label>Address</label><input value={p.address || ''} onChange={set('address')} /></div>
            <div className="field">
              <label>City</label>
              <Autocomplete value={p.city || ''} onChange={(v) => setP({ ...p, city: v })} suggestions={suggest(CITIES, p.city, 8)} />
            </div>
            <div className="field">
              <label>State</label>
              <Autocomplete value={p.state || ''} onChange={(v) => setP({ ...p, state: v })} suggestions={suggest(STATES, p.state, 8)} />
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Professional details</h2>
          <div className="form-grid">
            <div className="field"><label>Headline</label><input value={p.headline || ''} onChange={set('headline')} placeholder="MERN developer who loves clean UI" /></div>
            <div className="field">
              <label>Highest Qualification</label>
              <Autocomplete value={p.highestQualification || ''} onChange={(v) => setP({ ...p, highestQualification: v })} suggestions={suggest(QUALIFICATIONS, p.highestQualification, 8)} />
            </div>
            <div className="field"><label>Experience (years)</label><input type="number" min="0" max="50" value={p.experienceYears ?? 0} onChange={set('experienceYears')} /></div>
            <div className="field">
              <label>Current Designation</label>
              <Autocomplete value={p.currentDesignation || ''} onChange={(v) => setP({ ...p, currentDesignation: v })} suggestions={suggest(DESIGNATIONS, p.currentDesignation, 8)} />
            </div>
            <div className="field"><label>Current Company</label><input value={p.currentCompany || ''} onChange={set('currentCompany')} /></div>
            <div className="field">
              <label>Industry</label>
              <select value={p.industry || ''} onChange={set('industry')}>
                <option value="">Select</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="field"><label>Skills</label><SkillsInput value={skillsText} onChange={setSkillsText} staticList={SKILLS} /></div>
            <div className="field"><label>Expected Salary (LPA)</label><input type="number" min="0" step="0.5" value={p.expectedSalary ?? 0} onChange={set('expectedSalary')} /></div>
            <div className="field">
              <label>Working Status</label>
              <select value={p.workingStatus || ''} onChange={set('workingStatus')}>
                <option value="">Select</option><option value="fresher">Fresher</option>
                <option value="working">Currently working</option><option value="experienced">Experienced</option>
              </select>
            </div>
            <div className="field">
              <label>Notice Period</label>
              <select value={p.noticePeriod || ''} onChange={set('noticePeriod')}>
                <option value="">Select</option>
                {['Immediate', '15 days', '30 days', '60 days', '90 days'].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Job preferences</h2>
          <div className="form-grid">
            <div className="field"><label>Preferred Roles</label><SkillsInput value={(p.preferredRoles || []).join(', ')} onChange={(v) => setP({ ...p, preferredRoles: v.split(',').map((s) => s.trim()).filter(Boolean) })} staticList={PREFERENCES.roles} /></div>
            <div className="field"><label>Preferred Locations</label><SkillsInput value={(p.preferredLocations || []).join(', ')} onChange={(v) => setP({ ...p, preferredLocations: v.split(',').map((s) => s.trim()).filter(Boolean) })} staticList={CITIES} /></div>
            <div className="field">
              <label>Work Mode Preference</label>
              <select value={p.workModePreference || ''} onChange={set('workModePreference')}>
                <option value="">Select</option><option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option><option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Resume</h2>
          {p.resume ? (
            <div className="resume-row">
              <span className="resume-ic">📄</span>
              <div className="grow">
                <div className="bold">{p.resumeName || 'Your resume'}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Uploaded {p.resumeUploadedAt ? new Date(p.resumeUploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'earlier'}
                </div>
              </div>
              <a className="btn btn-ghost btn-sm" href={p.resume} target="_blank" rel="noreferrer">View</a>
            </div>
          ) : (
            <p className="muted">No resume uploaded yet — you'll be asked to add one when you apply to a job.</p>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" onChange={uploadResume} style={{ display: 'none' }} />
          <div className="flex gap-1 mt-1">
            <button type="button" className="btn btn-teal btn-sm" onClick={() => fileRef.current.click()}>
              {p.resume ? 'Replace Resume' : 'Upload Resume'}
            </button>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </div>
      </form>
    </>
  );
}
