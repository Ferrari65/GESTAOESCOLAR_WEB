import React, { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, helperText, className = '', ...props }, ref) => {
    const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className="space-y-1">
        {/* Label */}
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {icon}
              </div>
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
              transition-colors duration-200
              ${icon ? 'pl-10 pr-4' : 'px-4'}
              ${error 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
              }
              ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-help` : 
              undefined
            }
            {...props}
          />
        </div>

        {helperText && !error && (
          <p id={`${inputId}-help`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export { FormInput };
export default FormInput;