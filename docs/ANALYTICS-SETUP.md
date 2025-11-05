# Google Analytics 4 Setup Guide
## Igor Szuniewicz Portfolio - Analytics Configuration

### Overview
This guide will help you set up Google Analytics 4 for igorszuniewicz.com to track website performance and user behavior.

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Enter account name: "Igor Szuniewicz Portfolio"
5. Configure data sharing settings (recommend all options enabled)
6. Click "Next"

### Step 2: Create GA4 Property

1. **Property name**: "igorszuniewicz.com"
2. **Reporting time zone**: Select your timezone (Belgium)
3. **Currency**: EUR (or your preferred currency)
4. Click "Next"

### Step 3: Business Information

1. **Industry category**: "Technology" or "Entertainment"
2. **Business size**: Select appropriate size
3. **How you plan to use Google Analytics**: Select relevant options
4. Click "Create"

### Step 4: Set Up Data Stream

1. Choose "Web" platform
2. **Website URL**: `https://igorszuniewicz.com`
3. **Stream name**: "igorszuniewicz.com"
4. Click "Create stream"

### Step 5: Get Measurement ID

1. Copy the **Measurement ID** (starts with "G-")
2. Open `assets/js/analytics.js`
3. Replace `G-XXXXXXXXXX` on line 8 with your actual Measurement ID:

```javascript
const GA_CONFIG = {
  measurementId: 'G-YOUR_ACTUAL_ID_HERE', // Replace with your GA4 Measurement ID
  // ... rest of config
};
```

### Step 6: Configure Enhanced Measurement

In Google Analytics:

1. Go to "Admin" → "Data Streams"
2. Click on your web stream
3. Scroll to "Enhanced measurement"
4. Enable these events:
   - [x] Page views
   - [x] Scrolls
   - [x] Outbound clicks
   - [x] Site search
   - [x] Video engagement
   - [x] File downloads

### Step 7: Set Up Goals/Conversions

#### Primary Goals
1. Go to "Admin" → "Events"
2. Click "Create event"
3. Set up these key events:

**CV Downloads**
- Event name: `cv_download`
- Conditions: Event name = "file_download" AND File name contains "cv"

**Project Views**
- Event name: `project_view`
- Conditions: Event name = "page_view" AND Page location contains "/projects/"

**Contact Interactions**
- Event name: `contact_interaction`
- Conditions: Event name = "click" AND Click element contains "contact"

### Step 8: Privacy Configuration

The analytics.js file is already configured with privacy-friendly settings:

- **IP Anonymization**: Enabled
- **Google Signals**: Disabled
- **Ad Personalization**: Disabled
- **Cookie Settings**: Strict and Secure
- **User Consent**: Required before tracking

### Step 9: Test Implementation

#### Verify Tracking
1. Deploy your changes to the live website
2. Visit your website
3. In Google Analytics, go to "Realtime" → "Overview"
4. You should see active users (yourself)

#### Test Events
1. Download your CV (should trigger `cv_download`)
2. Visit project pages (should trigger `project_view`)
3. Click contact links (should trigger `contact_interaction`)

### Step 10: Configure Reports

#### Custom Reports
1. Go to "Explore" → "Free form"
2. Create custom reports for:
   - Project page performance
   - Audio interaction tracking
   - Geographic distribution
   - Device/browser analytics

#### Audience Insights
1. Go to "Audience" → "Demographics"
2. Configure age, gender, interests
3. Set up custom audiences for:
   - Audio professionals
   - Game developers
   - Music enthusiasts

### Step 11: Set Up Alerts

1. Go to "Admin" → "Custom insights"
2. Create alerts for:
   - Traffic drops > 50%
   - High bounce rate > 80%
   - New keyword rankings
   - Error rate increases

### Step 12: Integration with Search Console

1. In Google Analytics, go to "Admin" → "Product Links"
2. Click "Search Console"
3. Link your Search Console property
4. This enables Search Console data in Analytics

### Privacy Compliance

#### GDPR Compliance
The analytics implementation includes:
- User consent before tracking
- IP anonymization
- Minimal data collection
- Clear privacy policy integration

#### Cookie Notice
The analytics script shows a consent banner:
- Users can accept or decline
- Choice is remembered in localStorage
- No tracking without consent

### Regular Maintenance

#### Weekly Tasks
- [ ] Check realtime data
- [ ] Review top pages and sources
- [ ] Monitor conversion events

#### Monthly Tasks
- [ ] Analyze audience insights
- [ ] Review custom reports
- [ ] Check for data anomalies
- [ ] Update goals if needed

### Troubleshooting

#### Common Issues

**No Data Appearing**
- Check Measurement ID is correct
- Verify analytics.js is loading
- Check browser console for errors
- Ensure website is live

**Events Not Tracking**
- Verify event names match exactly
- Check if user has given consent
- Test in incognito mode
- Review GA4 DebugView

**Consent Banner Not Showing**
- Check localStorage for existing consent
- Clear browser data and test
- Verify analytics.js is loaded

### Expected Timeline

- **Setup**: 30 minutes
- **First Data**: 1-2 hours
- **Full Data**: 24-48 hours
- **Historical Data**: 1-2 weeks

### Next Steps

After Analytics is set up:

1. **Monitor performance daily for first week**
2. **Set up custom dashboards**
3. **Create automated reports**
4. **Integrate with other tools**

### Resources

- [Google Analytics Help](https://support.google.com/analytics/)
- [GA4 Events Guide](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Privacy and Analytics](https://support.google.com/analytics/answer/9019185)

---

**Last Updated**: January 27, 2025  
**Next Review**: February 27, 2025
