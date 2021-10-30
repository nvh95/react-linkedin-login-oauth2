import React from 'react';

import { useLinkedIn } from '../src/useLinkedIn';
import linkedin from '../assets/linkedin.png';

function LinkedInPage() {
  const { linkedInLogin } = useLinkedIn({
    clientId: '86vhj2q7ukf83q',
    redirectUri: `${window.location.origin}/linkedin`,
    onSuccess: (code) => {
      console.log(code);
      setCode(code);
    },
    scope: 'r_emailaddress',
    onError: (error) => {
      console.log(error);
      setErrorMessage(error.errorMessage);
    },
  });
  const [code, setCode] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  return (
    <div>
      <div style={{ cursor: 'pointer' }} onClick={linkedInLogin}>
        <img
          src={linkedin}
          alt="Log in with Linked In"
          style={{ maxWidth: '180px' }}
        />
      </div>

      {!code && <div>No code</div>}
      {code && <div>Code: {code}</div>}
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}

export default LinkedInPage;
