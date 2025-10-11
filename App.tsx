

import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProfileDashboard from './components/ProfileDashboard';
import SelectionScreen from './components/SelectionScreen';
import { SubType, Partner } from './types';

// Extend the Window interface to include our global API key for TypeScript
declare global {
  interface Window {
    GOOGLE_MAPS_API_KEY: string;
  }
}

// @ts-ignore
const { createClient } = window.supabase;

// --- CONFIGURATION ---
// IMPORTANT: Replace with your Supabase Project URL and Anon Key
// FIX: Explicitly type constants as string to prevent TypeScript from inferring them
// as literal types, which causes comparison errors.
const SUPABASE_URL: string = 'https://ovfhgfzdlwgjtzsfsgzf.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmhnZnpkbHdnanR6c2ZzZ3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Nzc4NTQsImV4cCI6MjA3NTI1Mzg1NH0.NWUYp9AkyzNiqC5oYUG59pOGzxJGvMbz8Bzu96e8qOI';
const GOOGLE_MAPS_API_KEY = window.GOOGLE_MAPS_API_KEY;

const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
const isGoogleMapsConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

// Initialize Supabase client ONLY if configured
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// --- Configuration Error Component ---
const ConfigurationError: React.FC = () => (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white p-8">
        <div className="text-center bg-gray-900 p-8 rounded-2xl border border-red-500/50 max-w-lg w-full shadow-lg">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Required</h1>
            <p className="text-slate-300 mb-6">
                This application requires API keys to function. Please configure the following credentials:
            </p>
            <ul className="text-left space-y-4">
                {!isSupabaseConfigured && (
                    <li className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <p className="font-semibold text-slate-200">Supabase Credentials</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Open <code>App.tsx</code> and replace the placeholder values for <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>.
                        </p>
                    </li>
                )}
                {!isGoogleMapsConfigured && (
                    <li className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <p className="font-semibold text-slate-200">Google Maps API Key</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Open <code>index.html</code> and replace the placeholder value for <code>GOOGLE_MAPS_API_KEY</code>.
                        </p>
                    </li>
                )}
            </ul>
        </div>
    </div>
);

// --- Main App Component ---
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Partner | null>(null);
  const [userType, setUserType] = useState<SubType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
            setLoading(false);
        }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const fetchProfile = async () => {
      if (session?.user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching profile:', error);
        }
        if (data) {
            setProfile(data as Partner);
            setUserType(data.sub_type);
        }
        setLoading(false);
      } else {
        setProfile(null);
        setUserType(null);
      }
    };
    fetchProfile();
  }, [session]);

  const handleTypeSelect = (type: SubType) => {
    setUserType(type);
  };
  
  const handleBackToSelection = () => {
    setUserType(null);
  };
  
  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
    // State updates will be handled by onAuthStateChange
  };

  if (!isSupabaseConfigured || !isGoogleMapsConfigured) {
    return <ConfigurationError />;
  }
  
  if (loading) {
    return (
        <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );
  }

  // A profile is required to enter the dashboard
  if (!session || !profile) {
    return (
        <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
            <div className="w-full h-screen">
                {!userType ? (
                    <SelectionScreen onSelect={handleTypeSelect} />
                ) : (
                    <Auth userType={userType} onBack={handleBackToSelection} supabase={supabase} />
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif]">
      <ProfileDashboard profile={profile} onLogout={handleLogout} supabase={supabase} />
    </div>
  );
};

export default App;