import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminContacts() {
  const [contacts, setContacts] = useState(null);

  const load = () => api.get('/misc/admin/contacts').then((r) => setContacts(r.data)).catch(() => setContacts([]));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/misc/admin/contacts/${id}`, { status });
      load();
    } catch (e) { window.alert(e.message); }
  };

  if (contacts === null) return <div className="spin" />;

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>Contact Requests</h1>
          <p>Callbacks and enquiries from the website contact form.</p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="panel"><p className="muted">No contact requests yet.</p></div>
      ) : (
        <div className="table-wrap panel" style={{ marginTop: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>From</th><th>Subject</th><th>Message</th><th>Status</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td>
                    <b>{c.name}</b>
                    <div className="muted">{c.email}</div>
                    {c.phone && <div className="muted">📞 {c.phone}</div>}
                    {c.company && <div className="muted">🏢 {c.company}</div>}
                  </td>
                  <td>
                    {c.kind === 'callback' ? <span className="badge new">📞 Callback</span> : (c.subject || '—')}
                    {c.kind === 'callback' && c.callback?.preferredTime && (
                      <div className="muted">Prefers: {c.callback.preferredTime}</div>
                    )}
                  </td>
                  <td style={{ maxWidth: 340 }}>{c.message}</td>
                  <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                  <td>
                    <div className="actions">
                      {c.status === 'new' && <button className="btn btn-sm btn-teal" onClick={() => setStatus(c._id, 'in-progress')}>Start</button>}
                      {c.status !== 'resolved' && <button className="btn btn-sm btn-teal" onClick={() => setStatus(c._id, 'resolved')}>Resolve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
