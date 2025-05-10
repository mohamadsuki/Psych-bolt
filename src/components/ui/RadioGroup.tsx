import React from 'react';

interface RadioOption {
  label: string;
  value: string | boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ 
  options, 
  name, 
  value, 
  onChange,
  direction = 'horizontal',
  disabled = false
}) => {
  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
      {options.map((option) => (
        <div key={String(option.value)} className="flex items-center">
          <input
            type="radio"
            id={`${name}-${String(option.value)}`}
            name={name}
            value={String(option.value)}
            checked={value === option.value}
            onChange={onChange}
            disabled={disabled}
            className={`w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <label 
            htmlFor={`${name}-${String(option.value)}`} 
            className={`mr-2 text-gray-700 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;