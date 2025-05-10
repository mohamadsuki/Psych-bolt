import React, { useEffect, useRef } from 'react';
import { formatDateToDDMMYYYY, formatDateForInput } from '../../utils/dateUtils';

interface TextInputProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  className?: string;
  readOnly?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  min,
  max,
  maxLength,
  className = '',
  readOnly = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Special handling for date inputs to ensure correct format
  useEffect(() => {
    if (type === 'date' && inputRef.current) {
      // For date inputs, we need to ensure value is in YYYY-MM-DD format
      if (value && typeof value === 'string') {
        const formattedValue = formatDateForInput(value);
        if (formattedValue !== value) {
          // Update with correctly formatted date
          const event = {
            target: {
              name,
              value: formattedValue
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      }
    }
  }, []);
  
  // Create custom change handler for date inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'date') {
      // We directly use the value as it's already in YYYY-MM-DD format from the input
      onChange(e);
    } else {
      // For non-date inputs, pass through unchanged
      onChange(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      maxLength={maxLength}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
      readOnly={readOnly}
    />
  );
};

export default TextInput;