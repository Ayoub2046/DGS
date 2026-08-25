import React from 'react';

interface HantiFlowVectorLogoProps {
  className?: string;
  size?: number | string;
}

export const HantiFlowVectorLogo: React.FC<HantiFlowVectorLogoProps> = ({
  className = 'w-full h-full',
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="hf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0b1329" />
        </linearGradient>
        <linearGradient id="hf-blue-pillar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="hf-green-pillar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hf-gold-arrow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="hf-gold-coin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <filter id="hf-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Main Rounded Badge Background */}
      <rect width="512" height="512" rx="112" fill="url(#hf-bg)" />
      <rect
        x="12"
        y="12"
        width="488"
        height="488"
        rx="100"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="3"
      />

      {/* Stylized 3D H and Financial Artwork */}
      <g filter="url(#hf-shadow)">
        {/* Left Pillar of H (Cyan to Royal Blue) */}
        <rect x="96" y="96" width="62" height="200" rx="22" fill="url(#hf-blue-pillar)" />

        {/* Right Pillar of H (Emerald Green) */}
        <rect x="226" y="96" width="62" height="200" rx="22" fill="url(#hf-green-pillar)" />

        {/* Horizontal Bar of H */}
        <rect x="110" y="172" width="166" height="48" rx="16" fill="#ffffff" opacity="0.95" />

        {/* Dynamic Curved Gold Arrow */}
        <path
          d="M 80 230 C 140 260 210 240 280 145 L 290 160 L 305 100 L 245 115 L 260 130 C 190 200 130 220 80 200 Z"
          fill="url(#hf-gold-arrow)"
        />

        {/* Calculator Widget */}
        <g transform="translate(305, 140)">
          {/* Calculator Body */}
          <rect
            width="106"
            height="146"
            rx="18"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="3.5"
          />
          {/* Calc Screen */}
          <rect x="14" y="14" width="78" height="32" rx="8" fill="#0284c7" />
          <path d="M 22 36 L 42 22 L 58 30 L 78 18" stroke="#ffffff" strokeWidth="3" fill="none" />
          {/* Keypad */}
          <circle cx="28" cy="64" r="7" fill="#475569" />
          <circle cx="53" cy="64" r="7" fill="#475569" />
          <circle cx="78" cy="64" r="7" fill="#475569" />
          <circle cx="28" cy="88" r="7" fill="#475569" />
          <circle cx="53" cy="88" r="7" fill="#475569" />
          <circle cx="78" cy="88" r="7" fill="#f59e0b" />
          <circle cx="28" cy="112" r="7" fill="#475569" />
          <circle cx="53" cy="112" r="7" fill="#475569" />
          <circle cx="78" cy="112" r="7" fill="#10b981" />
        </g>

        {/* Invoice Receipt Background Sheet */}
        <g transform="translate(370, 85)">
          <path
            d="M 0 0 L 50 0 C 60 0 66 8 66 18 L 66 110 L 55 102 L 44 110 L 33 102 L 22 110 L 11 102 L 0 110 Z"
            fill="#f8fafc"
            opacity="0.92"
          />
          <text x="18" y="32" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#0f766e">
            $
          </text>
          <line x1="36" y1="22" x2="52" y2="22" stroke="#94a3b8" strokeWidth="3" />
          <line x1="36" y1="30" x2="52" y2="30" stroke="#94a3b8" strokeWidth="3" />
        </g>

        {/* Golden Coins Stack */}
        <g transform="translate(390, 250)">
          <ellipse cx="25" cy="40" rx="28" ry="12" fill="url(#hf-gold-coin)" />
          <ellipse cx="25" cy="30" rx="28" ry="12" fill="url(#hf-gold-coin)" />
          <ellipse cx="25" cy="20" rx="28" ry="12" fill="url(#hf-gold-coin)" />
          <text x="21" y="24" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#78350f">
            $
          </text>
        </g>
      </g>

      {/* Typography: HantiFlow */}
      <text
        x="256"
        y="390"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="54"
        fontWeight="900"
        fill="#ffffff"
        letterSpacing="0.5"
      >
        HantiFlow
      </text>

      {/* Subtitle: BUSINESS & ACCOUNTING */}
      <text
        x="256"
        y="426"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15"
        fontWeight="800"
        fill="#93c5fd"
        letterSpacing="4"
      >
        BUSINESS &amp; ACCOUNTING
      </text>

      {/* Tagline Pill at bottom */}
      <rect x="96" y="446" width="320" height="34" rx="17" fill="#1e3a8a" opacity="0.8" />
      <text
        x="256"
        y="468"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="#60a5fa"
      >
        Smart Business. Clear Numbers.
      </text>
    </svg>
  );
};
