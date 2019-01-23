import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../assets/index.css';

export class LinkedIn extends Component {
  static propTypes = {
    className: PropTypes.string,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    clientId: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage, false);
    if (this.popup && !this.popup.closed) this.popup.close();
  }

  getUrl = () => {
    const {redirectUri, clientId, state, scope} = this.props;
    // TODO: Support IE 11
    const scopeParam = (scope) ? `&scope=${encodeURI(scope)}` : ''
    const linkedInAuthenLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}${scopeParam}&state=${state}`;
    return linkedInAuthenLink;
  }

  receiveMessage = (event) => {
    if (event.origin === window.location.origin) {
      console.log('event data:', event.data);
      if (event.data.errorMessage && event.data.from === 'Linked In') {
        this.props.onFailure(event.data);
        this.popup && this.popup.close();
      } else if (event.data.code && event.data.from === 'Linked In') {
        this.props.onSuccess({ code: event.data.code });
        this.popup && this.popup.close();
      }
    }
  };

  handleConnectLinkedInClick = (e) => {
    console.log('handleConnectLinkedInClick');
    if (e) {
      e.preventDefault();
    }
    this.props.onClick && this.props.onClick();
    this.popup = window.open(this.getUrl(), '_blank', 'width=600,height=600');
    window.removeEventListener('message', this.receiveMessage, false);
    window.addEventListener('message', this.receiveMessage, false);
  }


  render() {
    const { className, disabled, children } = this.props;
    return (
      <button
        type="button"
        onClick={this.handleConnectLinkedInClick}
        className={className}
        disabled={disabled}
      >
        {children}
      </button>

    );
  }
}

LinkedIn.defaultProps = {
  className: 'btn-linkedin',
  disabled: false,
  children: (<img src={require('../assets/linkedin.png')} alt="Log in with Linked In" style={{ maxWidth: '180px' }} />),
  state: 'fdsf78fyds7fm',
};
export default LinkedIn;
