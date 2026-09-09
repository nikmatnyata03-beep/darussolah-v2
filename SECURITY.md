# Security Guidelines for Darussolah Project

## 🔐 Critical Security Practices

### 1. Environment Variables (NEVER Commit Secrets)

**DO:**
- Store all secrets in `.env` file (which is gitignored)
- Use `.env.example` as a template for required variables
- Rotate secrets regularly

**DON'T:**
- ❌ Never commit `.env` files to version control
- ❌ Never hardcode passwords, API keys, or tokens in source code
- ❌ Never share credentials via chat or email

### 2. Firebase Configuration

The project now uses environment variables for Firebase configuration:

```bash
# Required environment variables:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=your-app-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_OAUTH_CLIENT_ID=your-oauth-client-id
```

### 3. Database Credentials

```bash
# Required database environment variables:
SQL_HOST=localhost
SQL_DB_NAME=darussolah
SQL_USER=dbuser
SQL_PASSWORD=strong-password-here
SQL_ADMIN_USER=admin
SQL_ADMIN_PASSWORD=strong-admin-password-here
```

### 4. Default User Passwords

When seeding users, always use strong passwords:

```bash
# Change these from the defaults!
DEFAULT_ADMIN_PASSWORD=StrongP@ssw0rd123!
DEFAULT_GURU_PASSWORD=An0therStr0ngP@ss!
```

## 🚨 If You Accidentally Committed Secrets

1. **Immediately rotate the compromised secret** (change password, regenerate API key, etc.)
2. Remove the secret from git history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. Check GitHub's secret scanning alerts
4. Audit access logs for unauthorized usage

## 📋 Security Checklist

- [ ] `.env` file exists and is in `.gitignore`
- [ ] All hardcoded secrets removed from code
- [ ] Firebase config loaded from environment variables
- [ ] Database passwords are strong and unique
- [ ] Default seed passwords changed in production
- [ ] No secrets in commit history
- [ ] Regular security audits scheduled

## 🔍 Security Scanning

Run these commands to check for exposed secrets:

```bash
# Check for hardcoded passwords
grep -rni "password.*=" --include="*.js" --include="*.ts" | grep -v node_modules | grep -v ".env"

# Check for API keys
grep -rni "apiKey\|api_key\|apikey" --include="*.js" --include="*.ts" | grep -v node_modules

# Check for tokens
grep -rni "secret\|token" --include="*.js" --include="*.ts" | grep -v node_modules | grep -v test
```

## 📞 Security Contacts

If you discover a security vulnerability, please report it immediately to the project maintainers.
