import { Component } from 'react';
import QueryString from 'query-string';

class LinkedInPopUp extends Component {
  componentDidMount() {
    const params = QueryString.parse(window.location.search);
    if (params.error) {
      const errorMessage = params.error_description || 'Login failed. Please try again.';
      window.opener && window.opener.postMessage({ error: params.error, errorMessage, from: 'Linked In' }, window.location.origin);
      // Close tab if user cancelled login
      if (params.error === 'user_cancelled_login') {
        window.close();
      }
    }
    if (params.code) {
      console.log('sending code', params.code);
      window.opener && window.opener.postMessage({ code: params.code, from: 'Linked In' }, window.location.origin);
    }
  }
  render() {
    return null;
  }
}

export default LinkedInPopUp;
