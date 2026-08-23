import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock,
} from 'vitest';
import { useLinkedIn } from '../useLinkedIn';
import { LINKEDIN_OAUTH2_STATE } from '../utils';

type LinkedInError = {
  error: string;
  errorMessage: string;
};

type TestComponentProps = {
  onSuccess: (code: string) => void;
  onError: (error: LinkedInError) => void;
  scope?: string;
  state?: string;
  closePopupMessage?: string;
  popupWidth?: number;
  popupHeight?: number;
};

type Popup = {
  closed: boolean;
  close: Mock;
};

function TestComponent({
  onSuccess,
  onError,
  scope,
  state,
  closePopupMessage,
  popupWidth,
  popupHeight,
}: TestComponentProps) {
  const { linkedInLogin } = useLinkedIn({
    clientId: 'client-id',
    redirectUri: 'https://example.com/linkedin',
    onSuccess,
    onError,
    scope,
    state,
    closePopupMessage,
    popupWidth,
    popupHeight,
  });

  return <button onClick={linkedInLogin}>Sign in</button>;
}

describe('useLinkedIn', () => {
  let container: HTMLDivElement;
  let root: Root;
  let popup: Popup;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    popup = {
      closed: false,
      close: vi.fn(() => {
        popup.closed = true;
      }),
    };
    vi.spyOn(window, 'open').mockImplementation(
      () => popup as unknown as Window,
    );
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const renderAndOpenPopup = (
    onSuccess: Mock,
    onError: Mock,
    popupOptions: Pick<
      TestComponentProps,
      'scope' | 'state' | 'closePopupMessage' | 'popupWidth' | 'popupHeight'
    > = {},
  ) => {
    act(() => {
      root.render(
        <TestComponent
          onSuccess={onSuccess}
          onError={onError}
          {...popupOptions}
        />,
      );
    });

    const button = container.querySelector('button');
    if (!button) {
      throw new Error('Sign-in button was not rendered');
    }

    act(() => {
      button.click();
    });
  };

  test('uses configurable popup dimensions', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    renderAndOpenPopup(onSuccess, onError, {
      scope: 'openid',
      popupWidth: 900,
      popupHeight: 700,
    });

    expect(vi.mocked(window.open).mock.calls[0]?.[2]).toContain('width=900');
    expect(vi.mocked(window.open).mock.calls[0]?.[2]).toContain('height=700');
  });

  test('reports success once without a subsequent popup-closed error', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderAndOpenPopup(onSuccess, onError);

    const openedUrl = vi.mocked(window.open).mock.calls[0]?.[0];
    if (!openedUrl) {
      throw new Error('LinkedIn authorization URL was not opened');
    }
    const authorizationUrl = new URL(openedUrl);
    expect(authorizationUrl.searchParams.get('scope')).toBe(
      'openid profile email',
    );

    const state = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup as unknown as Window,
          data: { code: 'authorization-code', state, from: 'Linked In' },
        }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith('authorization-code');
    expect(onError).not.toHaveBeenCalled();
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).toBeNull();
  });

  test('reports a state mismatch from the login popup', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderAndOpenPopup(onSuccess, onError, { state: 'expected-state' });

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup as unknown as Window,
          data: {
            code: 'authorization-code',
            state: 'unexpected-state',
            from: 'Linked In',
          },
        }),
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      error: 'state_mismatch',
      errorMessage: 'State does not match',
    });
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).toBeNull();
  });

  test('forwards an authorization error from the login popup', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderAndOpenPopup(onSuccess, onError);
    const state = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
    const linkedInError = {
      error: 'access_denied',
      errorMessage: 'Member declined',
      state,
      from: 'Linked In',
    };

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup as unknown as Window,
          data: linkedInError,
        }),
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(linkedInError);
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).toBeNull();
  });

  test('warns without blocking when a custom scope omits openid', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    renderAndOpenPopup(onSuccess, onError, {
      scope: 'r_emailaddress r_liteprofile',
    });

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'The scope must include "openid" for Sign in with LinkedIn using OpenID Connect',
    );
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).not.toBeNull();
  });

  test.each(['openid%20email', 'openid,email', 'openid+email'])(
    'normalizes the encoded scope %s',
    (scope) => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      renderAndOpenPopup(onSuccess, onError, { scope });

      const openedUrl = vi.mocked(window.open).mock.calls[0]?.[0];
      if (!openedUrl) {
        throw new Error('LinkedIn authorization URL was not opened');
      }

      expect(new URL(openedUrl).searchParams.get('scope')).toBe('openid email');
      expect(console.warn).not.toHaveBeenCalled();
    },
  );

  test('reports a blocked popup', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    vi.mocked(window.open).mockImplementation(() => null);

    renderAndOpenPopup(onSuccess, onError);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      error: 'popup_blocked',
      errorMessage: 'The LinkedIn login popup was blocked',
    });
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).toBeNull();
  });

  test('reports a failure while creating the authorization request', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable');
    });

    renderAndOpenPopup(onSuccess, onError);

    expect(window.open).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      error: 'authorization_request_failed',
      errorMessage: 'Storage is unavailable',
    });
  });

  test('reports a failure while opening the popup', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    vi.mocked(window.open).mockImplementation(() => {
      throw new Error('Popup API failed');
    });

    renderAndOpenPopup(onSuccess, onError);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      error: 'popup_open_failed',
      errorMessage: 'Popup API failed',
    });
    expect(localStorage.getItem(LINKEDIN_OAUTH2_STATE)).toBeNull();
  });

  test('reports a manually closed popup once', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderAndOpenPopup(onSuccess, onError, {
      closePopupMessage: 'The member closed LinkedIn',
    });

    popup.closed = true;
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({
      error: 'user_closed_popup',
      errorMessage: 'The member closed LinkedIn',
    });
  });

  test('reports a failure while checking the popup status', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    popup.close.mockImplementation(() => undefined);
    Object.defineProperty(popup, 'closed', {
      configurable: true,
      get() {
        throw new Error('Popup status is unavailable');
      },
    });
    renderAndOpenPopup(onSuccess, onError);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      error: 'popup_status_check_failed',
      errorMessage: 'Popup status is unavailable',
    });
  });

  test('rejects messages that do not come from the login popup', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderAndOpenPopup(onSuccess, onError);

    const state = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: window,
          data: { code: 'authorization-code', state, from: 'Linked In' },
        }),
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
