export const LINKEDIN_OAUTH2_STATE = 'linkedin_oauth2_state';

type AuthorizationUrlParams = {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
};

export function generateRandomState(byteLength = 32) {
  const values = new Uint8Array(byteLength);
  window.crypto.getRandomValues(values);

  let result = '';
  for (let index = 0; index < values.length; index += 1) {
    const hex = values[index].toString(16);
    result += hex.length === 1 ? `0${hex}` : hex;
  }

  return result;
}

export function buildLinkedInAuthorizationUrl({
  clientId,
  redirectUri,
  scope,
  state,
}: AuthorizationUrlParams) {
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);

  return url.toString();
}

export function parse(search: string) {
  const parsed: Record<string, string> = {};
  const params = new URLSearchParams(
    search.charAt(0) === '?' ? search.substring(1) : search,
  );

  params.forEach((value, key) => {
    parsed[key] = value;
  });

  return parsed;
}
