import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminStories() {
  const [stories, setStories] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '', company: '', story: '' });
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/misc/admin/stories').then((r) => setStories(r.data)).catch(() => setStories([]));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/misc/admin/stories', form);
      setForm({ name: '', designation: '', company: '', story: '' });
      load();
    } catch (err) { window.alert(err.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try { await api.delete(`/misc/admin/stories/${id}`); load(); } catch (e) { window.alert(e.message); }
  };

  if (stories === null) return <div className="spin" />;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Placement Stories</h1>
          <p>Manage testimonials shown on the homepage and placement story page.</p>
        </div>
      </div>

      <form className="panel" style={{ marginTop: 0 }} onSubmit={create}>
        <h2>Add story</h2>
        <div className="form-grid">
          <div className="field"><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Designation</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Software Engineer" /></div>
          <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        </div>
        <div className="field"><label>Story *</label><textarea required rows={4} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add Story'}</button>
      </form>

      <div className="panel">
        <h2>Existing stories ({stories.length})</h2>
        {stories.length === 0 ? (
          <p className="muted">No stories yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Story</th><th></th></tr></thead>
              <tbody>
                {stories.map((s) => (
                  <tr key={s._id}>
                    <td><b>{s.name}</b><div className="muted">{s.designation}{s.company ? `, ${s.company}` : ''}</div></td>
                    <td style={{ maxWidth: 420 }}>{s.story}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => remove(s._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
