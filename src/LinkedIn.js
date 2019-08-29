import React, { Component } from "react";
import PropTypes from "prop-types";
import "../assets/index.css";

export class LinkedIn extends Component {
  static propTypes = {
    className: PropTypes.string,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    clientId: PropTypes.string.isRequired,
    redirectUri: PropTypes.string.isRequired,
    renderElement: PropTypes.func
  };

  componentWillUnmount() {
    window.removeEventListener("message", this.receiveMessage, false);
    if (this.popup && !this.popup.closed) this.popup.close();
  }

  popupCenter = (width, height) => {
    var left = (screen.width - width) / 2;
    var top = (screen.height - height) / 4;

    return (
      "resizable=yes, width=" +
      width +
      ", height=" +
      height +
      ", top=" +
      top +
      ", left=" +
      left
    );
  };

  getUrl = () => {
    const {
      redirectUri,
      clientId,
      state,
      scope,
      supportIE,
      redirectPath
    } = this.props;
    // TODO: Support IE 11
    const scopeParam = scope
      ? `&scope=${supportIE ? scope : encodeURI(scope)}`
      : "";
    const linkedInAuthenLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}${scopeParam}&state=${state}`;
    if (supportIE) {
      const redirectLink = `${
        window.location.origin
      }${redirectPath}?linkedin_redirect_url=${encodeURIComponent(
        linkedInAuthenLink
      )}`;
      return redirectLink;
    }
    return linkedInAuthenLink;
  };

  receiveMessage = event => {
    const { state } = this.props;
    if (event.origin === window.location.origin) {
      if (event.data.errorMessage && event.data.from === "Linked In") {
        // Prevent CSRF attack by testing state
        if (event.data.state !== state) {
          this.popup && this.popup.close();
          return;
        }
        this.props.onFailure(event.data);
        this.popup && this.popup.close();
      } else if (event.data.code && event.data.from === "Linked In") {
        // Prevent CSRF attack by testing state
        if (event.data.state !== state) {
          this.popup && this.popup.close();
          return;
        }
        this.props.onSuccess({ code: event.data.code });
        this.popup && this.popup.close();
      }
    }
  };

  handleConnectLinkedInClick = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.onClick && this.props.onClick();
    this.popup = window.open(
      this.getUrl(),
      "_blank",
      this.popupCenter(600, 600)
    );
    window.removeEventListener("message", this.receiveMessage, false);
    window.addEventListener("message", this.receiveMessage, false);
  };

  render() {
    const { className, disabled, children, renderElement } = this.props;
    if (renderElement) {
      return renderElement({
        onClick: this.handleConnectLinkedInClick,
        disabled
      });
    }
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
  className: "btn-linkedin",
  disabled: false,
  children: (
    <img
      src={require("../assets/linkedin.png")}
      alt="Log in with Linked In"
      style={{ maxWidth: "180px" }}
    />
  ),
  state: "fdsf78fyds7fm",
  supportIE: false,
  redirectPath: "/linkedin"
};
export default LinkedIn;
