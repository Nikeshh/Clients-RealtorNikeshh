import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'rounded-lg border px-3 py-2 text-gray-700 shadow-sm transition-colors';
  const widthStyles = fullWidth ? 'w-full' : 'w-auto';
  
  const stateStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-blue-200 focus:border-blue-400 focus:ring-blue-400';

  const iconPadding = {
    paddingLeft: startIcon ? '2.5rem' : undefined,
    paddingRight: endIcon ? '2.5rem' : undefined,
  };

  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            ${baseStyles}
            ${widthStyles}
            ${stateStyles}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          style={iconPadding}
          disabled={disabled}
          {...props}
        />

        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            {endIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 