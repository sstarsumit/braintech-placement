import { useEffect, useState } from 'react';
import api from '../api';
import PageBanner from '../components/PageBanner.jsx';
import { Spinner } from '../components/Spinner.jsx';

export default function PlacementStory() {
  const [stories, setStories] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/misc/stories').then((r) => setStories(r.data)).catch(() => setStories([]));
  }, []);

  return (
    <>
      <PageBanner
        title="Placement Story"
        sub="Real stories from candidates we placed across industries."
        crumbs={[{ label: 'Placement Story' }]}
      />
      <div className="page">
        <div className="container">
          {stories === null ? (
            <Spinner />
          ) : stories.length === 0 ? (
            <div className="empty"><div className="big">💬</div><p>No placement stories yet.</p></div>
          ) : (
            <div className="story-grid">
              {stories.map((s) => (
                <div className="story-card" key={s._id}>
                  <span className="qm">“</span>
                  <p>{s.story}</p>
                  <div className="who">
                    <span className="ph">{s.name.charAt(0).toUpperCase()}</span>
                    <span>
                      <b>{s.name}</b>
                      <span>{s.designation}{s.company ? `, ${s.company}` : ''}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
