# Deploying to Vercel

## Option 1: Deploy via Vercel CLI (Quickest)

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the frontend folder:
   ```bash
   cd Full-stack-e-commerce-app-copy/frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing Vercel project or create new
   - Confirm build settings (should auto-detect Vite)
   - Deploy

## Option 2: Deploy via GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project" → Import your GitHub repo

4. Vercel will auto-detect Vite configuration

5. Deploy!

## Configuration Details

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **API Proxy**: All `/api/*` requests forward to your Elastic Beanstalk backend
- **Client-side Routing**: Configured to serve `index.html` for unknown routes

## Environment Variables (if needed)

Add in Vercel dashboard → Settings → Environment Variables:
- `BACKEND_URL`: (optional) Your backend API URL

## Verify Deployment

After deployment:
1. Visit your Vercel URL
2. Check that products load from the backend
3. Test adding items to cart
4. Check browser console for any errors
