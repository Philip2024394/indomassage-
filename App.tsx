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

  // Render selection or auth screens in a centered, full-screen view
  if (!userType || !isLoggedIn) {
    return (
        <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
            <div className="w-full h-screen">
                {!userType ? (
                    <SelectionScreen onSelect={handleTypeSelect} />
                ) : (
                    <Auth userType={userType} onLoginSuccess={handleLoginSuccess} onBack={handleBackToSelection} />
                )}
            </div>
        </div>
    );
  }

  // Render the dashboard in a simple, full-page layout that allows for scrolling
  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif]">
      <ProfileDashboard subType={userType} onLogout={handleLogout} />
    </div>
  );
};

export default App;
