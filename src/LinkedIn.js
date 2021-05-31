import React, { Component } from 'react';
import PropTypes from 'prop-types';

const getPopupPositionProperties = ({ width = 600, height = 600 }) => {
  const left = screen.width / 2 - width / 2;
  const top = screen.height / 2 - height / 2;
  return `left=${left},top=${top},width=${width},height=${height}`;
};

const generateRandomString = (length = 20) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const LINKEDIN_OAUTH2_STATE = 'linkedin_oauth2_state';

export class LinkedIn extends Component {
  static propTypes = {
    className: PropTypes.string,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    clientId: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
    renderElement: PropTypes.func,
  };

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage, false);
    if (this.popup && !this.popup.closed) this.popup.close();
  }

  getUrl = () => {
    const { redirectUri, clientId, scope, supportIE, redirectPath } =
      this.props;
    const scopeParam = `&scope=${supportIE ? scope : encodeURI(scope)}`;
    const state = generateRandomString();
    localStorage.setItem(LINKEDIN_OAUTH2_STATE, state);
    const linkedInAuthenLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}${scopeParam}&state=${state}`;
    if (supportIE) {
      const redirectLink = `${
        window.location.origin
      }${redirectPath}?linkedin_redirect_url=${encodeURIComponent(
        linkedInAuthenLink,
      )}`;
      return redirectLink;
    }
    return linkedInAuthenLink;
  };

  receiveMessage = (event) => {
    const state = localStorage.getItem(LINKEDIN_OAUTH2_STATE);
    if (event.origin === window.location.origin) {
      if (event.data.errorMessage && event.data.from === 'Linked In') {
        // Prevent CSRF attack by testing state
        if (event.data.state !== state) {
          this.popup && this.popup.close();
          return;
        }
        this.props.onFailure(event.data);
        this.popup && this.popup.close();
      } else if (event.data.code && event.data.from === 'Linked In') {
        // Prevent CSRF attack by testing state
        if (event.data.state !== state) {
          console.error('State does not match');
          this.popup && this.popup.close();
          return;
        }
        this.props.onSuccess({ code: event.data.code });
        this.popup && this.popup.close();
      }
    }
  };

  handleConnectLinkedInClick = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onClick && this.props.onClick();
    this.popup = window.open(
      this.getUrl(),
      '_blank',
      getPopupPositionProperties({ width: 600, height: 600 }),
    );
    window.removeEventListener('message', this.receiveMessage, false);
    window.addEventListener('message', this.receiveMessage, false);
  };

  render() {
    const { className, disabled, children, renderElement, style } = this.props;
    if (renderElement) {
      return renderElement({
        onClick: this.handleConnectLinkedInClick,
        disabled,
      });
    }
    return (
      <button
        type="button"
        onClick={this.handleConnectLinkedInClick}
        className={className}
        disabled={disabled}
        style={
          style
            ? style
            : {
                background: 'none',
                color: 'inherit',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
                outline: 'inherit',
              }
        }
      >
        {children}
      </button>
    );
  }
}

LinkedIn.defaultProps = {
  disabled: false,
  children: <button>Linked In</button>,
  supportIE: false,
  redirectPath: '/linkedin',
  scope: 'r_emailaddress',
};
export default LinkedIn;
