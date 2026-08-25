import React, { useState } from 'react';
import hantiFlowImg from '../../assets/images/hantiflow_logo_1787649184449.jpg';
import { HantiFlowVectorLogo } from './HantiFlowVectorLogo';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showSubtitle?: boolean;
  showSlogan?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  useVectorOnly?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  showSlogan = false,
  className = '',
  variant = 'light',
  useVectorOnly = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimensions for logo container
  const imageSizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl shadow-xl',
    '2xl': 'w-32 h-32 sm:w-40 sm:h-40 rounded-3xl shadow-2xl',
  }[size];

  const titleSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Logo Display with Vector Fallback */}
      <div className={`relative shrink-0 flex items-center justify-center overflow-hidden ${imageSizeClasses}`}>
        {!useVectorOnly && !imageError ? (
          <img
            src={hantiFlowImg}
            alt="HantiFlow Logo"
            className="w-full h-full object-cover rounded-[inherit] ring-1 ring-blue-500/20"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <HantiFlowVectorLogo className="w-full h-full rounded-[inherit]" />
        )}
      </div>

      {/* Brand Name Typography & Subtitle */}
      {showText && (
        <div className="min-w-0 flex flex-col justify-center">
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
            <span className="inline-block text-amber-500 font-black -translate-y-0.5 text-xs">↗</span>
          </div>

          {showSubtitle && (
            <p
              className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                variant === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}
            >
              Business &amp; Accounting
            </p>
          )}

          {showSlogan && (
            <p
              className={`text-[10px] font-semibold mt-0.5 ${
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
