import React, { useEffect, useRef } from 'react';

const Modal = ({ open, onClose, children, ariaLabel }) => {
  const overlayRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // basic focus trap
        const focusable = containerRef.current.querySelectorAll('a[href], button, textarea, input, select');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // autofocus first focusable element
    setTimeout(() => {
      const el = containerRef.current && containerRef.current.querySelector('input, button, select, textarea');
      if (el) el.focus();
    }, 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }} role="dialog" aria-label={ariaLabel || 'modal'}>
      <div ref={containerRef} className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 transform transition-all duration-200 ease-out scale-100" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
