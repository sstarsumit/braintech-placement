import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container text-center" style={{ padding: '80px 0' }}>
        <div style={{ fontSize: 90 }}>🧭</div>
        <h1 style={{ fontSize: 34, margin: '16px 0 8px' }}>Page not found</h1>
        <p className="muted">The page you are looking for doesn't exist or was moved.</p>
        <Link to="/" className="btn btn-teal mt-2" style={{ marginTop: 22 }}>Back to Home</Link>
      </div>
    </div>
  );
}
