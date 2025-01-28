import React, { useState } from 'react';
import { Music, Send } from 'lucide-react';
import { analyzeMood, generatePlaylist } from './utils/spotify';
import { Camera } from './components/Camera';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
}

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mood = analyzeMood(text);
      const playlist = await generatePlaylist(mood);
      setTracks(playlist);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodDetected = (detectedMood: string) => {
    setText(prevText => `${prevText} ${detectedMood}`.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <Music className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold text-center mb-2">Mood Music Matcher</h1>
          <p className="text-lg text-gray-300 text-center">
            Tell us how you're feeling, and we'll create the perfect playlist for you
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={() => setShowCamera(!showCamera)}
            className="w-full mb-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 backdrop-blur-sm transition-colors rounded-lg p-4 flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-5 h-5" />
            {showCamera ? 'Hide Camera' : 'Show Camera'}
          </button>

          {showCamera && (
            <div className="mb-8">
              <Camera onMoodDetected={handleMoodDetected} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How are you feeling today? (e.g., 'I've had a stressful day and need to relax')"
              className="w-full p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
            />
            <button
              type="submit"
              disabled={loading || !text}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Creating your perfect playlist...</p>
          </div>
        )}

        {tracks.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Personalized Playlist</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              {tracks.map((track) => (
                <a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 hover:bg-white/5 rounded-lg transition-colors mb-2"
                >
                  <Music className="w-6 h-6 mr-4 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">{track.name}</h3>
                    <p className="text-sm text-gray-400">
                      {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;