#!/usr/bin/env node

// Google Search Console CLI - Search Console API
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node search-console.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/search-console/.env (global - works from any project)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const WEBMASTERS_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const INSPECTION_BASE = 'https://searchconsole.googleapis.com/v1';
const OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'search-console');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// ─── Env Loader ──────────────────────────────────────────────────────────────

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const vars = {};
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function loadEnv() {
  const scriptDir = new URL('.', import.meta.url).pathname;
  const scriptProjectDir = join(scriptDir, '..');

  const globalVars = parseEnvFile(GLOBAL_ENV_FILE);
  const scriptProjectVars = parseEnvFile(join(scriptProjectDir, '.env'));
  const cwdVars = parseEnvFile(join(process.cwd(), '.env'));

  const merged = { ...globalVars, ...scriptProjectVars, ...cwdVars };
  for (const [key, value] of Object.entries(merged)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// ─── Auth ────────────────────────────────────────────────────────────────────

let cachedAccessToken = null;
let tokenExpiresAt = 0;

function getRequiredEnv(name, helpMessage) {
  const value = process.env[name];
  if (!value) {
    console.error(JSON.stringify({
      error: `${name} not set`,
      help: helpMessage || `Set ${name} in your environment or .env file`,
      setup: [
        'Quick setup (global - works in any project):',
        '  node search-console.mjs setup --site-url=https://example.com',
        '',
        'Or run: node search-console.mjs auth (for step-by-step guide)',
      ]
    }, null, 2));
    process.exit(1);
  }
  return value;
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const clientId = getRequiredEnv('GOOGLE_ADS_CLIENT_ID', 'OAuth2 Client ID from Google Cloud Console (shared with Google Ads)');
  const clientSecret = getRequiredEnv('GOOGLE_ADS_CLIENT_SECRET', 'OAuth2 Client Secret from Google Cloud Console (shared with Google Ads)');
  const refreshToken = getRequiredEnv('GOOGLE_ADS_REFRESH_TOKEN', 'OAuth2 Refresh Token (shared with Google Ads)');

  const res = await fetch(OAUTH2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new ApiError(`OAuth2 token refresh failed: ${data.error_description || data.error}`, 401, 'AUTH_ERROR');
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in * 1000);
  return cachedAccessToken;
}

function getSiteUrl() {
  return getRequiredEnv('GOOGLE_SEARCH_CONSOLE_SITE_URL', 'Site URL (e.g., https://example.com or sc-domain:example.com)');
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function buildHeaders() {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function scGet(url) {
  const headers = await buildHeaders();
  const res = await fetch(url, { headers });
  const data = await res.json();

  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    throw new ApiError(msg, data.error.code || res.status, 'API_ERROR');
  }
  return data;
}

async function scPost(url, body) {
  const headers = await buildHeaders();
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    throw new ApiError(msg, data.error.code || res.status, 'API_ERROR');
  }
  return data;
}

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateRange(flags) {
  const days = parseInt(flags.days || '28', 10);
  const end = new Date();
  // Search Console data has ~3 day delay
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  if (flags.since && flags.until) {
    return { startDate: flags.since, endDate: flags.until };
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function formatCtr(ctr) {
  return (Number(ctr) * 100).toFixed(2) + '%';
}

function formatPosition(pos) {
  return Number(pos).toFixed(1);
}

// ─── Args Parser ─────────────────────────────────────────────────────────────

function parseArgs(args) {
  const positional = [];
  const flags = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex !== -1) {
        const key = arg.substring(2, eqIndex);
        const value = arg.substring(eqIndex + 1);
        flags[key] = value;
      } else {
        flags[arg.substring(2)] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

// ─── Output ──────────────────────────────────────────────────────────────────

function output(data, flags = {}) {
  if (flags.format === 'table' && Array.isArray(data.results || data.data || data)) {
    const items = data.results || data.data || data;
    if (items.length === 0) {
      console.log('No results found.');
      return;
    }
    const flatItems = items.map(item => flattenObject(item));
    const keys = Object.keys(flatItems[0]);
    const widths = keys.map(k =>
      Math.max(k.length, ...flatItems.map(i => String(i[k] ?? '').length))
    );
    const header = keys.map((k, idx) => k.padEnd(widths[idx])).join(' | ');
    const sep = widths.map(w => '-'.repeat(w)).join('-+-');
    console.log(header);
    console.log(sep);
    for (const item of flatItems) {
      const row = keys.map((k, idx) => String(item[k] ?? '').padEnd(widths[idx])).join(' | ');
      console.log(row);
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth & Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);

    if (!flags['site-url'] && !flags['client-id'] && !flags['client-secret'] && !flags['refresh-token']) {
      return {
        message: 'Save Search Console credentials globally (works in any project)',
        usage: 'node search-console.mjs setup --site-url=https://example.com [--client-id=X --client-secret=X --refresh-token=X]',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/search-console/.env',
          'OAuth2 credentials are shared with Google Ads (GOOGLE_ADS_CLIENT_ID, etc.)',
          'GOOGLE_SEARCH_CONSOLE_SITE_URL is specific to this tool',
          'Project .env overrides global config, shell env overrides both',
        ],
        get_credentials: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Enable "Google Search Console API" in APIs & Services > Library',
          '3. Reuse the same OAuth2 Client ID/Secret from Google Ads setup',
          '4. Site URL formats:',
          '   - URL prefix: https://example.com/',
          '   - Domain property: sc-domain:example.com',
          '5. Run: node search-console.mjs setup --site-url=https://example.com',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (flags['site-url']) existing.GOOGLE_SEARCH_CONSOLE_SITE_URL = flags['site-url'];
    if (flags['client-id']) existing.GOOGLE_ADS_CLIENT_ID = flags['client-id'];
    if (flags['client-secret']) existing.GOOGLE_ADS_CLIENT_SECRET = flags['client-secret'];
    if (flags['refresh-token']) existing.GOOGLE_ADS_REFRESH_TOKEN = flags['refresh-token'];

    const content = [
      '# Google Search Console - Global Configuration',
      '# This file is loaded automatically by search-console.mjs from any project',
      `# Updated: ${new Date().toISOString()}`,
      '',
      ...Object.entries(existing).map(([k, v]) => `${k}=${v}`),
      ''
    ].join('\n');

    writeFileSync(GLOBAL_ENV_FILE, content, { mode: 0o600 });

    for (const [k, v] of Object.entries(existing)) {
      if (!process.env[k]) process.env[k] = v;
    }

    return {
      message: 'Credentials saved successfully',
      config_file: GLOBAL_ENV_FILE,
      saved_keys: Object.keys(existing),
      test: 'Run: node search-console.mjs auth',
    };
  },

  async auth() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

    if (!clientId) {
      return {
        message: 'Setup Google Search Console API access',
        steps: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Enable "Google Search Console API" in APIs & Services > Library',
          '3. If you already have Google Ads credentials, they are reused automatically',
          '4. Otherwise, create OAuth 2.0 Client IDs (type: Desktop app)',
          '5. Get your site URL from Search Console (https://search.google.com/search-console)',
          '6. Run: node search-console.mjs setup --site-url=https://example.com',
          '7. If OAuth2 tokens needed: node google-ads.mjs auth (shared auth flow)',
        ]
      };
    }

    // Verify access by listing sites
    try {
      const token = await getAccessToken();
      const res = await fetch(`${WEBMASTERS_BASE}/sites`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.error) {
        return {
          status: 'ERROR',
          site_url: siteUrl || 'NOT_SET',
          error: data.error.message,
          hint: 'Enable "Google Search Console API" in Google Cloud Console',
        };
      }

      const sites = (data.siteEntry || []).map(s => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      }));

      const currentSiteFound = siteUrl
        ? sites.some(s => s.siteUrl === siteUrl)
        : false;

      return {
        status: 'OK',
        configured_site: siteUrl || 'NOT_SET',
        site_found: currentSiteFound,
        accessible_sites: sites,
        total_sites: sites.length,
        message: currentSiteFound
          ? `Connected. Site "${siteUrl}" found with access.`
          : siteUrl
            ? `WARNING: Site "${siteUrl}" not found in accessible sites. Check the URL format.`
            : 'Connected. Set GOOGLE_SEARCH_CONSOLE_SITE_URL to select a site.',
      };
    } catch (err) {
      return {
        status: 'ERROR',
        error: err.message,
        hint: 'Check your OAuth2 credentials',
      };
    }
  },

  // ── Sites ──

  async sites() {
    const token = await getAccessToken();
    const res = await fetch(`${WEBMASTERS_BASE}/sites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.error) {
      throw new ApiError(data.error.message, data.error.code, 'API_ERROR');
    }

    const sites = (data.siteEntry || []).map(s => ({
      siteUrl: s.siteUrl,
      permissionLevel: s.permissionLevel,
    }));

    return { data: sites, total: sites.length };
  },

  // ── Queries ──

  async queries(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const body = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dimensions: ['query'],
      rowLimit: limit,
    };

    if (flags.page) {
      body.dimensionFilterGroups = [{
        filters: [{
          dimension: 'page',
          operator: 'contains',
          expression: flags.page,
        }],
      }];
    }

    if (flags.country) {
      body.dimensions.push('country');
    }

    if (flags.device) {
      body.dimensions.push('device');
    }

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      body
    );

    const rows = (response.rows || []).map(row => {
      const obj = { query: row.keys[0] };
      if (flags.country && row.keys[1]) obj.country = row.keys[1];
      if (flags.device) obj.device = row.keys[flags.country ? 2 : 1];
      obj.clicks = row.clicks;
      obj.impressions = row.impressions;
      obj.ctr = formatCtr(row.ctr);
      obj.position = formatPosition(row.position);
      return obj;
    });

    return {
      data: rows,
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Pages ──

  async pages(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const body = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dimensions: ['page'],
      rowLimit: limit,
    };

    if (flags.query) {
      body.dimensionFilterGroups = [{
        filters: [{
          dimension: 'query',
          operator: 'contains',
          expression: flags.query,
        }],
      }];
    }

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      body
    );

    const rows = (response.rows || []).map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: formatCtr(row.ctr),
      position: formatPosition(row.position),
    }));

    return {
      data: rows,
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Sitemaps ──

  async sitemaps(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const response = await scGet(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/sitemaps`
    );

    const sitemaps = (response.sitemap || []).map(sm => ({
      path: sm.path,
      lastSubmitted: sm.lastSubmitted || 'N/A',
      isPending: sm.isPending || false,
      isSitemapsIndex: sm.isSitemapsIndex || false,
      type: sm.type || 'unknown',
      lastDownloaded: sm.lastDownloaded || 'N/A',
      warnings: (sm.warnings != null) ? sm.warnings : 'N/A',
      errors: (sm.errors != null) ? sm.errors : 'N/A',
    }));

    return {
      data: sitemaps,
      site: siteUrl,
      total: sitemaps.length,
    };
  },

  // ── Indexing (URL Inspection) ──

  async indexing(args) {
    const { positional, flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const inspectionUrl = positional[0] || flags.url;

    if (!inspectionUrl) {
      throw new Error('Usage: indexing <url> [--site=<site_url>]\nExample: node search-console.mjs indexing https://example.com/page');
    }

    const response = await scPost(`${INSPECTION_BASE}/urlInspection/index:inspect`, {
      inspectionUrl,
      siteUrl,
    });

    const result = response.inspectionResult || {};
    const indexStatus = result.indexStatusResult || {};
    const mobileUsability = result.mobileUsabilityResult || {};
    const richResults = result.richResultsResult || {};

    return {
      url: inspectionUrl,
      site: siteUrl,
      inspection: {
        coverage: indexStatus.coverageState || 'UNKNOWN',
        indexing: indexStatus.indexingState || 'UNKNOWN',
        page_fetch: indexStatus.pageFetchState || 'UNKNOWN',
        robots_txt: indexStatus.robotsTxtState || 'UNKNOWN',
        crawled_as: indexStatus.crawledAs || 'UNKNOWN',
        last_crawl: indexStatus.lastCrawlTime || 'N/A',
        google_canonical: indexStatus.googleCanonical || 'N/A',
        user_canonical: indexStatus.userCanonical || 'N/A',
        referring_urls: indexStatus.referringUrls || [],
      },
      mobile_usability: {
        verdict: mobileUsability.verdict || 'UNKNOWN',
        issues: (mobileUsability.issues || []).map(i => ({
          type: i.issueType,
          severity: i.severity,
          message: i.message,
        })),
      },
      rich_results: {
        verdict: richResults.verdict || 'UNKNOWN',
        detected_items: (richResults.detectedItems || []).map(d => ({
          type: d.richResultType,
          items: (d.items || []).map(i => ({
            name: i.name,
            issues: (i.issues || []).map(iss => ({
              type: iss.issueType,
              severity: iss.severity,
              message: iss.issueMessage,
            })),
          })),
        })),
      },
    };
  },

  // ── Coverage ──

  async coverage(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    // Get page-level data to assess indexed vs non-indexed
    const body = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dimensions: ['page'],
      rowLimit: 1000,
    };

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      body
    );

    const rows = response.rows || [];

    // Categorize pages by performance
    let totalPages = rows.length;
    let pagesWithClicks = 0;
    let pagesNoClicks = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    const lowPositionPages = [];

    for (const row of rows) {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;

      if (row.clicks > 0) {
        pagesWithClicks++;
      } else {
        pagesNoClicks++;
      }

      if (row.position > 20) {
        lowPositionPages.push({
          page: row.keys[0],
          position: formatPosition(row.position),
          impressions: row.impressions,
        });
      }
    }

    return {
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      summary: {
        total_indexed_pages: totalPages,
        pages_with_clicks: pagesWithClicks,
        pages_impressions_only: pagesNoClicks,
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
      },
      low_position_pages: {
        count: lowPositionPages.length,
        note: 'Pages with average position > 20 (potential for improvement)',
        data: lowPositionPages.slice(0, 20),
      },
      hint: 'For detailed URL inspection, use: node search-console.mjs indexing <url>',
    };
  },

  // ── Performance by Date ──

  async performance(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const body = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dimensions: ['date'],
      rowLimit: 500,
    };

    if (flags.query) {
      body.dimensionFilterGroups = [{
        filters: [{
          dimension: 'query',
          operator: 'contains',
          expression: flags.query,
        }],
      }];
    }

    if (flags.page) {
      const filter = { dimension: 'page', operator: 'contains', expression: flags.page };
      if (body.dimensionFilterGroups) {
        body.dimensionFilterGroups[0].filters.push(filter);
      } else {
        body.dimensionFilterGroups = [{ filters: [filter] }];
      }
    }

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      body
    );

    const rows = (response.rows || []).map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: formatCtr(row.ctr),
      position: formatPosition(row.position),
    }));

    // Calculate totals
    let totalClicks = 0, totalImpressions = 0, totalPosition = 0;
    for (const row of rows) {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
      totalPosition += Number(row.position);
    }

    return {
      data: rows,
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      summary: {
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        avg_ctr: rows.length > 0 ? formatCtr(totalClicks / totalImpressions) : '0.00%',
        avg_position: rows.length > 0 ? formatPosition(totalPosition / rows.length) : '0.0',
      },
      total: rows.length,
    };
  },

  // ── Countries ──

  async countries(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: ['country'],
        rowLimit: limit,
      }
    );

    const rows = (response.rows || []).map(row => ({
      country: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: formatCtr(row.ctr),
      position: formatPosition(row.position),
    }));

    return {
      data: rows,
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Devices ──

  async devices(args) {
    const { flags } = parseArgs(args);
    const siteUrl = flags.site || getSiteUrl();
    const dateRange = getDateRange(flags);
    const encodedSiteUrl = encodeURIComponent(siteUrl);

    const response = await scPost(
      `${WEBMASTERS_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: ['device'],
        rowLimit: 10,
      }
    );

    const rows = (response.rows || []).map(row => ({
      device: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: formatCtr(row.ctr),
      position: formatPosition(row.position),
    }));

    return {
      data: rows,
      site: siteUrl,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node search-console.mjs <command> [options]',
      note: 'Uses Google Search Console API. OAuth2 credentials shared with Google Ads. Data has ~3 day delay.',
      commands: {
        'Auth': {
          'setup': 'Save credentials globally (~/.config/search-console/.env)',
          'auth': 'Verify Search Console API access and list accessible sites',
          'sites': 'List all accessible sites',
        },
        'Search Performance': {
          'queries': 'Search queries with clicks, impressions, CTR, position [--days=28] [--page=<filter>]',
          'pages': 'Page performance with clicks, impressions, CTR, position [--days=28] [--query=<filter>]',
          'performance': 'Daily performance over time [--days=28] [--query=<filter>] [--page=<filter>]',
          'countries': 'Performance by country [--days=28] [--limit=25]',
          'devices': 'Performance by device type [--days=28]',
        },
        'Indexing & Coverage': {
          'sitemaps': 'List sitemaps with status and errors',
          'indexing <url>': 'URL inspection (coverage, indexing, mobile, rich results)',
          'coverage': 'Index coverage summary (indexed pages, impressions-only pages)',
        },
      },
      global_flags: {
        '--format=table': 'Output as table instead of JSON',
        '--days=<N>': 'Number of days to look back (default: 28)',
        '--since=YYYY-MM-DD': 'Custom start date',
        '--until=YYYY-MM-DD': 'Custom end date',
        '--limit=<N>': 'Limit number of results',
        '--site=<url>': 'Override default site URL',
      },
      env: {
        'GOOGLE_ADS_CLIENT_ID': 'Required. OAuth2 Client ID (shared with Google Ads)',
        'GOOGLE_ADS_CLIENT_SECRET': 'Required. OAuth2 Client Secret (shared with Google Ads)',
        'GOOGLE_ADS_REFRESH_TOKEN': 'Required. OAuth2 Refresh Token (shared with Google Ads)',
        'GOOGLE_SEARCH_CONSOLE_SITE_URL': 'Required. Site URL (e.g., https://example.com or sc-domain:example.com)',
      }
    };
  }
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    output(await commands.help());
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);
  const { flags } = parseArgs(commandArgs);

  const handler = commands[command];
  if (!handler) {
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node search-console.mjs help" for available commands' }));
    process.exit(1);
  }

  try {
    const result = await handler(commandArgs);
    output(result, flags);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(JSON.stringify({
        error: err.message,
        code: err.code,
        type: err.type,
      }, null, 2));
    } else {
      console.error(JSON.stringify({ error: err.message }, null, 2));
    }
    process.exit(1);
  }
}

main();
