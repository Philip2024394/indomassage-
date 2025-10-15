
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface AppConfig {
  supabaseUrl: string;
  supabaseKey: string;
  googleMapsKey: string;
}

interface ConfigurationSetupProps {
  onConfigured: (config: AppConfig) => void;
}

const ConfigurationSetup: React.FC<ConfigurationSetupProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (supabaseUrl.trim() && supabaseKey.trim() && googleMapsKey.trim()) {
      onConfigured({ 
        supabaseUrl: supabaseUrl.trim(), 
        supabaseKey: supabaseKey.trim(), 
        googleMapsKey: googleMapsKey.trim() 
      });
    } else {
      alert('Please fill in all API keys.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen font-['Inter',_sans-serif] flex items-center justify-center text-white p-8">
      <div className="bg-gray-900 p-8 rounded-2xl border border-orange-500/50 max-w-lg w-full shadow-lg">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-400 mb-4">Application Setup</h1>
            <p className="text-slate-300 mb-6">
            This application requires API keys to connect to its services. Please enter them below. These will be saved in your browser for convenience.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <Input 
            label="Supabase URL"
            id="supabaseUrl"
            type="url"
            placeholder="Enter your Supabase project URL"
            required
            value={supabaseUrl}
            onChange={e => setSupabaseUrl(e.target.value)}
          />
          <Input 
            label="Supabase Anon Key"
            id="supabaseKey"
            type="text"
            placeholder="Enter your Supabase anon (public) key"
            required
            value={supabaseKey}
            onChange={e => setSupabaseKey(e.target.value)}
          />
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