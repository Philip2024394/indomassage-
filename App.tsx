
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProfileDashboard from './components/ProfileDashboard';
import { SubType, Partner } from './types';
import { initialFormData } from './components/ProfileForm';

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

  const checkSession = async () => {
    if (!supabase) {
        setLoading(false);
        return;
    }
    setConnectionError(null);
    setLoading(true);

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error("Supabase connection error:", error);
        setConnectionError("Failed to connect to the database. Please check your internet connection and try again.");
        setLoading(false);
    } else {
        setSession(session);
        // If there's no session, we're done loading. The user will see the auth screen.
        if (!session) {
            setLoading(false);
        }
        // If there is a session, the profile useEffect will trigger, which will handle the loading state.
    }
  };

  useEffect(() => {
    checkSession(); // Initial check on mount

    if (supabase) {
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            // When auth state changes, if a new session appears, reset profile to trigger fetch
            if (session?.user?.id !== profile?.user_id) {
                setProfile(null);
            }
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
      if (session?.user) {
        if (profile && profile.user_id === session.user.id) {
            setLoading(false);
            return; // Profile already loaded for this session
        }
          
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') { // No rows found - this is a new user
            console.log('No profile found for new user, creating one...');
             // Assign a rotating header image for the new therapist
            const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('sub_type', SubType.HomeService);

            let headerImageUrl = '';
            if (countError) {
                console.error('Error counting profiles:', countError);
                // Fallback to a random image from the list if count fails
                headerImageUrl = HOME_SERVICE_HEADER_IMAGES[Math.floor(Math.random() * HOME_SERVICE_HEADER_IMAGES.length)];
            } else {
                const nextImageIndex = (count || 0) % HOME_SERVICE_HEADER_IMAGES.length;
                headerImageUrl = HOME_SERVICE_HEADER_IMAGES[nextImageIndex];
            }
            
            const newProfileData = {
                ...initialFormData(),
                user_id: session.user.id,
                name: 'New Member', // Default name
                header_image_url: headerImageUrl,
            };

            const { data: insertedProfile, error: profileError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();

            if (profileError) {
                 console.error('Error creating profile:', profileError);
                 setConnectionError(`Account created, but failed to create a profile automatically. Please try again.`);
            } else {
                setProfile(insertedProfile as Partner);
            }

        } else if (error) { 
            console.error('Error fetching profile:', error);
            setConnectionError("Could not load your profile. Please check your internet connection.");
        } else if (data) {
            setProfile(data as Partner);
        }
        setLoading(false);
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [session]);

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      setConnectionError("Failed to log out. Please check your connection.");
    }
    // State updates will be handled by onAuthStateChange, which sets session to null
    // and triggers the profile useEffect to clear the profile.
    setLoading(false);
  };

  if (!isSupabaseConfigured || !isGoogleMapsConfigured) {
    return <ConfigurationError />;
  }
  
  if (connectionError) {
    return <ConnectionError message={connectionError} onRetry={checkSession} />
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
                <Auth supabase={supabase} />
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
