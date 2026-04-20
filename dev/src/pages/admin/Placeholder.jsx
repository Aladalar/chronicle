export default function Placeholder({ title, description }) {
  return (
    <div style={{
      padding: "40px 20px",
      textAlign: "center",
      border: "1px dashed var(--border)",
      borderRadius: 8,
      background: "var(--surface)",
    }}>
      <h3 style={{ color: "var(--text-dim)", marginBottom: 8 }}>{title}</h3>
      <p className="muted">{description || "Section not built yet."}</p>
    </div>
  );
}
