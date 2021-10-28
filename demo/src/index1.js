import React, { Component } from "react";
import { render } from "react-dom";
import { parse } from "../../src/utils";
import { LinkedInCallback } from "../../src";
import LinkedInPage from "./LinkedInPage";

class Demo1 extends Component {
  render() {
    const params = parse(window.location.search);
    if (params.code || params.error) {
      return <LinkedInCallback />;
    }
    return <LinkedInPage />;
  }
}

render(<Demo1 />, document.querySelector("#demo"));
