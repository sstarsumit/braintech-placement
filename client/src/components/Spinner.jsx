export function Spinner() {
  return <div className="spin" />;
}

export function Empty({ icon = '🔍', text = 'Nothing found' }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
