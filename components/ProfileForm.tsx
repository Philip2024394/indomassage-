

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SubType, Status, Partner, Price, HomeServicePartner } from '../types';
import Input from './Input';
import Button from './Button';
import LocationInput from './LocationInput';
import ConfirmationModal from './ConfirmationModal';


interface ProfileFormProps {
  profile: Partner;
  onSave: (data: Partial<Partner>) => Promise<boolean>;
  onBack: () => void;
  supabase: any; // Add supabase client prop
  headerImages: string[];
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
  aspectRatio?: 'square' | 'wide';
}
const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onImageChange, helpText, aspectRatio = 'square' }) => {
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

  const aspectClass = aspectRatio === 'wide' ? 'aspect-video w-full' : 'aspect-square w-24 h-24';
  const containerClass = aspectRatio === 'wide' ? 'w-full' : 'flex items-center gap-4';
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className={containerClass}>
        <div className={`${aspectClass} rounded-lg bg-black/30 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden`}>
          {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <CameraIcon />}
        </div>
        <div className={aspectRatio === 'wide' ? 'mt-2' : ''}>
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

const GalleryManager: React.FC<{
    existingImageUrls: string[];
    onNewFilesSelected: (files: File[]) => void;
    onDeleteExistingImage: (url: string) => void;
}> = ({ existingImageUrls, onNewFilesSelected, onDeleteExistingImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onNewFilesSelected(files);
            // FIX: Add type assertion to resolve `unknown` type error on `file`.
            const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-slate-200">Profile Gallery</h3>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    Add Images
                </Button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                />
            </div>
            <p className="text-xs text-slate-500 -mt-2 mb-4">
                Showcase your space, services, or past work.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {existingImageUrls.map(url => (
                    <div key={url} className="relative group aspect-square">
                        <img src={url} alt="Gallery item" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => onDeleteExistingImage(url)}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                aria-label="Delete image"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                {previews.map((previewUrl, index) => (
                     <div key={index} className="relative aspect-square">
                        <img src={previewUrl} alt="New preview" className="w-full h-full object-cover rounded-lg" />
                         <div className="absolute top-1 right-1 px-2 py-0.5 bg-blue-500/80 text-white text-xs font-bold rounded-full">NEW</div>
                    </div>
                ))}
            </div>
             {existingImageUrls.length === 0 && previews.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-slate-500">No gallery images uploaded yet.</p>
                </div>
            )}
        </div>
    );
};


// --- Main Profile Form Component ---

const MASSAGE_TYPES_OPTIONS = [
    "Aromatherapy Massage",
    "Balinese Massage",
    "Deep Tissue Massage",
    "Hot Stone Massage",
    "Javanese Pijat",
    "Myofascial Release",
    "Pijat Urat",
    "Reflexology",
    "Sasak Massage",
    "Shiatsu",
    "Sports Massage",
    "Swedish Massage",
    "Thai Foot Massage",
    "Thai Herbal Massage",
    "Thai Massage",
    "Trigger Point Therapy",
];

export const initialFormData = (): Omit<Partner, 'sub_type' | 'user_id' | 'id' | 'name' | 'header_image_url'> => ({
    type: 'massage' as const,
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
    booked_dates: [],
    gallery_image_urls: [],
});


const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave, onBack, supabase, headerImages }) => {
  const [formData, setFormData] = useState<Partner>(profile);
  const [termsAccepted, setTermsAccepted] = useState(true); // Default to true for existing users
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [idCardImageFile, setIdCardImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);


  useEffect(() => {
    // This effect syncs the form's state with the profile prop from the parent.
    // This is crucial for ensuring the form displays the latest data after a save.
    const profileData = { ...profile };
    const basePrices: Price[] = [
      { duration: 60, price: 0 },
      { duration: 90, price: 0 },
      { duration: 120, price: 0 },
    ];

    const normalizedPrices = basePrices.map(basePrice => {
      const existingPrice = profile.prices?.find(p => p.duration === basePrice.duration);
      return existingPrice || basePrice;
    });

    profileData.prices = normalizedPrices;
    setFormData(profileData);
  }, [profile]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    const isNumber = e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value } as Partner));
  };
  
  const handlePriceChange = (index: number, field: 'duration' | 'price', value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    let numericValue = parseInt(cleanValue, 10) || 0;
    
    if (field === 'price') {
        numericValue *= 1000;
    }

    const updatedPrices = [...(formData.prices || [])];
    if (updatedPrices[index]) {
        updatedPrices[index] = { ...updatedPrices[index], [field]: numericValue };
        setFormData(prev => ({ ...prev, prices: updatedPrices } as Partner));
    }
  };

  const handleLocationChange = useCallback((newLocation: string) => {
    setFormData(prev => ({ ...prev, location: newLocation } as Partner));
  }, []);

  const handleDeleteGalleryImage = (urlToDelete: string) => {
    setFormData(prev => ({
        ...prev,
        gallery_image_urls: (prev.gallery_image_urls || []).filter(url => url !== urlToDelete)
    } as Partner));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }
    setIsSaving(true);

    const updatesToSave: Partial<Partner> = { ...formData };
    
    // Helper to upload an image to Supabase Storage
    const uploadImage = async (file: File, path: string): Promise<string | null> => {
        const { data, error } = await supabase.storage
            .from('profile-assets') // NOTE: Make sure you have a bucket named 'profile-assets'
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true, // Overwrite file if it exists
            });

        if (error) {
            console.error('Error uploading image:', error.message);
            alert(`Failed to upload image: ${error.message}`);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('profile-assets')
            .getPublicUrl(data.path);
            
        return publicUrl;
    };

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("User not authenticated. Please log in again.");
        }
        const userId = user.id;

        // Upload profile picture if a new one was selected
        if (profileImageFile) {
            const fileExt = profileImageFile.name.split('.').pop();
            const filePath = `profiles/${userId}/avatar.${fileExt}`;
            const publicUrl = await uploadImage(profileImageFile, filePath);
            if (publicUrl) {
                updatesToSave.image_url = publicUrl;
            } else {
                throw new Error("Profile picture upload failed.");
            }
        }
        
        if (idCardImageFile) {
            const fileExt = idCardImageFile.name.split('.').pop();
            const filePath = `profiles/${userId}/id_card.${fileExt}`;
            const publicUrl = await uploadImage(idCardImageFile, filePath);
            if (publicUrl) {
                (updatesToSave as HomeServicePartner).id_card_image_url = publicUrl;
            } else {
                throw new Error("ID card upload failed.");
            }
        }
        
        if (galleryImageFiles.length > 0) {
            const newImageUrls: string[] = [];
            for (const file of galleryImageFiles) {
                const fileName = `gallery_${Date.now()}_${Math.floor(Math.random() * 1000)}.${file.name.split('.').pop()}`;
                const filePath = `profiles/${userId}/${fileName}`;
                const publicUrl = await uploadImage(file, filePath);
                if (publicUrl) {
                    newImageUrls.push(publicUrl);
                }
            }
            updatesToSave.gallery_image_urls = [...(formData.gallery_image_urls || []), ...newImageUrls];
        }


        // Call the parent onSave function, which now returns a success boolean
        const success = await onSave(updatesToSave);

        if (success) {
            // Reset file state only on successful save
            setProfileImageFile(null);
            setIdCardImageFile(null);
            setGalleryImageFiles([]);
            setHeaderImageFile(null);
            setShowSuccessModal(true);
        }
        // If not successful, the parent handler will show an alert.

    } catch (error: any) {
        console.error('Save process failed:', error);
        alert(`An error occurred while saving: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onBack();
  };
  
  return (
    <>
        {showSuccessModal && (
            <ConfirmationModal 
                message="Your profile has been updated successfully."
                onClose={handleModalClose}
            />
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
            <button type="button" onClick={onBack} className="text-sm text-orange-500 hover:underline mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
                Back to Dashboard
            </button>

            <FormSection title="Therapist Information">
                <Input name="name" label="Full Name" value={formData.name} onChange={handleChange} required/>
                <ImageUpload 
                    label="Profile Picture"
                    value={formData.image_url || ''} 
                    onImageChange={setProfileImageFile} 
                    helpText="Upload a clear headshot."
                    aspectRatio="square"
                />
                 
                {/* FIX: Conditionally render Home Service specific fields for type safety. */}
                {formData.sub_type === SubType.HomeService && (
                <>
                  {formData.id_card_image_url ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Indonesian ID Card (KTP)</label>
                      <div className="flex items-center gap-3 p-4 bg-gray-800/80 rounded-lg text-slate-300 text-sm">
                        <CheckCircleIcon />
                        <span>ID card has been submitted for verification.</span>
                      </div>
                    </div>
                  ) : (
                    <ImageUpload 
                      label="Indonesian ID Card (KTP)" 
                      value=""
                      onImageChange={setIdCardImageFile} 
                      helpText="This is for verification and is not public."
                    />
                  )}
                  <Input name="years_of_experience" label="Years of Experience" type="number" value={formData.years_of_experience || ''} onChange={handleChange} required/>
                </>
                )}
                
                 <div className="relative">
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number</label>
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-black/40 text-slate-400 text-sm">+62</span>
                        <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} required noLabel className="rounded-l-none"/>
                    </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">Bio / Description</label>
                  <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleChange} maxLength={250} className="w-full px-3 py-2 bg-black/30 backdrop-blur-sm border border-white/20 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400" required></textarea>
                  <p className="text-right text-xs text-slate-500 mt-1">{(formData.bio || '').length} / 250</p>
                </div>
            </FormSection>
            
            <FormSection title="Gallery Manager">
                <GalleryManager 
                    existingImageUrls={formData.gallery_image_urls || []}
                    onNewFilesSelected={setGalleryImageFiles}
                    onDeleteExistingImage={handleDeleteGalleryImage}
                />
            </FormSection>

            <FormSection title="Services & Pricing">
                <MultiSelectDropdown 
                    label="Massage Types Offered"
                    options={MASSAGE_TYPES_OPTIONS}
                    selectedOptions={formData.massage_types || []}
                    onSelectionChange={(selection) => setFormData(p => ({...p, massage_types: selection} as Partner))}
                />
                 <div className="flex justify-between items-center pt-4">
                    <h3 className="text-md font-semibold text-slate-200">Prices</h3>
                </div>
                 <p className="text-xs text-slate-500 -mt-1 mb-3">Set your prices in thousands of Rupiah (e.g., enter 150 for Rp 150k).</p>
                 <div className="space-y-4">
                    {(formData.prices || []).map((price, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex-1">
                                <Input 
                                    label={`Duration (mins)`}
                                    type="number"
                                    placeholder="e.g., 60"
                                    value={price.duration || ''}
                                    onChange={e => handlePriceChange(index, 'duration', e.target.value)}
                                    disabled={true}
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Input 
                                    label={`Price`}
                                    type="number"
                                    placeholder="e.g., 150"
                                    value={price.price > 0 ? price.price / 1000 : ''}
                                    onChange={e => handlePriceChange(index, 'price', e.target.value)}
                                />
                                 <span className="absolute right-3 bottom-2.5 text-slate-400">k</span>
                            </div>
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
    </>
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
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;

export default ProfileForm;