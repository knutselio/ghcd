# GHCD OAuth Proxy Worker

A minimal [Cloudflare Worker](https://workers.cloudflare.com/) that proxies the GitHub OAuth token exchange. This exists because GitHub's `/login/oauth/access_token` endpoint does not support CORS, so browsers cannot call it directly.

## What it does

1. Receives a POST from the GHCD frontend with the OAuth authorization `code`
2. Adds the `client_id` and `client_secret` (stored as Cloudflare secrets)
3. Forwards the request to GitHub's token endpoint
4. Returns the response with CORS headers

That's it — ~30 lines of code, no state, no database.

## Current deployment

This worker is deployed at `https://ghcd-oauth.tech-f18.workers.dev` and is configured for the GHCD OAuth App owned by the [knutselio](https://github.com/knutselio) organization.

## Deploying your own

If you're forking GHCD, you'll need your own worker and OAuth App:

1. [Create a GitHub OAuth App](https://github.com/settings/applications/new)
2. Install wrangler: `npm i -g wrangler`
3. Deploy the worker:

```sh
cd worker
wrangler login
wrangler secret put GITHUB_CLIENT_ID      # from your OAuth App
wrangler secret put GITHUB_CLIENT_SECRET   # from your OAuth App
wrangler deploy
```

4. Set `VITE_PUBLIC_OAUTH_PROXY_URL` to the worker URL in your environment

## Secrets

| Secret                 | Description             |
| ---------------------- | ----------------------- |
| `GITHUB_CLIENT_ID`     | OAuth App client ID     |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |

These are stored in Cloudflare, never in code.
