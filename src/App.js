import React, { useState, useEffect } from 'react';
import './App.css';
import queryString from 'query-string';
import axios from 'axios';

function App({ getAuthorizationUrl }) {
  const [accessToken, setAccessToken] = useState(null);
  const [songs, setSongs] = useState([]);

  // Check if we have an access token on page load (from URL params)
  useEffect(() => {
    const { code } = queryString.parse(window.location.search);

    if (code && !accessToken) {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const clientId = '9e48df172d37493eb42ffbe9c061131d';
      const clientSecret = '12035761b48243689460e6631b332c2c';

      axios
        .post(tokenUrl, queryString.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'http://localhost:3000/callback',
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
        })
        .then((response) => {
          setAccessToken(response.data.access_token);
        })
        .catch(console.error);
    }
  }, [accessToken]);

  // Fetch songs based on the mood/genre entered by the user
  const fetchSongs = (query) => {
    if (!accessToken || !query) return;

    axios
      .get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      })
      .then((response) => setSongs(response.data.tracks.items))
      .catch(console.error);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Song Recommender</h1>
        <button onClick={() => (window.location = getAuthorizationUrl())}>
          Log in with Spotify
        </button>
        <input
          type="text"
          placeholder="Enter song mood or genre"
          onKeyDown={(e) => e.key === 'Enter' && fetchSongs(e.target.value)} // Trigger fetchSongs on Enter key
        />
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                {song.name} by {song.artists.map((artist) => artist.name).join(', ')}
              </a>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
