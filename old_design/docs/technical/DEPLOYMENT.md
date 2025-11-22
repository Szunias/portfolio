# Deployment Guide

This guide covers deployment options and best practices for the Igor Szuniewicz Portfolio project.

## 🚀 Deployment Options

### 1. GitHub Pages (Recommended)

**Pros:**
- Free hosting
- Automatic HTTPS
- Easy CI/CD with GitHub Actions
- Custom domain support

**Steps:**

1. **Enable GitHub Pages**
   ```bash
   # Repository Settings > Pages
   # Source: Deploy from a branch
   # Branch: main
   # Folder: / (root)
   ```

2. **Configure Custom Domain**
   ```bash
   # Add CNAME file
   echo "igorszuniewicz.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

3. **DNS Configuration**
   ```
   Type: CNAME
   Name: www
   Value: szunias.github.io
   
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

### 2. Netlify

**Pros:**
- Advanced features
- Form handling
- Branch previews
- Edge functions

**Steps:**

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub repository

2. **Build Settings**
   ```
   Build command: (leave empty)
   Publish directory: /
   ```

3. **Environment Variables**
   ```
   NODE_VERSION=18
   ```

4. **Custom Domain**
   - Add domain in Site settings
   - Configure DNS records

### 3. Vercel

**Pros:**
- Excellent performance
- Global CDN
- Automatic HTTPS
- Preview deployments

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   vercel --prod
   ```

3. **Configure Domain**
   - Add domain in Vercel dashboard
   - Update DNS records

### 4. AWS S3 + CloudFront

**Pros:**
- Highly scalable
- Global CDN
- Advanced caching
- Cost-effective for high traffic

**Steps:**

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://igorszuniewicz-portfolio
   aws s3 website s3://igorszuniewicz-portfolio --index-document index.html
   ```

2. **Upload Files**
   ```bash
   aws s3 sync . s3://igorszuniewicz-portfolio --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure caching rules

## 🔧 Pre-Deployment Checklist

### Performance Optimization

- [ ] **Image Optimization**
  ```bash
  # Optimize images
  find assets/images -name "*.jpg" -exec jpegoptim --max=85 {} \;
  find assets/images -name "*.png" -exec pngquant --ext .png --force {} \;
  ```

- [ ] **CSS Minification**
  ```bash
  # Minify CSS (if using build process)
  cleancss -o assets/css/main.min.css assets/css/main.css
  # When using @import, remember to inline modules:
  # cleancss --inline all -o assets/css/main.min.css assets/css/main.css
  ```

- [ ] **JavaScript Minification**
  ```bash
  # Minify JavaScript
  uglifyjs assets/js/main.js -o assets/js/main.min.js
  ```

### Content Verification

- [ ] **Check All Links**
  ```bash
  # Use link checker
  npx linkchecker https://igorszuniewicz.com
  ```

- [ ] **Validate HTML**
  ```bash
  # HTML validation
  npx html-validate index.html
  ```

- [ ] **Test Responsive Design**
  - Mobile (320px - 767px)
  - Tablet (768px - 1023px)
  - Desktop (1024px+)

### SEO Verification

- [ ] **Meta Tags**
  - Title tags are unique and descriptive
  - Meta descriptions are compelling
  - Open Graph tags are complete

- [ ] **Structured Data**
  - JSON-LD markup is valid
  - Schema.org validation passes

- [ ] **Sitemap**
  - sitemap.xml is accessible
  - All pages are included
  - URLs are correct

## 🌐 Domain Configuration

### DNS Records

```
# A Records (IPv4)
@                    A    185.199.108.153
@                    A    185.199.109.153
@                    A    185.199.110.153
@                    A    185.199.111.153

# CNAME Records
www                  CNAME szunias.github.io
api                  CNAME szunias.github.io

# TXT Records (for verification)
@                    TXT  "v=spf1 include:_spf.google.com ~all"
@                    TXT  "google-site-verification=YOUR_VERIFICATION_CODE"
```

### SSL Certificate

- **GitHub Pages**: Automatic Let's Encrypt
- **Netlify**: Automatic Let's Encrypt
- **Vercel**: Automatic Let's Encrypt
- **AWS**: ACM (AWS Certificate Manager)

## 📊 Performance Monitoring

### Core Web Vitals

Monitor these metrics:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Tools

1. **Google PageSpeed Insights**
   ```
   https://pagespeed.web.dev/
   ```

2. **WebPageTest**
   ```
   https://www.webpagetest.org/
   ```

3. **Lighthouse CI**
   ```bash
   npm install -g @lhci/cli
   lhci autorun
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Portfolio

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Netlify Build

Create `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## 🚨 Error Handling

### 404 Page

Create `404.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Igor Szuniewicz</title>
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
  <div class="container">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/" class="btn btn-primary">Go Home</a>
  </div>
</body>
</html>
```

### Error Monitoring

Consider adding error tracking:

```javascript
// Sentry integration
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## 🔒 Security Headers

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self';
">
```

### Security Headers

```yaml
# Netlify headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'"
```

## 📈 Analytics Setup

### Google Analytics 4

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Privacy Compliance

- **GDPR**: Cookie consent banner
- **CCPA**: Privacy policy
- **Cookie Policy**: Clear cookie usage

## 🔄 Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup files
cp -r assets "$BACKUP_DIR/"
cp -r projects "$BACKUP_DIR/"
cp -r locales "$BACKUP_DIR/"
cp *.html "$BACKUP_DIR/"

# Compress backup
tar -czf "backups/backup_$DATE.tar.gz" "$BACKUP_DIR"

# Cleanup old backups (keep last 7 days)
find backups/ -name "backup_*.tar.gz" -mtime +7 -delete
```

## 🚀 Go-Live Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Performance optimized
- [ ] SEO verified
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Security headers configured
- [ ] Analytics setup
- [ ] Error pages created
- [ ] Backup strategy in place

### Post-Launch

- [ ] Monitor performance
- [ ] Check error logs
- [ ] Verify analytics
- [ ] Test all functionality
- [ ] Monitor Core Web Vitals
- [ ] Check search engine indexing

## 📞 Support

For deployment issues:

- **Email**: igorszuniewiczwork@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/Szunias/igorszuniewicz/issues)
- **Documentation**: [Technical Docs](docs/technical/)

---

**Last Updated**: January 27, 2025  
**Maintained by**: Igor Szuniewicz
