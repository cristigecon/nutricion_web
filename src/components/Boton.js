function Boton({ children, onClick, activo }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 12,
        borderRadius: 14,
        border: "none",
        backgroundColor: activo ? "#007AFF" : "#e5e5ea",
        color: activo ? "white" : "black",
        fontWeight: "600",
        cursor: "pointer",
        transition: "0.2s"
      }}
    >
      {children}
    </button>
  );
}

export default Boton;