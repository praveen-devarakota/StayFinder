import React, { useEffect, useRef, useState } from 'react';

const TICK_PATH = "M6 13l4 4L18 7";
const CROSS_PATH = "M6 6l12 12M6 18L18 6";

const AnimatedPopup = ({ show, message, onClose, type = 'success', duration = 3000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef();
  const typingRef = useRef();

  // Typing animation
  useEffect(() => {
    if (show) {
      setDisplayedText('');
      let i = 0;
      function typeNext() {
        setDisplayedText(message.slice(0, i + 1));
        if (i < message.length - 1) {
          typingRef.current = setTimeout(typeNext, 18 + Math.random() * 30);
          i++;
        }
      }
      typeNext();
    } else {
      setDisplayedText('');
    }
    return () => clearTimeout(typingRef.current);
  }, [show, message]);

  // Auto-dismiss
  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [show, duration, onClose]);

  // SVG animation keyframes
  useEffect(() => {
    if (!document.getElementById('popup-animations')) {
      const style = document.createElement('style');
      style.id = 'popup-animations';
      style.innerHTML = `
        @keyframes draw {
          from { stroke-dashoffset: var(--draw-length, 24); }
          to { stroke-dashoffset: 0; }
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.85); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Popup color and icon
  const iconStroke = type === 'success' ? '#22c55e' : '#ef4444';
  const path = type === 'success' ? TICK_PATH : CROSS_PATH;
  const pathLength = type === 'success' ? 24 : 36;
  const text = type === 'success' ? 'text-green-800' : 'text-red-800';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none`}
      aria-live="polite"
    >
      <div
        className={`relative flex flex-col items-center px-10 py-8 rounded-3xl shadow-2xl border border-gray-200 bg-white/80 backdrop-blur-lg ${text} max-w-xs w-full transition-all duration-500
          ${show ? 'opacity-100 scale-100 animate-[fadeInScale_0.6s_cubic-bezier(0.4,0,0.2,1)]' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{ minWidth: 260, transition: 'box-shadow 0.4s, background 0.4s' }}
      >
        {/* Animated SVG icon */}
        <svg
          width="54" height="54" viewBox="0 0 24 24"
          fill="none" stroke={iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="mb-3 drop-shadow-lg"
        >
          <path
            d={path}
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: show ? 0 : pathLength,
              animation: show ? 'draw 1.1s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
              '--draw-length': pathLength,
            }}
          />
        </svg>
        {/* Typing animation for message */}
        <span
          className="block font-semibold text-lg text-center whitespace-nowrap overflow-hidden max-w-xs"
          style={{
            letterSpacing: '0.01em',
            minHeight: 28,
            width: 'fit-content',
            animation: show ? 'typing 1.2s steps(40, end) 1' : 'none',
            margin: '0 auto',
            maxWidth: 260,
          }}
        >
          {displayedText}
        </span>
      </div>
    </div>
  );
};

export default AnimatedPopup; 