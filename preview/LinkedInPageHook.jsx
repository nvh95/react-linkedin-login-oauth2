import { useState } from 'react';

import linkedin from '../assets/linkedin.png';
import { useLinkedIn } from '../src/useLinkedIn';

function LinkedInPage() {
  const { linkedInLogin } = useLinkedIn({
    clientId: '86uosml0bbk93k',
    redirectUri: `${window.location.origin}/linkedin`,
    onSuccess: (code) => {
      console.log(code);
      setCode(code);
    },
    scope: 'openid profile email',
    onError: (error) => {
      console.log(error);
      setErrorMessage(error.errorMessage);
    },
  });
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLinkedInLogin = () => {
    setCode('');
    setErrorMessage('');
    linkedInLogin();
  };

  return (
    <div>
      hooks
      <br />
      <img
        onClick={handleLinkedInLogin}
        src={linkedin}
        alt="Sign in with Linked In"
        style={{ maxWidth: '180px', cursor: 'pointer' }}
      />
      {!code && <div>No code</div>}
      {code && <div>Code: {code}</div>}
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}

export default LinkedInPage;
