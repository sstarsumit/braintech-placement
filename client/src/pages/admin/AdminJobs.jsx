import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminJobs() {
  const [jobs, setJobs] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/jobs/admin/all').then((r) => setJobs(r.data)).catch(() => setJobs([]));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/jobs/admin/${id}/status`, { status });
      load();
    } catch (e) { window.alert(e.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this job and all its applications? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/admin/${id}`);
      load();
    } catch (e) { window.alert(e.message); }
  };

  if (jobs === null) return <div className="spin" />;
  const list = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Jobs</h1>
          <p>Approve new postings, or moderate existing ones.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="btn btn-ghost" style={{ paddingRight: 30 }}>
          <option value="all">All ({jobs.length})</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {list.length === 0 ? (
        <div className="panel"><p className="muted">No jobs in this view.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Job</th><th>Company</th><th>Location</th><th>Salary</th><th>Status</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((j) => (
                <tr key={j._id}>
                  <td>
                    <b>{j.title}</b>
                    <div className="muted">{j.employmentType} · {j.workMode} · {j.openings} openings</div>
                  </td>
                  <td>{j.company?.companyName || '—'}</td>
                  <td>{j.location}</td>
                  <td>₹{j.salaryMin}–{j.salaryMax} LPA</td>
                  <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                  <td>
                    <div className="actions">
                      {j.status === 'pending' && <button className="btn btn-sm btn-teal" onClick={() => setStatus(j._id, 'active')}>Approve</button>}
                      {j.status !== 'rejected' && j.status !== 'closed' && (
                        <button className="btn btn-sm btn-danger" onClick={() => setStatus(j._id, 'rejected')}>Reject</button>
                      )}
                      {j.status === 'active' && <button className="btn btn-sm btn-ghost" onClick={() => setStatus(j._id, 'closed')}>Close</button>}
                      <a className="btn btn-sm btn-ghost" href={`/jobs/${j._id}`} target="_blank" rel="noreferrer">View</a>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(j._id)}>Delete</button>
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
