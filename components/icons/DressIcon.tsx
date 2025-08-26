import React from 'react';

export const DressIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="m6 3-3 4 3 4h12l3-4-3-4H6Z" />
        <path d="M12 11v10" />
        <path d="m6 21 6-10 6 10" />
    </svg>
);
