import './globals.css';

export const metadata = {
  title: 'LinkedIn OAuth example',
  description: 'Next.js example for react-linkedin-login-oauth2',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
