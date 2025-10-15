import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  noLabel?: boolean;
  onToggleVisibility?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, noLabel = false, onToggleVisibility, type, ...props }, ref) => {
  const finalId = id || props.name;

  const toggleButton = onToggleVisibility ? (
    <button 
      type="button" 
      onClick={onToggleVisibility} 
      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200 z-10"
      aria-label={type === 'password' ? 'Show password' : 'Hide password'}
    >
      {type === 'password' ? <EyeIcon /> : <EyeSlashIcon />}
    </button>
  ) : null;

  const inputElement = (
    <div className="relative">
      <input
        ref={ref}
        id={finalId}
        type={type}
        {...props}
        className={`w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400 ${onToggleVisibility ? 'pr-12' : ''} ${props.className || ''}`}
      />
      {toggleButton}
    </div>
  );

  if (noLabel) {
    return inputElement;
  }

  return (
    <div>
      <label htmlFor={finalId} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      {inputElement}
    </div>
  );
});

Input.displayName = 'Input';

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.572M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 2.25 19.5 19.5" /></svg>;

export default Input;