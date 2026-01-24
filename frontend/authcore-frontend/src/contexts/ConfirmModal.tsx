import React from "react";

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null; // No mostrar si no está activo

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#222222",
          padding: "20px",
          borderRadius: "8px",
          color: "#fff",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <p>{message}</p>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-around" }}>
          <button
            style={{ padding: "8px 16px", background: "#9340ff", color: "#fff", border: "none", borderRadius: 4 }}
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            style={{ padding: "8px 16px", background: "#555", color: "#fff", border: "none", borderRadius: 4 }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
