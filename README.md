# React Linked In Login Using OAuth 2.0
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm package][npm-badge]][npm]



[npm-badge]: https://img.shields.io/npm/v/react-linkedin-login-oauth2.png
[npm]: https://www.npmjs.org/package/react-linkedin-login-oauth2


Demo: https://stupefied-goldberg-b44ee5.netlify.app/

This package is used to get authorization code for Linked In Log in feature using OAuth2 in a easy way. After have the authorization code, you can send it to server to continue to get information needed. For more, please see at [Authenticating with OAuth 2.0 - Linked In](https://developer.linkedin.com/docs/oauth2)  
See [Usage](#usage) and [Demo](#demo) for instruction.  

## Table of contents
- [Changelog](#changelog)
- [Installation](#installation)
- [Overview](#overview)
- [Usage](#usage)
- [Support IE](#support-ie)
- [Demo](#demo)
- [Props](#props)
- [Issues](#issues)

## Changelog
See [CHANGELOG.md](https://github.com/nvh95/react-linkedin-login-oauth2/blob/master/CHANGELOG.md)

## Installation
```
npm install --save react-linkedin-login-oauth2
```

## Overview
We will create a Linked In button (using `LinkedIn` component), after clicking on this button, a popup window will show up and ask for the permission. After we accepted, the pop up window will redirect to a specified URI which should be routed to `LinkedInPopUp` component. It has responsible to notice our openning app the authorization code Linked In provides us. You can consider using `react-router-dom` as a possible solution.  

## Usage
First, we create a button and provide required props
```
import React, { Component } from 'react';

import { LinkedIn } from 'react-linkedin-login-oauth2';
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png'

class LinkedInPage extends Component {
  state = {
    code: '',
    errorMessage: '',
  };


  handleSuccess = (data) => {
    this.setState({
      code: data.code,
      errorMessage: '',
    });
  }

  handleFailure = (error) => {
    this.setState({
      code: '',
      errorMessage: error.errorMessage,
    });
  }
  
  render() {
    const { code, errorMessage } = this.state;
    return (
      <div>
        <LinkedIn
          clientId="81lx5we2omq9xh"
          onFailure={this.handleFailure}
          onSuccess={this.handleSuccess}
          redirectUri="http://localhost:3000/linkedin"
        >
          <img src={linkedin} alt="Log in with Linked In" style={{ maxWidth: '180px' }} />
        </LinkedIn>
        {!code && <div>No code</div>}
        {code && <div>Code: {code}</div>}
        {errorMessage && <div>{errorMessage}</div>}
      </div>
    );
  }
}

export default LinkedInPage;
```

Then we define a route to `redirect_url` and pass `LinkedInPopUp` to it as follow:
```
import React, { Component } from 'react';
import { LinkedInPopUp } from 'react-linkedin-login-oauth2';

import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LinkedInPage from './LinkedInPage';

class Demo extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch >
          <Route exact path="/linkedin" component={LinkedInPopUp} />
          <Route path="/" component={LinkedInPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}
```

### Usage with custom button
You can render your own component by provide `renderElement` as following example:
```
<LinkedIn
  clientId="81lx5we2omq9xh"
  onFailure={this.handleFailure}
  onSuccess={this.handleSuccess}
  redirectUri="http://localhost:3000/linkedin"
  renderElement={({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>Custom linkedin element</button>
  )}
/>
```
# Support IE

Earlier, this package might not work in IE11. The reason is that if popup and opener do not have same domain, popup cannot send message to opener. For more information about this, please visit [here](https://stackoverflow.com/questions/21070553/postmessage-still-broken-on-ie11). From `1.0.7`, we can bypass this by open a popup to our page, then redirect to Linked In authorization page, it should work fine. IE11 is supported in `1.0.7`. Following is step to support it. (If you don't have need to support IE, please ignore this part)  


1. Pass prop `supportIE` 
2. Pass `redirectPath`  which has path route to `LinkedinPopUp` component, default value is `/linkedin` (for above example, `<Route exact path="/linkedin" component={LinkedInPopUp} />` => `redirectPath="/linkedin"`)
```
<LinkedIn
  ...
  supportIE
  redirectPath="/linkedin"
  ...
/>
```

## Demo
- Source code: https://github.com/nvh95/react-linkedin-login-oauth2-demo/blob/master/src/App.js
- Online demo: [https://stupefied-goldberg-b44ee5.netlify.com/](https://stupefied-goldberg-b44ee5.netlify.com/)
## Props
`LinkedIn` component:  

| Parameter     | value    | is required | default                                                                            |
|---------------|----------|:-----------:|:----------------------------------------------------------------------------------:|
| clientId      | string   | yes         |                                                                                    |
| redirectUri   | string   | yes         |                                                                                    |
| scope         | string   | yes         | 'r_emailaddress'                                                                   |
|               |          |             | See your app scope in `https://www.linkedin.com/developers/apps/${yourAppId}/auth` |
| onSuccess     | function | yes         |                                                                                    |
| onFailure     | function | yes         |                                                                                    |
| className     | string   | no          | 'btn-linkedin'                                                                     |
| style         | object   | no          |                                                                                    |
| disabled      | boolean  | no          | false                                                                              |
| onClick       | function | no          |                                                                                    |
| children      | function | no          | Linked in Signin button                                                            |
| renderElement | function | no          | Render prop to use a custom element, use props.onClick                             |
| supportIE     | boolean  | no          | false                                                                              |
| redirectPath  | function | no          | /linkedin                                                                          |

Read more about props here [https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin/context#step-2-request-an-authorization-code](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin/context#step-2-request-an-authorization-code)

`LinkedinPopUp` component:  
No parameters needed  

## Issues  
Please create an issue at [https://github.com/nvh95/react-linkedin-login-oauth2/issues](https://github.com/nvh95/react-linkedin-login-oauth2/issues). I will spend time to help you.

#### Failed to minify the code from this file: ./node_modules/react-linkedin-login-oauth2/node_modules/query-string/index.js:8
Please upgrade `react-linkedin-login-oauth2` to latest version following
```
npm install --save react-linkedin-login-oauth2
```
## Known issue

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
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!