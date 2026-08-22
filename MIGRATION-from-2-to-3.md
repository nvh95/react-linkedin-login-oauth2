# Migrating from version 2 to version 3

Version 3 targets **Sign in with LinkedIn using OpenID Connect**. LinkedIn deprecated the legacy Sign In with LinkedIn product and its `r_liteprofile` and `r_emailaddress` scopes on August 1, 2023.

## 1. Enable the OpenID Connect product

In the LinkedIn Developer Portal, open your application and request the **Sign in with LinkedIn using OpenID Connect** product from the Products tab. Confirm that the callback URL used by your application is registered as an authorized redirect URL.

## 2. Upgrade the package

```shell
pnpm add react-linkedin-login-oauth2@^3
```

Version 3 changes the default scope from `r_emailaddress` to `openid profile email`. If you omit `scope`, no source-code change is needed:

```js
const { linkedInLogin } = useLinkedIn({
  clientId,
  redirectUri,
  onSuccess,
  onError,
});
```

If you provide `scope`, replace the legacy scopes and make sure `openid` is included:

```diff
- scope: 'r_liteprofile r_emailaddress'
+ scope: 'openid profile email'
```

The `profile` and `email` scopes may be omitted when your application does not need those claims. Version 3 warns when `openid` is missing because LinkedIn requires it for OpenID Connect, but the library does not block the authorization flow.

## 3. Handle the token response on your backend

The browser API is unchanged: `onSuccess` receives an authorization code. Send it to your backend and exchange it at LinkedIn's token endpoint. With the OpenID Connect scopes, the successful token response includes an ID token in addition to the access token.

Validate the ID token on your backend using LinkedIn's OpenID Connect discovery metadata and signing keys. At minimum, validate its signature, issuer, audience, and expiration. Do not treat an unverified, decoded JWT payload as an authenticated identity.

You can use the verified ID token claims or call `https://api.linkedin.com/v2/userinfo` with the access token. The `email` and `email_verified` claims are optional, so handle their absence.

Never put the LinkedIn Client Secret or token-exchange logic in browser code.

## Staying on the legacy flow

Existing applications that cannot migrate from `r_liteprofile` or `r_emailaddress` yet should remain on the latest version 2 release:

```shell
pnpm add react-linkedin-login-oauth2@^2
```

LinkedIn no longer supports the legacy product for new applications.
