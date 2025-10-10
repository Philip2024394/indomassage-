import React, { useCallback } from 'react';
import { SubType, Partner, Status } from '../types';
import ProfileForm from './ProfileForm';

interface ProfileDashboardProps {
  onLogout: () => void;
  subType: SubType;
}

// Mock user data for display purposes
const mockUser = {
  name: "Wayan",
  rating: 4.92,
  imageUrl: `https://i.pravatar.cc/150?u=wayan`,
  stats: {
    status: Status.Online,
    acceptance: '95%',
    completion: '99%',
  }
};

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onLogout, subType }) => {

  const handleSaveProfile = useCallback((data: Partner) => {
    console.log('Saving profile data to Supabase:', data);
    alert('Profile saved! Check the console for the data structure.');
  }, []);

  // The "back" action from the form will now trigger a full logout.
  const handleBack = () => {
    onLogout();
  };
  
  return (
    <div className="flex-1 flex flex-col bg-black h-full">
      <ProfileHeader user={mockUser} />
      <main className="flex-1 overflow-y-auto p-4">
          <ProfileForm
              subType={subType}
              onSave={handleSaveProfile}
              onBack={handleBack}
          />
      </main>
       <BottomNav onLogout={onLogout} />
    </div>
  );
};

const ProfileHeader: React.FC<{ user: typeof mockUser }> = ({ user }) => (
    <header className="flex flex-col items-center p-6 text-center">
        <img src={user.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-800 ring-2 ring-orange-500" />
        <h1 className="text-2xl font-bold text-white mt-4">{user.name}</h1>
        <div className="flex items-center gap-1 text-yellow-400 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.393c.849.07 1.205 1.103.58 1.668l-3.53 3.034 1.034 4.636c.21 1.028-.766 1.833-1.684 1.33l-4.158-2.433-4.158 2.433c-.918.503-1.894-.302-1.684-1.33l1.034-4.636-3.53-3.034c-.625-.565-.269-1.598.58-1.668l4.753-.393 1.83-4.401Z" clipRule="evenodd" /></svg>
            <span className="font-semibold text-lg">{user.rating} Rating</span>
        </div>
        <div className="mt-6 w-full bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-4 flex justify-around">
            <StatItem value={user.stats.status} label="Status" />
            <StatItem value={user.stats.acceptance} label="Acceptance" />
            <StatItem value={user.stats.completion} label="Completion" />
        </div>
    </header>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-2xl font-bold text-orange-500 capitalize">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
);

const BottomNav: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <footer className="w-full bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/80">
        <div className="flex justify-around items-center h-20">
            <NavItem icon={<HomeIcon />} label="Home" />
            <NavItem icon={<ChartBarIcon />} label="Earnings" />
            <NavItem icon={<ClockIcon />} label="History" />
            <NavItem icon={<UserCircleIcon />} label="Profile" active />
             <button onClick={onLogout} className="flex flex-col items-center text-slate-400 hover:text-orange-500 transition-colors">
                <LogoutIcon />
                <span className="text-xs mt-1">Logout</span>
            </button>
        </div>
    </footer>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
    <a href="#" className={`flex flex-col items-center transition-colors ${active ? 'text-orange-500' : 'text-slate-400 hover:text-orange-500'}`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </a>
);

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" /><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75Z" /><path d="M9.75 8.625c-1.035 0-1.875.84-1.875 1.875v11.25c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V10.5c0-1.035-.84-1.875-1.875-1.875h-.75Z" /><path d="M3 13.125c-1.035 0-1.875.84-1.875 1.875v6.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875v-6.75c0-1.035-.84-1.875-1.875-1.875H3Z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>;

export default ProfileDashboard;