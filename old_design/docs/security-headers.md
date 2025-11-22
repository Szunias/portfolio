# Security Headers Configuration

## Recommended Security Headers for igorszuniewicz.com

To enhance website security and professional appearance, implement the following HTTP security headers:

### 1. Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.web3forms.com;
```

### 2. X-Frame-Options
```
X-Frame-Options: DENY
```

### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

### 4. Referrer Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

### 5. Permissions Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 6. Strict-Transport-Security (HTTPS only)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Implementation

### For Apache (.htaccess)
```apache
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.web3forms.com;"
```

### For Nginx
```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.web3forms.com;" always;
```

## Notes
- Test thoroughly after implementation
- Monitor browser console for CSP violations
- Adjust CSP as needed for third-party services
- Ensure HTTPS is properly configured before enabling HSTS
