import React from 'react';

export const PantsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2v20M5.5 2l-1.5 20M18.5 2l1.5 20M4 22h16" />
        <path d="M6 12h12" />
    </svg>
);
