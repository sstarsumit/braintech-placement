import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import JobCard from '../components/JobCard.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Autocomplete from '../components/Autocomplete.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { isSaved, toggleSaved } from '../lib/saved.js';
import { SKILLS, CITIES, suggest } from '../lib/suggestions.js';

const TRENDING = [
  { label: 'Electronics Industry', industry: 'Electronics' },
  { label: 'Mining Industry', industry: 'Mining' },
  { label: 'FMCG Industry', industry: 'FMCG' },
  { label: 'IT Industries', industry: 'IT' },
  { label: 'Wire Manufacturing', industry: 'Wire Manufacturing' },
  { label: 'Infrastructure', industry: 'Infrastructure' }
];

const QUALITIES = [
  {
    icon: '✓',
    title: 'Quality',
    body:
      'We are driven by quality — a tried and tested recruitment process that supports our consultants to ensure who we hire is the right person for you.'
  },
  {
    icon: '👥',
    title: 'Our Team',
    body:
      'Braintech is known for bringing a common-sense approach to recruitment and going the extra mile to ensure clients and candidates achieve the best outcomes.'
  },
  {
    icon: '★',
    title: 'Expertise',
    body:
      'Expertise in recruiting for Non-IT profiles: Sales, Accounts, HR, Back Office, Counsellors and Technicians — from fresher to senior management.'
  }
];

const PROMISES = [
  'Partners in your dream',
  'Committed to your success',
  'The Braintech experience',
  '24/7 Accessibility',
  'Right team – right experience',
  'We will be honest and fair'
];

const PARTNERS = [
  ['Etrica Power', 'partner-01.png'],
  ['Trent', 'partner-02.png'],
  ['Dev Milk Foods (DMF)', 'partner-03.png'],
  ['Reliance', 'partner-04.png'],
  ['Jio', 'partner-05.png'],
  ['Birla International School', 'partner-06.png'],
  ['Presidency School', 'partner-07.png'],
  ['Goral', 'partner-08.png'],
  ['Poppins Pre Primary School', 'partner-09.png'],
  ["Children's Academy Jaipur", 'partner-10.png']
];

// Reveal-on-scroll: adds .active to .reveal elements as they enter the viewport.
function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.active)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('active'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('active');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function Home() {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState(null);
  const [meta, setMeta] = useState(null);
  const [, force] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    api
      .get('/jobs', { params: { limit: 6 } })
      .then((r) => setJobs(r.data.jobs))
      .catch(() => setJobs([]));
    api
      .get('/jobs/search-meta')
      .then((r) => setMeta(r.data))
      .catch(() => setMeta(null));
  }, []);

  useReveal([jobs, meta]);

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

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <>
      {/* ---------- HERO + SEARCH ---------- */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title reveal">
            Search More then 50,000<br />Job Openings.
          </h1>
          <p className="hero-subtitle reveal">
            We help people get back to work and companies get back to business.
          </p>

          <form className="job-search reveal" onSubmit={search} ref={searchRef}>
            <div className="search-field">
              <span className="sf-icon" aria-hidden="true">🔍</span>
              <Autocomplete
                value={q}
                onChange={setQ}
                suggestions={qSuggestions}
                placeholder="Job title, skill or company"
                aria-label="Job title, skill or company"
                submitOnEnter
              />
            </div>
            <div className="search-field">
              <span className="sf-icon" aria-hidden="true">📍</span>
              <Autocomplete
                value={location}
                onChange={setLocation}
                suggestions={locSuggestions}
                placeholder="City, State"
                aria-label="City or State"
                submitOnEnter
              />
            </div>
            <button className="search-button" type="submit">Search</button>
          </form>

          <div className="hero-stats reveal">
            <div><b>50,000+</b><span className="lbl">Job Openings</span></div>
            <div><b>2,500+</b><span className="lbl">Companies</span></div>
            <div><b>15,000+</b><span className="lbl">Candidates Placed</span></div>
            <div><b>9+</b><span className="lbl">Industry Bodies</span></div>
          </div>
        </div>
      </section>

      {/* ---------- TRENDING SEARCHES ---------- */}
      <section className="trending-section">
        <div className="container trending-wrapper">
          <div className="trending-title reveal">
            <h2>Trending Searches</h2>
            <Link to="/jobs">View more jobs →</Link>
          </div>
          <div className="trending-tags reveal">
            {TRENDING.map((t) => (
              <Link
                key={t.label}
                to={`/jobs?industry=${encodeURIComponent(t.industry)}`}
                className="trending-tag"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- LATEST JOBS ---------- */}
      <section className="jobs-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>Latest Jobs</h2>
            <Link to="/jobs" className="view-all">View All →</Link>
          </div>
          {jobs === null ? (
            <Spinner />
          ) : jobs.length === 0 ? (
            <div className="empty"><div className="big">📭</div><p>No jobs posted yet. Check back soon!</p></div>
          ) : (
            <div className="jobs-grid">
              {jobs.slice(0, 6).map((j) => (
                <JobCard
                  key={j._id}
                  job={j}
                  saved={isSaved(j._id)}
                  onSave={(job) => { toggleSaved(job); force((n) => n + 1); }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- WHY BRAINTECH ---------- */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title reveal">Why People Choose Braintech</h2>
          <div className="features-grid">
            {QUALITIES.map((c) => (
              <div className="feature-card reveal" key={c.title}>
                <span className="feature-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INDUSTRY PARTNERS ---------- */}
      <section className="partners">
        <div className="container">
          <h2 className="partners-heading reveal">Supported by 9+ industry bodies and media partners</h2>
          <div className="partner-grid reveal">
            {PARTNERS.map(([name, file]) => (
              <img key={file} src={`/partners/${file}`} alt={name} title={name} className="partner-logo" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ABOUT COMPANY ---------- */}
      <section className="about-section">
        <div className="container about-grid">
          <div className="about-image reveal">
            <img src="/founder.png" alt="Divya Babbar — Founder, Braintech Education & Placement" />
            <div className="about-founder-tag">
              <b>Founder - Divya Babbar</b>
              <span>Braintech Education &amp; Placement</span>
            </div>
          </div>
          <div className="about-content reveal">
            <h2>About Braintech</h2>
            <p>
              <b>Since 2017</b>, Braintech Education &amp; Placement Services has operated in employment
              services — recruiting across India for fresher, middle and senior management positions.
              Headquartered in Jaipur (Rajasthan), we cater to a PAN-India client base spanning
              Electronics, Mining, FMCG, IT, Wire Manufacturing and Infrastructure.
            </p>
            <p>
              With an unrivalled history of sourcing excellent candidates who stay happy and successful
              in their roles, you can trust Braintech to take the stress out of sourcing and placing
              employees — without the burden of huge financial outlay.
            </p>
            <Link to="/about" className="btn btn-primary">Explore Company</Link>
          </div>
        </div>
      </section>

      {/* ---------- OUR PROMISE ---------- */}
      <section className="promise-section">
        <div className="container">
          <h2 className="section-title reveal">Our Promise to You</h2>
          <div className="promise-list reveal">
            {PROMISES.map((p) => (
              <div className="promise-item" key={p}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CANDIDATE CTA ---------- */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="candidate-cta reveal">
            <div>
              <h2>Looking for your next opportunity?</h2>
              <p>Create your profile and discover jobs matching your skills.</p>
            </div>
            <div className="cta-actions">
              <Link to="/submit-resume" className="cta-button">Create Candidate Profile</Link>
              <Link to="/jobs" className="cta-button ghost">Find a Job</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- EMPLOYER CTA ---------- */}
      <section className="section">
        <div className="container">
          <div className="employer-cta reveal">
            <div>
              <h2>Hiring talent?</h2>
              <p>Find qualified candidates faster with Braintech's verified talent pool.</p>
            </div>
            <div className="cta-actions">
              <Link to="/post-job" className="btn btn-primary">Post a Job</Link>
              <Link to="/contact" className="btn btn-outline-dark">Talk to Recruitment Team</Link>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}
