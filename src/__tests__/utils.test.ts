import {
  buildLinkedInAuthorizationUrl,
  generateRandomState,
  parse,
} from '../utils';
import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

test('parse', () => {
  expect(parse('?a=b')).toEqual({ a: 'b' });
  expect(parse('?a=b&c=d')).toEqual({ a: 'b', c: 'd' });
  expect(parse('?')).toEqual({});
  expect(parse('')).toEqual({});
  expect(parse('?a%20=b%20')).toEqual({ 'a ': 'b ' });
  expect(parse('?message=hello+world&token=a%3Db%3D')).toEqual({
    message: 'hello world',
    token: 'a=b=',
  });
});

test('buildLinkedInAuthorizationUrl', () => {
  const url = new URL(
    buildLinkedInAuthorizationUrl({
      clientId: 'client&id',
      redirectUri: 'https://example.com/linkedin?source=login',
      scope: 'r_emailaddress r_liteprofile',
      state: 'state=value',
    }),
  );

  expect(`${url.origin}${url.pathname}`).toBe(
    'https://www.linkedin.com/oauth/v2/authorization',
  );
  expect(Object.fromEntries(url.searchParams.entries())).toEqual({
    response_type: 'code',
    client_id: 'client&id',
    redirect_uri: 'https://example.com/linkedin?source=login',
    scope: 'r_emailaddress r_liteprofile',
    state: 'state=value',
  });
});

test('generateRandomState', () => {
  const firstState = generateRandomState();
  const secondState = generateRandomState();

  expect(firstState).toMatch(/^[a-f0-9]{64}$/);
  expect(secondState).toMatch(/^[a-f0-9]{64}$/);
  expect(firstState).not.toBe(secondState);
});

test('generateRandomState pads single-digit hexadecimal values', () => {
  vi.spyOn(window.crypto, 'getRandomValues').mockImplementation((values) => {
    (values as Uint8Array).set([0, 16]);
    return values;
  });

  expect(generateRandomState(2)).toBe('0010');
});
