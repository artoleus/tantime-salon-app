# Firebase App Hosting Deployment Guide

This guide documents the complete workflow for deploying a Next.js application to Firebase App Hosting using Google Cloud Secret Manager for environment variables.

## Prerequisites

- Google Cloud CLI (`gcloud`) installed
- Firebase CLI installed
- Git repository with your Next.js application
- Google Cloud project created

## Step 1: Set Up Google Cloud CLI

1. **Initialize and authenticate gcloud:**
   ```bash
   gcloud init
   ```
   - Follow the prompts to authenticate
   - Select your Google Cloud project

2. **Set the active project:**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

## Step 2: Enable Required Services

```bash
gcloud services enable secretmanager.googleapis.com
```

## Step 3: Create Secrets in Google Cloud Secret Manager

**Critical:** Use `echo -n` to avoid newline characters that will cause Firebase authentication failures.

```bash
# Firebase configuration secrets
echo -n "YOUR_API_KEY" | gcloud secrets create firebase-api-key --data-file=-
echo -n "YOUR_AUTH_DOMAIN" | gcloud secrets create firebase-auth-domain --data-file=-
echo -n "YOUR_PROJECT_ID" | gcloud secrets create firebase-project-id --data-file=-
echo -n "YOUR_STORAGE_BUCKET" | gcloud secrets create firebase-storage-bucket --data-file=-
echo -n "YOUR_MESSAGING_SENDER_ID" | gcloud secrets create firebase-messaging-sender-id --data-file=-
echo -n "YOUR_APP_ID" | gcloud secrets create firebase-app-id --data-file=-
echo -n "YOUR_MEASUREMENT_ID" | gcloud secrets create firebase-measurement-id --data-file=-
echo -n "YOUR_ADMIN_EMAILS" | gcloud secrets create admin-emails --data-file=-
```

**Verify secrets (should have no trailing newlines):**
```bash
gcloud secrets versions access latest --secret="firebase-api-key"
```

## Step 4: Initialize Firebase CLI

1. **Login to Firebase:**
   ```bash
   firebase login
   ```
   - If in a non-interactive environment, use: `firebase login:ci`

2. **Create Firebase configuration files:**

   **`.firebaserc`:**
   ```json
   {
     "projects": {
       "default": "YOUR_PROJECT_ID"
     }
   }
   ```

   **`firebase.json`:**
   ```json
   {
     "hosting": {
       "public": ".next/out",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ]
     }
   }
   ```

## Step 5: Configure App Hosting with Secrets

Create or update `apphosting.yaml`:

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

# Build-time environment variables (needed for Next.js build process)
env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    secret: firebase-api-key
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    secret: firebase-auth-domain
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    secret: firebase-project-id
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    secret: firebase-storage-bucket
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    secret: firebase-messaging-sender-id
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    secret: firebase-app-id
  - variable: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    secret: firebase-measurement-id
  - variable: NEXT_PUBLIC_ADMIN_EMAILS
    secret: admin-emails

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1
  
  # Runtime environment variables from Google Cloud Secret Manager
  env:
    - variable: NEXT_PUBLIC_FIREBASE_API_KEY
      secret: firebase-api-key
    - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      secret: firebase-auth-domain
    - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
      secret: firebase-project-id
    - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      secret: firebase-storage-bucket
    - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      secret: firebase-messaging-sender-id
    - variable: NEXT_PUBLIC_FIREBASE_APP_ID
      secret: firebase-app-id
    - variable: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      secret: firebase-measurement-id
    - variable: NEXT_PUBLIC_ADMIN_EMAILS
      secret: admin-emails
```

## Step 6: Grant Secret Access to App Hosting

**Critical step:** Grant the App Hosting service account permission to access secrets:

```bash
firebase apphosting:secrets:grantaccess firebase-api-key,firebase-auth-domain,firebase-project-id,firebase-storage-bucket,firebase-messaging-sender-id,firebase-app-id,firebase-measurement-id,admin-emails --backend YOUR_BACKEND_NAME --project YOUR_PROJECT_ID
```

## Step 7: Commit and Push Configuration

```bash
git add apphosting.yaml .firebaserc firebase.json
git commit -m "Configure Firebase App Hosting with Google Cloud Secret Manager"
git push
```

## Step 8: Create App Hosting Backend (if needed)

If you don't have an existing backend:
```bash
firebase apphosting:backends:create
```

List existing backends:
```bash
firebase apphosting:backends:list
```

## Step 9: Deploy with Rollout

```bash
firebase apphosting:rollouts:create YOUR_BACKEND_NAME -b master -f
```

Monitor deployment:
```bash
firebase apphosting:backends:get YOUR_BACKEND_NAME
```

## Troubleshooting Common Issues

### 1. Permission Denied Errors

**Error:** `Permission 'secretmanager.versions.get' denied`

**Solution:** Run the grantaccess command:
```bash
firebase apphosting:secrets:grantaccess SECRET_NAMES --backend BACKEND_NAME
```

### 2. Invalid API Key Errors

**Error:** `auth/api-key-not-valid-please-pass-a-valid-api-key`

**Cause:** Newline characters in secret values

**Solution:** Recreate secrets using `echo -n`:
```bash
echo -n "CLEAN_VALUE_NO_NEWLINES" | gcloud secrets versions add SECRET_NAME --data-file=-
```

### 3. Missing Environment Variables

**Error:** Environment variables showing as `undefined` in build

**Solution:** Ensure both build-time and runtime `env` sections are configured in `apphosting.yaml`

### 4. Build Conflicts

**Error:** `HTTP Error: 409, unable to queue the operation`

**Solution:** Wait for current build to complete, then retry

## Verification Steps

1. **Check secret values:**
   ```bash
   gcloud secrets versions access latest --secret="SECRET_NAME"
   ```

2. **Monitor deployment:**
   - Firebase Console: `https://console.firebase.google.com/project/PROJECT_ID/apphosting`
   - App URL: Check backend details for the hosted URL

3. **Debug environment variables:**
   Add temporary logging to your app:
   ```javascript
   console.log('Environment variables check:', {
     NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'present' : 'missing'
   });
   ```

## Best Practices

1. **Always use `echo -n`** when creating secrets to avoid newline characters
2. **Grant secret access** immediately after creating secrets
3. **Use both build-time and runtime** environment variable configurations
4. **Verify secret values** before deployment
5. **Monitor deployment logs** for any configuration issues
6. **Keep local `.env.local`** for development, use Secret Manager for production

## File Structure

Your project should include:
```
your-app/
├── apphosting.yaml          # App Hosting configuration
├── .firebaserc              # Firebase project configuration
├── firebase.json            # Firebase hosting configuration
├── .env.local              # Local development environment variables
└── src/
    └── lib/
        └── firebase.ts     # Firebase initialization
```

## Environment Variables Mapping

| Local (.env.local) | Secret Manager | Purpose |
|-------------------|----------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `firebase-api-key` | Firebase authentication |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `firebase-auth-domain` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `firebase-project-id` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `firebase-storage-bucket` | Firebase storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `firebase-messaging-sender-id` | Firebase messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `firebase-app-id` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `firebase-measurement-id` | Firebase analytics |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `admin-emails` | Admin user emails |

This workflow ensures a secure, scalable deployment process using Google Cloud Secret Manager for sensitive configuration while maintaining a smooth development experience with local environment variables.