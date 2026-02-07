# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing and validation of pull requests.

## 🚀 Workflows

### 1. Backend CI (`backend-ci.yml`)
**Purpose**: Build and test the Spring Boot backend

**Triggers**: Pull requests that modify `timetable-app-backend/**`

**What it does**:
- ✅ Sets up Java 21 with Maven caching
- ✅ Starts PostgreSQL 16 service for tests
- ✅ Runs `mvn clean install` to build and test
- ✅ Uploads test results as artifacts

**Free Tier Optimizations**:
- Concurrency control (cancels outdated runs)
- Path filtering (runs only when backend changes)
- 7-day artifact retention

### 2. Frontend CI (`frontend-ci.yml`)
**Purpose**: Build and test the Angular frontend

**Triggers**: Pull requests that modify `timetable-app/**`

**What it does**:
- ✅ Sets up Node.js 18 with npm caching
- ✅ Runs tests in headless Chrome
- ✅ Builds production bundle
- ✅ Uploads coverage reports

**Free Tier Optimizations**:
- Concurrency control (cancels outdated runs)
- Path filtering (runs only when frontend changes)
- 7-day artifact retention

### 3. PR Checks (`pr-checks.yml`)
**Purpose**: Orchestrate all PR validation checks

**Triggers**: All pull requests

**What it does**:
- ✅ Detects which parts of codebase changed
- ✅ Runs only necessary CI workflows (backend/frontend)
- ✅ Provides unified pass/fail status
- ✅ Can be used as required status check

**Free Tier Optimizations**:
- Smart change detection (skips unnecessary jobs)
- Parallel execution when both changed
- Concurrency control

## 📊 Free Tier Usage

GitHub Actions Free Tier provides:
- **2,000 minutes/month** for private repos
- **Unlimited minutes** for public repos

Our optimizations:
- ✅ Path filtering reduces unnecessary runs
- ✅ Concurrency control cancels outdated runs
- ✅ Change detection runs only affected workflows
- ✅ Efficient caching (Maven, npm)

**Estimated usage per PR**:
- Backend only: ~3-5 minutes
- Frontend only: ~2-4 minutes
- Both changed: ~5-8 minutes (parallel)

## 🔧 Extension Points

Each workflow includes comments for easy extension:

### Backend CI Extensions
```yaml
# Add code coverage reporting (e.g., JaCoCo)
# Add static analysis (e.g., SonarCloud, SpotBugs)
# Add security scanning (e.g., OWASP Dependency Check)
# Add Docker build step
# Add deployment step for staging environment
```

### Frontend CI Extensions
```yaml
# Add linting step (ng lint)
# Add E2E tests (ng e2e)
# Add bundle size analysis
# Add accessibility testing
# Add Lighthouse CI for performance metrics
# Add deployment to preview environment (e.g., Vercel, Netlify)
```

### PR Checks Extensions
```yaml
# Add security scanning job (e.g., Snyk, Dependabot)
# Add code quality gates (e.g., SonarCloud)
# Add performance benchmarks
# Add visual regression testing
# Add automated changelog generation
# Add PR labeling based on changed files
```

## 📝 Usage

### For Contributors

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   # Open PR on GitHub
   ```

4. **Wait for CI checks**:
   - GitHub will automatically run relevant workflows
   - Check the "Checks" tab on your PR
   - All checks must pass before merging

### For Maintainers

**Setting up branch protection** (optional):

1. Go to Settings → Branches
2. Add rule for `main` (or your default branch)
3. Enable "Require status checks to pass"
4. Select "PR Validation" as required check
5. Enable "Require branches to be up to date"

## 🐛 Troubleshooting

### Backend CI fails with database connection error
- Check PostgreSQL service is running in workflow
- Verify environment variables are set correctly
- Ensure tests use test database credentials

### Frontend CI fails with "ChromeHeadless not found"
- This shouldn't happen on GitHub runners (Chrome is pre-installed)
- If it does, add Chrome installation step

### Workflow doesn't trigger
- Check that PR modifies files in watched paths
- Verify workflow YAML syntax is valid
- Check GitHub Actions tab for errors

### Workflow runs on every PR even when files unchanged
- This is expected for `pr-checks.yml` (orchestrator)
- Individual CI workflows should skip via path filtering
- Change detection in `pr-checks.yml` prevents unnecessary work

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Free Tier Limits](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
