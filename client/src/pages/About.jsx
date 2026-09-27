import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Testimonials from '../components/Testimonials.jsx';

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

const STATS = [
  { v: '2017', l: 'Established' },
  { v: 'PAN India', l: 'Recruitment Coverage' },
  { v: 'Fresher → Senior', l: 'Management Hiring' },
  { v: 'Non-IT Focus', l: 'Recruitment Expertise' }
];

const WHO = [
  'Talent Acquisition',
  'Recruitment Services',
  'Training & Development',
  'Career Support',
  'Industry-focused Recruitment',
  'HR Solutions'
];

const SERVICES = [
  {
    icon: '🎯',
    t: 'Recruitment Services',
    d: 'End-to-end hiring support — from formulating the recruitment plan to following up till the joining date.'
  },
  {
    icon: '🧲',
    t: 'Talent Acquisition',
    d: 'Sourcing excellent candidates who stay happy and successful in their roles, at every level of seniority.'
  },
  {
    icon: '📚',
    t: 'Training & Development',
    d: 'Programs that support individuals to develop competencies and build efficiency in their roles.'
  },
  {
    icon: '🗂️',
    t: 'HR Solutions',
    d: 'A tried-and-tested process that gives organizations effective, structured HR support.'
  },
  {
    icon: '🧭',
    t: 'Career Support',
    d: 'Guidance for candidates at every step — profile building, interview coordination and offer negotiation.'
  },
  {
    icon: '🏭',
    t: 'Industry Hiring',
    d: 'Sector-specialist consultants across Electronics, Mining, FMCG, IT, Wire Manufacturing and Infrastructure.'
  }
];

const EXPERTISE = [
  'Sales & Business Development',
  'Finance & Accounts',
  'HR & Administration',
  'Back Office / Front Office',
  'Counsellor',
  'Technician'
];

const INDUSTRIES = ['Electronics', 'Mining', 'FMCG', 'IT', 'Wire Manufacturing', 'Infrastructure'];

const PROCESS = [
  { n: '01', t: 'Requirement Analysis', d: 'Understanding the role, team and culture to formulate a precise recruitment plan.' },
  { n: '02', t: 'Candidate Sourcing', d: 'Searching our database and networks for profiles matching the requirement.' },
  { n: '03', t: 'Screening', d: 'Assessing applicant profiles and shortlisting the strongest fits.' },
  { n: '04', t: 'Interview Coordination', d: 'Calling and following up with shortlisted candidates for interviews.' },
  { n: '05', t: 'Selection Support', d: 'Working closely with the client to select the most suitable candidates.' },
  { n: '06', t: 'Background Checks', d: 'Verifying selected candidates before offers are released.' },
  { n: '07', t: 'Offer & Negotiation', d: 'Helping the client negotiate with the chosen candidates.' },
  { n: '08', t: 'Post-placement Support', d: 'Following up with both sides till the joining date — and beyond.' }
];

const WHY = [
  {
    icon: '✓',
    t: 'Quality',
    d: 'We are driven by quality — a tried and tested recruitment process that supports our consultants to ensure who we hire is the right person for you.'
  },
  {
    icon: '👥',
    t: 'Our Team',
    d: 'Braintech is known for bringing a common-sense approach to recruitment and going the extra mile to ensure clients and candidates achieve the best outcomes.'
  },
  {
    icon: '★',
    t: 'Expertise',
    d: 'Expertise in recruiting for Non-IT profiles — Sales, Accounts, HR, Back Office, Counsellors and Technicians — from fresher to senior management.'
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

export default function About() {
  useReveal([]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="abt-hero">
        <div className="container abt-hero-inner">
          <div className="crumbs crumbs-light">
            <Link to="/">Home</Link>
            <span>› About Us</span>
          </div>
          <h1 className="reveal">Connecting Talent With the Right Opportunity</h1>
          <p className="reveal">
            Braintech Education &amp; Placement Services helps organizations find capable talent and
            helps professionals build meaningful careers.
          </p>
          <div className="abt-hero-tags reveal">
            <span>Recruitment</span>
            <span>Training</span>
            <span>Career Development</span>
          </div>
        </div>
      </section>

      {/* ---------- COMPANY INTRODUCTION + STATS ---------- */}
      <section className="section abt-intro">
        <div className="container">
          <div className="abt-intro-grid">
            <div className="abt-image reveal">
              <img src="/founder.png" alt="Braintech Education & Placement" loading="lazy" />
              <div className="abt-image-badge">
                <b>Since 2017</b>
                <span>Employment services across India</span>
              </div>
            </div>
            <div className="abt-intro-content reveal">
              <span className="eyebrow">Who is Braintech</span>
              <h2>
                A Jaipur-based talent-search organization <em>serving clients across India</em>
              </h2>
              <p>
                Braintech Education &amp; Placement Services is a talent search and employment
                services organization based in Jaipur, Rajasthan. Since 2017 we have been providing
                recruitment, training &amp; development services that support individuals to develop
                competencies and help organizations improve efficiency.
              </p>
              <p>
                We recruit professionals across India for organizations of every size — from small
                and medium enterprises to established industry houses — covering fresher,
                middle-management and senior-management positions.
              </p>
              <div className="abt-intro-actions">
                <Link to="/jobs" className="btn btn-primary">Find a Job</Link>
                <Link to="/post-job" className="btn btn-outline">Post a Job</Link>
              </div>
            </div>
          </div>

          <div className="abt-stats reveal">
            {STATS.map((s) => (
              <div className="abt-stat" key={s.l}>
                <div className="v">{s.v}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHO WE ARE ---------- */}
      <section className="section abt-who">
        <div className="container">
          <div className="abt-who-grid">
            <div className="reveal">
              <span className="eyebrow">Who We Are</span>
              <h2>We connect people with opportunities and organizations with talent</h2>
              <p>
                Our work sits at the meeting point of two searches: a candidate's search for a
                meaningful career and a company's search for the right person. Our consultants
                manage both sides of that conversation every day.
              </p>
            </div>
            <div className="check-list reveal">
              {WHO.map((w) => (
                <div className="check-item" key={w}>
                  <span className="check-icon">✓</span>
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHAT WE DO ---------- */}
      <section className="section abt-services">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">What We Do</span>
            <h2>Services built around the full hiring journey</h2>
          </div>
          <div className="abt-services-grid">
            {SERVICES.map((s) => (
              <div className="service-card reveal" key={s.t}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- EXPERTISE ---------- */}
      <section className="section abt-expertise">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">Our Recruitment Expertise</span>
            <h2>Non-IT profiles are our speciality</h2>
            <p className="abt-muted">
              From fresher hiring to senior management, our consultants recruit for these
              categories every day.
            </p>
          </div>
          <div className="abt-exp-grid">
            {EXPERTISE.map((e) => (
              <div className="abt-exp-card reveal" key={e}>
                <span className="dot" />
                {e}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INDUSTRIES ---------- */}
      <section className="section abt-industries">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">Industries We Serve</span>
            <h2>Sector-specialist recruitment</h2>
          </div>
          <div className="abt-ind-grid">
            {INDUSTRIES.map((i) => (
              <Link to={`/jobs?industry=${encodeURIComponent(i)}`} className="abt-ind-card reveal" key={i}>
                <b>{i}</b>
                <span>Explore jobs →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- RECRUITMENT PROCESS ---------- */}
      <section className="abt-process">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow light">Our Recruitment Process</span>
            <h2>Structured. Systematic. Transparent.</h2>
          </div>
          <div className="abt-process-grid">
            {PROCESS.map((p) => (
              <div className="process-card reveal" key={p.n}>
                <div className="process-number">{p.n}</div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MISSION + VISION ---------- */}
      <section className="section abt-mv">
        <div className="container">
          <div className="abt-mv-grid">
            <div className="mv-card reveal">
              <span className="eyebrow">Our Mission</span>
              <h3>Connecting people, organizations and opportunities</h3>
              <p>
                To connect organizations with capable talent while helping candidates discover
                career opportunities aligned with their skills, experience and goals.
              </p>
            </div>
            <div className="mv-card reveal">
              <span className="eyebrow">Our Vision</span>
              <h3>A trusted recruitment ecosystem</h3>
              <p>
                To build a trusted recruitment ecosystem where organizations can access suitable
                talent and professionals can discover meaningful career paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHY CHOOSE US ---------- */}
      <section className="section abt-why">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">Why Choose Braintech</span>
            <h2>Quality. Team. Expertise.</h2>
          </div>
          <div className="abt-why-grid">
            {WHY.map((w) => (
              <div className="why-card reveal" key={w.t}>
                <div className="why-icon">{w.icon}</div>
                <h3>{w.t}</h3>
                <p>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FOUNDER ---------- */}
      <section className="section abt-founder">
        <div className="container">
          <div className="abt-founder-grid">
            <div className="abt-founder-image reveal">
              <img src="/founder.png" alt="Divya Babbar — Founder, Braintech Education & Placement" loading="lazy" />
            </div>
            <div className="abt-founder-content reveal">
              <span className="eyebrow">Meet Our Founder</span>
              <div className="founder-name">Divya Babbar</div>
              <div className="founder-role">Founder — Braintech Education &amp; Placement</div>
              <blockquote>
                “With an unrivalled history of sourcing excellent candidates who stay happy and
                successful in their roles, you can trust Braintech to take the stress out of
                sourcing and placing employees — without the burden of huge financial outlay.”
              </blockquote>
              <p>
                Under her leadership, Braintech has grown from a Jaipur-based consultancy into a
                recruitment partner serving organizations across India — built on honest advice,
                structured process and long-term relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- OUR PROMISE ---------- */}
      <section className="section abt-promise">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">Our Promise</span>
            <h2>What you can count on, every time</h2>
          </div>
          <div className="abt-promise-grid">
            {PROMISES.map((p) => (
              <div className="promise-card reveal" key={p}>
                <span className="promise-icon">✓</span>
                <b>{p}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CANDIDATE + EMPLOYER CTA ---------- */}
      <section className="abt-cta">
        <div className="container">
          <div className="abt-cta-grid">
            <div className="cta-card candidate reveal">
              <h3>Looking for a job?</h3>
              <p>Create your profile, get verified and apply to opportunities across India.</p>
              <div className="cta-actions">
                <Link to="/submit-resume" className="btn btn-light">Submit Resume</Link>
                <Link to="/jobs" className="btn btn-outline-light">Find Jobs</Link>
              </div>
            </div>
            <div className="cta-card employer reveal">
              <h3>Hiring talent?</h3>
              <p>Register your company, post your vacancy and receive verified applications.</p>
              <div className="cta-actions">
                <Link to="/post-job" className="btn btn-light">Post a Job</Link>
                <Link to="/contact" className="btn btn-outline-light">Talk to Our Team</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="section">
        <div className="container">
          <div className="abt-center reveal">
            <span className="eyebrow">What People Say</span>
            <h2>Placements that speak for themselves</h2>
          </div>
          <Testimonials />
        </div>
      </section>
    </>
  );
}
