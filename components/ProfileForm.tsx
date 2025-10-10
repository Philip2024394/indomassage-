import React, { useState } from 'react';
import { SubType, Status, Partner, Price, Photo, PlacePartner } from '../types';
import Input from './Input';
import Button from './Button';
import TagInput from './TagInput';

interface ProfileFormProps {
  subType: SubType;
  onSave: (data: Partner) => void;
  onBack: () => void;
}

const initialFormData = (subType: SubType): Partial<Partner> => {
    const commonData = {
        name: '',
        type: 'massage' as const,
        address: '',
        status: Status.Online,
        rating: 4.5,
        image_url: `https://picsum.photos/seed/${Math.random()}/400/400`,
        header_image_url: `https://picsum.photos/seed/${Math.random()}/800/400`,
        whatsapp: '',
        bio: '',
        massage_types: [],
        prices: [{ duration: 60, price: 150000 }],
    };

    if (subType === SubType.HomeService) {
        return {
            ...commonData,
            sub_type: SubType.HomeService,
            street: 'Home Service',
        };
    } else {
        return {
            ...commonData,
            sub_type: SubType.Place,
            street: '',
            opening_hours: '',
            other_services: [],
            photos: [{ url: `https://picsum.photos/seed/${Math.random()}/600/400`, name: 'Treatment Room' }],
        };
    }
};


const ProfileForm: React.FC<ProfileFormProps> = ({ subType, onSave, onBack }) => {
  const [formData, setFormData] = useState<Partial<Partner>>(initialFormData(subType));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleListChange = <T,>(listName: 'prices' | 'photos', index: number, field: keyof T, value: string | number) => {
      const list = ((formData as any)[listName] as T[] | undefined) || [];
      const updatedList = [...list];
      updatedList[index] = { ...updatedList[index], [field]: value };
      setFormData(prev => ({ ...prev, [listName]: updatedList }));
  };

  const addListItem = (listName: 'prices' | 'photos') => {
      const list = ((formData as any)[listName] as any[] | undefined) || [];
      const newItem = listName === 'prices' 
          ? { duration: 90, price: 200000 }
          : { url: `https://picsum.photos/seed/${Math.random()}/600/400`, name: 'New Photo' };
      setFormData(prev => ({ ...prev, [listName]: [...list, newItem] }));
  };
  
  const removeListItem = (listName: 'prices' | 'photos', index: number) => {
      const list = ((formData as any)[listName] as any[] | undefined) || [];
      setFormData(prev => ({ ...prev, [listName]: list.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData as Partner);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
        <button type="button" onClick={onBack} className="text-sm text-orange-500 hover:underline mb-4 flex items-center">
            &larr; Back to selection
        </button>

        <FormSection title="Basic Information">
            <Input name="name" label="Name" value={formData.name} onChange={handleChange} required/>
            {formData.sub_type === SubType.Place && <Input name="street" label="Street Address" value={(formData as PlacePartner).street} onChange={handleChange} required/>}
            <Input name="address" label="Operating Area (e.g., Ubud)" value={formData.address} onChange={handleChange} required/>
            <Input name="whatsapp" label="WhatsApp Number" type="tel" value={formData.whatsapp} onChange={handleChange} required/>
            <Input name="rating" label="Rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleChange} required/>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                    <option value={Status.Online}>Online</option>
                    <option value={Status.Offline}>Offline</option>
                    <option value={Status.Busy}>Busy</option>
                </select>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">Bio / Description</label>
              <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" required></textarea>
            </div>
        </FormSection>

        <FormSection title="Services & Pricing">
             <TagInput 
                label="Massage Types" 
                tags={formData.massage_types || []} 
                onTagsChange={(tags) => setFormData(p => ({...p, massage_types: tags}))} 
                placeholder="e.g., Balinese, Deep Tissue"
             />
             <h3 className="text-md font-semibold text-slate-200 pt-4">Prices</h3>
             <div className="space-y-3">
             {formData.prices?.map((price, index) => (
                 <div key={index} className="flex items-center gap-2 p-2 bg-gray-800/80 rounded-md">
                     <Input type="number" placeholder="Duration (min)" value={price.duration} onChange={e => handleListChange<Price>('prices', index, 'duration', parseInt(e.target.value, 10) || 0)} noLabel/>
                     <Input type="number" placeholder="Price (IDR)" value={price.price} onChange={e => handleListChange<Price>('prices', index, 'price', parseInt(e.target.value, 10) || 0)} noLabel/>
                     <button type="button" onClick={() => removeListItem('prices', index)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                        <TrashIcon/>
                     </button>
                 </div>
             ))}
             </div>
             <Button type="button" variant="secondary" onClick={() => addListItem('prices')}>Add Price</Button>
        </FormSection>

        {formData.sub_type === SubType.Place && (
             <FormSection title="Business Details">
                 <Input name="opening_hours" label="Opening Hours" value={(formData as PlacePartner).opening_hours} onChange={handleChange} />
                 <TagInput 
                    label="Other Services" 
                    tags={(formData as PlacePartner).other_services || []} 
                    onTagsChange={(tags) => setFormData(p => ({...p, other_services: tags}))} 
                    placeholder="e.g., Sauna, Jacuzzi"
                 />
                 <h3 className="text-md font-semibold text-slate-200 pt-4">Photo Gallery</h3>
                 <div className="space-y-3">
                 {(formData as PlacePartner).photos?.map((photo, index) => (
                     <div key={index} className="flex items-center gap-2 p-2 bg-gray-800/80 rounded-md">
                         <Input placeholder="Photo URL" value={photo.url} onChange={e => handleListChange<Photo>('photos', index, 'url', e.target.value)} noLabel/>
                         <Input placeholder="Name" value={photo.name} onChange={e => handleListChange<Photo>('photos', index, 'name', e.target.value)} noLabel/>
                         <button type="button" onClick={() => removeListItem('photos', index)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                            <TrashIcon/>
                         </button>
                     </div>
                 ))}
                 </div>
                 <Button type="button" variant="secondary" onClick={() => addListItem('photos')}>Add Photo</Button>
             </FormSection>
        )}
        
        <div className="pt-6 pb-12">
            <Button type="submit" fullWidth>Save Profile</Button>
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

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


export default ProfileForm;