# 3.0.0

## Breaking changes

- Use LinkedIn's current OpenID Connect scopes, `openid profile email`, by default
- Warn when a custom scope omits `openid` without blocking the authorization flow; applications that still depend on the deprecated `r_emailaddress` or `r_liteprofile` flow should remain on version 2
- Normalize space-delimited, `%20`-encoded, comma-delimited, and `+`-delimited scope values before creating the authorization URL
- Remove the runtime legacy-flow deprecation warning introduced in version 2.1

## Documentation

- Add a version 2 to version 3 migration guide
- Document the OpenID Connect ID token and UserInfo response alongside the existing server-side authorization-code exchange guidance

## Testing

- Add V8 coverage reports and enforce minimum coverage in local development and continuous integration
- Cover callback success and error responses, render-props forwarding, popup failures, state validation, scope normalization, and random state formatting

# 2.1.0

## Features

- Add configurable `popupWidth` and `popupHeight` options with 600px defaults
- Support React 19 and correct the React 16 peer minimum to 16.14 for the automatic JSX runtime

## Fixes

- Prevent a completed login from also reporting `user_closed_popup`
- Report blocked and failed popup attempts through `onError`
- Generate OAuth state with the Web Crypto API and remove it after completion
- Build and parse OAuth URLs with the browser URL APIs
- Validate callback messages against both the application origin and popup window

## Build

- Switch the package build from Rollup to Rolldown
- Use pnpm for dependency management and project scripts
- Replace Jest with Vitest and remove the Babel-based test pipeline
- Upgrade the development toolchain to Vite 8, TypeScript 6, ESLint 10, and React 19
- Remove unused Babel, Sass, Rimraf, and preview router dependencies
- Add `build:preview` for generating the deployable Vite preview in `preview/dist`
- Declare the TypeScript entry point and mark the package as side-effect free
- Modernize the Next.js example to Next.js 16, React 19, the App Router, and pnpm
- Add GitHub Actions checks for tests, types, linting, package builds, packing, and the preview
- Use Node.js 24 for development and continuous integration

## Documentation

- Explain that the library returns an authorization code that applications must exchange on their backend
- Warn against exposing the LinkedIn Client Secret in browser code
- Update the React Router and Next.js callback examples

## Deprecations

- Warn when the deprecated `r_emailaddress` or `r_liteprofile` Sign In with LinkedIn scopes are used. They remain supported in the 2.x line for existing applications.

# 2.0.1

## Features

- Support React 18

# 2.0.0

## Features

[Pull Request](https://github.com/nvh95/react-linkedin-login-oauth2/pull/50)

- Rewritten in typescript
- Use functional component
- Use rollup
- Fix bugs on Next.js
- Drop IE support
- Drop default UI
- Bring back `state` parameter (optional, randomly generate `state` by default)

# 1.0.10

## Features

- Support React ^17.x

# 1.0.9

## Features

- Remove prop `state`. It's generated automatically
- Add `style` prop

## Fixes

- Remove `index.css` to fix #13, #30

## Chores

- Remove default class `btn-linkedin`
- Inline button style. (TODO: To use children as renderElement in 2.x)
- Update README to use image from `react-linkedin-login-oauth2/assets/linkedin.png`

# 1.0.8

## Fixes

- Make `scope` to be a required property with default value of `r_emailaddress`
- Make the pop up center of the screen
- Update demo link in README.md
- Update scope for demo

# 1.0.7

## Features

- Be able to render custom element (Thank @YBeck for your contribution)
- Support IE11, please see #support-ie in README.md for more detail
- Check `state` to avoid CSRF attack

## Fixes

- Remove unnecessary `console.log`
