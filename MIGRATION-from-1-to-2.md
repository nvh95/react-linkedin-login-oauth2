### MIGRATION TO VERSION 2

`react-linkedin-login-oauth2` is rewritten using typescript and updated to use functional component with hooks. The API also changed to make it easier to integrate. In version 1, it comes with a default `Signin with Linked In` button. In version 2, you can use your own `Signin with Linked In` button. You cans still use the default image, which is bundled within the package at `react-linkedin-login-oauth2/assets/linkedin.png`.

- The `onSuccess` callback now have `code` as an argument (version 1 is `{code}`)
- The callback to handle error changed name from `onFailure` to `onError`

Given that in version 1, your code is similar to bellow:

```javascript
import { LinkedIn } from 'react-linkedin-login-oauth2';

function LoginWithLinked() {
  const handleSuccess = (data) => {
    console.log(data.code);
  };
  const handleFailure = (error) => {
    console.log(error.errorMessage);
  };
  return (
    <LinkedIn
      clientId="your-client-id"
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      redirectUri="http://localhost:3000/linkedin"
      renderElement={({ onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled}>
          Signin with Linkedin
        </button>
      )}
    />
  );
}
```

In version 2, you can use it with hooks like this:

```javascript
import { useLinkedIn } from 'react-linkedin-login-oauth2';
// You can still use default image provided by the package
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';

function LoginWithLinked() {
  const { linkedInLogin } = useLinkedIn({
    clientId: 'your-client-id',
    redirectUri: 'http://localhost:3000/linkedin',
    onSuccess: (code) => {
      // Change from `data.code` to `code`
      console.log(code);
    },
    // Change from `onFailure` to `onError`
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <img
      src={linkedin}
      alt="Log in with Linked In"
      style={{ maxWidth: '180px' }}
      // Pass `linkedInLogin` to `onClick` handler
      onClick={linkedInLogin}
    />
  );
}
```

If you do not like hooks, you can use render props:

```diff
import { LinkedIn } from 'react-linkedin-login-oauth2';

function LoginWithLinked() {
  const handleSuccess = (data) => {
    console.log(data.code);
  };
  const handleFailure = (error) => {
    console.log(error.errorMessage);
  };
  return (
    <LinkedIn
      clientId="your-client-id"
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      redirectUri="http://localhost:3000/linkedin"
-     renderElement={({ onClick, disabled }) => (
-       <button onClick={onClick} disabled={disabled}>
+    >
+      {({ linkedInLogin }) => (
+        <button onClick={linkedInLogin}>
          Signin with Linkedin
        </button>
      )}
-   />
+   </LinkedIn>
  );
}
```
