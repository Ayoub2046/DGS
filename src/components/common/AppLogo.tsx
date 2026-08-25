import React, { useState } from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  showSlogan?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  showSlogan = false,
  className = '',
  variant = 'light',
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mappings for image dimensions
  const imageSizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl shadow-xl',
  }[size];

  const titleSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D App Logo Image / Fallback Vector */}
      <div className="relative shrink-0 flex items-center justify-center">
        {!imageError ? (
          <img
            src="/hantiflow-logo.png"
            alt="HantiFlow Business & Accounting Logo"
            className={`${imageSizeClasses} object-cover shadow-sm ring-1 ring-blue-500/20`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`${imageSizeClasses} bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black shadow-md`}
          >
            <span className="font-extrabold tracking-tighter">H</span>
          </div>
        )}
      </div>

      {/* Brand Typography & Subtitle */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${titleSizeClasses} ${
                variant === 'dark'
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent'
              }`}
            >
              HantiFlow
            </span>
            <span className="inline-block text-amber-500 font-bold -translate-y-0.5">↗</span>
          </div>

          {showSubtitle && (
            <p
              className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                variant === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}
            >
              Business &amp; Accounting
            </p>
          )}

          {showSlogan && (
            <p
              className={`text-[10px] font-medium mt-0.5 ${
                variant === 'dark' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Smart Business. Clear Numbers.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
