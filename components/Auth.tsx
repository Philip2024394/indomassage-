import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { SubType } from '../types';
import { initialFormData } from './ProfileForm';

interface AuthProps {
  userType: SubType;
  onBack: () => void;
  supabase: any;
}

const Auth: React.FC<AuthProps> = ({ userType, onBack, supabase }) => {
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
        // Create a profile entry
        const profileData = {
            ...initialFormData(userType),
            user_id: data.user.id,
            name: 'New Member', // Default name
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
  
  const typeName = userType === SubType.HomeService ? 'Therapist' : 'Business';

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center p-6 h-full relative bg-cover bg-center"
      style={{ backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463')` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      
      <button onClick={onBack} className="absolute top-6 left-6 text-sm text-orange-500 hover:underline flex items-center gap-2 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
          Back
      </button>

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
