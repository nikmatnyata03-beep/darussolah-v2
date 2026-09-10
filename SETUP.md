# 🔐 Security Setup Guide

## Quick Start - Secure Your Application

### Step 1: Create Your Environment File

```bash
cp .env.example .env
```

### Step 2: Fill in Your Secrets

Edit the `.env` file and replace all placeholder values with your actual credentials:

**Critical Security Notes:**
- ⚠️ **NEVER** commit `.env` to version control
- ⚠️ Use **strong, unique passwords** (min 16 characters, mix of upper/lower/numbers/symbols)
- ⚠️ Generate a **random JWT secret** (use: `openssl rand -base64 32`)
- ⚠️ Change default seed passwords before deploying to production

### Step 3: Generate Secure Secrets

```bash
# Generate a secure JWT secret
openssl rand -base64 32

# Generate a secure database password
openssl rand -base64 24

# Generate a secure admin password
openssl rand -base64 24
```

### Step 4: Verify No Hardcoded Secrets

Run these checks to ensure no secrets are in your code:

```bash
# Check for hardcoded passwords
grep -rni "password.*=.*['\"]" --include="*.js" --include="*.ts" | grep -v node_modules | grep -v ".env"

# Check for API keys
grep -rni "AIzaSy" --include="*.js" --include="*.ts" --include="*.json" | grep -v node_modules

# Check for common secret patterns
grep -rni "secret\|token\|key" --include="*.js" --include="*.ts" | grep -v node_modules | grep "=" | grep -v test | grep -v ".env"
```

### Step 5: Update Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Copy the configuration values
5. Paste them into your `.env` file

### Step 6: Run Seed Script (Development Only)

```bash
# Make sure .env has DEFAULT_ADMIN_PASSWORD and DEFAULT_GURU_PASSWORD set
npm run seed-users  # or whatever your seed command is
```

## 🚨 If You Find Hardcoded Secrets

1. **Rotate immediately**: Change the compromised password/API key
2. **Remove from code**: Replace with environment variable references
3. **Check git history**: Use `git log -p --all -- <file>` to find when it was committed
4. **Clean history** (if needed): See SECURITY.md for instructions

## ✅ Security Checklist

Before deploying to production:

- [ ] `.env` file exists with all required variables
- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded passwords in source code
- [ ] No hardcoded API keys in source code
- [ ] JWT secret is randomly generated (min 32 chars)
- [ ] Database passwords are strong and unique
- [ ] Default seed passwords changed from examples
- [ ] Firebase config loaded from environment variables
- [ ] SECURITY.md reviewed by team

## 📚 Related Documentation

- See `SECURITY.md` for detailed security guidelines
- See `.env.example` for all required environment variables
- See `src/lib/firebase-config.ts` for Firebase configuration loader
