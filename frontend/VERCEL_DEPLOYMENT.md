# Deploy frontend to Vercel

## Option 1: Vercel Dashboard (recommended)

1. Push your code to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Set **Root Directory** to `Full-stack-e-commerce-app-copy/frontend`.
5. Vercel auto-detects Vite. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**.

No environment variables are required. API and image requests are proxied to AWS via `vercel.json`.

## Option 2: Vercel CLI

```bash
cd Full-stack-e-commerce-app-copy/frontend
npm i -g vercel
vercel
```

## How it works

| Request | Handled by |
|---------|------------|
| `/api/*` | Vercel rewrite → AWS Elastic Beanstalk |
| `/images/*` | Vercel rewrite → AWS Elastic Beanstalk |
| `/checkout`, `/stripe`, etc. | SPA fallback → `index.html` |

## After deploy

1. Open your Vercel URL.
2. Confirm products load.
3. Test add to cart and checkout.

## Backend CORS

Set on AWS Elastic Beanstalk (`CORS_ORIGIN`):

```
*
```

Or include your Vercel URL:

```
https://your-app.vercel.app
```
