import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

/* ---------------- Real contact data (matches braintechplacement.com) ---------------- */

const OFFICE = {
  name: 'Braintech Education & Placement Services Pvt. Ltd.',
  lines: ['SF-13A, JTM Mall, Near Model Town', 'Malviya Nagar, Jaipur', 'Rajasthan 302017'],
  short: 'Jaipur, Rajasthan'
};
const PHONE = { label: '+91 9587254540', href: 'tel:+919587254540' };
const WHATSAPP = [
  { label: '+91 9587254540', href: 'https://wa.me/919587254540' },
  { label: '+91 9549846075', href: 'https://wa.me/919549846075' },
  { label: '+91 8094602079', href: 'https://wa.me/918094602079' }
];
const EMAIL = { label: 'admin@braintechplacement.com', href: 'mailto:admin@braintechplacement.com' };
const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=JTM+Mall+Malviya+Nagar+Jaipur+Rajasthan+302017';
const MAPS_EMBED =
  'https://www.google.com/maps?q=JTM%20Mall%2C%20Model%20Town%2C%20Malviya%20Nagar%2C%20Jaipur%2C%20Rajasthan%20302017&output=embed';

/* ---------------- Icons (inline SVG — no emoji) ---------------- */

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);
const I = {
  call:
    'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail:
    'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  pin:
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  wa:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z'
};

/* ---------------- Help selector data ---------------- */

const REASONS = [
  { id: 'job-seeker', label: 'Looking for a job', subject: 'Candidate enquiry' },
  { id: 'employer', label: 'Hiring candidates', subject: 'Recruitment enquiry' },
  { id: 'general', label: 'General enquiry', subject: 'General enquiry' },
  { id: 'other', label: 'Other', subject: 'General enquiry' }
];
const subjectFor = (id) => (REASONS.find((r) => r.id === id) || REASONS[2]).subject;

const FAQS = [
  {
    q: 'How can I apply for jobs through Braintech?',
    a: 'Create your candidate profile and browse available opportunities. You can then apply to the openings that match your skills and experience.'
  },
  {
    q: 'Can companies contact Braintech for recruitment requirements?',
    a: 'Yes. Employers can send us their hiring requirement through this page, talk to our recruitment team directly, or use the Post a Job flow after registering as a recruiter.'
  },
  {
    q: 'How can I contact Braintech directly?',
    a: 'You can call us, message us on WhatsApp, email us, or submit the contact form on this page — whichever is quickest for you.'
  },
  {
    q: 'Where is Braintech located?',
    a: 'Our office is at SF-13A, JTM Mall, Near Model Town, Malviya Nagar, Jaipur, Rajasthan 302017. Directions are available in the "Visit our office" section below.'
  }
];

const scrollToForm = () =>
  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ---------------- Component ---------------- */

export default function Contact() {
  const { user } = useAuth();
  const [helpChoice, setHelpChoice] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', reason: 'general', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);
  const [cb, setCb] = useState({ name: '', phone: '', time: 'Morning' });
  const [cbStatus, setCbStatus] = useState({ type: '', msg: '' });
  const [cbBusy, setCbBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const chooseHelp = (id) => {
    setHelpChoice(id);
    setForm((f) => ({ ...f, reason: id }));
    scrollToForm();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: '', msg: '' });
    try {
      const payload = { ...form, subject: subjectFor(form.reason), kind: 'message' };
      const r = await api.post('/misc/contact', payload);
      setStatus({ type: 'ok', msg: r.data.message });
      setForm({ name: '', email: '', phone: '', company: '', reason: form.reason, message: '' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || err.message });
    } finally {
      setBusy(false);
    }
  };

  const submitCallback = async (e) => {
    e.preventDefault();
    setCbBusy(true);
    setCbStatus({ type: '', msg: '' });
    try {
      const r = await api.post('/misc/contact', {
        name: cb.name,
        phone: cb.phone,
        kind: 'callback',
        subject: 'Callback request',
        message: `Callback requested — preferred time: ${cb.time}.`,
        callback: { preferredTime: cb.time }
      });
      setCbStatus({ type: 'ok', msg: r.data.message });
      setCb({ name: '', phone: '', time: 'Morning' });
    } catch (err) {
      setCbStatus({ type: 'err', msg: err.response?.data?.message || err.message });
    } finally {
      setCbBusy(false);
    }
  };

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="c-hero">
        <div className="container c-hero-grid">
          <div>
            <div className="c-hero-kicker">Contact Braintech</div>
            <h1>
              Let's talk about your
              <br />
              next opportunity.
            </h1>
            <p className="c-hero-sub">
              Looking for a job, hiring talent, or simply have a question? Get in touch with the
              Braintech Education &amp; Placement team.
            </p>
            <div className="c-hero-crumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Contact Us</span>
            </div>
          </div>
          <div className="c-hero-visual" aria-hidden="true">
            <span className="c-hero-badge">Jaipur HQ</span>
            <b>{OFFICE.name}</b>
            {OFFICE.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
            <a className="c-hero-visual-link" href={MAPS_LINK} target="_blank" rel="noreferrer">
              View on Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ---------- HOW CAN WE HELP ---------- */}
      <section className="c-help">
        <div className="container">
          <h2 className="c-sec-title">How can we help?</h2>
          <div className="c-help-opts">
            <button type="button" className={helpChoice === 'job-seeker' ? 'on' : ''} aria-pressed={helpChoice === 'job-seeker'} onClick={() => chooseHelp('job-seeker')}>
              I'm looking for a job
            </button>
            <button type="button" className={helpChoice === 'employer' ? 'on' : ''} aria-pressed={helpChoice === 'employer'} onClick={() => chooseHelp('employer')}>
              I'm hiring
            </button>
            <button type="button" className={helpChoice === 'general' ? 'on' : ''} aria-pressed={helpChoice === 'general'} onClick={() => chooseHelp('general')}>
              General enquiry
            </button>
          </div>

          {helpChoice === 'job-seeker' && (
            <div className="c-help-panel">
              <h3>I'm looking for a job</h3>
              <p>Create your profile, explore opportunities, or speak with our placement team.</p>
              <div className="c-actions">
                <Link className="btn btn-primary" to="/submit-resume">Create Candidate Profile</Link>
                <button type="button" className="btn btn-ghost" onClick={scrollToForm}>Talk to Placement Team</button>
              </div>
            </div>
          )}
          {helpChoice === 'employer' && (
            <div className="c-help-panel">
              <h3>I'm hiring</h3>
              <p>Tell us about your hiring requirement and our recruitment team can assist you.</p>
              <div className="c-actions">
                <Link className="btn btn-primary" to="/post-job">Post a Job</Link>
                <button type="button" className="btn btn-ghost" onClick={scrollToForm}>Talk to Recruitment Team</button>
              </div>
            </div>
          )}
          {helpChoice === 'general' && (
            <div className="c-help-panel">
              <h3>Have a question?</h3>
              <p>Send us a message and we'll get back to you.</p>
              <div className="c-actions">
                <button type="button" className="btn btn-primary" onClick={scrollToForm}>Write a Message</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- FORM + DIRECT CONTACT ---------- */}
      <section className="c-main" id="contact-form">
        <div className="container">
          <h2 className="c-sec-title">Contact our team</h2>
          <div className="c-main-grid">
            <div className="c-form">
              <h3>Send a message</h3>
              {status.msg && (
                <div className={`alert ${status.type === 'ok' ? 'alert-success' : 'alert-error'}`}>{status.msg}</div>
              )}
              <form onSubmit={submit}>
                <div className="form-grid">
                  <div className="field">
                    <label>Full Name *</label>
                    <input required value={form.name} onChange={set('name')} placeholder="Your full name" />
                  </div>
                  <div className="field">
                    <label>Email Address *</label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Mobile number (optional)" />
                </div>
                <div className="field">
                  <label>What can we help you with?</label>
                  <div className="c-reasons" role="radiogroup" aria-label="Reason for contact">
                    {REASONS.map((r) => (
                      <label key={r.id} className={`c-reason ${form.reason === r.id ? 'on' : ''}`}>
                        <input
                          type="radio"
                          name="reason"
                          value={r.id}
                          checked={form.reason === r.id}
                          onChange={() => setForm({ ...form, reason: r.id })}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>
                {form.reason === 'employer' && (
                  <div className="field">
                    <label>Company</label>
                    <input value={form.company} onChange={set('company')} placeholder="Company name (optional)" />
                  </div>
                )}
                <p className="c-subject-note">Subject: <b>{subjectFor(form.reason)}</b></p>
                <div className="field">
                  <label>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')} placeholder="Tell us more…" />
                </div>
                <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send Message'}</button>
              </form>
            </div>

            <aside className="c-direct" id="direct">
              <h3>Contact directly</h3>

              <div className="c-line">
                <span className="c-ico"><Icon d={I.call} /></span>
                <div>
                  <b>Call us</b>
                  <a href={PHONE.href}>{PHONE.label}</a>
                  <small>Speak with our support team</small>
                </div>
              </div>

              <div className="c-line">
                <span className="c-ico c-ico-wa"><Icon d={I.wa} /></span>
                <div>
                  <b>WhatsApp</b>
                  <a href={WHATSAPP[0].href} target="_blank" rel="noreferrer">{WHATSAPP[0].label}</a>
                  <small>
                    Also:{' '}
                    <a href={WHATSAPP[1].href} target="_blank" rel="noreferrer">{WHATSAPP[1].label}</a>
                    {' · '}
                    <a href={WHATSAPP[2].href} target="_blank" rel="noreferrer">{WHATSAPP[2].label}</a>
                  </small>
                </div>
              </div>

              <div className="c-line">
                <span className="c-ico"><Icon d={I.mail} /></span>
                <div>
                  <b>Email</b>
                  <a href={EMAIL.href}>{EMAIL.label}</a>
                </div>
              </div>

              <div className="c-line">
                <span className="c-ico"><Icon d={I.pin} /></span>
                <div>
                  <b>Office</b>
                  <span>{OFFICE.short}</span>
                  <small>
                    <a href="#visit">See location &amp; directions</a>
                  </small>
                </div>
              </div>

              <a className="btn btn-primary c-direct-cta" href={PHONE.href}>Call {PHONE.label}</a>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------- CALLBACK ---------- */}
      <section className="c-callback">
        <div className="container c-callback-grid">
          <div>
            <h2>Request a call back</h2>
            <p>
              Need to speak with our team? Leave your number and a preferred time — we'll call you
              back. You can also reach us instantly on {PHONE.label}.
            </p>
          </div>
          <form className="c-callback-form" onSubmit={submitCallback}>
            {cbStatus.msg && (
              <div className={`alert ${cbStatus.type === 'ok' ? 'alert-success' : 'alert-error'}`}>{cbStatus.msg}</div>
            )}
            <div className="c-cb-row">
              <div className="field">
                <label>Name</label>
                <input required value={cb.name} onChange={(e) => setCb({ ...cb, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input required type="tel" value={cb.phone} onChange={(e) => setCb({ ...cb, phone: e.target.value })} placeholder="Mobile number" />
              </div>
              <div className="field">
                <label>Preferred time</label>
                <select value={cb.time} onChange={(e) => setCb({ ...cb, time: e.target.value })}>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" disabled={cbBusy}>{cbBusy ? 'Sending…' : 'Request a Call'}</button>
          </form>
        </div>
      </section>

      {/* ---------- OFFICE / MAP ---------- */}
      <section className="c-map" id="visit">
        <div className="container">
          <h2 className="c-sec-title">Visit our Jaipur office</h2>
          <div className="c-map-grid">
            <div className="c-map-frame">
              <iframe
                title="Braintech Education & Placement office location"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="c-map-info">
              <b>{OFFICE.name}</b>
              <address>
                {OFFICE.lines.map((l) => (
                  <span key={l}>
                    {l}
                    <br />
                  </span>
                ))}
              </address>
              <a className="btn btn-primary" href={MAPS_LINK} target="_blank" rel="noreferrer">Get Directions</a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="c-faq">
        <div className="container c-faq-narrow">
          <h2 className="c-sec-title">Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- ROLE-AWARE FINAL CTA ---------- */}
      <FinalCta user={user} />
    </>
  );
}

function FinalCta({ user }) {
  if (!user) {
    return (
      <section className="c-cta">
        <div className="container c-cta-grid">
          <div className="c-cta-panel">
            <h3>Looking for work?</h3>
            <p>Create your profile and explore relevant jobs from verified employers.</p>
            <div className="c-actions">
              <Link className="btn btn-primary" to="/jobs">Find Jobs</Link>
              <Link className="btn btn-ghost" to="/submit-resume">Create Candidate Profile</Link>
            </div>
          </div>
          <div className="c-cta-panel">
            <h3>Hiring talent?</h3>
            <p>Tell us what you're looking for — we source candidates across industries.</p>
            <div className="c-actions">
              <Link className="btn btn-primary" to="/post-job">Post a Job</Link>
              <Link className="btn btn-ghost" to="/register">Register as Recruiter</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (user.role === 'candidate') {
    return (
      <section className="c-cta">
        <div className="container c-cta-grid">
          <div className="c-cta-panel">
            <h3>Looking for a job?</h3>
            <p>Your profile is ready. Browse current openings and apply in one click.</p>
            <div className="c-actions">
              <Link className="btn btn-primary" to="/jobs">Find Jobs</Link>
              <Link className="btn btn-ghost" to="/candidate/applications">My Applications</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (user.role === 'recruiter') {
    return (
      <section className="c-cta">
        <div className="container c-cta-grid">
          <div className="c-cta-panel">
            <h3>Hiring?</h3>
            <p>Manage your vacancies and review applicants from your recruiter dashboard.</p>
            <div className="c-actions">
              <Link className="btn btn-primary" to="/post-job">Post a Job</Link>
              <Link className="btn btn-ghost" to="/recruiter/jobs">My Jobs</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="c-cta">
      <div className="container c-cta-grid">
        <div className="c-cta-panel">
          <h3>Signed in as administrator</h3>
          <p>Review contact requests and enquiries from the admin panel.</p>
          <div className="c-actions">
            <Link className="btn btn-primary" to="/admin/contacts">Contact Requests</Link>
            <Link className="btn btn-ghost" to="/admin">Dashboard</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
