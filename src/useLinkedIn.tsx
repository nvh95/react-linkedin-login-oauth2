import { useCallback, useEffect, useRef } from 'react';
import { useLinkedInType } from './types';
import { LINKEDIN_OAUTH2_STATE } from './utils';

const getPopupPositionProperties = ({ width = 600, height = 600 }) => {
  const left = screen.width / 2 - width / 2;
  const top = screen.height / 2 - height / 2;
  return `left=${left},top=${top},width=${width},height=${height}`;
};

const generateRandomString = (length = 20) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export function useLinkedIn({
  redirectUri,
  clientId,
  onSuccess,
  onError,
  scope = 'r_emailaddress',
  state = '',
  closePopupMessage = 'User closed the popup',
}: useLinkedInType) {
  const popupRef = useRef<Window>(null);
  const popUpIntervalRef = useRef<number>(null);

  const receiveMessage = useCallback(
    (event: MessageEvent) => {
      const savedState = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
      if (event.origin === window.location.origin) {
        if (event.data.errorMessage && event.data.from === 'Linked In') {
          // Prevent CSRF attack by testing state
          if (event.data.state !== savedState) {
            popupRef.current && popupRef.current.close();
            return;
          }
          onError && onError(event.data);
          popupRef.current && popupRef.current.close();
        } else if (event.data.code && event.data.from === 'Linked In') {
          // Prevent CSRF attack by testing state
          if (event.data.state !== savedState) {
            console.error('State does not match');
            popupRef.current && popupRef.current.close();
            return;
          }
          onSuccess && onSuccess(event.data.code);
          popupRef.current && popupRef.current.close();
        }
      }
    },
    [onError, onSuccess],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('message', receiveMessage, false);

      if (popupRef.current) {
        popupRef.current.close();
        popupRef.current = null;
      }
      if (popUpIntervalRef.current) {
        window.clearInterval(popUpIntervalRef.current);
        popUpIntervalRef.current = null;
      }
    };
  }, [receiveMessage]);

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    return () => {
      window.removeEventListener('message', receiveMessage, false);
    };
  }, [receiveMessage]);

  const getUrl = () => {
    const scopeParam = `&scope=${encodeURI(scope)}`;
    const generatedState = state || generateRandomString();
    localStorage.setItem(LINKEDIN_OAUTH2_STATE, generatedState);
    const linkedInAuthLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}${scopeParam}&state=${generatedState}`;
    return linkedInAuthLink;
  };

  const linkedInLogin = () => {
    popupRef.current?.close();
    popupRef.current = window.open(
      getUrl(),
      '_blank',
      getPopupPositionProperties({ width: 600, height: 600 }),
    );

    if (popUpIntervalRef.current) {
      window.clearInterval(popUpIntervalRef.current);
      popUpIntervalRef.current = null;
    }
    popUpIntervalRef.current = window.setInterval(() => {
      try {
        if (popupRef.current && popupRef.current.closed) {
          window.clearInterval(popUpIntervalRef.current);
          popUpIntervalRef.current = null;
          if (onError) {
            onError({
              error: 'user_closed_popup',
              errorMessage: closePopupMessage,
            });
          }
        }
      } catch (error) {
        console.error(error);
        window.clearInterval(popUpIntervalRef.current);
        popUpIntervalRef.current = null;
      }
    }, 1000);
  };

  return {
    linkedInLogin,
  };
}
