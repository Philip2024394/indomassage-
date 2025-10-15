

import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProfileDashboard from './components/ProfileDashboard';
import { SubType, Partner, HomeServicePartner } from './types';
import { initialFormData } from './components/ProfileForm';
import SelectionScreen from './components/SelectionScreen';
import PublicProfileView from './components/PublicProfileView';
import { supabase, GOOGLE_MAPS_API_KEY } from './components/ConfigurationSetup';

// @ts-ignore
const { createClient } = window.supabase;

// --- CONFIGURATION ---
// Configuration has been moved to components/ConfigurationSetup.tsx for security.

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
  
  const initializeApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const profileId = urlParams.get('profile');

      if (profileId) {
          setPublicProfileId(profileId);
      } else {
          setConnectionError(null);
          setLoading(true);

          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
              console.error("Supabase connection error:", error);
              setConnectionError("Failed to connect to the database. Please check your internet connection and try again.");
          } else {
              setSession(session);
          }
      }
      // Loading state will be handled by profile fetching
  };

  useEffect(() => {
    // Load the Google Maps script once.
    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize the app and set up auth listeners.
    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setProfile(null);
        setNeedsProfileSetup(false);
        setPublicProfileId(null);
        setSession(session);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user && !publicProfileId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') {
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
    } else if (session) {
      fetchProfile();
    } else {
        // No session and not a public view, so we are done loading.
        setLoading(false);
    }
  }, [session, publicProfileId]);
  
  const handleCreateProfile = async (subType: SubType) => {
    if (!session?.user) return;
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
        headerImageUrl = 'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261';
    }
    
    const newProfileData = {
        ...initialFormData(),
        user_id: session.user.id,
        name: subType === SubType.HomeService ? 'New Therapist' : 'New Massage Place',
        sub_type: subType,
        header_image_url: headerImageUrl,
    };

    // FIX: Explicitly set default values for columns that might be NOT NULL in the database
    // to prevent insertion errors, especially for new user profiles.
    if (subType === SubType.HomeService) {
        (newProfileData as HomeServicePartner).is_verified = false;
        (newProfileData as HomeServicePartner).years_of_experience = 0;
    }

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
    setLoading(false);
  };

  const clearPublicView = () => {
    setPublicProfileId(null);
    setProfile(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  if (loading) return <LoadingScreen />;
  if (connectionError) return <ConnectionError message={connectionError} onRetry={initializeApp} />

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

  return <LoadingScreen />;
};

export default App;