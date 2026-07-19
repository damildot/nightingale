import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export default function BrandLogo({ className = "", size = 42 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      id="ournb-brand-logo-svg"
    >
      <defs>
        {/* Sky/Water Gradient for Circle background */}
        <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" /> {/* sky-200 */}
          <stop offset="100%" stopColor="#7dd3fc" /> {/* sky-300 */}
        </linearGradient>

        {/* Grass/Land Gradient */}
        <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" /> {/* green-400 */}
          <stop offset="100%" stopColor="#22c55e" /> {/* green-500 */}
        </linearGradient>

        {/* Outer Pin/Border Gradient */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" /> {/* blue-900 */}
          <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
        </linearGradient>

        {/* Banner/Label Gradient */}
        <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
          <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
        </linearGradient>

        {/* Pin Gradient */}
        <linearGradient id="redPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
          <stop offset="100%" stopColor="#b91c1c" /> {/* red-700 */}
        </linearGradient>

        {/* Drop shadow filter for professional 3D effect */}
        <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* 1. Main outer teardrop map pin outline with drop shadow */}
      <g filter="url(#logoShadow)">
        {/* Pin base background */}
        <path
          d="M60 112C88 88 104 68 104 46C104 21.7 84.3 2 60 2C35.7 2 16 21.7 16 46C16 68 32 88 60 112Z"
          fill="url(#borderGrad)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Map/Neighborhood Circle */}
        <mask id="mapMask">
          <circle cx="60" cy="46" r="39" fill="#ffffff" />
        </mask>

        <g mask="url(#mapMask)">
          {/* Base Grass Land */}
          <circle cx="60" cy="46" r="39" fill="url(#grassGrad)" />

          {/* Grid of Gray Roads/Streets */}
          {/* Diagonal Road 1 */}
          <line x1="20" y1="46" x2="100" y2="46" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <line x1="20" y1="46" x2="100" y2="46" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3" />

          {/* Diagonal Road 2 */}
          <line x1="60" y1="6" x2="60" y2="86" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <line x1="60" y1="6" x2="60" y2="86" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3" />

          {/* Center Intersection Circle */}
          <circle cx="60" cy="46" r="7" fill="#e2e8f0" />

          {/* CUTE ISOMETRIC HOUSES */}
          {/* House 1: Top Left (Red Roof, Orange Body) */}
          <g transform="translate(32, 18)">
            {/* Front Wall */}
            <rect x="0" y="6" width="10" height="8" fill="#fdba74" rx="1" />
            {/* Side Wall */}
            <path d="M10 6 L14 4 L14 11 L10 14 Z" fill="#f97316" />
            {/* Roof */}
            <polygon points="0,6 5,1 10,6" fill="#ef4444" />
            <polygon points="5,1 11,0 14,4 10,6" fill="#dc2626" />
            {/* Door */}
            <rect x="3" y="10" width="3.5" height="4" fill="#7c2d12" />
          </g>

          {/* House 2: Top Right (Blue Roof, Yellow Body) */}
          <g transform="translate(74, 18)">
            <rect x="2" y="6" width="10" height="8" fill="#fef08a" rx="1" />
            <path d="M12 6 L15 4 L15 11 L12 14 Z" fill="#eab308" />
            <polygon points="2,6 7,1 12,6" fill="#3b82f6" />
            <polygon points="7,1 12,0 15,4 12,6" fill="#1d4ed8" />
            <rect x="5" y="10" width="3" height="4" fill="#713f12" />
          </g>

          {/* House 3: Bottom Left (Purple Roof, Pink Body) */}
          <g transform="translate(26, 56)">
            <rect x="0" y="6" width="10" height="8" fill="#fbcfe8" rx="1" />
            <path d="M10 6 L13 4 L13 11 L10 14 Z" fill="#f472b6" />
            <polygon points="0,6 5,1 10,6" fill="#a855f7" />
            <polygon points="5,1 10,0 13,4 10,6" fill="#8b5cf6" />
          </g>

          {/* House 4: Bottom Right (Green Roof, Teal Body) */}
          <g transform="translate(76, 58)">
            <rect x="0" y="6" width="9" height="8" fill="#99f6e4" rx="1" />
            <path d="M9 6 L12 4 L12 11 L9 14 Z" fill="#0d9488" />
            <polygon points="0,6 4.5,1 9,6" fill="#10b981" />
            <polygon points="4.5,1 9,0 12,4 9,6" fill="#047857" />
          </g>

          {/* CUTE LITTLE GREEN TREES */}
          {/* Tree 1 */}
          <g transform="translate(48, 12)">
            <rect x="2" y="6" width="2" height="6" fill="#7c2d12" />
            <circle cx="3" cy="5" r="5" fill="#15803d" />
            <circle cx="2.5" cy="4.5" r="3.5" fill="#22c55e" />
          </g>
          {/* Tree 2 */}
          <g transform="translate(70, 68)">
            <rect x="2" y="6" width="2" height="6" fill="#7c2d12" />
            <circle cx="3" cy="5" r="5" fill="#166534" />
            <circle cx="2" cy="4.5" r="3.5" fill="#15803d" />
          </g>

          {/* Central Bright Red Marker Pin on the cross road */}
          <g transform="translate(53, 33)">
            {/* Pin body */}
            <path
              d="M7 19C10.5 14.5 14 11 14 7.5C14 3.4 10.9 0.2 7 0.2C3.1 0.2 0 3.4 0 7.5C0 11 3.5 14.5 7 19Z"
              fill="url(#redPinGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Inside white core */}
            <circle cx="7" cy="6.5" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* 2. Inner White/Gold ring around the Map circle */}
        <circle cx="60" cy="46" r="39" stroke="#ffffff" strokeWidth="2.5" pointerEvents="none" />
      </g>
    </svg>
  );
}
