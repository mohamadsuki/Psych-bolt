import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  children, 
  error,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;