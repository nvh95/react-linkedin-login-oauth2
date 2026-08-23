import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LinkedInCallback } from '../LinkedInCallback';
import { LINKEDIN_OAUTH2_STATE } from '../utils';

describe('LinkedInCallback', () => {
  let container: HTMLDivElement;
  let root: Root;
  let opener: { postMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/linkedin');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    opener = { postMessage: vi.fn() };
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: opener,
    });
    vi.spyOn(window, 'close').mockImplementation(() => undefined);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: null,
    });
    vi.restoreAllMocks();
  });

  const renderCallback = (search: string, savedState = 'saved-state') => {
    if (savedState) {
      localStorage.setItem(LINKEDIN_OAUTH2_STATE, savedState);
    }
    window.history.replaceState({}, '', `/linkedin${search}`);

    act(() => {
      root.render(<LinkedInCallback />);
    });
  };

  test('sends a successful authorization code to the opener', () => {
    renderCallback('?code=authorization-code&state=saved-state');

    expect(opener.postMessage).toHaveBeenCalledWith(
      {
        code: 'authorization-code',
        state: 'saved-state',
        from: 'Linked In',
      },
      window.location.origin,
    );
    expect(window.close).toHaveBeenCalledTimes(1);
    expect(container.textContent).toBe('');
  });

  test('reports a state mismatch to the opener', () => {
    renderCallback('?code=authorization-code&state=wrong-state');

    expect(opener.postMessage).toHaveBeenCalledWith(
      {
        error: 'state_mismatch',
        state: 'saved-state',
        errorMessage: 'State does not match',
        from: 'Linked In',
      },
      window.location.origin,
    );
    expect(container.textContent).toBe('State does not match');
  });

  test('forwards an authorization error and its description', () => {
    renderCallback(
      '?error=access_denied&error_description=Member+declined&state=saved-state',
    );

    expect(opener.postMessage).toHaveBeenCalledWith(
      {
        error: 'access_denied',
        state: 'saved-state',
        errorMessage: 'Member declined',
        from: 'Linked In',
      },
      window.location.origin,
    );
    expect(container.textContent).toBe('Member declined');
  });

  test('uses a fallback message when LinkedIn omits an error description', () => {
    renderCallback('?error=server_error&state=saved-state');

    expect(container.textContent).toBe('Login failed. Please try again.');
  });

  test('reports an invalid response without a code', () => {
    renderCallback('?state=saved-state');

    expect(opener.postMessage).toHaveBeenCalledWith(
      {
        error: 'invalid_response',
        state: 'saved-state',
        errorMessage: 'LinkedIn did not return an authorization code.',
        from: 'Linked In',
      },
      window.location.origin,
    );
    expect(container.textContent).toBe(
      'LinkedIn did not return an authorization code.',
    );
  });

  test('shows an error when the original window is unavailable', () => {
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: null,
    });

    renderCallback('?code=authorization-code&state=saved-state');

    expect(container.textContent).toBe(
      'Unable to complete login because the original window is unavailable.',
    );
    expect(window.close).not.toHaveBeenCalled();
  });
});
