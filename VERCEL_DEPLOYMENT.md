# HRMS Frontend Deployment Guide for Vercel

This guide explains how to deploy the HRMS frontend application to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account
2. The backend API already deployed and running
3. Node.js v18 or higher installed on your local machine

## Configuration Steps

### 1. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_APP_API_BASE_URL=https://your-backend-api-url.vercel.app/api/v1
```

Replace `https://your-backend-api-url.vercel.app/api/v1` with the actual URL of your deployed backend API.

### 2. Create a Vercel Configuration File

Create a `vercel.json` file in the root directory with the following content:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

This configuration ensures that your React application's client-side routing works correctly.

### 3. Update package.json

Ensure your `package.json` has the correct build script:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Deployment Methods

### Option 1: Using Vercel Dashboard (Recommended for First-Time Deployment)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click "New Project".
4. Import your repository.
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: (leave empty if your project is in the repository root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add the environment variables:
   - Click "Environment Variables"
   - Add `VITE_APP_API_BASE_URL` with the value of your backend API URL
7. Click "Deploy".

### Option 2: Using Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Navigate to your project directory:
   ```
   cd frontend-hrms
   ```

4. Deploy the project:
   ```
   vercel
   ```

5. Follow the prompts to link to an existing project or create a new one.

6. To deploy to production:
   ```
   vercel --prod
   ```

## Monitoring Your Deployment

After deployment:

1. Vercel provides a unique URL for your application.
2. You can add a custom domain in the Vercel project settings.
3. View deployment logs and environment variables in the Vercel dashboard.

## Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository:

1. Every push to the main branch triggers a production deployment.
2. Pull requests create preview deployments.

## Troubleshooting

If you encounter issues:

1. Check the build logs in the Vercel dashboard.
2. Ensure environment variables are set correctly.
3. Verify that your API base URL is correct and the backend is accessible.
4. If you see routing issues, ensure the `vercel.json` configuration is correct.

## Performance Optimization

For better performance:

1. Enable Vercel Edge Functions in the project settings.
2. Use Vercel's built-in Analytics to monitor performance.
3. Configure image optimization if you're using many images.

## Need More Help?

If you need further assistance with deployment, refer to [Vercel's documentation](https://vercel.com/docs) or contact the development team. 