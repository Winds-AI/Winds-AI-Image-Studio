import React from 'react';

export const GlassesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M6 14C6 12.3431 7.34315 11 9 11C10.6569 11 12 12.3431 12 14" />
        <path d="M12 14C12 12.3431 13.3431 11 15 11C16.6569 11 18 12.3431 18 14" />
        <path d="M6 14H2" />
        <path d="M18 14H22" />
        <path d="M9 11V6" />
        <path d="M15 11V6" />
    </svg>
);
