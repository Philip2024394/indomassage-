
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProfileDashboard from './components/ProfileDashboard';
import { SubType, Partner } from './types';
import { initialFormData } from './components/ProfileForm';
import SelectionScreen from './components/SelectionScreen';
import PublicProfileView from './components/PublicProfileView';

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

// A predefined list of high-quality header images for new Home Service therapists.
// The system will cycle through this list for each new sign-up.
const HOME_SERVICE_HEADER_IMAGES = [
  'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%203.png?updatedAt=1760186998015',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%204.png?updatedAt=1760187040909',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%205.png?updatedAt=1760187081702',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%207.png?updatedAt=1760187181168',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%208.png?updatedAt=1760187222991',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2010.png?updatedAt=1760187307232',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187422314',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2013.png?updatedAt=1760187547313',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2015.png?updatedAt=1760187650860',
  'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
];


// Initialize Supabase client ONLY if configured
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// --- Helper Components ---
const LoadingScreen: React.FC = () => (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
    </div>
);

const AuthScreen: React.FC<{ supabase: any }> = ({ supabase }) => (
     <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="w-full h-screen">
            <Auth supabase={supabase} />
        </div>
    </div>
);

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

// --- Connection Error Component ---
const ConnectionError: React.FC<{ message: string; onRetry: () => void; }> = ({ message, onRetry }) => (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white p-8">
        <div className="text-center bg-gray-900 p-8 rounded-2xl border border-yellow-500/50 max-w-lg w-full shadow-lg">
            <h1 className="text-2xl font-bold text-yellow-400 mb-4">Connection Issue</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <button
              onClick={onRetry}
              className="px-4 py-3 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-all duration-150 text-base bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500"
            >
              Retry
            </button>
        </div>
    </div>
);


// --- Main App Component ---
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [publicProfileId, setPublicProfileId] = useState<string | null>(null);

  const checkInitialState = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Check for public profile URL first
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profile');

    if (profileId) {
      setPublicProfileId(profileId);
    } else {
      // Proceed with normal session check
      setConnectionError(null);
      setLoading(true);

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
          console.error("Supabase connection error:", error);
          setConnectionError("Failed to connect to the database. Please check your internet connection and try again.");
      } else {
          setSession(session);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInitialState();

    if (supabase) {
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            // Reset state only on auth change, not on initial load
            setProfile(null);
            setNeedsProfileSetup(false);
            setPublicProfileId(null); // Clear public view on login/logout
            setSession(session);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    const fetchProfile = async () => {
      // Fetch for logged-in user
      if (session?.user && !publicProfileId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') {
            console.log('No profile found, showing setup screen.');
            setNeedsProfileSetup(true);
        } else if (error) { 
            console.error('Error fetching profile:', error);
            setConnectionError("Could not load your profile. Please check your internet connection.");
        } else if (data) {
            setProfile(data as Partner);
        }
        setLoading(false);
      }
    };
    
    const fetchPublicProfile = async () => {
        // Fetch for public view
        if (publicProfileId) {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', publicProfileId)
                .single();

            if (error) {
                console.error('Error fetching public profile:', error);
                setConnectionError(`Could not find the requested profile. It may no longer exist.`);
            } else {
                setProfile(data as Partner);
            }
            setLoading(false);
        }
    };

    if (publicProfileId) {
      fetchPublicProfile();
    } else {
      fetchProfile();
    }
  }, [session, publicProfileId]);
  
  const handleCreateProfile = async (subType: SubType) => {
    if (!supabase || !session?.user) return;
    setLoading(true);
    setNeedsProfileSetup(false);

    let headerImageUrl = '';
    if (subType === SubType.HomeService) {
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('sub_type', SubType.HomeService);
        
        let nextImageIndex = 0;
        if (!countError && count) {
            nextImageIndex = count % HOME_SERVICE_HEADER_IMAGES.length;
        }
        headerImageUrl = HOME_SERVICE_HEADER_IMAGES[nextImageIndex];
    } else {
        // Use a generic image for Massage Places
        headerImageUrl = 'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261';
    }
    
    const newProfileData = {
        ...initialFormData(),
        user_id: session.user.id,
        name: subType === SubType.HomeService ? 'New Therapist' : 'New Massage Place',
        sub_type: subType, // Set the selected sub_type
        header_image_url: headerImageUrl,
    };

    const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single();

    if (profileError) {
         console.error('Error creating profile:', profileError);
         setConnectionError(`Failed to create your profile. Please log out and try again.`);
    } else {
        setProfile(insertedProfile as Partner);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      setConnectionError("Failed to log out. Please check your connection.");
    }
    // Auth listener will handle state cleanup
    setLoading(false);
  };

  const clearPublicView = () => {
    setPublicProfileId(null);
    setProfile(null);
    window.history.pushState({}, '', window.location.pathname); // Clear URL param
  };

  if (!isSupabaseConfigured || !isGoogleMapsConfigured) return <ConfigurationError />;
  if (connectionError) return <ConnectionError message={connectionError} onRetry={checkInitialState} />
  if (loading) return <LoadingScreen />;

  // Public Profile View takes priority
  if (publicProfileId && profile) {
    return <PublicProfileView profile={profile} onClose={clearPublicView} isPublicView />;
  }
  
  if (!session) return <AuthScreen supabase={supabase} />;
  
  if (needsProfileSetup) {
    return (
        <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
            <div className="w-full h-screen">
                <SelectionScreen onSelect={handleCreateProfile} />
            </div>
        </div>
    );
  }

  if (profile) {
    return (
      <div className="bg-black min-h-screen font-['Inter',_sans-serif]">
        <ProfileDashboard profile={profile} onLogout={handleLogout} supabase={supabase} />
      </div>
    );
  }

  // Fallback loading screen if session exists but profile is still being processed
  return <LoadingScreen />;
};

export default App;
