
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface AuthProps {
  supabase: any;
}

const Auth: React.FC<AuthProps> = ({ supabase }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const formatPhoneNumber = (input: string): string => {
    let digits = input.replace(/\D/g, '');
    if (digits.startsWith('0')) {
        digits = digits.substring(1);
    }
    if (digits.startsWith('62')) {
        return `+${digits}`;
    }
    return `+62${digits}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formattedPhone = formatPhoneNumber(phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('A special access code has been sent to your WhatsApp.');
      setStep('code');
    }
    setLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formattedPhone = formatPhoneNumber(phone);
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: code,
      type: 'sms' // Supabase uses 'sms' type for phone verification
    });

    if (error) {
      setError(error.message);
    }
    // onAuthStateChange in App.tsx will handle successful login and profile creation
    setLoading(false);
  };

  const renderPhoneStep = () => (
    <form onSubmit={handlePhoneSubmit} className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-center text-white">
        Therapist Sign In / Sign Up
      </h2>
      <p className="text-center text-sm text-slate-400 -mt-2">Enter your WhatsApp number to receive an access code.</p>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-slate-400">+62</span>
        </div>
        <Input 
          id="phone" 
          type="tel" 
          placeholder="812 3456 7890" 
          required 
          value={phone} 
          onChange={e => setPhone(e.target.value)}
          className="pl-12"
          noLabel
        />
      </div>
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Sending...' : 'Send Access Code'}
      </Button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleCodeSubmit} className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-center text-white">
        Enter Access Code
      </h2>
       <p className="text-center text-sm text-slate-400 -mt-2">
        A code was sent to <span className="font-semibold text-slate-300">{formatPhoneNumber(phone)}</span>.
      </p>
      <Input 
        id="code" 
        type="text" 
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        placeholder="6-digit code" 
        required 
        value={code} 
        onChange={e => setCode(e.target.value)}
        noLabel
      />
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Sign In'}
      </Button>
    </form>
  );

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
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
          {message && <p className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-md mb-4">{message}</p>}

          {step === 'phone' ? renderPhoneStep() : renderCodeStep()}

          {step === 'code' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setStep('phone'); setError(null); setMessage(null); setCode('') }}
                className="text-sm text-orange-500 hover:text-orange-400 font-medium transition"
              >
                Entered the wrong number? Change it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
