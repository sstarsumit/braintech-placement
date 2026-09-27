import { useState } from 'react';
import api from '../../api';
import SkillsInput from '../../components/SkillsInput.jsx';
import Autocomplete from '../../components/Autocomplete.jsx';
import { SKILLS, CITIES, suggest } from '../../lib/suggestions.js';

export default function JobForm({ job, onDone, onCancel }) {
  const [f, setF] = useState(() => job ? {
    ...job,
    responsibilities: (job.responsibilities || []).join('\n'),
    requirements: (job.requirements || []).join('\n'),
    skills: (job.skills || []).join(', '),
    deadline: job.deadline ? job.deadline.slice(0, 10) : ''
  } : {
    title: '', department: '', industry: 'IT', location: '',
    employmentType: 'Full Time', workMode: 'On-site',
    experienceMin: 0, experienceMax: 2, salaryMin: 3, salaryMax: 6,
    education: '', openings: 1, deadline: '',
    description: '', responsibilities: '', requirements: '', skills: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const list = (s) => s.split('\n').map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      title: f.title, department: f.department, industry: f.industry, location: f.location,
      employmentType: f.employmentType, workMode: f.workMode,
      experienceMin: Number(f.experienceMin) || 0, experienceMax: Number(f.experienceMax) || 0,
      salaryMin: Number(f.salaryMin) || 0, salaryMax: Number(f.salaryMax) || 0,
      education: f.education, openings: Number(f.openings) || 1,
      deadline: f.deadline || undefined,
      description: f.description,
      responsibilities: list(f.responsibilities),
      requirements: list(f.requirements),
      skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean)
    };
    try {
      if (job) await api.put(`/jobs/${job._id}`, payload);
      else await api.post('/jobs', payload);
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="dash-head">
        <div><h1>{job ? 'Edit Job' : 'Post New Job'}</h1></div>
      </div>
      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field"><label>Job Title *</label><input required value={f.title} onChange={set('title')} /></div>
            <div className="field"><label>Department</label><input value={f.department || ''} onChange={set('department')} /></div>
            <div className="field">
              <label>Location *</label>
              <Autocomplete value={f.location} onChange={(v) => setF({ ...f, location: v })} suggestions={suggest(CITIES, f.location, 8)} />
            </div>
            <div className="field">
              <label>Employment Type</label>
              <select value={f.employmentType} onChange={set('employmentType')}>
                {['Full Time', 'Part Time', 'Internship', 'Contract'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Work Mode</label>
              <select value={f.workMode} onChange={set('workMode')}>
                {['On-site', 'Hybrid', 'Remote'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Education</label><input value={f.education || ''} onChange={set('education')} /></div>
            <div className="field"><label>Experience Min</label><input type="number" min="0" value={f.experienceMin} onChange={set('experienceMin')} /></div>
            <div className="field"><label>Experience Max</label><input type="number" min="0" value={f.experienceMax} onChange={set('experienceMax')} /></div>
            <div className="field"><label>Salary Min (LPA)</label><input type="number" min="0" step="0.5" value={f.salaryMin} onChange={set('salaryMin')} /></div>
            <div className="field"><label>Salary Max (LPA)</label><input type="number" min="0" step="0.5" value={f.salaryMax} onChange={set('salaryMax')} /></div>
            <div className="field"><label>Openings</label><input type="number" min="1" value={f.openings} onChange={set('openings')} /></div>
            <div className="field"><label>Deadline</label><input type="date" value={f.deadline} onChange={set('deadline')} /></div>
          </div>
          <div className="field"><label>Skills</label><SkillsInput value={f.skills} onChange={(v) => setF({ ...f, skills: v })} staticList={SKILLS} /></div>
          <div className="field"><label>Description *</label><textarea required rows={5} value={f.description} onChange={set('description')} /></div>
          <div className="field"><label>Responsibilities (one per line)</label><textarea rows={4} value={f.responsibilities} onChange={set('responsibilities')} /></div>
          <div className="field"><label>Requirements (one per line)</label><textarea rows={4} value={f.requirements} onChange={set('requirements')} /></div>
          <div className="flex gap-1">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : job ? 'Save Changes' : 'Publish Job'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
