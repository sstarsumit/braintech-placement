import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminApplications() {
  const [apps, setApps] = useState(null);
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');

  // Admin sees all applications by fetching per pending-free route: we reuse recruiter applicants via admin rights
  const load = async () => {
    try {
      const r = await api.get('/misc/admin/applications' , { params: status ? { status } : {} });
      setApps(r.data);
    } catch {
      setApps([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const update = async (id, newStatus) => {
    setBusyId(id);
    try {
      await api.put(`/applications/${id}/status`, { status: newStatus });
      load();
    } catch (e) { window.alert(e.message); } finally { setBusyId(''); }
  };

  if (apps === null) return <div className="spin" />;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Applications</h1>
          <p>Monitor every application across the platform.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="btn btn-ghost" style={{ paddingRight: 30 }}>
          <option value="">All statuses</option>
          {['applied', 'reviewing', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {apps.length === 0 ? (
        <div className="panel"><p className="muted">No applications found.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Job</th><th>Company</th><th>Applied</th><th>Status</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a._id}>
                  <td><b>{a.candidate?.user?.name || '—'}</b><div className="muted">{a.candidate?.user?.email}</div></td>
                  <td>{a.job?.title || '—'}</td>
                  <td>{a.job?.company?.companyName || '—'}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                  <td>
                    <div className="actions">
                      <select
                        value={a.status}
                        disabled={busyId === a._id}
                        onChange={(e) => update(a._id, e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: 7, border: '1.5px solid #dfe5e9' }}
                      >
                        {['applied', 'reviewing', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
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
