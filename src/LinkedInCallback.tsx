import { useEffect, useState } from 'react';
import { LINKEDIN_OAUTH2_STATE, parse } from './utils';

type ParamsType = {
  state: string;
  code?: string;
  error?: string;
  error_description?: string;
};

type CallbackMessage = {
  code?: string;
  error?: string;
  state: string | null;
  errorMessage?: string;
  from: 'Linked In';
};

export function LinkedInCallback() {
  const [errorMessage, setErrorMessage] = useState<string>('');
  useEffect(() => {
    const params = parse(window.location.search) as ParamsType;
    const savedState = localStorage.getItem(LINKEDIN_OAUTH2_STATE);

    const notifyOpener = (message: CallbackMessage) => {
      if (!window.opener) {
        setErrorMessage(
          'Unable to complete login because the original window is unavailable.',
        );
        return false;
      }

      window.opener.postMessage(message, window.location.origin);
      window.close();
      return true;
    };

    if (!savedState || params.state !== savedState) {
      const stateErrorMessage = 'State does not match';
      setErrorMessage(stateErrorMessage);
      notifyOpener({
        error: 'state_mismatch',
        state: savedState,
        errorMessage: stateErrorMessage,
        from: 'Linked In',
      });
    } else if (params.error) {
      const linkedInErrorMessage =
        params.error_description || 'Login failed. Please try again.';
      setErrorMessage(linkedInErrorMessage);
      notifyOpener({
        error: params.error,
        state: params.state,
        errorMessage: linkedInErrorMessage,
        from: 'Linked In',
      });
    } else if (params.code) {
      notifyOpener({
        code: params.code,
        state: params.state,
        from: 'Linked In',
      });
    } else {
      const responseErrorMessage =
        'LinkedIn did not return an authorization code.';
      setErrorMessage(responseErrorMessage);
      notifyOpener({
        error: 'invalid_response',
        state: savedState,
        errorMessage: responseErrorMessage,
        from: 'Linked In',
      });
    }
  }, []);

  return <div>{errorMessage}</div>;
}
