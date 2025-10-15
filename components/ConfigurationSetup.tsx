
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface GoogleMapsConfig {
  googleMapsKey: string;
}

interface ConfigurationSetupProps {
  onConfigured: (config: GoogleMapsConfig) => void;
}

const ConfigurationSetup: React.FC<ConfigurationSetupProps> = ({ onConfigured }) => {
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  // This check is no longer needed as Supabase keys are hardcoded in App.tsx.
  // const supabaseKeysMissing = !(process as any).env.VITE_SUPABASE_URL || !(process as any).env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (googleMapsKey.trim()) {
      onConfigured({
        googleMapsKey: googleMapsKey.trim()
      });
    } else {
      alert('Please fill in the Google Maps API key.');
      setLoading(false);
    }
  };
  
  // The error display for missing Supabase keys is removed because they are now hardcoded.
  // This component will now only render when the Google Maps key is needed.

  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white p-8">
      <div className="bg-gray-900 p-8 rounded-2xl border border-orange-500/50 max-w-lg w-full shadow-lg">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-400 mb-4">Application Setup</h1>
            <p className="text-slate-300 mb-6">
            Your Supabase keys have been loaded automatically. Please provide your Google Maps API key to complete the setup.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <Input
            label="Google Maps API Key"
            id="googleMapsKey"
            type="text"
            placeholder="Enter your Google Maps API key"
            required
            value={googleMapsKey}
            onChange={e => setGoogleMapsKey(e.target.value)}
          />
          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationSetup;
