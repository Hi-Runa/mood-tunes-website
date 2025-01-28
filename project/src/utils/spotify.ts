import SpotifyWebApi from 'spotify-web-api-js';
import nlp from 'compromise';

const clientId = '9e48df172d37493eb42ffbe9c061131d';
const clientSecret = '12035761b48243689460e6631b332c2c';

const spotifyApi = new SpotifyWebApi();

interface MoodMapping {
  valence: number;
  energy: number;
  genres: string[];
}

const moodKeywords: Record<string, MoodMapping> = {
  happy: { valence: 0.8, energy: 0.8, genres: ['pop', 'dance'] },
  sad: { valence: 0.2, energy: 0.3, genres: ['acoustic', 'piano'] },
  relaxed: { valence: 0.6, energy: 0.3, genres: ['ambient', 'chill'] },
  energetic: { valence: 0.7, energy: 0.9, genres: ['dance', 'electronic'] },
  angry: { valence: 0.4, energy: 0.9, genres: ['rock', 'metal'] },
  stressed: { valence: 0.3, energy: 0.4, genres: ['classical', 'ambient'] },
  peaceful: { valence: 0.7, energy: 0.2, genres: ['acoustic', 'ambient'] },
  tired: { valence: 0.4, energy: 0.2, genres: ['sleep', 'ambient'] }
};

export const analyzeMood = (text: string): MoodMapping => {
  const doc = nlp(text.toLowerCase());
  
  // Default mood for neutral text
  let mood: MoodMapping = { 
    valence: 0.5, 
    energy: 0.5,
    genres: ['pop', 'rock'] 
  };
  
  Object.entries(moodKeywords).forEach(([keyword, mapping]) => {
    if (doc.has(keyword)) {
      mood = mapping;
    }
  });

  // Additional context analysis
  if (doc.has('need to relax') || doc.has('stressful')) {
    mood = moodKeywords.relaxed;
  }

  return mood;
};

export const getAccessToken = async () => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString()
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      console.error('No access token in response:', data);
      throw new Error('No access token received');
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const generatePlaylist = async (mood: MoodMapping) => {
  try {
    const token = await getAccessToken();
    
    const params = new URLSearchParams({
      seed_genres: mood.genres.slice(0, 2).join(','),
      target_valence: mood.valence.toString(),
      target_energy: mood.energy.toString(),
      min_popularity: '30',
      limit: '15'
    });

    console.log('Making request with params:', params.toString());
    
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?${params}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Recommendations response not OK:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: response.url
      });
      throw new Error(`Failed to get recommendations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.tracks || !Array.isArray(data.tracks)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Spotify API');
    }

    return data.tracks;
  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
};