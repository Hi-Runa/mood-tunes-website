import queryString from 'query-string';

const clientId = '9e48df172d37493eb42ffbe9c061131d';
const redirectUri = 'http://localhost:3000/callback'; // Match with Spotify dashboard
const scopes = ['user-read-private', 'user-read-email'];

export const getAuthorizationUrl = () => {
  const queryParams = queryString.stringify({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
  });

  return `https://accounts.spotify.com/authorize?${queryParams}`;
};
