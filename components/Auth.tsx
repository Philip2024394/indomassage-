import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { SubType } from '../types';

interface AuthProps {
  onLoginSuccess: () => void;
  userType: SubType;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess, userType, onBack }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle API calls to Supabase here.
    // For this demo, we'll just simulate a successful login/signup.
    onLoginSuccess();
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
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <h2 className="text-2xl font-semibold text-center text-white">
              {isLoginView ? `${typeName} Sign In` : `Create ${typeName} Account`}
            </h2>
            <div className="space-y-4">
              <Input id="email" type="email" placeholder="Email Address" required />
              <Input id="password" type="password" placeholder="Password" required />
              {!isLoginView && (
                <Input id="confirm-password" type="password" placeholder="Confirm Password" required />
              )}
            </div>
            <Button type="submit" fullWidth>
              {isLoginView ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-sm text-orange-500 hover:text-orange-400 font-medium transition"
            >
              {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={onLoginSuccess}
              className="text-xs text-slate-500 hover:text-orange-400 font-medium transition"
            >
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;