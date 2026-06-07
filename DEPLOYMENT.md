# Modux Deployment Architecture

This document maps out the fully automated CI/CD deployment pipeline for Modux. This repository utilizes **Infrastructure as Code (IaC)**, meaning there are no manual deployment steps. Code is automatically built and shipped directly to production when merged into the `main` branch.

## 🚀 Live Environments
- **Frontend SPA**: [https://aayushjain0829.github.io/](https://aayushjain0829.github.io/)
- **Backend API**: [https://modux.onrender.com/](https://modux.onrender.com/)

---

## 🏗️ Backend Pipeline (Render)

Our Python FastAPI backend is hosted on Render using a declarative configuration file.

### Infrastructure Configuration
The entire environment is configured via [`render.yaml`](./render.yaml) located in the root of the project.
- **Trigger**: Render automatically listens to the `main` branch. Whenever code is merged into `main`, it spins up a new container.
- **Environment**: Python.
- **CORS Configuration**: It securely restricts API access specifically to your frontend URL using the `ALLOWED_ORIGINS` environment variable.
- **WebSocket Protocol**: Secure Websockets (`wss://`) are fully supported out-of-the-box by Render.

### Cold Starts
Because we are utilizing the free tier, Render will spin the backend down to 0 replicas after 15 minutes of inactivity. When the first user tries to join a game after a period of dormancy, it may take `30-60 seconds` for the backend to wake up and accept the WebSocket connection.

---

## 🎨 Frontend Pipeline (GitHub Pages)

Our React frontend is compiled using Vite and deployed instantly using GitHub Actions.

### Continuous Deployment Action
We use the modern GitHub Actions pipeline located at [`.github/workflows/deploy-frontend.yml`](./.github/workflows/deploy-frontend.yml).
- **Trigger**: Any push or PR merge into the `main` branch.
- **Build Process**: The action uses an Ubuntu runner to install `Node 20`, builds the React code (`npm run build`), and securely uploads the `dist` artifact directly into GitHub's internal Pages environment.
- **No Orphan Branches**: Historically, GitHub Pages required a dirty `gh-pages` branch. **We do not use this.** Our Actions pipeline deploys securely without needing a dedicated tracking branch.

### Client-Side Environment Variables
The frontend application dynamically detects the environment it is running in (`useGameSocket.js`). 
- If running locally (`localhost`), it points to `ws://localhost:8000`. 
- If deployed on GitHub Pages, it automatically routes connections to the secure `wss://modux.onrender.com` endpoint.

---

## ⚠️ Troubleshooting

1. **"The Frontend Deployed, but the layout is broken!"**
   - Wait 2-3 minutes and perform a hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`). Browsers heavily cache GitHub Pages static assets.
2. **"Connection Refused / WebSockets aren't connecting!"**
   - The Render backend is likely experiencing a "cold start". Wait 60 seconds and refresh the page.
   - If it persists, ensure that `ALLOWED_ORIGINS` in `render.yaml` exactly matches your frontend URL.
