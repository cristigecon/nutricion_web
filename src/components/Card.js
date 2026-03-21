function Card({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      {children}
    </div>
  );
}

export default Card;