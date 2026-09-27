import { useEffect, useState } from 'react';
import api from '../api';

export default function Testimonials() {
  const [stories, setStories] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get('/misc/stories').then((r) => setStories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (stories.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % stories.length), 6000);
    return () => clearInterval(t);
  }, [stories.length]);

  if (!stories.length) return null;
  const s = stories[idx];
  const prev = () => setIdx((idx - 1 + stories.length) % stories.length);
  const next = () => setIdx((idx + 1) % stories.length);

  return (
    <section className="section tst-section">
      <div className="container">
        <h2 className="section-title">What our clients are saying</h2>
        <div className="tst-wrap">
          <button className="tst-nav prev" onClick={prev} aria-label="Previous">‹</button>
          <div key={s._id}>
            <p className="tst-quote">{s.story}</p>
            <div className="tst-person">
              <span className="ph">{s.name.charAt(0).toUpperCase()}</span>
              <span className="nm">
                <b>{s.name}</b>
                <span>{s.designation}{s.company ? `, ${s.company}` : ''}</span>
              </span>
            </div>
          </div>
          <button className="tst-nav next" onClick={next} aria-label="Next">›</button>
        </div>
        <div className="tst-dots">
          {stories.map((st, i) => (
            <button key={st._id} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} aria-label={`Story ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
