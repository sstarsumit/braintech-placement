import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import JobForm from './JobForm.jsx';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState(null);
  const [editing, setEditing] = useState(null); // job object or 'new'
  const [msg, setMsg] = useState('');

  const load = () => api.get('/jobs/mine/list').then((r) => setJobs(r.data)).catch(() => setJobs([]));
  useEffect(() => { load(); }, []);

  const close = async (id) => {
    if (!window.confirm('Close this job? It will no longer accept applications.')) return;
    try {
      await api.put(`/jobs/${id}/close`);
      setMsg('Job closed');
      load();
    } catch (e) { window.alert(e.message); }
  };

  if (jobs === null) return <div className="spin" />;

  if (editing) {
    return (
      <JobForm
        job={editing === 'new' ? null : editing}
        onDone={() => { setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>My Jobs</h1>
          <p>Create, edit and close your vacancies.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Post New Job</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {jobs.length === 0 ? (
        <div className="panel"><p className="muted">No jobs yet. Post your first vacancy!</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead><tr><th>Job</th><th>Location</th><th>Status</th><th>Applicants</th><th>Posted</th><th className="actions">Actions</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td><b>{j.title}</b><div className="muted">{j.employmentType} · {j.workMode}</div></td>
                  <td>{j.location}</td>
                  <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                  <td>{j.applicantCount} total<br /><span className="muted">{j.shortlistedCount} shortlisted</span></td>
                  <td>{new Date(j.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="actions">
                      <Link className="btn btn-sm btn-ghost" to={`/recruiter/jobs/${j._id}/applicants`}>Applicants</Link>
                      <button className="btn btn-sm btn-teal" onClick={() => setEditing(j)}>Edit</button>
                      {j.status !== 'closed' && <button className="btn btn-sm btn-danger" onClick={() => close(j._id)}>Close</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
