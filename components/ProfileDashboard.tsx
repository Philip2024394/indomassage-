
import React, { useCallback, useState } from 'react';
import { SubType, Partner, Status } from '../types';
import ProfileForm from './ProfileForm';
import Button from './Button';
import Input from './Input';
import LocationInput from './LocationInput';

interface ProfileDashboardProps {
  onLogout: () => void;
  profile: Partner;
  supabase: any;
}

const mockStats = {
  today: 7,
  week: 34,
  total: 489,
};

// --- REUSABLE & VIEW COMPONENTS ---

const DashboardSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-white mb-6 pb-4 border-b border-gray-700">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const LocationManager: React.FC<{ lastLocation: string; onLocationSet: (location: string) => void; }> = ({ lastLocation, onLocationSet }) => {
    const [currentLocation, setCurrentLocation] = useState(lastLocation);
    
    return (
        <DashboardSection title="Set Your Location">
            <p className="text-sm text-slate-400 -mt-2 mb-6">You must set your current location to go online. This will be visible to customers until you go offline.</p>
            <LocationInput 
                label="Current Location"
                onLocationSelect={(loc) => {
                    setCurrentLocation(loc);
                    onLocationSet(loc);
                }}
                initialValue={currentLocation}
            />
            <p className="text-xs text-slate-500 mt-2">Last set location: {lastLocation || 'Not set'}</p>
        </DashboardSection>
    );
};

const TherapistStatusControl: React.FC<{ profile: Partner; onProfileUpdate: (updates: Partial<Partner>) => void; }> = ({ profile, onProfileUpdate }) => {
    const isOnline = profile.status === Status.Online;
    const [location, setLocation] = useState(profile.location);
    
    const statusIndicatorColor = () => {
        switch(profile.status) {
            case Status.Online: return 'bg-green-400';
            case Status.Busy: return 'bg-yellow-400';
            case Status.Offline: return 'bg-slate-500';
            default: return 'bg-slate-500';
        }
    };

    const handleGoOnline = () => {
        if (location) {
            onProfileUpdate({ location, status: Status.Online });
        } else {
            alert("Please set your location before going online.");
        }
    };

    if (profile.status === Status.Offline) {
        return (
            <div className="space-y-8">
                <LocationManager lastLocation={profile.location} onLocationSet={setLocation} />
                <div className="p-4">
                    <Button onClick={handleGoOnline} fullWidth>
                        Set Location & Go Online
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <DashboardSection title="Your Status">
            <p className="text-sm text-slate-400 -mt-2 mb-6">
                Your location is currently set to: <span className="font-semibold text-slate-300">{profile.location}</span>
            </p>
            <div className="flex justify-center items-center gap-2 text-center bg-gray-800/80 p-4 rounded-lg">
                <span className={`w-3 h-3 rounded-full ${statusIndicatorColor()} ${profile.status === Status.Online ? 'animate-pulse' : ''}`}></span>
                <p className="font-semibold">Current Status: <span className="text-orange-500 capitalize">{profile.status}</span></p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Button onClick={() => onProfileUpdate({ status: Status.Offline })}>
                    Go Offline
                </Button>
                <Button onClick={() => onProfileUpdate({ status: profile.status === Status.Busy ? Status.Online : Status.Busy })} variant="secondary">
                    {profile.status === Status.Busy ? 'Set to Online' : 'Set to Busy'}
                </Button>
            </div>
        </DashboardSection>
    );
};


const BookingHistory: React.FC<{ bookedDates: string[]; setBookedDates: (dates: string[]) => void; }> = ({ bookedDates, setBookedDates }) => {
    const [newDate, setNewDate] = useState('');

    const addDate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDate && !bookedDates.includes(newDate)) {
            setBookedDates([...bookedDates, newDate].sort());
            setNewDate('');
        }
    };

    const removeDate = (dateToRemove: string) => {
        setBookedDates(bookedDates.filter(date => date !== dateToRemove));
    };

    return (
        <DashboardSection title="Booking History & Availability">
            <p className="text-sm text-slate-400 -mt-2 mb-6">
                Add dates you are fully booked. This will set your status to 'Busy' for those days on your public profile, preventing overbooking.
            </p>
            <form onSubmit={addDate} className="flex flex-col sm:flex-row gap-2">
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required noLabel className="flex-grow"/>
                <Button type="submit" className="w-full sm:w-auto">Add Booked Date</Button>
            </form>
            <div className="mt-6 space-y-3">
                <h3 className="text-md font-semibold text-slate-200">Your Booked Dates</h3>
                {bookedDates.length > 0 ? (
                    bookedDates.map(date => (
                        <div key={date} className="flex justify-between items-center p-3 bg-gray-800/80 rounded-lg animate-fade-in">
                            <span className="font-mono text-slate-300">{date}</span>
                            <button type="button" onClick={() => removeDate(date)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors">
                                <TrashIcon/>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">No booked dates added yet.</p>
                )}
            </div>
        </DashboardSection>
    );
};


const Earnings: React.FC = () => {
  const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-gray-800/80 p-4 rounded-lg text-center">
        <p className="text-4xl font-bold text-orange-500">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <DashboardSection title="WhatsApp Contact Analytics">
          <p className="text-sm text-slate-400 -mt-2 mb-6">
              Track how many times users have accessed your WhatsApp contact information. This app does not handle payments or bookings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard value={mockStats.today} label="Today's Clicks" />
              <StatCard value={mockStats.week} label="This Week's Clicks" />
              <StatCard value={mockStats.total} label="Total Clicks" />
          </div>
      </DashboardSection>
       <DashboardSection title="How it Works">
          <p className="text-sm text-slate-400 leading-relaxed">
            When a customer is interested in your service, they tap a button to reveal your WhatsApp number. Each tap is counted here.
            <br/><br/>
            We recommend following up promptly to secure the booking. This page gives you an idea of the interest your profile is generating.
          </p>
      </DashboardSection>
    </div>
  );
};

// --- Main Dashboard Component ---

type ActiveView = 'home' | 'earnings' | 'history' | 'profile';

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onLogout, profile: initialProfile, supabase }) => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [profile, setProfile] = useState<Partner>(initialProfile);
  const [bookedDates, setBookedDates] = useState<string[]>(['2024-12-24', '2024-12-25', '2024-12-31']);

  const handleProfileUpdate = async (updates: Partial<Partner>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile); // Optimistic update

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id);

    if (error) {
        console.error("Failed to update profile:", error);
        setProfile(profile); // Revert on error
        alert("Failed to update profile. Please try again.");
    }
  };

  const handleBackToHome = () => {
    setActiveView('home');
  }
  
  const renderContent = () => {
    switch(activeView) {
      case 'home':
        return <TherapistStatusControl profile={profile} onProfileUpdate={handleProfileUpdate} />
      case 'profile':
        return <ProfileForm profile={profile} onSave={handleProfileUpdate} onBack={handleBackToHome} />;
      case 'earnings':
        return <Earnings />;
      case 'history':
        return <BookingHistory bookedDates={bookedDates} setBookedDates={setBookedDates} />;
      default:
        return <p>Not found</p>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <ProfileHeader profile={profile} />
      <main id="main-content" className="flex-grow overflow-y-auto p-4 pb-28">
          {renderContent()}
      </main>
       <BottomNav activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
    </div>
  );
};

const ProfileHeader: React.FC<{ profile: Partner }> = ({ profile }) => (
    <header className="flex flex-col items-center p-6 text-center">
        <img src={profile.image_url || `https://i.pravatar.cc/150?u=${profile.id}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-800 ring-2 ring-orange-500 object-cover" />
        <h1 className="text-2xl font-bold text-white mt-4">{profile.name}</h1>
        <div className="mt-6 w-full max-w-md mx-auto bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-4 flex justify-around">
            <StatItem value={profile.status} label="Status" />
            <StatItem value={'N/A'} label="Acceptance" />
            <StatItem value={'N/A'} label="Completion" />
        </div>
    </header>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-2xl font-bold text-orange-500 capitalize">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
);


// --- Navigation Components ---

interface BottomNavProps {
    onLogout: () => void;
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onLogout, activeView, setActiveView }) => (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/80 z-50">
        <div className="flex justify-around items-center h-20 max-w-3xl mx-auto">
            <NavItem icon={<HomeIcon />} label="Home" view="home" activeView={activeView} onClick={setActiveView} />
            <NavItem icon={<ChartBarIcon />} label="Earnings" view="earnings" activeView={activeView} onClick={setActiveView} />
            <NavItem icon={<ClockIcon />} label="History" view="history" activeView={activeView} onClick={setActiveView} />
            <NavItem icon={<UserCircleIcon />} label="Profile" view="profile" activeView={activeView} onClick={setActiveView} />
             <button onClick={onLogout} className="flex flex-col items-center text-slate-400 hover:text-orange-500 transition-colors">
                <LogoutIcon />
                <span className="text-xs mt-1">Logout</span>
            </button>
        </div>
    </footer>
);

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    view: ActiveView;
    activeView: ActiveView;
    onClick: (view: ActiveView) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, activeView, onClick }) => (
    <button onClick={() => onClick(view)} className={`flex flex-col items-center transition-colors ${activeView === view ? 'text-orange-500' : 'text-slate-400 hover:text-orange-500'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);


// --- ICONS ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75Z" /><path d="M9.75 8.625c-1.035 0-1.875.84-1.875 1.875v11.25c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V10.5c0-1.035-.84-1.875-1.875-1.875h-.75Z" /><path d="M3 13.125c-1.035 0-1.875.84-1.875 1.875v6.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875v-6.75c0-1.035-.84-1.875-1.875-1.875H3Z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;

export default ProfileDashboard;
