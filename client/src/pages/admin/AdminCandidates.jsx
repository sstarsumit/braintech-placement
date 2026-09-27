import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => api.get('/candidates').then((r) => setCandidates(r.data)).catch(() => setCandidates([]));
  useEffect(() => { load(); }, []);

  const toggleVerify = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/misc/admin/candidates/${id}/verify`, {});
      load();
    } catch (e) { window.alert(e.message); } finally { setBusyId(''); }
  };

  if (candidates === null) return <div className="spin" />;
  const q = search.toLowerCase();
  const list = candidates.filter((c) => {
    const u = c.user || {};
    return !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (c.skills || []).some((s) => s.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Candidates</h1>
          <p>Verify candidate profiles to build employer trust.</p>
        </div>
        <input placeholder="Search name, email, skill…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #dfe5e9', minWidth: 240 }} />
      </div>

      {list.length === 0 ? (
        <div className="panel"><p className="muted">No candidates found.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Qualification</th><th>Experience</th><th>Skills</th><th>Verified</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const u = c.user || {};
                return (
                  <tr key={c._id}>
                    <td>
                      <b>{u.name || '—'}</b>
                      <div className="muted">{u.email}</div>
                      <div className="muted">Joined {new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td>{c.highestQualification || '—'}</td>
                    <td>{c.experienceYears === 0 ? 'Fresher' : `${c.experienceYears} yrs`}</td>
                    <td>
                      <div className="job-meta">
                        {(c.skills || []).slice(0, 4).map((s) => <span key={s} className="chip orange">{s}</span>)}
                      </div>
                    </td>
                    <td>{c.isVerified ? <span className="badge approved">verified</span> : <span className="badge pending">unverified</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-teal" disabled={busyId === c._id} onClick={() => toggleVerify(c._id)}>
                        {c.isVerified ? 'Un-verify' : 'Verify'}
                      </button>
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
