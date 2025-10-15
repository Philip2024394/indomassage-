

import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import TherapistDashboard from './components/TherapistDashboard';
import PlaceDashboard from './components/PlaceDashboard';
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

const AuthScreen: React.FC<{ supabase: any, initialSubType: SubType | null, onBack: () => void }> = ({ supabase, initialSubType, onBack }) => (
     <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="w-full h-screen">
            <Auth supabase={supabase} initialSubType={initialSubType} onBack={onBack} />
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
  const [authFlow, setAuthFlow] = useState<{ mode: 'welcome' | 'auth', subType: SubType | null }>({ mode: 'welcome', subType: null });
  const [publicProfileId, setPublicProfileId] = useState<string | null>(null);
  
  const initializeApp = async () => {
      setConnectionError(null);
      setLoading(true);

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
          console.error("Supabase connection error:", error);
          setConnectionError("Failed to connect to the database. Please check your internet connection and try again.");
      } else {
          setSession(session);
      }
      // Loading state will be handled by profile fetching
  };
  
  const handleDeveloperLogin = async () => {
    setLoading(true);
    const devEmail = 'dev-user@example.com';
    const devPassword = 'password123';

    // Attempt to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
    });

    if (signInError) {
        // If sign-in fails because the user doesn't exist, try to sign them up
        if (signInError.message.includes('Invalid login credentials')) {
            console.log('Developer account not found. Attempting to create one...');
            const { error: signUpError } = await supabase.auth.signUp({
                email: devEmail,
                password: devPassword,
            });

            if (signUpError) {
                console.error('Automatic dev account sign-up failed:', signUpError.message);
                setConnectionError(`Could not automatically create dev account. Please ensure email confirmation is OFF in your Supabase project settings and try again.`);
                setLoading(false);
            } else {
                // SignUp successful, onAuthStateChange will handle the new session.
                console.log('Developer account created successfully. You are now logged in.');
            }
        } else {
            console.error('Dev login failed:', signInError.message);
            setConnectionError('An unexpected error occurred during developer login.');
            setLoading(false);
        }
    }
    // Successful sign-in is handled by onAuthStateChange
  };

  const handleCreateProfile = async (subType: SubType) => {
    if (!session?.user) return;
    setLoading(true);

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

  // Effect for one-time application setup (runs only on mount)
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

    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profile');
    const devAccess = urlParams.get('dev-access');
    
    if (profileId) {
        setPublicProfileId(profileId);
    } else if (devAccess === 'true') {
        handleDeveloperLogin();
    } else {
        initializeApp();
    }
  }, []);

  // Effect for handling authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setProfile(null);
        
        if (!window.location.search.includes('profile=')) {
          setPublicProfileId(null);
        }
        
        setSession(session);

        if (_event === 'SIGNED_IN' && authFlow.subType && session?.user) {
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();
            
            if (!existingProfile) {
                await handleCreateProfile(authFlow.subType);
            }
            setAuthFlow({ mode: 'welcome', subType: null });
        } else if (!session) {
            setAuthFlow({ mode: 'welcome', subType: null });
        }
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, [authFlow.subType]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user && !publicProfileId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        // This handles a race condition where a profile is created right after login
        if (error && error.code === 'PGRST116') {
             // Profile not found, but we expect it to be created. Let's wait and retry.
             setTimeout(fetchProfile, 500);
             return; // Exit current attempt
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
        setLoading(false);
    }
  }, [session, publicProfileId]);

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    if (window.location.search.includes('dev-access')) {
        window.history.pushState({}, '', window.location.pathname);
    }
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
  
  if (!session) {
    if (authFlow.mode === 'welcome') {
        return (
            <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
                <div className="w-full h-screen">
                    <SelectionScreen 
                        onSelect={(subType) => setAuthFlow({ mode: 'auth', subType: subType })}
                        onLoginClick={() => setAuthFlow({ mode: 'auth', subType: null })}
                    />
                </div>
            </div>
        );
    }
    return <AuthScreen 
              supabase={supabase} 
              initialSubType={authFlow.subType} 
              onBack={() => setAuthFlow({ mode: 'welcome', subType: null })} 
            />;
  }
  
  if (profile) {
    const dashboardProps = {
      profile: profile,
      onLogout: handleLogout,
      supabase: supabase,
    };
    return (
      <div className="bg-black min-h-screen font-['Inter',_sans-serif]">
        {profile.sub_type === SubType.HomeService ? (
            <TherapistDashboard {...dashboardProps} />
        ) : (
            <PlaceDashboard {...dashboardProps} />
        )}
      </div>
    );
  }

  return <LoadingScreen />;
};

export default App;
