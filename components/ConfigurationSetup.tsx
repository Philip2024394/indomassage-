// @ts-ignore
const { createClient } = window.supabase;

// --- CONFIGURATION ---

// This setup enables both local development and secure production deployment.
// 1. For PRODUCTION (on Netlify): It uses the environment variables you set in the Netlify UI.
// 2. For LOCAL DEVELOPMENT (in this editor): It falls back to the hardcoded values below.

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://lqkfxdqzddtjuwfhjybc.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxa2Z4ZHF6ZGR0anV3ZmhqeWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTQ5NTksImV4cCI6MjA3NDc5MDk1OX0.pG9p3NsUNZBoknq5r5MS5bWg4Zg5ZP5KbZDmHKSItb8';
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyCxqJxKLJapoRePJ8xz1wK2sqBUOdd7O2c';

// NOTE ON SECURITY: Netlify's secret scanner is very strict and might still flag the hardcoded
// fallback keys above. If your build fails due to secrets, you may need to temporarily
// remove the values after the `||` operators before pushing to GitHub.

// Check if the keys are available from either source.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GOOGLE_MAPS_API_KEY) {
  const errorMessage = "CRITICAL ERROR: API keys are missing. Ensure they are set in your Netlify environment variables for deployment.";
  
  // Display a user-friendly message on the screen.
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="background-color: #1a1a1a; color: #ffcc80; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; font-family: monospace; flex-direction: column;">
        <h1 style="color: #ff8a65; font-size: 1.5rem; margin-bottom: 1rem;">Configuration Error</h1>
        <p style="text-align: center; max-width: 600px;">The application is not configured correctly. API keys are missing.</p>
      </div>
    `;
  }
  
  // Also throw an error to halt execution and log to console.
  throw new Error(errorMessage);
}

// Create and export the Supabase client instance.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
