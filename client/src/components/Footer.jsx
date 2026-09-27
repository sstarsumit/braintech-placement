import { Link } from 'react-router-dom';

const industries = [
  'Electronics Industry', 'Mining Industry', 'FMCG Industry',
  'IT Industries', 'Wire Manufacturing Industries', 'Infrastructure'
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo-full-alpha.png" alt="Braintech Education & Placement" className="footer-logo" />
            <p>
              Since 2017, Braintech Education &amp; Placement Services has connected
              job seekers with verified employers across India — from fresher roles
              to senior management positions.
            </p>
          </div>
          <div>
            <h3>Main</h3>
            <div className="footer-links">
              <Link to="/submit-resume">Post Resume</Link>
              <Link to="/post-job">Post Job</Link>
              <Link to="/jobs">Find a Job</Link>
              <Link to="/about">About Company</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/placement-story">Terms &amp; Conditions</Link>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            </div>
          </div>
          <div>
            <h3>For job seekers</h3>
            <div className="footer-links">
              {industries.map((i) => (
                <Link key={i} to={`/jobs?industry=${encodeURIComponent(i.replace(' Industry', '').replace(' Industries', ''))}`}>
                  {i}
                </Link>
              ))}
            </div>
          </div>
          <div className="social">
            <h3>Social</h3>
            <a href="https://www.facebook.com/braintechplacement/" target="_blank" rel="noreferrer"><span className="ic">f</span>Facebook</a>
            <a href="https://www.instagram.com/braintecheducationplacement/" target="_blank" rel="noreferrer">
              <span className="ic">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
              Instagram
            </a>
            <a href="https://www.linkedin.com/company/braintech-education-placement-services-pvt-ltd-jaipur" target="_blank" rel="noreferrer"><span className="ic">in</span>LinkedIn</a>
            <a href="https://wa.me/919587254540" target="_blank" rel="noreferrer"><span className="ic">✆</span>WhatsApp</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="inner">
            <img src="/logo-mark-alpha.png" alt="" className="mini-logo-img" aria-hidden="true" />
            <p>
              Copyright © 2024 Braintech. Designed and Developed by{' '}
              <a href="https://braintechplacement.com" target="_blank" rel="noreferrer">
                Braintech Education and Placement
              </a>{' '}
              All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
