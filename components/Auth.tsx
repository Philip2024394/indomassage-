import React, { useState } from 'react';
import { SubType } from '../types';
import Button from './Button';
import Input from './Input';

interface AuthProps {
  supabase: any;
  initialSubType: SubType | null;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ supabase, initialSubType, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(!!initialSubType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // Handle Sign Up
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Success! Please check your email to confirm your account.");
      }
    } else {
      // Handle Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setError("Invalid email or password. Please try again.");
        console.error("Login Error:", error.message);
      }
      // onAuthStateChange in App.tsx will handle successful login
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };
  
  const handleToggleMode = () => {
    setError(null);
    setMessage(null);
    if (isSignUp) {
        // If they were signing up and want to sign in
        setIsSignUp(false);
    } else {
        // If they were signing in and want to sign up, send them back to choose a role
        onBack();
    }
  };

  const BackButton = () => (
    <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-colors z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
        <span>Back</span>
    </button>
  );

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center p-6 h-full relative bg-cover bg-center"
      style={{ backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463')` }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <BackButton />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full text-center mb-10">
            <h1 className="text-4xl font-bold text-white">
            Indo<span className="text-orange-500">street</span>
            </h1>
            <p className="text-slate-400 mt-2">Massage Members Hub</p>
        </div>
      
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-8">
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
          {message && <p className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-md mb-4">{message}</p>}
          
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <h2 className="text-2xl font-semibold text-center text-white">
              {isSignUp 
                ? `Create ${initialSubType === SubType.HomeService ? 'Therapist' : 'Place'} Account` 
                : 'Member Sign In'}
            </h2>
            
            <Input 
                label="Email Address"
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
            />

            <Input 
                label="Password"
                id="password" 
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                onToggleVisibility={togglePasswordVisibility}
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
                onClick={handleToggleMode}
                className="text-sm text-orange-500 hover:underline disabled:opacity-50"
                disabled={loading}
            >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;