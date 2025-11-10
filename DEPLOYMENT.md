# Deployment Guide - Vercel

This guide will help you deploy the Smart Ridesharing Platform to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Sign in with your GitHub account
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Vite settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click "Deploy"

3. **Wait for deployment**
   - Vercel will install dependencies and build your project
   - Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment, run: `vercel --prod`

## Configuration

The project includes a `vercel.json` file with the following settings:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite

## Environment Variables

If you need to add environment variables:
1. Go to your project on Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables

## Post-Deployment

After deployment:
- Your app will be accessible at the Vercel-provided URL
- All routes will work correctly (Vercel handles SPA routing)
- The site will automatically rebuild on every push to your main branch

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes: `npm run build`
- Check Vercel build logs for specific errors

### Routing Issues
- Vercel automatically handles SPA routing for React Router
- If you encounter 404s, ensure `vercel.json` is configured correctly

### Environment Issues
- Make sure Node.js version is compatible (Vercel uses Node 18+ by default)
- Check that all required environment variables are set

## Support

For issues, check:
- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev

