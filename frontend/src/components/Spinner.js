import React from 'react';

const Spinner = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" className="animate-spin" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#e5e7eb" opacity="0.5" />
    <path d="M45 25a20 20 0 0 1-20 20" fill="none" strokeWidth="5" stroke="#3b82f6" strokeLinecap="round" />
  </svg>
);

export default Spinner;
