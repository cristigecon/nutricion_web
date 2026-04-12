function CheckCircle({ checked, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "2px solid",
        borderColor: checked ? "#4CAF50" : "#ccc",
        backgroundColor: checked ? "#4CAF50" : "transparent",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: checked ? "scale(1.1)" : "scale(1)"
      }}
      onMouseDown={(e) =>
        (e.currentTarget.style.transform = "scale(0.9)")
      }
      onMouseUp={(e) =>
        (e.currentTarget.style.transform = checked
          ? "scale(1.1)"
          : "scale(1)")
      }
    >
      {checked ? "✔" : ""}
    </button>
  );
}

export default CheckCircle;