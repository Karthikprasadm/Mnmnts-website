// Spotify API Service
// Handles authentication and API calls to Spotify Web API

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3000/api/spotify'
  : '/api/spotify';

const TOKEN_ENDPOINT = import.meta.env.DEV
  ? 'http://localhost:3000/api/spotify/token'
  : '/api/spotify/token';

export interface SpotifyToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    items: Array<{
      track: SpotifyTrack | null;
    }>;
  };
}

// Get stored token from localStorage
export function getStoredToken(): SpotifyToken | null {
  try {
    const stored = localStorage.getItem('spotify_token');
    if (!stored) return null;
    const token = JSON.parse(stored);
    // Check if token is expired (with 5 minute buffer)
    if (token.expires_at && Date.now() >= token.expires_at - 300000) {
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

// Store token in localStorage
export function storeToken(token: SpotifyToken): void {
  try {
    const expiresAt = Date.now() + (token.expires_in * 1000);
    localStorage.setItem('spotify_token', JSON.stringify({
      ...token,
      expires_at: expiresAt,
    }));
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

// Clear stored token
export function clearStoredToken(): void {
  localStorage.removeItem('spotify_token');
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<SpotifyToken> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to exchange authorization code');
  }

  return data.data;
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyToken> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to refresh token');
  }

  return data.data;
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken(): Promise<string | null> {
  let token = getStoredToken();
  
  if (!token) {
    return null;
  }

  // Check if token is expired or will expire soon
  const stored = JSON.parse(localStorage.getItem('spotify_token') || '{}');
  if (stored.expires_at && Date.now() >= stored.expires_at - 300000) {
    // Token expired or expiring soon, try to refresh
    if (token.refresh_token) {
      try {
        const refreshed = await refreshAccessToken(token.refresh_token);
        storeToken(refreshed);
        token = refreshed;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        clearStoredToken();
        return null;
      }
    } else {
      clearStoredToken();
      return null;
    }
  }

  return token.access_token;
}

// Make authenticated request to Spotify API
export async function spotifyRequest(endpoint: string): Promise<any> {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    throw new Error('No valid access token. Please authenticate first.');
  }

  const response = await fetch(`${API_BASE}?endpoint=${encodeURIComponent(endpoint)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      // Token expired, clear it
      clearStoredToken();
      throw new Error('Authentication expired. Please log in again.');
    }
    throw new Error(data.error || 'Spotify API request failed');
  }

  return data.data;
}

// Get user's playlists
export async function getUserPlaylists(limit = 50): Promise<SpotifyPlaylist[]> {
  const data = await spotifyRequest(`/me/playlists?limit=${limit}`);
  return data.items || [];
}

// Get playlist tracks
export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const data = await spotifyRequest(`/playlists/${playlistId}/tracks`);
  return (data.items || [])
    .map((item: any) => item.track)
    .filter((track: SpotifyTrack | null) => track !== null);
}

// Search for tracks
export async function searchTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
  const data = await spotifyRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
  return data.tracks?.items || [];
}

// Get user's saved tracks
export async function getSavedTracks(limit = 50): Promise<SpotifyTrack[]> {
  const data = await spotifyRequest(`/me/tracks?limit=${limit}`);
  return (data.items || []).map((item: any) => item.track);
}

// Get user's top tracks
export async function getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 50): Promise<SpotifyTrack[]> {
  const data = await spotifyRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  return data.items || [];
}

// Format duration from milliseconds to MM:SS
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

