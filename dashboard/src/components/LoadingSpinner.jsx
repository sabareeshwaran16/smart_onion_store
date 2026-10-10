export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        <div className="spin" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTopColor: '#2563eb',
        }} />
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>{text}</p>
    </div>
  );
}
