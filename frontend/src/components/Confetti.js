import { useEffect, useState } from "react";

function Confetti({ trigger }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 2000);
    }
  }, [trigger]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 999
      }}
    >
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            borderRadius: 2,
            animation: "fall 2s linear"
          }}
        />
      ))}

      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-100px); opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default Confetti;