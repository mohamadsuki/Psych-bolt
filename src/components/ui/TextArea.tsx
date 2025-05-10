import React from 'react';

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  rows = 4,
  className = '',
}) => {
  return (
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${className}`}
    />
  );
};

export default TextArea;