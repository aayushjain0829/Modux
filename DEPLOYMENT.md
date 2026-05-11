# Deployment Guide

This guide explains how to deploy Modux with backend on Render and frontend on GitHub Pages.

## Architecture

- **Backend**: FastAPI application hosted on Render
- **Frontend**: React application hosted on GitHub Pages
- **Communication**: WebSocket connections between frontend and backend

## Backend Deployment (Render)

### Prerequisites
- Render account (free tier available)
- GitHub repository connected to Render

### Steps

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the root directory

2. **Configure Service**
   - **Name**: `modux-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

3. **Environment Variables**
   - `ALLOWED_ORIGINS`: `https://aayushjain0829.github.io`
   - `PORT`: `10000`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your backend will be available at: `https://modux-backend.onrender.com`

### Alternative: Using render.yaml
The repository includes a `render.yaml` file that automatically configures the service when you connect your repository to Render.

## Frontend Deployment (GitHub Pages)

### Option 1: Automatic Deployment (Recommended)

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Source: Select "GitHub Actions"

2. **Push Changes**
   - The GitHub Actions workflow in `.github/workflows/deploy-frontend.yml` will automatically:
     - Build the frontend on push to main branch
     - Deploy to GitHub Pages
   - Your site will be available at: `https://aayushjain0829.github.io/Modux/`


## Configuration Details

### Backend CORS Configuration
The backend is configured to accept requests from:
- Local development: `http://localhost:3000`, `http://127.0.0.1:3000`
- Production: `https://aayushjain0829.github.io`

### Frontend WebSocket URLs
The frontend automatically detects the environment:
- **Local**: Connects to `ws://localhost:8000`
- **Production**: Connects to `wss://modux-backend.onrender.com`

### Vite Configuration
- **Base Path**: `/Modux/` (for GitHub Pages)
- **Output Directory**: `dist`
- **Assets Directory**: `assets`

## Important Notes

1. **WebSocket Connections**: Ensure your backend CORS settings allow your GitHub Pages domain
2. **Free Tier Limitations**: 
   - Render free tier spins down after 15 minutes of inactivity
   - Cold starts may take 30-60 seconds
3. **Environment Variables**: Update `ALLOWED_ORIGINS` if you change your GitHub Pages URL

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS settings in backend
   - Verify the backend URL in frontend code
   - Ensure backend is deployed and running

2. **Build Failures**
   - Check Node.js version (requires v18+)
   - Verify all dependencies are installed
   - Check build logs for specific errors

3. **Deployment Not Updating**
   - Clear GitHub Pages cache in repository settings
   - Wait for GitHub Actions to complete
   - Check if you're on the correct branch

### Testing Local Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Test with Production Backend**
   - The preview will use the production backend URL
   - Verify WebSocket connections work correctly

## URLs After Deployment

- **Frontend**: `https://aayushjain0829.github.io/Modux/`
- **Backend API**: `https://modux-backend.onrender.com`
- **Backend WebSocket**: `wss://modux-backend.onrender.com`

## Security Considerations

1. **CORS**: Only allow trusted origins
2. **Environment Variables**: Don't commit sensitive data
3. **WebSocket Security**: Use WSS in production
4. **Rate Limiting**: Consider implementing rate limiting for production

## Monitoring

- **Render**: Check dashboard for logs and metrics
- **GitHub Pages**: Check Actions tab for deployment status
- **Frontend**: Use browser dev tools for WebSocket debugging
