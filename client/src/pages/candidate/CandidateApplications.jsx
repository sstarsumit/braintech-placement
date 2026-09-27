import { useEffect, useState } from 'react';
import api from '../../api';
import { Empty } from '../../components/Spinner.jsx';

const PIPELINE = ['applied', 'reviewing', 'shortlisted', 'interview', 'selected'];

export default function CandidateApplications() {
  const [apps, setApps] = useState(null);
  const [busyId, setBusyId] = useState('');

  const load = () => api.get('/applications/mine').then((r) => setApps(r.data)).catch(() => setApps([]));
  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    setBusyId(id);
    try {
      await api.put(`/applications/${id}/withdraw`);
      load();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setBusyId('');
    }
  };

  if (apps === null) return <div className="spin" />;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>My Applications</h1>
          <p>Track where you stand in each hiring pipeline.</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="panel"><Empty icon="📭" text="You haven't applied to any jobs yet." /></div>
      ) : (
        apps.map((a) => {
          const stepIdx = PIPELINE.indexOf(a.status);
          const rejected = a.status === 'rejected';
          const withdrawn = a.status === 'withdrawn';
          return (
            <div className="panel" key={a._id} style={{ marginTop: 18 }}>
              <div className="flex between center wrap gap-1">
                <div>
                  <h2 style={{ marginBottom: 4 }}>
                    {a.job ? (
                      <a href={`/jobs/${a.job._id}`} className="link-orange" style={{ color: 'var(--ink)' }}>{a.job.title}</a>
                    ) : 'Job removed'}
                  </h2>
                  <span className="muted">
                    {a.job?.company?.companyName} · {a.job?.location} · Applied {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex gap-1 center">
                  {a.interviewDate && !withdrawn && (
                    <span className="chip blue">Interview: {new Date(a.interviewDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} {a.interviewMode && `(${a.interviewMode})`}</span>
                  )}
                  <span className={`badge ${a.status}`}>{a.status}</span>
                  {!['withdrawn', 'rejected', 'selected'].includes(a.status) && (
                    <button className="btn btn-sm btn-danger" disabled={busyId === a._id} onClick={() => withdraw(a._id)}>Withdraw</button>
                  )}
                </div>
              </div>

              {a.job?.status === 'closed' && <div className="alert alert-info mt-1">This position has been closed by the recruiter.</div>}

              {!withdrawn && (
                <div className="pipeline mt-2">
                  {PIPELINE.map((s, i) => (
                    <div
                      key={s}
                      className={`pipe ${!rejected && i <= stepIdx ? 'done' : ''} ${!rejected && i === stepIdx ? 'cur' : ''}`}
                    >
                      {s === 'reviewing' ? 'review' : s}
                    </div>
                  ))}
                  {rejected && <div className="pipe cur" style={{ background: '#fdecea', color: '#b3261e', borderColor: '#f6cfcb' }}>rejected</div>}
                </div>
              )}

              {a.recruiterNotes && (
                <div className="alert alert-info mt-2" style={{ marginBottom: 0 }}>
                  <b>Recruiter note:</b> {a.recruiterNotes}
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}
