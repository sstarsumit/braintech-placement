import { Link, useNavigate } from 'react-router-dom';

export default function JobCard({ job, saved, onSave, onApply, compact }) {
  const navigate = useNavigate();
  const company = job.company || {};
  const companyInitial = (company.companyName || 'C').charAt(0).toUpperCase();
  const expLabel =
    job.experienceMin === 0 && job.experienceMax === 0
      ? 'Fresher'
      : job.experienceMin === job.experienceMax
        ? `${job.experienceMin} Yr`
        : `${job.experienceMin ?? 0}-${job.experienceMax ?? ''} Yrs`;

  return (
    <article className="job-card">
      <div className="top">
        <span className="logo">{companyInitial}</span>
        <button
          className={`save-btn ${saved ? 'on' : ''}`}
          title={saved ? 'Remove from saved' : 'Save job'}
          onClick={(e) => {
            e.preventDefault();
            onSave && onSave(job);
          }}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div>
        <h3>{job.title}</h3>
        <div className="co">{company.companyName || 'Confidential'}</div>
      </div>
      <div className="job-meta">
        <span className="chip">📍 {job.location}</span>
        <span className="chip">{job.employmentType}</span>
        <span className="chip">{job.workMode}</span>
        <span className="chip teal">{expLabel}</span>
        {job.industry && <span className="chip gray">{job.industry}</span>}
      </div>
      {!compact && job.skills?.length > 0 && (
        <div className="skills">
          {job.skills.slice(0, 5).map((s) => (
            <span key={s} className="chip orange">{s}</span>
          ))}
        </div>
      )}
      <div className="foot">
        <span className="salary">
          {job.salaryMin || job.salaryMax ? `₹${job.salaryMin} - ₹${job.salaryMax} LPA` : 'Not disclosed'}
        </span>
        <div className="flex gap-1">
          <Link className="btn btn-sm btn-ghost" to={`/jobs/${job._id}`}>View Job</Link>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => (onApply ? onApply(job) : navigate(`/jobs/${job._id}`))}
          >
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
}
