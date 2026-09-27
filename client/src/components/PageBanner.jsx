import { Link } from 'react-router-dom';

export default function PageBanner({ title, sub, crumbs = [] }) {
  return (
    <div className="page-banner">
      <div className="container">
        <div className="crumbs">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}> › {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}</span>
          ))}
        </div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </div>
  );
}
