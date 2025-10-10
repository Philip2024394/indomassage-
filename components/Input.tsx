
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  noLabel?: boolean;
}

// FIX: Use forwardRef to allow parent components to get a ref to the input element.
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, noLabel = false, ...props }, ref) => {
  const finalId = id || props.name;
  const commonClasses = "w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400";
  
  if (noLabel) {
    return (
       <input
        ref={ref}
        id={finalId}
        {...props}
        className={`${commonClasses} ${props.className || ''}`}
      />
    );
  }

  return (
    <div>
      <label htmlFor={finalId} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <input
        ref={ref}
        id={finalId}
        {...props}
        className={`${commonClasses} ${props.className || ''}`}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
