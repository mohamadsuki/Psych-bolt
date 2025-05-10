import React, { ReactNode } from 'react';

interface ConditionalFieldProps {
  show: boolean;
  children: ReactNode;
  animate?: boolean;
}

const ConditionalField: React.FC<ConditionalFieldProps> = ({ 
  show, 
  children,
  animate = true
}) => {
  if (!show) return null;

  return (
    <div 
      className={`mt-3 pr-6 border-r-2 border-teal-200 ${
        animate ? 'animate-fadeIn' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default ConditionalField;