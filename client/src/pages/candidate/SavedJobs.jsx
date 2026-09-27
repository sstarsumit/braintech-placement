import { useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../../components/JobCard.jsx';
import { getSaved, removeSaved, toggleSaved } from '../../lib/saved.js';
import { Empty } from '../../components/Spinner.jsx';

export default function SavedJobs() {
  const [, force] = useState(0);
  const saved = getSaved();

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Saved Jobs</h1>
          <p>Jobs you bookmarked while browsing.</p>
        </div>
      </div>
      {saved.length === 0 ? (
        <div className="panel">
          <Empty icon="♡" text="No saved jobs yet. Browse jobs and tap the heart to save them." />
          <div className="text-center"><Link to="/jobs" className="btn btn-teal">Browse Jobs</Link></div>
        </div>
      ) : (
        <div className="job-grid">
          {saved.map((j) => (
            <JobCard
              key={j._id}
              job={j}
              saved
              onSave={() => { removeSaved(j._id); force((n) => n + 1); }}
            />
          ))}
        </div>
      )}
    </>
  );
}
