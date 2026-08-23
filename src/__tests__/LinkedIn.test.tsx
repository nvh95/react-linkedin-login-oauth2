import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LinkedIn } from '../LinkedIn';

describe('LinkedIn', () => {
  let container: HTMLDivElement;
  let root: Root;
  const popup = {
    closed: false,
    close: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(window, 'open').mockImplementation(
      () => popup as unknown as Window,
    );
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  test('passes linkedInLogin to its render prop and forwards options', () => {
    act(() => {
      root.render(
        <LinkedIn
          clientId="client-id"
          redirectUri="https://example.com/linkedin"
          state="custom-state"
          scope="openid,email"
          popupWidth={720}
          popupHeight={640}
          closePopupMessage="Closed"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        >
          {({ linkedInLogin }) => (
            <button onClick={linkedInLogin}>Sign in</button>
          )}
        </LinkedIn>,
      );
    });

    act(() => {
      container.querySelector('button')?.click();
    });

    const [openedUrl, , features] = vi.mocked(window.open).mock.calls[0];
    const authorizationUrl = new URL(openedUrl as string);
    expect(authorizationUrl.searchParams.get('state')).toBe('custom-state');
    expect(authorizationUrl.searchParams.get('scope')).toBe('openid email');
    expect(features).toContain('width=720');
    expect(features).toContain('height=640');
  });
});
