# Google Search Console Setup Guide
## Igor Szuniewicz Portfolio - SEO Configuration

### Overview
This guide will help you set up Google Search Console for igorszuniewicz.com to monitor SEO performance and submit your sitemap.

### Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property" or "Add a property"

### Step 2: Add Your Website

1. **Property Type**: Choose "URL prefix"
2. **URL**: Enter `https://igorszuniewicz.com`
3. Click "Continue"

### Step 3: Verify Ownership

You have several verification options. **Recommended: HTML tag method**

#### Option A: HTML Tag (Recommended)
1. Select "HTML tag" verification method
2. Copy the verification code (looks like: `google-site-verification=abc123...`)
3. Replace `YOUR_VERIFICATION_CODE_HERE` in these files:
   - `index.html` (line 46)
   - `about.html` (line 54)
   - `contact.html` (line 41)
   - `music.html` (line 51)
   - `projects/index.html` (line 41)
   - All project pages (if you add verification to them)

4. Deploy the changes to your live website
5. Click "Verify" in Google Search Console

#### Option B: DNS Record (Alternative)
1. Select "DNS record" verification
2. Add the TXT record to your domain's DNS settings
3. Wait for DNS propagation (up to 24 hours)
4. Click "Verify"

### Step 4: Submit Sitemap

1. In Google Search Console, go to "Sitemaps" in the left sidebar
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Wait for Google to process (usually within 24-48 hours)

### Step 5: Configure Settings

#### URL Inspection
- Use "URL Inspection" tool to test individual pages
- Check if pages are indexed
- Request indexing for important pages

#### Coverage Report
- Monitor "Coverage" for indexing issues
- Fix any errors or warnings
- Submit pages for re-indexing if needed

### Step 6: Set Up Monitoring

#### Performance Tab
- Monitor search queries and click-through rates
- Track which pages perform best
- Identify opportunities for improvement

#### Mobile Usability
- Check mobile-friendly status
- Fix any mobile issues
- Ensure responsive design works properly

### Step 7: Regular Maintenance

#### Weekly Tasks
- [ ] Check for new errors in Coverage report
- [ ] Monitor Performance for new queries
- [ ] Review mobile usability issues

#### Monthly Tasks
- [ ] Analyze top-performing pages
- [ ] Update sitemap if new content added
- [ ] Check Core Web Vitals scores
- [ ] Review search appearance

### Troubleshooting

#### Common Issues

**Verification Failed**
- Ensure the meta tag is in the `<head>` section
- Check that the website is live and accessible
- Verify the code is exactly as provided by Google

**Sitemap Not Processing**
- Check sitemap.xml is accessible at `https://igorszuniewicz.com/sitemap.xml`
- Validate XML format
- Ensure all URLs in sitemap are accessible

**Pages Not Indexed**
- Use URL Inspection tool to check specific pages
- Submit important pages for indexing
- Check for robots.txt blocking
- Verify canonical URLs are correct

### Expected Timeline

- **Verification**: Immediate (if HTML tag method)
- **Sitemap Processing**: 24-48 hours
- **First Data**: 1-3 days
- **Full Indexing**: 1-2 weeks

### Next Steps

After Search Console is set up:

1. **Set up Google Analytics 4** (see `ANALYTICS-SETUP.md`)
2. **Monitor performance weekly**
3. **Optimize based on data**
4. **Submit new content regularly**

### Resources

- [Google Search Console Help](https://support.google.com/webmasters/)
- [Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [URL Inspection Tool](https://support.google.com/webmasters/answer/9012289)

---

**Last Updated**: January 27, 2025  
**Next Review**: February 27, 2025
