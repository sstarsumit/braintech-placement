import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth, dashboardPath } from '../context/AuthContext.jsx';
import { Spinner } from '../components/Spinner.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  // Smart apply modal: 'confirm' (resume exists) | 'upload' (no resume yet) | null
  const [modal, setModal] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null); // { resume, resumeName, resumeUploadedAt }
  const [modalBusy, setModalBusy] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);
  const fileRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch((e) => setError(e.message));
  }, [id]);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  // Apply Now → fetch the candidate's resume state once, then open the right
  // modal: confirm-and-apply when a resume exists, upload-then-apply when not.
  const openApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role !== 'candidate') {
      setMessage('Only candidate accounts can apply for jobs.');
      return;
    }
    setMessage('');
    setModalBusy(true);
    try {
      const r = await api.get('/candidates/me');
      const info = {
        resume: r.data.resume || '',
        resumeName: r.data.resumeName || '',
        resumeUploadedAt: r.data.resumeUploadedAt || ''
      };
      setResumeInfo(info);
      setModal(info.resume ? 'confirm' : 'upload');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setModalBusy(false);
    }
  };

  const closeModal = () => {
    if (modalBusy) return;
    setModal(null);
    setPickedFile(null);
  };

  const submitApplication = async () => {
    setApplying(true);
    try {
      const r = await api.post(`/applications/job/${id}`, { coverLetter });
      setModal(null);
      setPickedFile(null);
      setMessage(r.data.message || 'Application submitted successfully');
    } catch (e) {
      setMessage(e.message);
      setModal(null);
    } finally {
      setApplying(false);
    }
  };

  // Upload the chosen resume, then immediately submit the application.
  const uploadAndApply = async () => {
    if (!pickedFile) {
      return;
    }
    setModalBusy(true);
    try {
      const fd = new FormData();
      fd.append('resume', pickedFile);
      await api.post('/candidates/me/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await submitApplication();
    } catch (e) {
      setMessage(e.message);
      setModal(null);
      setModalBusy(false);
    }
  };

  if (error) {
    return (
      <div className="page"><div className="container"><div className="alert alert-error">{error}</div>
        <Link to="/jobs" className="btn btn-teal">Back to Jobs</Link></div></div>
    );
  }
  if (!job) return <div className="page"><Spinner /></div>;

  const company = job.company || {};
  const expLabel =
    job.experienceMin === 0 && job.experienceMax === 0
      ? 'Fresher'
      : `${job.experienceMin}-${job.experienceMax} Years`;
  const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <div className="page">
      <div className="container">
        <div className="job-detail">
          <div className="main-card">
            <h1>{job.title}</h1>
            <div className="company-line">
              <span className="logo">{(company.companyName || 'C').charAt(0).toUpperCase()}</span>
              <div>
                <div className="bold" style={{ fontSize: 17 }}>{company.companyName || 'Confidential'}</div>
                <div className="muted">{company.city}{company.industry ? ` • ${company.industry}` : ''}</div>
              </div>
            </div>

            <div className="quickfacts">
              <div className="fact"><span className="ic">📍</span><span><b>Location:</b> {job.location}</span></div>
              <div className="fact"><span className="ic">💼</span><span><b>Type:</b> {job.employmentType}</span></div>
              <div className="fact"><span className="ic">💰</span><span><b>Salary:</b> ₹{job.salaryMin} - ₹{job.salaryMax} LPA</span></div>
              <div className="fact"><span className="ic">🧑‍💻</span><span><b>Experience:</b> {expLabel}</span></div>
              <div className="fact"><span className="ic">🎓</span><span><b>Education:</b> {job.education || 'Any graduate'}</span></div>
              <div className="fact"><span className="ic">🌐</span><span><b>Work Mode:</b> {job.workMode}</span></div>
            </div>

            <section>
              <h2>About the role</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </section>

            {job.responsibilities?.length > 0 && (
              <section>
                <h2>Responsibilities</h2>
                <ul>{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section>
                <h2>Requirements</h2>
                <ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </section>
            )}

            {job.skills?.length > 0 && (
              <section>
                <h2>Required skills</h2>
                <div className="job-meta">
                  {job.skills.map((s) => <span key={s} className="chip orange">{s}</span>)}
                </div>
              </section>
            )}

            {job.benefits?.length > 0 && (
              <section>
                <h2>Benefits</h2>
                <ul>{job.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </section>
            )}
          </div>

          <aside>
            <div className="side-card">
              <h3>Job Overview</h3>
              <div className="row"><span>Openings</span><b>{job.openings}</b></div>
              <div className="row"><span>Deadline</span><b>{deadline || 'Rolling'}</b></div>
              <div className="row"><span>Department</span><b>{job.department || '-'}</b></div>
              <div className="row"><span>Industry</span><b>{job.industry || '-'}</b></div>
              <div className="row"><span>Posted</span><b>{new Date(job.createdAt).toLocaleDateString('en-IN')}</b></div>
              <button className="btn btn-primary btn-block mt-2" onClick={openApply} disabled={applying || modalBusy}>
                {applying ? 'Applying…' : modalBusy ? 'Checking resume…' : 'Apply Now'}
              </button>
              {message && (
                <div className={`alert mt-2 ${message.includes('success') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 0 }}>
                  {message}
                </div>
              )}
              {!user && <p className="hint mt-1">You will be asked to login as a candidate first.</p>}
              {user && user.role === 'candidate' && (
                <Link to={dashboardPath('candidate') + '/applications'} className="btn btn-ghost btn-block mt-1">Track Applications</Link>
              )}
            </div>

            <div className="side-card">
              <h3>About Company</h3>
              <p className="muted" style={{ lineHeight: 1.7 }}>{company.about || 'Verified employer hiring via Braintech Education & Placement.'}</p>
              {company.website && (
                <a className="link-orange" href={company.website} target="_blank" rel="noreferrer">Visit website →</a>
              )}
            </div>

            {user?.role === 'candidate' && (
              <div className="side-card">
                <h3>Cover letter (optional)</h3>
                <div className="field" style={{ marginBottom: 0 }}>
                  <textarea rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why are you a great fit?" />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            {modal === 'confirm' ? (
              <>
                <div className="modal-head">
                  <h3>Apply for {job.title}</h3>
                  <button className="modal-x" onClick={closeModal} aria-label="Close">✕</button>
                </div>
                <p className="muted" style={{ marginTop: -6 }}>Your resume will be sent with this application.</p>
                <div className="resume-row">
                  <span className="resume-ic">📄</span>
                  <div className="grow">
                    <div className="bold">{resumeInfo.resumeName || 'Your resume'}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Uploaded {fmtDate(resumeInfo.resumeUploadedAt) || 'earlier'}
                    </div>
                  </div>
                  <a className="btn btn-ghost btn-sm" href={resumeInfo.resume} target="_blank" rel="noreferrer">View</a>
                </div>
                <button className="btn btn-primary btn-block mt-2" onClick={submitApplication} disabled={applying || modalBusy}>
                  {applying ? 'Submitting…' : 'Confirm & Apply'}
                </button>
                <p className="hint text-center" style={{ marginTop: 12 }}>
                  Want to use another resume?{' '}
                  <button type="button" className="linklike" onClick={() => { setModal('upload'); setPickedFile(null); }}>
                    Upload a new one
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="modal-head">
                  <h3>Apply for {job.title}</h3>
                  <button className="modal-x" onClick={closeModal} aria-label="Close">✕</button>
                </div>
                <p className="muted" style={{ marginTop: -6 }}>
                  You need a resume to apply — upload it here and we'll submit your application right away.
                </p>
                <button type="button" className="upload-drop" onClick={() => fileRef.current?.click()}>
                  <span className="resume-ic big">📄</span>
                  <b>{pickedFile ? pickedFile.name : 'Choose PDF / DOC / DOCX'}</b>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {pickedFile ? 'Click to pick a different file' : 'PDF, DOC or DOCX · max 5 MB'}
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => setPickedFile(e.target.files?.[0] || null)}
                />
                <button
                  className="btn btn-primary btn-block mt-2"
                  onClick={uploadAndApply}
                  disabled={!pickedFile || modalBusy}
                >
                  {modalBusy ? 'Uploading…' : pickedFile ? 'Upload & Apply' : 'Choose a resume first'}
                </button>
                <p className="hint text-center" style={{ marginTop: 12 }}>
                  You can manage your resume anytime from your <Link to={dashboardPath('candidate') + '/profile'}>profile</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
