import { useState } from "react";

function BotonGuardar({ onClick, texto = "Guardar" }) {
  const [guardado, setGuardado] = useState(false);

  const handleClick = () => {
    onClick();

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 1500);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 14,
        border: "none",
        backgroundColor: guardado ? "#4CAF50" : "#007AFF",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: guardado ? "scale(1.05)" : "scale(1)"
      }}
    >
      {guardado ? "✔ Guardado" : texto}
    </button>
  );
}

export default BotonGuardar;