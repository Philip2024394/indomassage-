import React, { useState } from 'react';

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, onTagsChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm transition-all focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-1 bg-orange-500/20 text-orange-300 text-sm font-medium px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(index)} className="ml-1 text-orange-400 hover:text-orange-300">
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow bg-transparent focus:outline-none p-1 text-slate-100 placeholder:text-slate-400"
        />
      </div>
       <p className="text-xs text-slate-500 mt-1">Press Enter or comma to add a tag.</p>
    </div>
  );
};

export default TagInput;