// Spotify Authentication Component
// Handles OAuth flow and displays login/logout UI

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, LogOut, Loader2 } from 'lucide-react';
import { 
  getStoredToken, 
  clearStoredToken, 
  exchangeCodeForToken, 
  storeToken,
  type SpotifyToken 
} from '../services/spotify';

interface SpotifyAuthProps {
  clientId: string;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

export default function SpotifyAuth({ clientId, onAuthSuccess, onAuthError }: SpotifyAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = getStoredToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);

    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setIsLoading(false);
      onAuthError?.(error);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setIsProcessing(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const token = await exchangeCodeForToken(code, redirectUri);
      storeToken(token);
      setIsAuthenticated(true);
      onAuthSuccess?.();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      onAuthError?.(error.message || 'Failed to authenticate with Spotify');
      setIsAuthenticated(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-top-read',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      show_dialog: 'true',
    })}`;

    window.location.href = authUrl;
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    onAuthSuccess?.(); // Notify parent that auth state changed
  };

  if (isLoading || isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 text-white/70"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">
          {isProcessing ? 'Connecting to Spotify...' : 'Loading...'}
        </span>
      </motion.div>
    );
  }

  if (isAuthenticated) {
    return (
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Disconnect Spotify</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleLogin}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg border border-green-500/30 transition-colors"
    >
      <Music className="w-4 h-4" />
      <span className="text-sm font-medium">Connect with Spotify</span>
    </motion.button>
  );
}

