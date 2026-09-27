import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import JobCard from '../components/JobCard.jsx';
import Autocomplete from '../components/Autocomplete.jsx';
import PageBanner from '../components/PageBanner.jsx';
import { Spinner, Empty } from '../components/Spinner.jsx';
import { isSaved, toggleSaved } from '../lib/saved.js';
import { SKILLS, CITIES, suggest } from '../lib/suggestions.js';

const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract'];
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const EXPERIENCE = [
  { id: 'fresher', label: 'Fresher' },
  { id: '0-2', label: '0-2 Years' },
  { id: '2-5', label: '2-5 Years' },
  { id: '5+', label: '5+ Years' }
];
const SALARIES = [
  { id: '0-3', label: '₹0 - ₹3 LPA' },
  { id: '3-6', label: '₹3 - ₹6 LPA' },
  { id: '6-10', label: '₹6 - ₹10 LPA' },
  { id: '10+', label: '₹10+ LPA' }
];
const INDUSTRIES = ['IT', 'Electronics', 'Mining', 'FMCG', 'Wire Manufacturing', 'Infrastructure'];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [jobs, setJobs] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(parseInt(params.get('page')) || 1);
  const [, bumpSaved] = useState(0); // re-render after bookmarking a job
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api.get('/jobs/search-meta').then((r) => setMeta(r.data)).catch(() => setMeta(null));
  }, []);

  const jobType = (params.get('jobType') || '').split(',').filter(Boolean);
  const workMode = (params.get('workMode') || '').split(',').filter(Boolean);
  const experience = (params.get('experience') || '').split(',').filter(Boolean);
  const salary = (params.get('salary') || '').split(',').filter(Boolean);
  const industry = (params.get('industry') || '').split(',').filter(Boolean);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value.length) next.set(key, value.join(','));
    else next.delete(key);
    next.delete('page');
    setParams(next);
    setPage(1);
  };

  const toggle = (key, list, value) => {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    updateParam(key, next);
  };

  const buildQuery = () => {
    const out = {};
    for (const [k, v] of params.entries()) out[k] = v;
    out.page = page;
    out.limit = 8;
    return out;
  };

  useEffect(() => {
    setJobs(null);
    api.get('/jobs', { params: buildQuery() })
      .then((r) => {
        setJobs(r.data.jobs);
        setTotal(r.data.total);
        setPages(r.data.pages);
      })
      .catch(() => setJobs([]));
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, page]);

  const qSuggestions = q.trim()
    ? suggest(
        [
          ...(meta?.skills || []).map((s) => ({ label: s.label, count: s.count })),
          ...(meta?.titles || []).map((t) => ({ label: t.label, count: t.count })),
          ...SKILLS.map((s) => ({ label: s }))
        ].filter((v, i, arr) => arr.findIndex((x) => x.label.toLowerCase() === v.label.toLowerCase()) === i),
        q,
        8
      )
    : (meta?.titles || []).slice(0, 8).map((t) => ({ label: t.label, count: t.count }));

  const locSuggestions = suggest(
    [
      ...(meta?.locations || []).map((l) => ({ label: l.label, count: l.count })),
      ...CITIES.map((c) => ({ label: c }))
    ].filter((v, i, arr) => arr.findIndex((x) => x.label.toLowerCase() === v.label.toLowerCase()) === i),
    location,
    8
  );

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    q ? next.set('q', q) : next.delete('q');
    location ? next.set('location', location) : next.delete('location');
    next.delete('page');
    setParams(next);
    setPage(1);
  };

  return (
    <>
      <PageBanner title="Find Your Next Job" sub="Search thousands of openings from verified employers." crumbs={[{ label: 'Jobs' }]} />
      <div className="page">
        <div className="container">
          <div className="jobs-layout">
            <aside className="filter-panel">
              <h3>Filters</h3>
              <div className="filter-group">
                <h4>Job Type</h4>
                {JOB_TYPES.map((t) => (
                  <label className="check-line" key={t}>
                    <input type="checkbox" checked={jobType.includes(t)} onChange={() => toggle('jobType', jobType, t)} /> {t}
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Experience</h4>
                {EXPERIENCE.map((t) => (
                  <label className="check-line" key={t.id}>
                    <input type="checkbox" checked={experience.includes(t.id)} onChange={() => toggle('experience', experience, t.id)} /> {t.label}
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Salary</h4>
                {SALARIES.map((t) => (
                  <label className="check-line" key={t.id}>
                    <input type="checkbox" checked={salary.includes(t.id)} onChange={() => toggle('salary', salary, t.id)} /> {t.label}
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Work Mode</h4>
                {WORK_MODES.map((t) => (
                  <label className="check-line" key={t}>
                    <input type="checkbox" checked={workMode.includes(t)} onChange={() => toggle('workMode', workMode, t)} /> {t}
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Industry</h4>
                {INDUSTRIES.map((t) => (
                  <label className="check-line" key={t}>
                    <input type="checkbox" checked={industry.includes(t)} onChange={() => toggle('industry', industry, t)} /> {t}
                  </label>
                ))}
              </div>
            </aside>

            <div>
              <form className="searchbar" onSubmit={submitSearch}>
                <Autocomplete
                  value={q}
                  onChange={setQ}
                  suggestions={qSuggestions}
                  placeholder="Job title, skill or company"
                  aria-label="Job title, skill or company"
                  submitOnEnter
                />
                <Autocomplete
                  value={location}
                  onChange={setLocation}
                  suggestions={locSuggestions}
                  placeholder="City, State"
                  aria-label="City or State"
                  submitOnEnter
                />
                <button className="btn btn-primary" type="submit">Search</button>
              </form>

              <div className="jobs-results-head">
                <div className="count">
                  {jobs === null ? 'Searching…' : `${total} job${total === 1 ? '' : 's'} found`}
                </div>
              </div>

              {jobs === null ? (
                <Spinner />
              ) : jobs.length === 0 ? (
                <Empty text="No jobs match your filters. Try removing some filters." />
              ) : (
                <>
                  <div className="jobs-list">
                    {jobs.map((j) => (
                      <JobCard
                        key={j._id}
                        job={j}
                        saved={isSaved(j._id)}
                        onSave={(job) => {
                          toggleSaved(job);
                          bumpSaved((n) => n + 1);
                        }}
                      />
                    ))}
                  </div>

                  {pages > 1 && (
                    <div className="flex center gap-1 mt-3" style={{ justifyContent: 'center' }}>
                      <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
                      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`btn btn-sm ${p === page ? 'btn-teal' : 'btn-ghost'}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button className="btn btn-sm btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
