# Next.js example

This example uses Next.js 16, React 19, the App Router, and the local workspace version of `react-linkedin-login-oauth2`.

## Getting Started

From the repository root, install dependencies and build the library:

```shell
pnpm install
pnpm build
```

Create `examples/nextjs/.env.local` with your public LinkedIn Client ID:

```dotenv
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
```

Never put the LinkedIn Client Secret in this file with a `NEXT_PUBLIC_` prefix. Client Secrets and access-token exchanges belong only on your backend.

Start the example:

```shell
pnpm --filter react-linkedin-login-oauth2-nextjs-example dev
```

Open [http://localhost:3000](http://localhost:3000). Register `http://localhost:3000/linkedin` as an authorized redirect URL in the LinkedIn Developer Portal.

To create a production build:

```shell
pnpm --filter react-linkedin-login-oauth2-nextjs-example build
```
