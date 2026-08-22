import { useCallback, useEffect, useRef } from 'react';
import { useLinkedInType } from './types';
import {
  buildLinkedInAuthorizationUrl,
  generateRandomState,
  LINKEDIN_OAUTH2_STATE,
} from './utils';

const DEFAULT_SCOPE = 'openid profile email';

const getPopupPositionProperties = ({ width = 600, height = 600 }) => {
  const left = screen.width / 2 - width / 2;
  const top = screen.height / 2 - height / 2;
  return `left=${left},top=${top},width=${width},height=${height}`;
};

const normalizeScope = (scope: string) =>
  scope
    .replace(/%20|[,+]/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');

export function useLinkedIn({
  redirectUri,
  clientId,
  onSuccess,
  onError,
  scope = DEFAULT_SCOPE,
  state = '',
  closePopupMessage = 'User closed the popup',
  popupWidth = 600,
  popupHeight = 600,
}: useLinkedInType) {
  const popupRef = useRef<Window>(null);
  const popUpIntervalRef = useRef<number>(null);

  const clearPopupInterval = useCallback(() => {
    if (popUpIntervalRef.current) {
      window.clearInterval(popUpIntervalRef.current);
      popUpIntervalRef.current = null;
    }
  }, []);

  const finishPopup = useCallback(() => {
    clearPopupInterval();
    try {
      localStorage.removeItem(LINKEDIN_OAUTH2_STATE);
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }

    if (popupRef.current) {
      popupRef.current.close();
      popupRef.current = null;
    }
  }, [clearPopupInterval]);

  const receiveMessage = useCallback(
    (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== popupRef.current ||
        !event.data ||
        event.data.from !== 'Linked In'
      ) {
        return;
      }

      const savedState = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
      if (!savedState || event.data.state !== savedState) {
        finishPopup();
        if (onError) {
          onError({
            error: 'state_mismatch',
            errorMessage: 'State does not match',
          });
        }
        return;
      }

      if (event.data.error) {
        finishPopup();
        if (onError) {
          onError(event.data);
        }
      } else if (event.data.code) {
        const code = event.data.code;
        finishPopup();
        onSuccess(code);
      }
    },
    [finishPopup, onError, onSuccess],
  );

  useEffect(() => {
    return () => {
      finishPopup();
    };
  }, [finishPopup]);

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    return () => {
      window.removeEventListener('message', receiveMessage, false);
    };
  }, [receiveMessage]);

  const getUrl = () => {
    const normalizedScope = normalizeScope(scope);

    if (!normalizedScope.split(' ').includes('openid')) {
      console.warn(
        'The scope must include "openid" for Sign in with LinkedIn using OpenID Connect',
      );
    }

    const generatedState = state || generateRandomState();
    localStorage.setItem(LINKEDIN_OAUTH2_STATE, generatedState);
    return buildLinkedInAuthorizationUrl({
      clientId,
      redirectUri,
      scope: normalizedScope,
      state: generatedState,
    });
  };

  const linkedInLogin = () => {
    finishPopup();

    let authorizationUrl: string;
    try {
      authorizationUrl = getUrl();
    } catch (error) {
      finishPopup();
      if (onError) {
        onError({
          error: 'authorization_request_failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to create the LinkedIn authorization request',
        });
      }
      return;
    }

    try {
      popupRef.current = window.open(
        authorizationUrl,
        '_blank',
        getPopupPositionProperties({
          width: popupWidth,
          height: popupHeight,
        }),
      );
    } catch (error) {
      finishPopup();
      if (onError) {
        onError({
          error: 'popup_open_failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to open the LinkedIn login popup',
        });
      }
      return;
    }

    if (!popupRef.current) {
      finishPopup();
      if (onError) {
        onError({
          error: 'popup_blocked',
          errorMessage: 'The LinkedIn login popup was blocked',
        });
      }
      return;
    }

    popUpIntervalRef.current = window.setInterval(() => {
      try {
        if (popupRef.current && popupRef.current.closed) {
          finishPopup();
          if (onError) {
            onError({
              error: 'user_closed_popup',
              errorMessage: closePopupMessage,
            });
          }
        }
      } catch (error) {
        finishPopup();
        if (onError) {
          onError({
            error: 'popup_status_check_failed',
            errorMessage:
              error instanceof Error
                ? error.message
                : 'Unable to check the LinkedIn login popup status',
          });
        }
      }
    }, 1000);
  };

  return {
    linkedInLogin,
  };
}
