# React Linked In Login Using OAuth 2.0

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-11-orange.svg?style=flat-square)](#contributors-)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm package][npm-badge]][npm]
[![npm](https://img.shields.io/npm/dt/react-linkedin-login-oauth2)](https://www.npmjs.com/package/react-linkedin-login-oauth2)

[npm-badge]: https://img.shields.io/npm/v/react-linkedin-login-oauth2.png
[npm]: https://www.npmjs.org/package/react-linkedin-login-oauth2

Demo: https://stupefied-goldberg-b44ee5.netlify.app/

> [!WARNING]
> LinkedIn deprecated the legacy **Sign In with LinkedIn** product on August 1, 2023. Version 2 of this library is maintained for existing applications that still use the legacy `r_emailaddress` and `r_liteprofile` scopes. If you are creating a new application, use version 3 of this library with [Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2).

This library completes the browser portion of LinkedIn's OAuth 2.0 authorization flow and returns an **authorization code**. It does not exchange that code for an access token. Your application must send the code to its backend, where the backend exchanges it with LinkedIn using the application's client secret. See [Exchange the authorization code](#exchange-the-authorization-code).

## Table of contents

- [React Linked In Login Using OAuth 2.0](#react-linked-in-login-using-oauth-20)
  - [Table of contents](#table-of-contents)
  - [Changelog](#changelog)
  - [Installation](#installation)
  - [Overview](#overview)
  - [Usage](#usage)
  - [Exchange the authorization code](#exchange-the-authorization-code)
  - [Security](#security)
- [Support IE](#support-ie)
  - [Demo](#demo)
  - [Props](#props)
  - [Issues](#issues)
    - [Failed to minify the code from this file: ./node\_modules/react-linkedin-login-oauth2/node\_modules/query-string/index.js:8](#failed-to-minify-the-code-from-this-file-node_modulesreact-linkedin-login-oauth2node_modulesquery-stringindexjs8)
  - [Known issue](#known-issue)
  - [Migration guide](#migration-guide)
  - [Contributors ✨](#contributors-)

## Changelog

See [CHANGELOG.md](https://github.com/nvh95/react-linkedin-login-oauth2/blob/master/CHANGELOG.md)

## Installation

For a new application, install version 3 or above and use LinkedIn's OpenID Connect flow:

```shell
pnpm add react-linkedin-login-oauth2@^3
```

Only existing applications that depend on the deprecated legacy scopes should install version 2:

```shell
pnpm add react-linkedin-login-oauth2@^2
```

## Overview

Call `linkedInLogin` using `useLinkedIn` (recommended) or the `LinkedIn` render-props component. A popup asks the member to authorize your application. LinkedIn then redirects the popup to your `redirectUri`, where `LinkedInCallback` sends the authorization code back to the original window. Your `onSuccess` callback receives that code.

The authorization code is not an access token and cannot be used directly to call LinkedIn APIs. Send it to your backend immediately and exchange it as described below.

## Usage

First, we create a button and provide required props:

```js
import { useLinkedIn } from 'react-linkedin-login-oauth2';
// You can use provided image shipped by this package or using your own
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';

function LinkedInPage() {
  const { linkedInLogin } = useLinkedIn({
    clientId: '86vhj2q7ukf83q',
    redirectUri: `${window.location.origin}/linkedin`, // for Next.js, you can use `${typeof window === 'object' && window.location.origin}/linkedin`
    onSuccess: (code) => {
      // Send the authorization code to your own backend.
      fetch('/api/auth/linkedin/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
    },
    onError: (error) => {
      console.log(error);
    },
    popupWidth: 700,
    popupHeight: 700,
  });

  return (
    <img
      onClick={linkedInLogin}
      src={linkedin}
      alt="Sign in with Linked In"
      style={{ maxWidth: '180px', cursor: 'pointer' }}
    />
  );
}
```

If you do not want to use hooks, the library also provides a render-props component:

```js
import { LinkedIn } from 'react-linkedin-login-oauth2';
// You can use provided image shipped by this package or using your own
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';

function LinkedInPage() {
  return (
    <LinkedIn
      clientId="86vhj2q7ukf83q"
      redirectUri={`${window.location.origin}/linkedin`}
      onSuccess={(code) => {
        console.log(code);
      }}
      onError={(error) => {
        console.log(error);
      }}
      popupWidth={700}
      popupHeight={700}
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
  );
}
```

Render `LinkedInCallback` at the path configured as your `redirectUri`. You can use [React Router](https://reactrouter.com/start/declarative/routing) or [Next.js routing](https://nextjs.org/docs/app/getting-started/layouts-and-pages).

- React Router:

```js
import { LinkedInCallback } from 'react-linkedin-login-oauth2';
import { BrowserRouter, Route, Routes } from 'react-router';

function Demo() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/linkedin" element={<LinkedInCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- Next.js App Router:

```js
// app/linkedin/page.js
'use client';

import { LinkedInCallback } from 'react-linkedin-login-oauth2';

export default function LinkedInCallbackPage() {
  return <LinkedInCallback />;
}
```

## Exchange the authorization code

The `code` passed to `onSuccess` is short-lived. Your application should complete these steps immediately:

1. Send the code from the browser to an endpoint on your own backend over HTTPS.
2. From the backend, send a form-encoded `POST` request to `https://www.linkedin.com/oauth/v2/accessToken`.
3. Include `grant_type`, `code`, `client_id`, `client_secret`, and the same `redirect_uri` used for authorization.
4. Check LinkedIn's response and securely store or use the returned access token on the backend.
5. Create your application's own login session, preferably using a secure, HTTP-only cookie.

The token exchange must run on a server. For example:

```js
// Server-side code only. Do not include this function in a browser bundle.
async function exchangeLinkedInCode(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
  });

  const response = await fetch(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`LinkedIn token exchange failed: ${response.status}`);
  }

  return response.json();
}
```

Your `/api/auth/linkedin/exchange` handler should call this function with the authorization code received from the browser. Validate the request, handle LinkedIn errors, associate the LinkedIn identity with the correct user, and avoid returning the LinkedIn access token to browser code unless your architecture specifically requires it.

See LinkedIn's official [Authorization Code Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow) documentation for the request fields, response format, token lifetime, and refresh behavior.

## Security

> [!CAUTION]
> Never put your LinkedIn Client Secret in frontend source code or expose it to the browser. Do not store it in `VITE_*`, `NEXT_PUBLIC_*`, or `REACT_APP_*` environment variables, browser storage, query strings, or the published JavaScript bundle. Anyone using the application can inspect those values.

The LinkedIn Client ID is public and may be passed to this library. The Client Secret must remain on your backend, ideally in a server-side environment variable or secret manager. Only your backend should exchange authorization codes for access tokens. Keep the returned access token secure and, where possible, use it from the backend rather than exposing it to the browser.

# Support IE

- Support for IE is dropped from version `2`

## Demo

- Source code: https://github.com/nvh95/react-linkedin-login-oauth2-demo/blob/master/src/App.js
- In action: [https://stupefied-goldberg-b44ee5.netlify.app/](https://stupefied-goldberg-b44ee5.netlify.app/)

## Props

- `LinkedIn` component:

| Parameter         | value    | is required |                                                                                             default                                                                                              |
| ----------------- | -------- | :---------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| clientId          | string   |     yes     |                                                                                                                                                                                                  |
| redirectUri       | string   |     yes     |                                                                                                                                                                                                  |
| onSuccess         | function |     yes     |                                                                                                                                                                                                  |
| onError           | function |     no      |                                                                                                                                                                                                  |
| state             | string   |     no      |                                                                   randomly generated string (recommend to keep default value)                                                                    |
| scope             | string   |     no      |                                                                                         'r_emailaddress'                                                                                         |
|                   |          |             | See LinkedIn's [OAuth permission documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication#member-auth-permissions). Separate multiple scopes with a space. |
| popupWidth        | number   |     no      |                                                                                               600                                                                                                |
| popupHeight       | number   |     no      |                                                                                               600                                                                                                |
| closePopupMessage | string   |     no      |                                                                                     'User closed the popup'                                                                                      |
| children          | function |     no      |                                                                   Required when using the `LinkedIn` component (render props)                                                                    |

Reference: [LinkedIn Authorization Code Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow#step-2-request-an-authorization-code)

- `LinkedInCallback` component:  
  No parameters needed

## Issues

Please create an issue at [https://github.com/nvh95/react-linkedin-login-oauth2/issues](https://github.com/nvh95/react-linkedin-login-oauth2/issues). I will spend time to help you.

#### Failed to minify the code from this file: ./node_modules/react-linkedin-login-oauth2/node_modules/query-string/index.js:8

Please upgrade `react-linkedin-login-oauth2` to latest version following

Follow the version-specific commands in [Installation](#installation).

## Known issue

## Migration guide

Upgrading an existing integration from version 1? See the [version 1 to version 2 migration guide](./MIGRATION-from-1-to-2.md).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://hung.dev"><img src="https://avatars.githubusercontent.com/u/8603085?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hung Viet Nguyen</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=nvh95" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Songuku95"><img src="https://avatars.githubusercontent.com/u/9360548?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nguyễn Duy Khánh</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=Songuku95" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/YBeck"><img src="https://avatars.githubusercontent.com/u/28867948?v=4?s=100" width="100px;" alt=""/><br /><sub><b>YBeck</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=YBeck" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mehdirazajaffri"><img src="https://avatars.githubusercontent.com/u/10342757?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mehdi Raza</b></sub></a><br /><a href="#ideas-mehdirazajaffri" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/phillipdenness/"><img src="https://avatars.githubusercontent.com/u/7850970?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Phillip Denness</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/issues?q=author%3AphillipDenness" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/deepdil-sp"><img src="https://avatars.githubusercontent.com/u/39123166?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dsp.iam</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/issues?q=author%3Adeepdil-sp" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/vitalii-bulyzhyn"><img src="https://avatars.githubusercontent.com/u/46309116?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vitalii Bulyzhyn</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=vitalii-bulyzhyn" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/pradeeptinku"><img src="https://avatars.githubusercontent.com/u/8938131?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pradeep Reddy Guduru</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/issues?q=author%3Apradeeptinku" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://linkedin.com/in/uric-bonatti-cardoso-820275132/"><img src="https://avatars.githubusercontent.com/u/43557914?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Uric Bonatti Cardoso</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/issues?q=author%3Auricbonatti" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/faisalur-rehman"><img src="https://avatars.githubusercontent.com/u/66237466?v=4?s=100" width="100px;" alt=""/><br /><sub><b>faisalur-rehman</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=faisalur-rehman" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/asanovr"><img src="https://avatars.githubusercontent.com/u/6459461?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ruslan</b></sub></a><br /><a href="https://github.com/nvh95/react-linkedin-login-oauth2/commits?author=asanovr" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
