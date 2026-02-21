# Google Search Console CLI - Tools Reference

## Commands Reference

### auth
Verify Search Console API access and list accessible sites.

```bash
node aios-marketing/bin/search-console.mjs auth
```

**Output:** Connection status, configured site, list of all accessible sites with permission levels.

---

### setup
Save Search Console credentials globally.

```bash
node aios-marketing/bin/search-console.mjs setup [--site-url=https://example.com] [--client-id=X] [--client-secret=X] [--refresh-token=X]
```

**Parameters:**
| Flag | Description |
|------|-------------|
| `--site-url` | Site URL (URL prefix or domain property) |
| `--client-id` | OAuth2 Client ID (shared with Google Ads) |
| `--client-secret` | OAuth2 Client Secret (shared with Google Ads) |
| `--refresh-token` | OAuth2 Refresh Token (shared with Google Ads) |

**Config file:** `~/.config/search-console/.env`

**Site URL formats:**
- URL prefix: `https://example.com/`
- Domain property: `sc-domain:example.com`

---

### sites
List all accessible sites.

```bash
node aios-marketing/bin/search-console.mjs sites [--format=table]
```

**Output:** Site URL, permission level for each site.

---

### queries
Search performance by query (keyword).

```bash
node aios-marketing/bin/search-console.mjs queries [--days=28] [--limit=25] [--page=<filter>] [--country] [--device] [--format=table]
```

**Parameters:**
| Flag | Default | Description |
|------|---------|-------------|
| `--days` | 28 | Days to look back |
| `--limit` | 25 | Max results |
| `--page` | - | Filter by page URL (contains match) |
| `--country` | - | Add country breakdown |
| `--device` | - | Add device breakdown |

**Output columns:** Query | Clicks | Impressions | CTR | Position

---

### pages
Search performance by page.

```bash
node aios-marketing/bin/search-console.mjs pages [--days=28] [--limit=25] [--query=<filter>] [--format=table]
```

**Parameters:**
| Flag | Default | Description |
|------|---------|-------------|
| `--days` | 28 | Days to look back |
| `--limit` | 25 | Max results |
| `--query` | - | Filter by search query (contains match) |

**Output columns:** Page | Clicks | Impressions | CTR | Position

---

### performance
Daily performance over time.

```bash
node aios-marketing/bin/search-console.mjs performance [--days=28] [--query=<filter>] [--page=<filter>] [--format=table]
```

**Parameters:**
| Flag | Default | Description |
|------|---------|-------------|
| `--days` | 28 | Days to look back |
| `--query` | - | Filter by search query |
| `--page` | - | Filter by page URL |

**Output:** Daily breakdown with clicks, impressions, CTR, position + summary totals.

---

### countries
Performance by country.

```bash
node aios-marketing/bin/search-console.mjs countries [--days=28] [--limit=25] [--format=table]
```

**Output columns:** Country | Clicks | Impressions | CTR | Position

---

### devices
Performance by device type.

```bash
node aios-marketing/bin/search-console.mjs devices [--days=28] [--format=table]
```

**Output columns:** Device | Clicks | Impressions | CTR | Position

**Device types:** DESKTOP, MOBILE, TABLET

---

### sitemaps
List sitemaps with status.

```bash
node aios-marketing/bin/search-console.mjs sitemaps [--site=<url>] [--format=table]
```

**Output columns:** Path | Last Submitted | Is Pending | Type | Warnings | Errors

---

### indexing
URL inspection for a specific URL.

```bash
node aios-marketing/bin/search-console.mjs indexing <url> [--site=<site_url>]
```

**Example:**
```bash
node aios-marketing/bin/search-console.mjs indexing https://example.com/important-page
```

**Output includes:**
- **Coverage:** coverageState (e.g., "Submitted and indexed")
- **Indexing:** indexingState (e.g., "INDEXING_ALLOWED")
- **Page Fetch:** pageFetchState (e.g., "SUCCESSFUL")
- **Robots.txt:** robotsTxtState (e.g., "ALLOWED")
- **Crawled As:** User agent used (DESKTOP, MOBILE)
- **Last Crawl:** Timestamp of last crawl
- **Canonicals:** Google canonical vs user canonical
- **Mobile Usability:** Verdict and issues
- **Rich Results:** Detected structured data types and issues

---

### coverage
Index coverage summary.

```bash
node aios-marketing/bin/search-console.mjs coverage [--days=28] [--format=table]
```

**Output includes:**
- Total indexed pages (pages appearing in search results)
- Pages with clicks vs pages with impressions only
- Total clicks and impressions
- Low position pages (position > 20) -- potential for improvement

**Note:** This uses Search Analytics data as a proxy for index coverage. For detailed per-URL indexing status, use the `indexing` command.

---

## Global Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--format=table` | JSON | Output as formatted table |
| `--days=<N>` | 28 | Number of days to look back |
| `--since=YYYY-MM-DD` | - | Custom start date |
| `--until=YYYY-MM-DD` | - | Custom end date |
| `--limit=<N>` | varies | Limit number of results |
| `--site=<url>` | env var | Override site URL |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_ADS_CLIENT_ID` | Yes | OAuth2 Client ID (shared with Google Ads) |
| `GOOGLE_ADS_CLIENT_SECRET` | Yes | OAuth2 Client Secret (shared with Google Ads) |
| `GOOGLE_ADS_REFRESH_TOKEN` | Yes | OAuth2 Refresh Token (shared with Google Ads) |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | Yes | Site URL (e.g., https://example.com or sc-domain:example.com) |

## API Reference

- **Search Analytics:** POST https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
- **Sitemaps:** GET https://searchconsole.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps
- **URL Inspection:** POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
- **Sites List:** GET https://searchconsole.googleapis.com/webmasters/v3/sites
- **Auth:** OAuth2 Bearer token (auto-refreshed from shared Google Ads credentials)
- **Data delay:** ~3 days for Search Analytics, near real-time for URL Inspection
