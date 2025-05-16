# Environment Configuration Guide

This document explains how to configure environment variables for the HRMS frontend application, particularly the API URL for different deployment environments.

## Available Environment Variables

The HRMS frontend application uses the following environment variables:

- `VITE_API_URL`: The base URL for the backend API
- `VITE_APP_NAME`: The name of the application
- `VITE_APP_VERSION`: The version of the application

## Environment Files

The project includes several environment file templates:

1. `.env`: Default environment variables for local development
2. `.env.example`: Example template showing available environment variables
3. `.env.production`: Template for production deployment settings

## Development Environment

For local development, update the `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HRMS
VITE_APP_VERSION=v1
```

## Production Environment

When deploying to production, create a `.env.production` file or set the environment variables in your hosting platform:

```
VITE_API_URL=https://api.your-production-domain.com/api/v1
VITE_APP_NAME=HRMS
VITE_APP_VERSION=v1
```

## Deployment Instructions

### Netlify Deployment

1. In your Netlify dashboard, go to your site settings
2. Navigate to "Build & deploy" > "Environment"
3. Add the following environment variables:
   - Key: `VITE_API_URL`
   - Value: `https://api.your-production-domain.com/api/v1`

### Vercel Deployment

1. In your Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add the following environment variables:
   - Name: `VITE_API_URL`
   - Value: `https://api.your-production-domain.com/api/v1`

### Docker Deployment

When running in Docker, pass the environment variables using the `-e` flag:

```
docker run -e VITE_API_URL=https://api.your-production-domain.com/api/v1 your-docker-image
```

Or in a docker-compose.yml file:

```yaml
services:
  frontend:
    image: your-docker-image
    environment:
      VITE_API_URL: https://api.your-production-domain.com/api/v1
```

## Verifying Configuration

You can verify that the environment variables are correctly configured by checking the console logs in your browser's developer tools. The application logs the API URL it's using on startup:

```
API URL: https://api.your-production-domain.com/api/v1
```

## Troubleshooting

If the application cannot connect to the API:

1. Verify that the `VITE_API_URL` environment variable is correctly set
2. Ensure that the API server is running and accessible from the client
3. Check for CORS issues if the frontend and backend are on different domains
4. Verify network connectivity between the client and the API server 