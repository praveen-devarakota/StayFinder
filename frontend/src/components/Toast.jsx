import React, { useEffect } from 'react';

const Toast = ({ message, show, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-4 py-2 bg-[#FF385C] text-white font-bold rounded-lg shadow-lg transition-transform transform ${
        show ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ minWidth: 180 }}
    >
      {message}
    </div>
  );
};

export default Toast; 