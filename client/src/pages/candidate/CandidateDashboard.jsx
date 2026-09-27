import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import JobCard from '../../components/JobCard.jsx';
import { isSaved, toggleSaved } from '../../lib/saved.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_STEPS = ['applied', 'reviewing', 'shortlisted', 'interview', 'selected'];

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    api.get('/candidates/me').then((r) => setProfile(r.data)).catch(() => {});
    api.get('/applications/mine').then((r) => setApps(r.data)).catch(() => {});
    api.get('/jobs', { params: { limit: 3 } }).then((r) => setRecommended(r.data.jobs)).catch(() => {});
  }, []);

  const shortlisted = apps.filter((a) => ['shortlisted', 'interview', 'selected'].includes(a.status)).length;
  const interviews = apps.filter((a) => ['interview', 'selected'].includes(a.status)).length;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p>Here's what's happening with your applications.</p>
        </div>
        <Link to="/candidate/profile" className="btn btn-teal">Complete Profile</Link>
      </div>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="flex between center wrap gap-1">
          <b>Profile completion</b>
          <span className="bold" style={{ color: 'var(--orange)' }}>{profile?.completion ?? 0}%</span>
        </div>
        <div className="progress mt-1"><div style={{ width: `${profile?.completion ?? 0}%` }} /></div>
      </div>

      <div className="stat-grid g3 mt-2">
        <div className="stat"><div className="v">{apps.length}</div><div className="l">Applications</div></div>
        <div className="stat orange"><div className="v">{shortlisted}</div><div className="l">Shortlisted</div></div>
        <div className="stat green"><div className="v">{interviews}</div><div className="l">Interviews</div></div>
      </div>

      <div className="panel">
        <h2>Recommended Jobs</h2>
        {recommended.length === 0 ? (
          <p className="muted">No jobs to recommend right now.</p>
        ) : (
          <div className="job-grid" style={{ marginTop: 8 }}>
            {recommended.map((j) => (
              <JobCard
                key={j._id}
                job={j}
                compact
                saved={isSaved(j._id)}
                onSave={() => toggleSaved(j)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="flex between center">
          <h2>Recent Applications</h2>
          <Link to="/candidate/applications" className="link-orange">View all →</Link>
        </div>
        {apps.length === 0 ? (
          <p className="muted">You haven't applied to any jobs yet. <Link to="/jobs" className="link-orange">Browse jobs →</Link></p>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map((a) => (
                  <tr key={a._id}>
                    <td>{a.job?.title}</td>
                    <td>{a.job?.company?.companyName}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${a.status}`}>{a.status}</span></td>
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
