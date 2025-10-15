import React, { useState } from 'react';
import { Partner, Status, SubType, HomeServicePartner } from '../types';
import Button from './Button';

interface PublicProfileViewProps {
  profile: Partner;
  onClose: () => void;
  isPublicView?: boolean;
}

const AvailabilityCalendar: React.FC<{ bookedDates: string[] }> = ({ bookedDates }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    const renderCalendar = () => {
        const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const blanks = Array(firstDayOfMonth).fill(null);
        return (
            <div className="grid grid-cols-7 gap-2 text-center">
                {dayHeaders.map(day => <div key={day} className="font-bold text-xs text-slate-500 uppercase">{day}</div>)}
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dayString = day.toISOString().split('T')[0];
                    const isToday = day.getTime() === today.getTime();
                    const isBooked = bookedDates.includes(dayString);
                    const isPast = day < today;
                    
                    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors";
                    if (isToday) dayClasses += " ring-2 ring-orange-500 text-white";
                    if (isBooked) dayClasses += " bg-red-500/50 text-white font-bold line-through";
                    else if (isPast) dayClasses += " text-slate-600";
                    else dayClasses += " text-slate-300";

                    return (
                        <div key={dayString} className={dayClasses}>
                            {day.getDate()}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon /></button>
                <h3 className="text-md font-semibold text-white">{monthName}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRightIcon /></button>
            </div>
            {renderCalendar()}
        </div>
    );
};


const PublicProfileView: React.FC<PublicProfileViewProps> = ({ profile, onClose, isPublicView = false }) => {
  const isHomeService = profile.sub_type === SubType.HomeService;

  const statusInfo = {
    [Status.Online]: { text: 'Online', color: 'bg-green-500', textColor: 'text-green-300' },
    [Status.Offline]: { text: 'Offline', color: 'bg-slate-600', textColor: 'text-slate-400' },
    [Status.Busy]: { text: 'Busy', color: 'bg-yellow-500', textColor: 'text-yellow-300' },
  };
  const currentStatus = statusInfo[profile.status] || statusInfo[Status.Offline];
  
  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleWhatsAppClick = () => {
    if (isPublicView) {
        if (profile.whatsapp) {
            // Remove leading '0', '+', or spaces and prepend with '62' for the international format.
            const cleanedNumber = profile.whatsapp.replace(/^[0\s+]+/, '');
            const phoneNumber = `62${cleanedNumber}`;
            const url = `https://wa.me/${phoneNumber}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('WhatsApp number is not available for this user.');
        }
    } else {
        // This is a preview, so we'll just alert.
        alert(`In a live scenario, this would open a WhatsApp chat with +62${profile.whatsapp}`);
    }
  };

  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] text-slate-200 animate-fade-in">
        {/* --- Back Button --- */}
        <div className="fixed top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                <ArrowLeftIcon />
                <span>{isPublicView ? 'View More Therapists' : 'Back to Dashboard'}</span>
            </button>
        </div>

        {/* --- Main Content --- */}
        <div className="relative">
            {/* Header Image */}
            <div className="h-56 bg-gray-800">
                <img src={profile.header_image_url} alt="Header" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>

            {/* Profile Info */}
            <div className="relative px-4 pb-8 -mt-20">
                <div className="flex flex-col items-center text-center">
                    <img src={profile.image_url || `https://i.pravatar.cc/150?u=${profile.id}`} alt="Profile" className="w-28 h-28 rounded-full border-4 border-gray-900 ring-4 ring-orange-500 object-cover" />
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                        {/* FIX: Removed redundant cast. The 'isHomeService' check provides type narrowing. */}
                        {isHomeService && profile.is_verified && <VerifiedBadge />}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                        <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.color}`}></span>
                        <span className={currentStatus.textColor}>{currentStatus.text}</span>
                    </div>
                </div>

                {/* WhatsApp Button */}
                <div className="mt-8">
                    <Button onClick={handleWhatsAppClick} fullWidth>
                        <div className="flex items-center justify-center gap-2">
                           <WhatsAppIcon />
                           <span>Contact on WhatsApp</span>
                        </div>
                    </Button>
                </div>
                
                <div className="mt-8 space-y-8">
                    {/* Bio Section */}
                    <ProfileSection title={isHomeService ? "About Me" : "About Us"}>
                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{profile.bio || "No description provided."}</p>
                    </ProfileSection>

                    {/* Gallery Section */}
                    {profile.gallery_image_urls && profile.gallery_image_urls.length > 0 && (
                        <ProfileSection title="Gallery">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {profile.gallery_image_urls.map(url => (
                                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square">
                                        <img src={url} alt="Gallery image" className="w-full h-full object-cover rounded-lg" />
                                    </a>
                                ))}
                            </div>
                        </ProfileSection>
                    )}

                    {/* Availability Calendar Section */}
                    <ProfileSection title="Availability Calendar">
                        <AvailabilityCalendar bookedDates={profile.booked_dates || []} />
                    </ProfileSection>

                    {/* Location Section */}
                    <ProfileSection title="Location">
                        <div className="flex items-start gap-3">
                           <LocationMarkerIcon />
                           <p className="text-slate-300 flex-1">{profile.location || "Location not set."}</p>
                        </div>
                    </ProfileSection>

                    {/* Services Section */}
                    {profile.massage_types && profile.massage_types.length > 0 && (
                        <ProfileSection title="Services Offered">
                            <div className="flex flex-wrap gap-2">
                                {profile.massage_types.map(type => (
                                    <span key={type} className="px-3 py-1 bg-gray-800 text-orange-400 text-sm font-medium rounded-full">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </ProfileSection>
                    )}
                    
                    {/* Pricing Section */}
                    {profile.prices && profile.prices.some(p => p.price > 0) && (
                         <ProfileSection title="Rates">
                            <ul className="space-y-3">
                                {profile.prices.filter(p => p.price > 0).map(p => (
                                    <li key={p.duration} className="flex justify-between items-center text-slate-300 p-3 bg-gray-800/50 rounded-lg">
                                        <span>{p.duration} Minutes</span>
                                        <span className="font-semibold text-white">{formatPrice(p.price)}</span>
                                    </li>
                                ))}
                            </ul>
                        </ProfileSection>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

const ProfileSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h2 className="text-xl font-bold text-white pb-2 mb-4 border-b-2 border-gray-800">{title}</h2>
        {children}
    </div>
);

const VerifiedBadge = () => (
  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">
    <CheckCircleIcon />
    <span>Verified</span>
  </div>
);


// --- ICONS ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.1-.5 0-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.4.1.1 1.5 2.3 3.7 3.2.5.2.9.4 1.2.5.5.2 1 .1 1.4-.1.4-.2 1.2-1 1.5-1.9.3-.2.3-.4.2-.5l-.4-.2zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" /></svg>;
const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500 mt-1"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .757.433.62.62 0 0 0 .28.14l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></svg>;

export default PublicProfileView;