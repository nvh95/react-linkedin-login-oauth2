import { LinkedInCallback } from '../src/LinkedInCallback';
import LinkedInPage from './LinkedInPageHook';
// import LinkedInPage from './LinkedInPageRenderProps';

function App() {
  if (window.location.pathname === '/linkedin') {
    return <LinkedInCallback />;
  }

  return <LinkedInPage />;
}

export default App;
