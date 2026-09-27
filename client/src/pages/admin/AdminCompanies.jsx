import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/companies').then((r) => setCompanies(r.data)).catch(() => setCompanies([]));
  useEffect(() => { load(); }, []);

  const setVerification = async (id, status) => {
    try {
      await api.put(`/companies/${id}/verification`, { status });
      load();
    } catch (e) { window.alert(e.message); }
  };

  if (companies === null) return <div className="spin" />;
  const list = filter === 'all' ? companies : companies.filter((c) => c.verificationStatus === filter);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Companies</h1>
          <p>Approve or reject company accounts before they can post jobs.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="btn btn-ghost" style={{ paddingRight: 30 }}>
          <option value="all">All ({companies.length})</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {list.length === 0 ? (
        <div className="panel"><p className="muted">No companies here.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Company</th><th>Owner</th><th>Industry</th><th>Location</th><th>Verification</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c._id}>
                  <td>
                    <b>{c.companyName}</b>
                    {c.website && <div className="muted">{c.website}</div>}
                  </td>
                  <td>
                    {c.owner?.name || '—'}
                    <div className="muted">{c.owner?.email}</div>
                  </td>
                  <td>{c.industry || '—'}</td>
                  <td>{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td><span className={`badge ${c.verificationStatus}`}>{c.verificationStatus}</span></td>
                  <td>
                    <div className="actions">
                      {c.verificationStatus !== 'approved' && (
                        <button className="btn btn-sm btn-teal" onClick={() => setVerification(c._id, 'approved')}>Approve</button>
                      )}
                      {c.verificationStatus !== 'rejected' && (
                        <button className="btn btn-sm btn-danger" onClick={() => setVerification(c._id, 'rejected')}>Reject</button>
                      )}
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
