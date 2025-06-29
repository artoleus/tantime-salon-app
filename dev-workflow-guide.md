# Development Workflow Guide

## Branch Structure

- **`master`** - Production branch (deploys to live app)
- **`dev`** - Development branch (for testing new features)

## Development Backend Setup

### Option 1: Create Separate Dev Backend (Recommended)

Run this command interactively to create a separate development backend:

```bash
firebase apphosting:backends:create
```

When prompted:
- **Backend ID**: `tantime-salon-app-dev`
- **Repository**: Select your existing GitHub repo
- **Branch**: `dev`
- **Build settings**: Use same as production

### Option 2: Use Existing Backend with Branch Switching

Deploy specific branches to the existing backend:

```bash
# Deploy dev branch
firebase apphosting:rollouts:create tantime-salon-app -b dev -f

# Deploy master branch (production)
firebase apphosting:rollouts:create tantime-salon-app -b master -f
```

## Development Workflow

### 1. Working on New Features

```bash
# Switch to dev branch
git checkout dev

# Create feature branch from dev
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/your-feature-name

# Merge back to dev
git checkout dev
git merge feature/your-feature-name
git push origin dev
```

### 2. Testing Changes

```bash
# Deploy to development environment
firebase apphosting:rollouts:create tantime-salon-app-dev -b dev -f

# Or if using single backend:
firebase apphosting:rollouts:create tantime-salon-app -b dev -f
```

### 3. Promoting to Production

```bash
# Switch to master
git checkout master

# Merge dev into master
git merge dev

# Push to production
git push origin master

# Deploy to production (happens automatically or manually)
firebase apphosting:rollouts:create tantime-salon-app -b master -f
```

## Environment Configuration

### Development Environment Variables

For development, you may want separate secrets for testing:

```bash
# Create dev-specific secrets (optional)
echo -n "DEV_API_KEY" | gcloud secrets create firebase-api-key-dev --data-file=-
echo -n "DEV_AUTH_DOMAIN" | gcloud secrets create firebase-auth-domain-dev --data-file=-
# ... etc
```

### Development apphosting.yaml

Create `apphosting.dev.yaml` for dev-specific configuration:

```yaml
# Development-specific configuration
env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    secret: firebase-api-key-dev  # Use dev secrets
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    secret: firebase-auth-domain-dev
  # ... other dev-specific configs

runConfig:
  maxInstances: 1  # Keep low for cost
  env:
    - variable: NEXT_PUBLIC_FIREBASE_API_KEY
      secret: firebase-api-key-dev
    # ... runtime dev configs
```

## Local Development

### Running Locally

```bash
# Make sure you're on dev branch
git checkout dev

# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:9002
```

### Local Testing with Production Data

```bash
# Use production Firebase config locally
# .env.local already configured with production keys
npm run dev
```

## Security Considerations for Dev Environment

### Dev Branch Security Rules

Create `firestore.dev.rules` for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // More permissive rules for development testing
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy dev rules:
```bash
firebase deploy --only firestore:rules --config firestore.dev.json
```

### Dev Environment Best Practices

1. **Use separate Firebase project for dev** (optional but recommended)
2. **Use test data only in dev environment**
3. **Keep dev secrets separate from production**
4. **Don't mix production and development data**
5. **Regularly clean up dev deployments**

## Monitoring Dev Deployments

### Check Deployment Status

```bash
# List all backends
firebase apphosting:backends:list

# Get specific backend info
firebase apphosting:backends:get tantime-salon-app-dev
```

### Dev Environment URLs

- **Development**: `https://tantime-salon-app-dev--tan-salon-app.europe-west4.hosted.app`
- **Production**: `https://tantime-salon-app--tan-salon-app.europe-west4.hosted.app`

## Troubleshooting

### Common Issues

1. **Wrong branch deployed**: Check which branch is selected in rollout
2. **Environment variables not updating**: Verify secrets are properly configured
3. **Security rules conflicts**: Make sure dev rules are applied to dev environment

### Reset Dev Environment

```bash
# Delete dev backend and recreate
firebase apphosting:backends:delete tantime-salon-app-dev
firebase apphosting:backends:create  # Then configure for dev branch
```

## CI/CD Integration (Future)

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Development
on:
  push:
    branches: [dev]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Firebase App Hosting
        run: |
          firebase apphosting:rollouts:create tantime-salon-app-dev -b dev -f
```

### Production Deployment

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production
on:
  push:
    branches: [master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Firebase App Hosting
        run: |
          firebase apphosting:rollouts:create tantime-salon-app -b master -f
```

## Current Status

✅ **Dev branch created and pushed**
✅ **Working on dev branch**
⏳ **Dev backend needs to be created interactively**
⏳ **Dev secrets configuration (optional)**

## Next Steps

1. Create development backend: `firebase apphosting:backends:create`
2. Configure dev backend to use `dev` branch
3. Grant secret access to dev backend
4. Test deployment to dev environment
5. Continue development on dev branch safely