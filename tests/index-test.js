import expect from "expect";
import React from "react";
import { shallow } from "enzyme";
import Component from "src/";

describe("Component", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Component />);
  });

  it("render successfully", () => {
    expect(wrapper.length).toBe(1);
  });
});
