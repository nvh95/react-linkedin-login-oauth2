import { parse } from '../utils';

test('parse', () => {
  expect(parse('?a=b')).toEqual({ a: 'b' });
  expect(parse('?a=b&c=d')).toEqual({ a: 'b', c: 'd' });
  expect(parse('?')).toEqual({});
  expect(parse('')).toEqual({});
  expect(parse('?a%20=b%20')).toEqual({ 'a ': 'b ' });
});
