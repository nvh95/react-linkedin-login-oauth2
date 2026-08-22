import { useState } from 'react';

import linkedin from '../assets/linkedin.png';
import { LinkedIn } from '../src/LinkedIn';

function LinkedInPage() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div>
      render props
      <br />
      <LinkedIn
        clientId="86uosml0bbk93k"
        redirectUri={`${window.location.origin}/linkedin`}
        onSuccess={(code) => {
          console.log(code);
          setCode(code);
        }}
        scope="openid profile email"
        onError={(error) => {
          console.log(error);
          setErrorMessage(error.errorMessage);
        }}
      >
        {({ linkedInLogin }) => (
          <img
            onClick={linkedInLogin}
            src={linkedin}
            alt="Sign in with Linked In"
            style={{ maxWidth: '180px', cursor: 'pointer' }}
          />
        )}
      </LinkedIn>
      {!code && <div>No code</div>}
      {code && <div>Code: {code}</div>}
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}

export default LinkedInPage;
