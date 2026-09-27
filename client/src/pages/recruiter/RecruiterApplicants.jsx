import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';

const STATUS_OPTIONS = ['applied', 'reviewing', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [apps, setApps] = useState(null);
  const [job, setJob] = useState(null);
  const [busyId, setBusyId] = useState('');

  const load = () => {
    api.get(`/applications/job/${jobId}/applicants`).then((r) => setApps(r.data)).catch(() => setApps([]));
    api.get(`/jobs/${jobId}`).then((r) => setJob(r.data)).catch(() => {});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [jobId]);

  const update = async (id, patch) => {
    setBusyId(id);
    try {
      await api.put(`/applications/${id}/status`, patch);
      load();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusyId('');
    }
  };

  const scheduleInterview = (a) => {
    const date = window.prompt('Interview date & time (e.g. 2026-10-05T10:30):', a.interviewDate ? a.interviewDate.slice(0, 16) : '');
    if (!date) return;
    const mode = window.prompt('Mode: In-person, Phone or Video:', a.interviewMode || 'Video');
    if (mode === null) return;
    update(a._id, { status: 'interview', interviewDate: date, interviewMode: mode });
  };

  if (apps === null) return <div className="spin" />;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Applicants</h1>
          <p>{job ? `${job.title} · ${job.location}` : 'Loading…'}</p>
        </div>
        <Link to="/recruiter/jobs" className="btn btn-ghost">← All Jobs</Link>
      </div>

      {apps.length === 0 ? (
        <div className="panel"><p className="muted">No applications yet for this job.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Experience</th><th>Skills</th><th>Resume</th><th>Status</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const c = a.candidate || {};
                const u = c.user || {};
                return (
                  <tr key={a._id}>
                    <td>
                      <b>{u.name || 'Candidate'}</b>
                      <div className="muted">{u.email}</div>
                      {c.city && <div className="muted">📍 {c.city}</div>}
                    </td>
                    <td>{c.experienceYears === 0 ? 'Fresher' : `${c.experienceYears} yrs`}</td>
                    <td>
                      <div className="job-meta">
                        {(c.skills || []).slice(0, 4).map((s) => <span key={s} className="chip orange">{s}</span>)}
                      </div>
                    </td>
                    <td>
                      {c.resume ? (
                        <a className="link-orange" href={c.resume} target="_blank" rel="noreferrer">View ↗</a>
                      ) : <span className="muted">None</span>}
                    </td>
                    <td>
                      <span className={`badge ${a.status}`}>{a.status}</span>
                      {a.interviewDate && (
                        <div className="muted" style={{ marginTop: 4 }}>
                          {new Date(a.interviewDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <select
                          value={a.status}
                          disabled={busyId === a._id}
                          onChange={(e) => update(a._id, { status: e.target.value })}
                          style={{ padding: '6px 8px', borderRadius: 7, border: '1.5px solid #dfe5e9' }}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-sm btn-teal" disabled={busyId === a._id} onClick={() => scheduleInterview(a)}>Interview</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
