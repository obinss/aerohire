# ✈️ AeroHire — Executive Career Intelligence

A polyglot monorepo for executive career management, powered by Next.js, FastAPI, and AI.

## 📁 Structure

- **`apps/web`**: Next.js frontend (App Router, Tailwind CSS).
- **`apps/api`**: FastAPI backend (Python 3.11, Prisma, Celery, Playwright).
- **`packages/db`**: Shared Prisma schema (PostgreSQL).
- **`infra`**: Docker Compose production infrastructure.

## 🚀 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   ```

2. **Setup Database:**
   ```bash
   cp .env.example .env
   # Edit .env with your local credentials
   npm run db:push -w @aerohire/db
   ```

3. **Run Application:**
   ```bash
   npm run dev
   ```

## 🌍 Production Deployment

### 1. Server Preparation
- **Docker & Docker Compose:** Ensure they are installed on the target machine.
- **DNS:** Point your domain (`aerohire.app` or similar) to the server's IP.
- **Ports:** Ensure ports 80 and 443 are open.

### 2. Environment Variables
Copy `.env.example` to your server and fill in the production secrets:
- `POSTGRES_PASSWORD`: Use a strong password.
- `JWT_SECRET`: Use a strong secret.
- `OPENAI_API_KEY`: Required for AI features.
- `DOMAIN`: Your actual domain.

### 3. Deploy via Docker Compose
The project is configured for a single-server deployment using Docker Compose:

```bash
cd infra
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Automated Deployment (CI/CD)
The project includes a GitHub Actions workflow in `.github/workflows/main.yml`. To enable it:
1. Add the following secrets to your GitHub repository:
   - `DEPLOY_HOST`: Server IP.
   - `DEPLOY_USER`: SSH user (e.g., `root` or `ubuntu`).
   - `DEPLOY_SSH_KEY`: Your SSH private key.
   - `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, `OPENAI_API_KEY`, etc.
2. Push to the `main` branch to trigger a build and deploy.

## 🛠 Features

- **AI-Powered Matching:** Uses OpenAI and LangChain to score resumes against job descriptions.
- **Automated Scraping:** Uses Playwright to ingest job data from multiple sources.
- **Background Tasks:** Celery + Redis for scraping and AI processing.
- **Secure Auth:** JWT-based authentication with FastAPI.
- **Modern UI:** Responsive Next.js application with Framer Motion and Lucide.
