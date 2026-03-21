function Section({ titulo, children }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}
    >
      <p style={{ fontWeight: "600", marginBottom: 10 }}>
        {titulo}
      </p>

      {children}
    </div>
  );
}

export default Section;