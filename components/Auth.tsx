
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { SubType } from '../types';
import { initialFormData } from './ProfileForm';

interface AuthProps {
  userType: SubType;
  supabase: any;
}

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

const Auth: React.FC<AuthProps> = ({ userType, supabase }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isLoginView) {
      // Sign Up
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        let headerImageUrl = '';
        // Assign a rotating header image ONLY for home service therapists
        if (userType === SubType.HomeService) {
            const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('sub_type', SubType.HomeService);

            if (countError) {
                console.error('Error counting profiles:', countError);
                // Fallback to a random image from the list if count fails
                headerImageUrl = HOME_SERVICE_HEADER_IMAGES[Math.floor(Math.random() * HOME_SERVICE_HEADER_IMAGES.length)];
            } else {
                const nextImageIndex = (count || 0) % HOME_SERVICE_HEADER_IMAGES.length;
                headerImageUrl = HOME_SERVICE_HEADER_IMAGES[nextImageIndex];
            }
        }

        // Create a profile entry
        const profileData = {
            ...initialFormData(userType),
            user_id: data.user.id,
            name: 'New Member', // Default name
            ...(userType === SubType.HomeService && { header_image_url: headerImageUrl }),
        };
        const { error: profileError } = await supabase.from('profiles').insert(profileData);
        if (profileError) {
            setError(`Account created, but failed to create profile: ${profileError.message}`);
        } else {
             setMessage('Account created! Please check your email to verify your account, then sign in.');
             setIsLoginView(true); // Switch to login view after successful signup info
        }
      }
    } else {
      // Sign In
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
      // onAuthStateChange in App.tsx will handle successful login
    }
    setLoading(false);
  };
  
  const typeName = 'Therapist';

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center p-6 h-full relative bg-cover bg-center"
      style={{ backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463')` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full text-center mb-10">
            <h1 className="text-4xl font-bold text-white">
            Indo<span className="text-orange-500">street</span>
            </h1>
            <p className="text-slate-400 mt-2">Massage Members Hub</p>
        </div>
      
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-8">
          <form onSubmit={handleAuthAction} className="w-full space-y-6">
            <h2 className="text-2xl font-semibold text-center text-white">
              {isLoginView ? `${typeName} Sign In` : `Create ${typeName} Account`}
            </h2>
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
            {message && <p className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-md">{message}</p>}
            <div className="space-y-4">
              <Input id="email" type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
              <Input id="password" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
              {!isLoginView && (
                <Input id="confirm-password" type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              )}
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }}
              className="text-sm text-orange-500 hover:text-orange-400 font-medium transition"
            >
              {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
