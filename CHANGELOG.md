## 2.x

### Features

[Pull Request](https://github.com/nvh95/react-linkedin-login-oauth2/pull/50)

- Rewritten in typescript
- Use functional component
- Use rollup
- Fix bugs on Next.js
- Drop IE support
- Drop default UI
- Bring back `state` parameter (optional, randomly generate `state` by default)

## 1.0.10

### Features

- Support React ^17.x

## 1.0.9

### Features

- Remove prop `state`. It's generated automatically
- Add `style` prop

### Fixes

- Remove `index.css` to fix #13, #30

### Chores

- Remove default class `btn-linkedin`
- Inline button style. (TODO: To use children as renderElement in 2.x)
- Update README to use image from `react-linkedin-login-oauth2/assets/linkedin.png`

## 1.0.8

### Fixes

- Make `scope` to be a required property with default value of `r_emailaddress`
- Make the pop up center of the screen
- Update demo link in README.md
- Update scope for demo

### 1.0.7

### Features

- Be able to render custom element (Thank @YBeck for your contribution)
- Support IE11, please see #support-ie in README.md for more detail
- Check `state` to avoid CSRF attack

### Fixes

- Remove unnecessary `console.log`
