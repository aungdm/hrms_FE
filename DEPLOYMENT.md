# HRMS Deployment Guide

This guide explains how to deploy the HRMS frontend application to production environments and configure the API URL.

## Environment Variables

The HRMS frontend application uses environment variables to configure the API URL and other settings. The most important variable is:

- `VITE_API_URL` / `VITE_BASE_URL`: The base URL for the backend API (both variables are supported for backward compatibility)

## Deployment Options

### Option 1: Environment Files

Create a `.env.production` file in the project root before building the application:

```
# API Configuration
VITE_API_URL=https://api.your-production-domain.com/api/v1
VITE_BASE_URL=https://api.your-production-domain.com/api/v1

# App Configuration
VITE_APP_NAME=HRMS
VITE_APP_VERSION=v1
```

Then build the application with:

```
npm run build
```

### Option 2: Netlify Deployment

1. Connect your repository to Netlify
2. In the Netlify dashboard, go to your site settings
3. Navigate to "Build & deploy" > "Environment"
4. Add the following environment variables:
   - Key: `VITE_API_URL`
   - Value: `https://api.your-production-domain.com/api/v1`
   - Key: `VITE_BASE_URL`
   - Value: `https://api.your-production-domain.com/api/v1`

### Option 3: Vercel Deployment

1. Connect your repository to Vercel
2. In the Vercel dashboard, go to your project settings
3. Navigate to "Environment Variables"
4. Add the following environment variables:
   - Name: `VITE_API_URL`
   - Value: `https://api.your-production-domain.com/api/v1`
   - Name: `VITE_BASE_URL`
   - Value: `https://api.your-production-domain.com/api/v1`

### Option 4: Docker Deployment

When running in Docker, pass the environment variables using the `-e` flag:

```
docker run -e VITE_API_URL=https://api.your-production-domain.com/api/v1 -e VITE_BASE_URL=https://api.your-production-domain.com/api/v1 your-docker-image
```

Or in a docker-compose.yml file:

```yaml
services:
  frontend:
    image: your-docker-image
    environment:
      VITE_API_URL: https://api.your-production-domain.com/api/v1
      VITE_BASE_URL: https://api.your-production-domain.com/api/v1
```

## Verifying Configuration

You can verify that the environment variables are correctly configured by checking the console logs in your browser's developer tools. The application logs the API URL it's using on startup:

```
API URL: https://api.your-production-domain.com/api/v1
```

## Troubleshooting

If the application cannot connect to the API:

1. Verify that the `VITE_API_URL` or `VITE_BASE_URL` environment variable is correctly set
2. Ensure that the API server is running and accessible from the client
3. Check for CORS issues if the frontend and backend are on different domains
4. Verify network connectivity between the client and the API server
