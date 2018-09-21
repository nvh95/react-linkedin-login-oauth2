import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, Redirect, Switch } from 'react-router';
import QueryString from 'query-string';

import { LinkedIn, LinkedInPopUp } from '../../src';

class Demo extends Component {
  constructor(props) {
    super(props);
    const params = QueryString.parse(window.location.search);
    this.state = {
      params,
      code: '',
      errorMessage: '',
    };
  }
  handleSuccess = (data) => {
    this.setState({ 
      code: data.code,
      errorMessage: '',
    });
  }
  handleFailure = (error) => {
    console.log('error', error);
    this.setState({
      code: '',
      errorMessage: error.errorMessage,
    });
  }
  render() {
    const { params, code, errorMessage } = this.state;
    if (params.code || params.error) {
      return (
        <LinkedInPopUp />
      );
    }
    return (
      <div>
        <h1>react-linkedin-login-oauth2 Demo</h1>
        <LinkedIn
          clientId="81lx5we2omq9xh"
          onFailure={this.handleFailure}
          onSuccess={this.handleSuccess}
          redirectUri="http://localhost:3000"
        />
        {!code && <div>No code</div>}
        {code && <div>Code: {code}</div>}
        {errorMessage && <div>{errorMessage}</div>}
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
