# CI/CD Pipeline Setup Guide

This document provides a comprehensive guide to setting up and configuring the CI/CD pipeline for the GreenMate project.

## 📋 Overview

The CI/CD pipeline is built with GitHub Actions and includes:

- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Security**: Vulnerability scanning with Snyk and CodeQL
- **Testing**: Unit, integration, and E2E tests
- **Performance**: Lighthouse CI and bundle analysis
- **Deployment**: Automated deployments to staging and production
- **Monitoring**: Error tracking, performance monitoring
- **Maintenance**: Automated dependency updates and security audits

## 🚀 Quick Start

### Prerequisites

1. **GitHub Repository**: Ensure your code is in a GitHub repository
2. **Vercel Account**: For deployment (or configure alternative)
3. **Required Secrets**: Configure in GitHub repository settings

### Required GitHub Secrets

Navigate to your repository **Settings > Secrets and Variables > Actions** and add:

#### Deployment Secrets
```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here  
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

#### Monitoring & Analytics
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
CODECOV_TOKEN=your_codecov_token_here
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token_here
```

#### Security Scanning
```bash
SNYK_TOKEN=your_snyk_token_here
```

#### Notifications (Optional)
```bash
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
DISCORD_WEBHOOK=your_discord_webhook_here
STATUS_PAGE_WEBHOOK=your_status_page_webhook_here
DOCS_PAT=personal_access_token_for_docs_repo
```

### Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Set up Database**
   ```bash
   docker-compose up postgres redis -d
   npm run db:migrate
   npm run db:seed
   ```

## 🔧 Pipeline Configuration

### Workflow Files

The pipeline consists of several workflow files:

#### Main CI/CD Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Jobs**: Code quality, security, testing, building, deployment
- **Environments**: Staging (`develop` branch), Production (`main` branch)

#### Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: Push to `main`, Manual dispatch
- **Features**: Automatic versioning, changelog generation, Docker images
- **Outputs**: GitHub releases, Docker images, documentation updates

#### Dependency Updates (`.github/workflows/dependency-update.yml`)
- **Schedule**: Weekly on Mondays
- **Features**: Automated dependency updates, security patches
- **Auto-merge**: Safe minor updates with passing tests

### Pipeline Stages

#### 1. Code Quality (`code-quality`)
```yaml
- ESLint checks
- Prettier formatting
- TypeScript compilation
- Commit message validation (Conventional Commits)
- Super Linter validation
```

#### 2. Security Scanning (`security`)
```yaml
- npm audit for vulnerabilities
- Snyk security scan
- CodeQL static analysis
```

#### 3. Testing
- **Unit Tests** (`test-unit`): Jest with coverage reporting
- **Integration Tests** (`test-integration`): API and database tests
- **E2E Tests** (`test-e2e`): Playwright across multiple browsers

#### 4. Building (`build`)
```yaml
- Development build
- Production build
- Bundle analysis
- Artifact storage
```

#### 5. Performance Testing (`performance`)
```yaml
- Lighthouse CI audits
- Core Web Vitals monitoring
- Performance budget validation
```

#### 6. Deployment
- **Staging** (`deploy-staging`): Auto-deploy from `develop` branch
- **Production** (`deploy-production`): Auto-deploy from `main` branch with full test suite

#### 7. Post-Deployment
- **Health Checks**: API endpoint validation
- **Performance Monitoring**: Response time verification
- **Cleanup**: Old artifact removal

## 🔀 Branching Strategy

### Git Flow Model

```
main (production)
├── develop (staging)
│   ├── feature/user-auth
│   ├── feature/plant-management
│   └── hotfix/critical-bug
└── release/v1.2.0
```

### Branch Protection Rules

Configure these rules in **Settings > Branches**:

#### `main` branch:
- [x] Require a pull request before merging
- [x] Require approvals (1+)
- [x] Dismiss stale reviews when new commits are pushed
- [x] Require review from code owners
- [x] Require status checks to pass before merging
  - [x] `code-quality`
  - [x] `test-unit (18)`
  - [x] `test-integration`
  - [x] `build (production)`
- [x] Require branches to be up to date before merging
- [x] Require linear history
- [x] Restrict pushes that create files larger than 100MB

#### `develop` branch:
- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - [x] `code-quality`
  - [x] `test-unit (18)`

## 📊 Monitoring & Observability

### Error Tracking (Sentry)
- Automatic error capture and reporting
- Performance monitoring
- Release tracking
- User context and breadcrumbs

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size analysis
- Lighthouse CI integration
- Performance budget enforcement

### Code Coverage
- Unit test coverage with Codecov
- Coverage reports in PRs
- Coverage thresholds enforcement

## 🚨 Alerts & Notifications

### Slack Integration
```yaml
# Channels
#releases - New releases and deployments
#alerts - Failed builds, security issues
#ci-cd - General CI/CD notifications
```

### Discord Integration
- Release announcements
- Critical alerts
- Team notifications

### GitHub Notifications
- PR comments with deployment URLs
- Status checks and build results
- Automated issue creation for security vulnerabilities

## 🔒 Security Best Practices

### Secret Management
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Implement least-privilege access
- Never commit secrets to repository

### Dependency Security
- Weekly automated security audits
- Automatic vulnerability fixes
- Snyk integration for advanced scanning
- License compliance checking

### Build Security
- Multi-stage Docker builds
- Non-root container users
- Minimal base images
- Security scanning in CI

## 🐳 Docker & Containerization

### Multi-stage Dockerfile
```dockerfile
# Stages: deps → builder → runner
# Security: non-root user, minimal attack surface
# Performance: optimized layer caching
```

### Docker Compose
```yaml
# Development: Hot reloading, debugging tools
# Production: Optimized for performance
# Services: App, Database, Redis, MinIO, Monitoring
```

### Container Registry
- GitHub Container Registry (ghcr.io)
- Multi-architecture builds (AMD64, ARM64)
- Automated tagging and versioning

## 📈 Performance Optimization

### Bundle Analysis
- Automated bundle size tracking
- Webpack Bundle Analyzer integration
- Performance budget enforcement

### Core Web Vitals
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

### Lighthouse Audits
- Performance: 80+ score
- Accessibility: 90+ score
- Best Practices: 90+ score
- SEO: 90+ score

## 🔄 Automated Maintenance

### Dependency Updates
- **Schedule**: Weekly on Mondays
- **Types**: Security, Minor, Major updates
- **Auto-merge**: Safe minor updates only
- **Testing**: Full test suite before merge

### Security Audits
- **npm audit**: High-severity vulnerabilities
- **Snyk**: Advanced vulnerability detection
- **Automated fixes**: Security patches applied automatically

### Cleanup Tasks
- Old artifact removal (30-day retention)
- Stale branch cleanup
- Release cleanup (keep last 10 releases)

## 🚀 Deployment Strategies

### Staging Deployment
- **Trigger**: Push to `develop` branch
- **Environment**: Vercel preview deployment
- **Testing**: Basic test suite
- **Access**: Team and stakeholders

### Production Deployment
- **Trigger**: Push to `main` branch
- **Environment**: Vercel production
- **Testing**: Full test suite including E2E
- **Rollback**: Automatic on health check failure

### Feature Branches
- **Preview Deployments**: Automatic Vercel deployments
- **PR Comments**: Deployment URL added to PR
- **Testing**: Code quality and unit tests only

## 🛠️ Local Development Setup

### Docker Development
```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up app postgres redis

# View logs
docker-compose logs -f app

# Rebuild after changes
docker-compose up --build app
```

### Manual Setup
```bash
# Install dependencies
npm install

# Start database services
docker-compose up postgres redis -d

# Run migrations
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check Node.js version compatibility
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### 2. Test Failures
```bash
# Run tests locally
npm run test:unit
npm run test:integration
npm run test:e2e

# Check test database connection
npm run test:integration -- --verbose
```

#### 3. Deployment Issues
```bash
# Verify Vercel configuration
vercel --version
vercel login
vercel link

# Check environment variables
vercel env ls
```

#### 4. Docker Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check service logs
docker-compose logs service-name

# Reset volumes
docker-compose down -v
docker-compose up
```

### Getting Help

1. **Check Workflow Logs**: GitHub Actions tab for detailed error logs
2. **Review Documentation**: This guide and inline code comments
3. **Team Support**: Create GitHub issue with error details
4. **External Resources**: 
   - [GitHub Actions Documentation](https://docs.github.com/en/actions)
   - [Vercel Deployment Docs](https://vercel.com/docs)
   - [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Lighthouse Performance Budgets](https://web.dev/performance-budgets-101/)

---

**Need Help?** Create an issue in the repository or reach out to the development team.