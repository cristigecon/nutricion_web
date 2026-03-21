import { useState, useRef, useEffect } from "react";

function Bloque({ titulo, opciones, valor, setValor }) {
  const [abierto, setAbierto] = useState(!!valor);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(abierto ? contentRef.current.scrollHeight : 0);
    }
  }, [abierto]);

  return (
    <div style={{ marginTop: 15 }}>
      
      {/* CABECERA */}
      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          backgroundColor: "#f0f0f0",
          padding: 12,
          borderRadius: 10,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "0.2s"
        }}
      >
        <span>{titulo}</span>
        <span
          style={{
            transform: abierto ? "rotate(90deg)" : "rotate(0deg)",
            transition: "0.2s"
          }}
        >
          ▶
        </span>
      </div>

      {/* CONTENIDO ANIMADO */}
      <div
        style={{
          height: height,
          overflow: "hidden",
          transition: "height 0.25s ease"
        }}
      >
        <div ref={contentRef}>
          <div style={{ marginTop: 10 }}>
            {opciones.map((opcion) => {
              const seleccionado = valor === opcion;

              return (
                <div
                  key={opcion}
                  onClick={() => setValor(opcion)}
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 10,
                    cursor: "pointer",
                    backgroundColor: seleccionado ? "#4CAF50" : "#fff",
                    color: seleccionado ? "white" : "black",
                    border: "1px solid #ddd",
                    transition: "0.2s"
                  }}
                >
                  {opcion}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bloque;