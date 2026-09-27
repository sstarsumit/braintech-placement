import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminDashboard() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get('/applications/admin/stats').then((r) => setS(r.data)).catch(() => {});
  }, []);

  const stats = [
    { v: s?.candidates ?? '–', l: 'Total Candidates', c: '' },
    { v: s?.companies ?? '–', l: 'Total Companies', c: '' },
    { v: s?.activeJobs ?? '–', l: 'Active Jobs', c: '' },
    { v: s?.applications ?? '–', l: 'Applications', c: 'orange' },
    { v: s?.placements ?? '–', l: 'Placements', c: 'green' },
    { v: (s?.pendingCompanies ?? 0) + (s?.pendingJobs ?? 0), l: 'Pending Approvals', c: 'red' }
  ];

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview — Braintech Education &amp; Placement</p>
        </div>
      </div>

      <div className="stat-grid g3">
        {stats.map((st) => (
          <div className={`stat ${st.c}`} key={st.l}>
            <div className="v">{st.v}</div>
            <div className="l">{st.l}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Quick actions</h2>
        <div className="flex gap-1 wrap">
          <Link to="/admin/companies" className="btn btn-teal btn-sm">Review Company Approvals {s?.pendingCompanies ? `(${s.pendingCompanies})` : ''}</Link>
          <Link to="/admin/jobs" className="btn btn-teal btn-sm">Review Job Approvals {s?.pendingJobs ? `(${s.pendingJobs})` : ''}</Link>
          <Link to="/admin/candidates" className="btn btn-teal btn-sm">Verify Candidates</Link>
          <Link to="/admin/contacts" className="btn btn-teal btn-sm">Contact Requests {s?.newContacts ? `(${s.newContacts})` : ''}</Link>
        </div>
      </div>
    </>
  );
}
