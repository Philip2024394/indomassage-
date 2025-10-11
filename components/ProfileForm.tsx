
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SubType, Status, Partner, Price, HomeServicePartner } from '../types';
import Input from './Input';
import Button from './Button';
import LocationInput from './LocationInput';


interface ProfileFormProps {
  profile: Partner;
  onSave: (data: Partial<Partner>) => void;
  onBack: () => void;
}

// Checkbox Component
interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}
const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, children }) => (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input id={id} name={id} type="checkbox" checked={checked} onChange={onChange} className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-600 rounded bg-gray-700" />
      </div>
      <div className="ml-3 text-sm"><label htmlFor={id} className="text-slate-400">{children}</label></div>
    </div>
);

// Image Upload Component
interface ImageUploadProps {
  label: string;
  value: string;
  onImageChange: (file: File) => void;
  helpText?: string;
}
const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onImageChange, helpText }) => {
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg bg-black/30 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
          {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <CameraIcon />}
        </div>
        <div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-700 text-slate-200 text-sm font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-orange-500">Choose File</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
          {helpText && <p className="text-xs text-slate-500 mt-2">{helpText}</p>}
        </div>
      </div>
    </div>
  );
};

// Multi-select Dropdown Component
interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
}
const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedOptions, onSelectionChange, placeholder = 'Select types...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    const newSelection = selectedOptions.includes(option) ? selectedOptions.filter((item) => item !== option) : [...selectedOptions, option];
    onSelectionChange(newSelection);
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm text-left flex justify-between items-center">
          <span className="truncate">{selectedOptions.length > 0 ? selectedOptions.join(', ') : placeholder}</span>
          <ChevronDownIcon isOpen={isOpen} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-1">
              {options.map((option) => (
                <li key={option} className="px-4 py-2 text-slate-200 hover:bg-gray-700 cursor-pointer flex items-center" onClick={() => handleToggleOption(option)}>
                  <input type="checkbox" checked={selectedOptions.includes(option)} readOnly className="h-4 w-4 text-orange-600 border-gray-600 rounded bg-gray-900 focus:ring-0" />
                  <span className="ml-3">{option}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Profile Form Component ---

const MASSAGE_TYPES_OPTIONS = ["Balinese Massage", "Deep Tissue", "Reflexology", "Aromatherapy", "Hot Stone", "Shiatsu", "Thai Massage", "Swedish Massage"];

export const initialFormData = (): Partial<Partner> => {
    return {
        name: '',
        type: 'massage' as const,
        sub_type: SubType.HomeService,
        location: '',
        status: Status.Offline,
        image_url: '',
        whatsapp: '',
        bio: '',
        massage_types: [],
        prices: [
            { duration: 60, price: 0 },
            { duration: 90, price: 0 },
            { duration: 120, price: 0 },
        ],
        years_of_experience: 0,
        id_card_image_url: '',
    };
};


const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave, onBack }) => {
  const [formData, setFormData] = useState<Partial<Partner>>(profile);
  const [termsAccepted, setTermsAccepted] = useState(true); // Default to true for existing users
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    const isNumber = e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };
  
  const handlePriceChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newPrice = (parseInt(cleanValue, 10) || 0) * 1000;
    const updatedPrices = [...(formData.prices || [])];
    if (updatedPrices[index]) {
        updatedPrices[index] = { ...updatedPrices[index], price: newPrice };
        setFormData(prev => ({ ...prev, prices: updatedPrices }));
    }
  };
  
  const handleImageChange = useCallback((field: 'image_url' | 'id_card_image_url', file: File) => {
    // In a real app, you'd upload this to Supabase Storage and get a URL.
    // For now, we'll use a data URL as a placeholder.
    const reader = new FileReader();
    reader.onloadend = () => {
        setFormData(prev => ({...prev, [field]: reader.result as string}))
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLocationChange = useCallback((newLocation: string) => {
    setFormData(prev => ({ ...prev, location: newLocation }));
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!termsAccepted) {
          alert("Please accept the terms and conditions to continue.");
          return;
      }
      setIsSaving(true);
      await onSave(formData);
      setIsSaving(false);
      alert('Profile saved!');
      onBack(); // Go back to home after saving
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
        <button type="button" onClick={onBack} className="text-sm text-orange-500 hover:underline mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
            Back to Dashboard
        </button>

        <FormSection title="Therapist Information">
            <Input name="name" label="Full Name" value={formData.name} onChange={handleChange} required/>
            <ImageUpload 
                label="Profile Picture" 
                value={(formData as HomeServicePartner).image_url || ''} 
                onImageChange={(file) => handleImageChange('image_url', file)} 
                helpText="Upload a clear headshot."
            />
            <ImageUpload 
                label="Indonesian ID Card (KTP)" 
                value={(formData as HomeServicePartner).id_card_image_url || ''}
                onImageChange={(file) => handleImageChange('id_card_image_url', file)} 
                helpText="This is for verification and is not public."
            />
            <LocationInput 
                label="Primary Operating Area"
                onLocationSelect={handleLocationChange}
                initialValue={formData.location}
            />
             <div className="relative">
                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number</label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-black/40 text-slate-400 text-sm">+62</span>
                    <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} required noLabel className="rounded-l-none"/>
                </div>
            </div>
            <Input name="years_of_experience" label="Years of Experience" type="number" value={(formData as HomeServicePartner).years_of_experience || ''} onChange={handleChange} required/>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">Bio / Description</label>
              <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleChange} maxLength={250} className="w-full px-3 py-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400" required></textarea>
              <p className="text-right text-xs text-slate-500 mt-1">{(formData.bio || '').length} / 250</p>
            </div>
        </FormSection>

        <FormSection title="Services & Pricing">
            <MultiSelectDropdown 
                label="Massage Types Offered"
                options={MASSAGE_TYPES_OPTIONS}
                selectedOptions={formData.massage_types || []}
                onSelectionChange={(selection) => setFormData(p => ({...p, massage_types: selection}))}
            />
             <h3 className="text-md font-semibold text-slate-200 pt-4">Prices</h3>
             <p className="text-xs text-slate-500 -mt-1 mb-3">Set your prices in thousands of Rupiah (e.g., enter 150 for Rp 150k).</p>
             <div className="space-y-3">
                {formData.prices?.map((price, index) => (
                    <div key={price.duration} className="relative">
                        <Input 
                            label={`${price.duration} min Price`}
                            type="number"
                            placeholder="e.g., 150"
                            value={price.price > 0 ? price.price / 1000 : ''}
                            onChange={e => handlePriceChange(index, e.target.value)}
                            maxLength={3}
                        />
                         <span className="absolute right-3 bottom-2 text-slate-400">k</span>
                    </div>
                ))}
             </div>
        </FormSection>
        
        <div className="pt-2 pb-12 space-y-6">
            <Checkbox id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
                I understand that I am fully responsible for my own services, government fees, or taxes. 
                This platform is only a directory for traffic and does not get involved in any disputes, client issues, or payments.
            </Checkbox>
            <Button type="submit" fullWidth disabled={!termsAccepted || isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
        </div>
    </form>
  )
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-white mb-6 pb-4 border-b border-gray-700">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// --- ICONS ---
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>;
const ChevronDownIcon: React.FC<{isOpen: boolean}> = ({ isOpen }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>;


export default ProfileForm;
