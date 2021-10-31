import { useEffect, useState } from 'react';
import { LINKEDIN_OAUTH2_STATE, parse } from './utils';

type ParamsType = {
  state: string;
  code?: string;
  error?: string;
  error_description?: string;
};

export function LinkedInCallback() {
  const [errorMessage, setErrorMessage] = useState<string>('');
  useEffect(() => {
    const params = parse(window.location.search) as ParamsType;
    if (params.state !== localStorage.getItem(LINKEDIN_OAUTH2_STATE)) {
      setErrorMessage('State does not match');
    } else if (params.error) {
      const errorMessage =
        params.error_description || 'Login failed. Please try again.';
      window.opener &&
        window.opener.postMessage(
          {
            error: params.error,
            state: params.state,
            errorMessage,
            from: 'Linked In',
          },
          window.location.origin,
        );
      // Close tab if user cancelled login
      if (params.error === 'user_cancelled_login') {
        window.close();
      }
    }
    if (params.code) {
      window.opener &&
        window.opener.postMessage(
          { code: params.code, state: params.state, from: 'Linked In' },
          window.location.origin,
        );
    }
  }, []);

  return <div>{errorMessage}</div>;
}
