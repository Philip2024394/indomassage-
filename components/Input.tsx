import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  noLabel?: boolean;
}

const Input: React.FC<InputProps> = ({ label, id, noLabel = false, ...props }) => {
  const finalId = id || props.name;
  const commonClasses = "w-full px-4 py-2 bg-gray-800 border border-gray-700 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-shadow placeholder:text-gray-500";
  
  if (noLabel) {
    return (
       <input
        id={finalId}
        {...props}
        className={commonClasses}
      />
    );
  }

  return (
    <div>
      <label htmlFor={finalId} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <input
        id={finalId}
        {...props}
        className={commonClasses}
      />
    </div>
  );
};

export default Input;