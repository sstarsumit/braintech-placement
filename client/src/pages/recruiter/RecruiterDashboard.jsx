import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get('/applications/recruiter/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/companies/me').then((r) => setCompany(r.data)).catch(() => {});
    api.get('/jobs/mine/list').then((r) => setJobs(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p>{company?.companyName || 'Your company'}</p>
        </div>
        <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {company && company.verificationStatus !== 'approved' && (
        <div className="alert alert-info" style={{ marginTop: 0 }}>
          {company.verificationStatus === 'pending'
            ? '⏳ Your company is awaiting admin verification. You can complete your company profile; posting jobs unlocks after approval.'
            : '❌ Your company verification was rejected. Please contact the Braintech team.'}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat"><div className="v">{stats?.activeJobs ?? '–'}</div><div className="l">Active Jobs</div></div>
        <div className="stat orange"><div className="v">{stats?.applicants ?? '–'}</div><div className="l">Total Applicants</div></div>
        <div className="stat green"><div className="v">{stats?.shortlisted ?? '–'}</div><div className="l">Shortlisted</div></div>
        <div className="stat"><div className="v" style={{ color: '#7e22ce' }}>{stats?.interviews ?? '–'}</div><div className="l">Interviews</div></div>
        <div className="stat green"><div className="v">{stats?.hired ?? '–'}</div><div className="l">Hired</div></div>
      </div>

      <div className="panel">
        <div className="flex between center">
          <h2>My Jobs</h2>
          <Link to="/recruiter/jobs" className="link-orange">Manage all →</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="muted">No jobs yet. Post your first vacancy!</p>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Job</th><th>Status</th><th>Applicants</th><th>Posted</th><th></th></tr></thead>
              <tbody>
                {jobs.slice(0, 5).map((j) => (
                  <tr key={j._id}>
                    <td><b>{j.title}</b></td>
                    <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                    <td>{j.applicantCount}</td>
                    <td>{new Date(j.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><Link className="btn btn-sm btn-ghost" to={`/recruiter/jobs/${j._id}/applicants`}>Applicants</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
