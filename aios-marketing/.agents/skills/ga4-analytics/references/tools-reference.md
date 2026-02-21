# GA4 Analytics CLI - Tools Reference

## Commands Reference

### auth
Verify GA4 API access and show property info.

```bash
node aios-marketing/bin/ga4-analytics.mjs auth
```

**Output:** Connection status, property ID, available dimensions/metrics count.

---

### setup
Save GA4 credentials globally.

```bash
node aios-marketing/bin/ga4-analytics.mjs setup [--client-id=X] [--client-secret=X] [--refresh-token=X] [--property-id=properties/123456789]
```

**Parameters:**
| Flag | Description |
|------|-------------|
| `--client-id` | OAuth2 Client ID (shared with Google Ads) |
| `--client-secret` | OAuth2 Client Secret (shared with Google Ads) |
| `--refresh-token` | OAuth2 Refresh Token (shared with Google Ads) |
| `--property-id` | GA4 Property ID (format: properties/NUMERIC_ID) |

**Config file:** `~/.config/ga4-analytics/.env`

---

### overview
Key metrics overview for a date range.

```bash
node aios-marketing/bin/ga4-analytics.mjs overview [--days=7] [--since=YYYY-MM-DD --until=YYYY-MM-DD] [--format=table]
```

**Metrics returned:** sessions, totalUsers, newUsers, screenPageViews, bounceRate, averageSessionDuration

**Output includes:** Daily breakdown + summary totals

---

### acquisition
Traffic sources breakdown by source/medium.

```bash
node aios-marketing/bin/ga4-analytics.mjs acquisition [--days=7] [--limit=25] [--format=table]
```

**Dimensions:** sessionSource, sessionMedium
**Metrics:** sessions, totalUsers, newUsers, bounceRate, averageSessionDuration, conversions

---

### pages
Top pages by pageviews.

```bash
node aios-marketing/bin/ga4-analytics.mjs pages [--days=7] [--limit=25] [--format=table]
```

**Dimensions:** pagePath, pageTitle
**Metrics:** screenPageViews, sessions, averageSessionDuration, bounceRate, conversions

---

### events
Event counts and conversion data.

```bash
node aios-marketing/bin/ga4-analytics.mjs events [--days=7] [--limit=50] [--format=table]
```

**Dimensions:** eventName, isConversionEvent
**Metrics:** eventCount, totalUsers, eventCountPerUser

---

### conversions
Conversion events summary (filtered to conversion events only).

```bash
node aios-marketing/bin/ga4-analytics.mjs conversions [--days=7] [--format=table]
```

**Dimensions:** eventName (filtered by isConversionEvent=true)
**Metrics:** conversions, totalUsers

---

### funnel
Funnel visualization data.

```bash
node aios-marketing/bin/ga4-analytics.mjs funnel [--days=7] [--steps=event1,event2,event3]
```

**Default steps:** session_start -> page_view -> scroll -> click

**Custom steps example:**
```bash
node aios-marketing/bin/ga4-analytics.mjs funnel --steps=session_start,add_to_cart,begin_checkout,purchase
```

**Note:** Requires GA4 property with Funnel exploration feature.

---

### realtime
Real-time active users.

```bash
node aios-marketing/bin/ga4-analytics.mjs realtime [--by=country|device|page] [--format=table]
```

**Breakdown options:**
| Value | Dimension |
|-------|-----------|
| `country` | Country (default) |
| `device` | Device category |
| `page` | Active page/screen |

**Metrics:** activeUsers

---

### audiences
Audience comparisons.

```bash
node aios-marketing/bin/ga4-analytics.mjs audiences [--days=7] [--limit=25] [--format=table]
```

**Dimensions:** audienceName
**Metrics:** totalUsers, sessions, bounceRate, averageSessionDuration, conversions

---

### demographics
User demographics breakdown.

```bash
node aios-marketing/bin/ga4-analytics.mjs demographics [--by=country|city|language|age|gender|device|browser|os] [--days=7] [--limit=25] [--format=table]
```

**Dimension mapping:**
| Flag value | GA4 dimension |
|------------|---------------|
| `country` | country |
| `city` | city |
| `language` | language |
| `age` | userAgeBracket |
| `gender` | userGender |
| `device` | deviceCategory |
| `browser` | browser |
| `os` | operatingSystem |

---

## Global Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--format=table` | JSON | Output as formatted table |
| `--days=<N>` | 7 | Number of days to look back |
| `--since=YYYY-MM-DD` | - | Custom start date |
| `--until=YYYY-MM-DD` | - | Custom end date |
| `--limit=<N>` | varies | Limit number of results |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_ADS_CLIENT_ID` | Yes | OAuth2 Client ID (shared with Google Ads) |
| `GOOGLE_ADS_CLIENT_SECRET` | Yes | OAuth2 Client Secret (shared with Google Ads) |
| `GOOGLE_ADS_REFRESH_TOKEN` | Yes | OAuth2 Refresh Token (shared with Google Ads) |
| `GA4_PROPERTY_ID` | Yes | GA4 Property ID (e.g., properties/123456789) |

## API Reference

- **Base URL:** https://analyticsdata.googleapis.com/v1beta
- **Auth:** OAuth2 Bearer token (auto-refreshed)
- **Report endpoint:** POST /{property}:runReport
- **Realtime endpoint:** POST /{property}:runRealtimeReport
- **Funnel endpoint:** POST /{property}:runFunnelReport
- **Metadata endpoint:** GET /{property}/metadata
