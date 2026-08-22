'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';

export default function Home() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '';
  const redirectUri =
    typeof window === 'undefined' ? '' : `${window.location.origin}/linkedin`;

  const { linkedInLogin } = useLinkedIn({
    clientId,
    redirectUri,
    onSuccess: setCode,
    onError: (error) => setErrorMessage(error.errorMessage),
    scope: 'openid profile email',
  });

  const handleLinkedInLogin = () => {
    setCode('');
    setErrorMessage('');
    linkedInLogin();
  };

  return (
    <main>
      <h1>Sign in with LinkedIn</h1>
      <p>This example uses the local workspace build of the library.</p>
      {!clientId && (
        <p className="notice">
          Set NEXT_PUBLIC_LINKEDIN_CLIENT_ID in .env.local to enable login.
        </p>
      )}
      <button
        type="button"
        className="linkedinButton"
        onClick={handleLinkedInLogin}
        disabled={!clientId}
      >
        <Image src={linkedin} alt="Sign in with LinkedIn" width={180} />
      </button>
      {code && (
        <>
          <p>
            Authorization code received. Send it to your backend for the token
            exchange.
          </p>
          <p
            style={{
              overflowWrap: 'anywhere',
            }}
          >
            {code}
          </p>
        </>
      )}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </main>
  );
}
