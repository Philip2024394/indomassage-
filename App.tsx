import React, { useState } from 'react';
import Auth from './components/Auth';
import ProfileDashboard from './components/ProfileDashboard';
import SelectionScreen from './components/SelectionScreen';
import { SubType } from './types';

const App: React.FC = () => {
  const [userType, setUserType] = useState<SubType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleTypeSelect = (type: SubType) => {
    setUserType(type);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null); // Reset to selection screen
  };

  const handleBackToSelection = () => {
    setUserType(null);
  };

  let content;
  let isDashboard = false;

  if (!userType) {
    content = <SelectionScreen onSelect={handleTypeSelect} />;
  } else if (!isLoggedIn) {
    content = <Auth userType={userType} onLoginSuccess={handleLoginSuccess} onBack={handleBackToSelection} />;
  } else {
    content = <ProfileDashboard subType={userType} onLogout={handleLogout} />;
    isDashboard = true;
  }

  const containerClasses = isDashboard
    ? "w-full max-w-sm h-[800px] max-h-[90vh] bg-black rounded-3xl border border-gray-700/50 shadow-2xl shadow-orange-500/10 overflow-hidden flex flex-col"
    : "w-full h-screen"; // Full screen for selection and auth

  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center md:p-4">
      <div className={containerClasses}>
        {content}
      </div>
    </div>
  );
};

export default App;
