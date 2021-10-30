import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { LinkedInCallback } from '../src/LinkedInCallback';
// import LinkedInPage from './LinkedInPageHook';
import LinkedInPage from './LinkedInPageRenderProps';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/linkedin" component={LinkedInCallback} />
        <Route path="/" component={LinkedInPage} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
