
import React, { useState } from 'react';
import { Partner, Status } from '../types';
import ProfileForm from './ProfileForm';
import Button from './Button';
import PublicProfileView from './PublicProfileView';

interface PlaceDashboardProps {
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

const UserStatusControl: React.FC<{ profile: Partner; onProfileUpdate: (updates: Partial<Partner>) => void; }> = ({ profile, onProfileUpdate }) => {
    
    const statusIndicatorColor = () => {
        switch(profile.status) {
            case Status.Online: return 'bg-green-400';
            case Status.Busy: return 'bg-yellow-400';
            case Status.Offline: return 'bg-slate-500';
            default: return 'bg-slate-500';
        }
    };

    if (profile.status === Status.Offline) {
        return (
            <DashboardSection title="Business Status">
                <p className="text-sm text-slate-400 -mt-2 mb-6">Your business is currently offline. Go online to appear in search results for customers.</p>
                <p className="text-sm text-slate-400">Fixed Location: <span className="font-semibold text-slate-300">{profile.location || 'Not set in profile'}</span></p>
                <div className="mt-6">
                   <Button onClick={() => onProfileUpdate({ status: Status.Online })} fullWidth>
                       Go Online (Open for Business)
                   </Button>
                </div>
            </DashboardSection>
        );
    }

    return (
        <DashboardSection title="Your Status">
            <p className="text-sm text-slate-400 -mt-2 mb-6">
                Your business location is: <span className="font-semibold text-slate-300">{profile.location}</span>
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


const AvailabilityManager: React.FC<{ bookedDates: string[]; onDatesChange: (dates: string[]) => void; }> = ({ bookedDates, onDatesChange }) => {
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

    const handleDateClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const isBooked = bookedDates.includes(dateString);
        let newBookedDates;
        if (isBooked) {
            newBookedDates = bookedDates.filter(d => d !== dateString);
        } else {
            newBookedDates = [...bookedDates, dateString];
        }
        onDatesChange(newBookedDates.sort());
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
                    
                    let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer";
                    if (isToday) dayClasses += " ring-2 ring-orange-500 text-white";
                    if (isBooked) dayClasses += " bg-red-500/80 text-white font-bold hover:bg-red-600";
                    else if (isPast) dayClasses += " text-slate-600 cursor-not-allowed";
                    else dayClasses += " text-slate-300 hover:bg-gray-700";

                    return (
                        <div key={dayString} onClick={() => !isPast && handleDateClick(day)} className={dayClasses}>
                            {day.getDate()}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <DashboardSection title="Business Closed Dates">
            <p className="text-sm text-slate-400 -mt-2 mb-6">
                Click on a date to mark your business as closed for the day. Customers will see this on your public profile.
            </p>
            <div className="bg-gray-800/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon /></button>
                    <h3 className="text-md font-semibold text-white">{monthName}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRightIcon /></button>
                </div>
                {renderCalendar()}
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

const PlaceDashboard: React.FC<PlaceDashboardProps> = ({ onLogout, profile: initialProfile, supabase }) => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [profile, setProfile] = useState<Partner>(initialProfile);
  const [bookedDates, setBookedDates] = useState<string[]>(initialProfile.booked_dates || []);
  const [isPreviewing, setIsPreviewing] = useState(false);

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

  const handleBookedDatesChange = (newDates: string[]) => {
    setBookedDates(newDates);
    handleProfileUpdate({ booked_dates: newDates });
  };

  const handleBackToHome = () => {
    setActiveView('home');
  }
  
  const renderContent = () => {
    switch(activeView) {
      case 'home':
        return <UserStatusControl profile={profile} onProfileUpdate={handleProfileUpdate} />
      case 'profile':
        return <ProfileForm profile={profile} onSave={handleProfileUpdate} onBack={handleBackToHome} supabase={supabase} />;
      case 'earnings':
        return <Earnings />;
      case 'history':
        return <AvailabilityManager bookedDates={bookedDates} onDatesChange={handleBookedDatesChange} />;
      default:
        return <p>Not found</p>;
    }
  };
  
  if (isPreviewing) {
    return <PublicProfileView profile={profile} onClose={() => setIsPreviewing(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <ProfileHeader profile={profile} onPreview={() => setIsPreviewing(true)} />
      <main id="main-content" className="flex-grow overflow-y-auto p-4 pb-28">
          {renderContent()}
      </main>
       <BottomNav activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
    </div>
  );
};

const ProfileHeader: React.FC<{ profile: Partner, onPreview: () => void }> = ({ profile, onPreview }) => {
    const handleShare = () => {
        const url = `${window.location.origin}${window.location.pathname}?profile=${profile.user_id}`;
        navigator.clipboard.writeText(url)
            .then(() => alert('Your public profile link has been copied to the clipboard!'))
            .catch(err => console.error('Failed to copy link: ', err));
    };

    return (
        <header className="relative flex flex-col items-center p-6 text-center">
            <img src={profile.image_url || `https://i.pravatar.cc/150?u=${profile.id}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-800 ring-2 ring-orange-500 object-cover" />
            <h1 className="text-2xl font-bold text-white mt-4">{profile.name}</h1>
            <div className="mt-6 w-full max-w-md mx-auto bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-4 flex justify-around">
                <StatItem value={profile.status} label="Status" />
                <StatItem value={'N/A'} label="Acceptance" />
                <StatItem value={'N/A'} label="Completion" />
            </div>
             <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={handleShare} 
                  className="p-2 text-slate-400 hover:text-orange-500 rounded-full hover:bg-orange-500/10 transition-colors"
                  aria-label="Share Profile"
                >
                  <ShareIcon />
                </button>
                <button 
                  onClick={onPreview} 
                  className="p-2 text-slate-400 hover:text-orange-500 rounded-full hover:bg-orange-500/10 transition-colors"
                  aria-label="Preview Profile"
                >
                  <EyeIcon />
                </button>
            </div>
        </header>
    );
};

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
            <NavItem icon={<CalendarIcon />} label="Schedule" view="history" activeView={activeView} onClick={setActiveView} />
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
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3-3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" /></svg>;

export default PlaceDashboard;
