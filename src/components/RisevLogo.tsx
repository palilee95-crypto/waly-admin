import React from 'react';

interface RisevLogoProps {
  className?: string;
  size?: number | string;
}

export const RisevLogo: React.FC<RisevLogoProps> = ({ className = 'h-28 object-contain', size }) => {
  return (
    <img 
      src="/risev-logo.png" 
      alt="RISEV Logo" 
      className={`object-contain ${className}`}
      style={size ? { height: size } : undefined}
    />
  );
};
