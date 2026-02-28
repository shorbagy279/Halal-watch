// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Auto-detect the right host based on platform:
//   web            → localhost  (browser on same machine)
//   Android emu    → 10.0.2.2  (maps to host machine)
//   iOS simulator  → localhost
//   physical device → set YOUR_IP to your machine's LAN IP (e.g. 192.168.1.4)
const YOUR_IP = '192.168.1.4'; // ← change this for physical device

function getBaseUrl(): string {
  if (Platform.OS === 'web') return 'http://localhost:5064/api';
  if (Platform.OS === 'android') return `http://10.0.2.2:5064/api`;
  // iOS simulator or physical device
  return `http://${YOUR_IP}:5064/api`;
}

const BASE_URL = getBaseUrl();

async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url} | token: ${token ? '✅' : '❌ MISSING'}`);

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkErr: any) {
    console.error(`[API] Network error on ${url}:`, networkErr.message);
    throw new Error(
      `Cannot reach server. Make sure backend is running on port 5064.`
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.title || errorMessage;
    } catch {}
    console.error(`[API] ${response.status} on ${url}:`, errorMessage);
    if (response.status === 401) errorMessage = 'Not logged in. Please sign in first.';
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    request<{ token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Search
export const searchApi = {
  search: (query: string) =>
    request<MovieSearchResult[]>(`/search?query=${encodeURIComponent(query)}`),
};

// Movie
export const movieApi = {
  getMovie: (tmdbId: number) =>
    request<MoviePageResponse>(`/movie/${tmdbId}`),

  getReport: (tmdbId: number) =>
    request<MovieReport>(`/movie/report/${tmdbId}`),

  // FIX: encode title properly, use correct endpoint format
  analyze: (tmdbId: number, title: string) =>
    request<AnalysisResult>(`/analyze/${tmdbId}/${encodeURIComponent(title)}`, {
      method: 'POST',
    }),
};

// Home
export const homeApi = {
  getHomepage: () =>
    request<HomepageData>('/home'),

  getCommunityPlaylists: () =>
    request<CommunityPlaylist[]>('/home/community-playlists'),
};

// Playlists
export const playlistApi = {
  create: (name: string, description: string, isPublic: boolean) =>
    request<{ playlistId: number; message: string }>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, isPublic }),
    }),

  getMine: () =>
    request<MyPlaylist[]>('/playlists/mine'),

  getPlaylist: (id: number) =>
    request<PlaylistDetail>(`/playlists/${id}`),

  addMovie: (playlistId: number, tmdbId: number, movieTitle: string, posterUrl?: string) =>
    request(`/playlists/${playlistId}/add`, {
      method: 'POST',
      body: JSON.stringify({ tmdbId, movieTitle, posterUrl }),
    }),

  removeMovie: (playlistId: number, tmdbId: number) =>
    request(`/playlists/${playlistId}/remove/${tmdbId}`, {
      method: 'DELETE',
    }),

  toggleLike: (playlistId: number) =>
    request<{ liked: boolean; likes: number }>(`/playlists/${playlistId}/like`, {
      method: 'POST',
    }),
};

// Profile
export const profileApi = {
  getMe: () =>
    request<ProfileData>('/profile/me'),

  getProfile: (username: string) =>
    request<ProfileData>(`/profile/${username}`),
};

// Types
export interface MovieSearchResult {
  id: number;
  title: string;
  year: string;
  poster: string;
}

export interface MovieReport {
  overallScore: number;
  nudityScore: number;
  lgbtScore: number;
  biasScore: number;
  verdict: 'APPROPRIATE' | 'CAUTION' | 'INAPPROPRIATE';
  generatedAt: string;
}

export interface MoviePageResponse {
  movie: {
    id: number;
    title: string;
    overview: string;
    year: string;
    poster: string;
  };
  hasReport: boolean;
  report?: MovieReport;
}

export interface AnalysisResult {
  message: string;
  movie: string;
  overallScore: number;
  verdict: string;
  nuditySexScore: number;
  lgbtScore: number;
  islamArabBiasScore: number;
  totalComments: number;
}

export interface MovieCard {
  title: string;
  poster: string;
  year: string;
  tmdbId: number;
  mpaRating: string;
  overallScore: number;
  nudityScore: number;
  lgbtScore: number;
  biasScore: number;
}

export interface HomepageData {
  nudityFree: MovieCard[];
  lgbtFree: MovieCard[];
  biasFree: MovieCard[];
}

export interface CommunityPlaylist {
  id: number;
  name: string;
  description: string;
  creator: string;
  movieCount: number;
  likes: number;
  previewPosters: string[];
}

export interface MyPlaylist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  movieCount: number;
}

export interface PlaylistDetail {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  owner: string;
  movies: {
    tmdbId: number;
    movieTitle: string;
    posterUrl: string;
    addedAt: string;
  }[];
}

export interface ProfileData {
  username: string;
  email?: string;
  stats: {
    playlistsCount: number;
    totalAnalyzedMovies: number;
    averageHalalScore: number;
  };
  playlists: MyPlaylist[];
}