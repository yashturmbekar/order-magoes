import React from "react";
import "../style.css";

export default function Popup({
  message,
  onClose,
  children,
  hideCloseButton = false,
}) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <p>{message}</p>
        {children}
        {!hideCloseButton && <button onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}
