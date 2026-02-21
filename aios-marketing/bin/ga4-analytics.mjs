#!/usr/bin/env node

// GA4 Analytics CLI - Google Analytics Data API v1beta
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node ga4-analytics.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/ga4-analytics/.env (global - works from any project)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const BASE_URL = 'https://analyticsdata.googleapis.com/v1beta';
const OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'ga4-analytics');
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
        '  node ga4-analytics.mjs setup --client-id=X --client-secret=X --refresh-token=X --property-id=properties/123456789',
        '',
        'Or run: node ga4-analytics.mjs auth (for step-by-step guide)',
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

function getPropertyId() {
  return getRequiredEnv('GA4_PROPERTY_ID', 'GA4 Property ID (e.g., properties/123456789). Get from GA4 Admin > Property Settings');
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function buildHeaders() {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function ga4Post(endpoint, body) {
  const headers = await buildHeaders();
  const url = `${BASE_URL}${endpoint}`;

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

async function ga4Get(endpoint) {
  const headers = await buildHeaders();
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, { headers });
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
  const days = parseInt(flags.days || '7', 10);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  if (flags.since && flags.until) {
    return { startDate: flags.since, endDate: flags.until };
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function formatReportRows(response) {
  if (!response.rows || response.rows.length === 0) return [];

  const dimHeaders = (response.dimensionHeaders || []).map(h => h.name);
  const metHeaders = (response.metricHeaders || []).map(h => h.name);

  return response.rows.map(row => {
    const obj = {};
    (row.dimensionValues || []).forEach((v, i) => {
      obj[dimHeaders[i]] = v.value;
    });
    (row.metricValues || []).forEach((v, i) => {
      obj[metHeaders[i]] = v.value;
    });
    return obj;
  });
}

function formatDuration(seconds) {
  const s = Math.round(Number(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

function formatPercent(value) {
  return (Number(value) * 100).toFixed(2) + '%';
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

    if (!flags['client-id'] && !flags['client-secret'] && !flags['refresh-token'] && !flags['property-id']) {
      return {
        message: 'Save GA4 Analytics credentials globally (works in any project)',
        usage: 'node ga4-analytics.mjs setup --client-id=X --client-secret=X --refresh-token=X --property-id=properties/123456789',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/ga4-analytics/.env',
          'OAuth2 credentials are shared with Google Ads (GOOGLE_ADS_CLIENT_ID, etc.)',
          'GA4_PROPERTY_ID is specific to this tool',
          'Project .env overrides global config, shell env overrides both',
        ],
        get_credentials: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Enable "Google Analytics Data API" in APIs & Services > Library',
          '3. Reuse the same OAuth2 Client ID/Secret from Google Ads setup',
          '4. Get Property ID: GA4 Admin > Property Settings > Property ID',
          '5. Format as: properties/<numeric_id> (e.g., properties/123456789)',
          '6. Run: node ga4-analytics.mjs setup --property-id=properties/123456789',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (flags['client-id']) existing.GOOGLE_ADS_CLIENT_ID = flags['client-id'];
    if (flags['client-secret']) existing.GOOGLE_ADS_CLIENT_SECRET = flags['client-secret'];
    if (flags['refresh-token']) existing.GOOGLE_ADS_REFRESH_TOKEN = flags['refresh-token'];
    if (flags['property-id']) existing.GA4_PROPERTY_ID = flags['property-id'];

    const content = [
      '# GA4 Analytics - Global Configuration',
      '# This file is loaded automatically by ga4-analytics.mjs from any project',
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
      test: 'Run: node ga4-analytics.mjs auth',
    };
  },

  async auth() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!clientId) {
      return {
        message: 'Setup GA4 Analytics API access',
        steps: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Enable "Google Analytics Data API" in APIs & Services > Library',
          '3. If you already have Google Ads credentials, they are reused automatically',
          '4. Otherwise, create OAuth 2.0 Client IDs (type: Desktop app)',
          '5. Get Property ID: GA4 Admin > Property Settings',
          '6. Run: node ga4-analytics.mjs setup --property-id=properties/123456789',
          '7. If OAuth2 tokens needed: node google-ads.mjs auth (shared auth flow)',
        ]
      };
    }

    // Verify access by running a simple metadata request
    try {
      const pid = propertyId || 'NOT_SET';
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/${pid}/metadata`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.error) {
        return {
          status: 'ERROR',
          property_id: pid,
          error: data.error.message,
          hint: data.error.code === 403
            ? 'Enable "Google Analytics Data API" in Google Cloud Console and ensure the property ID is correct'
            : 'Check your credentials and property ID',
        };
      }

      const dims = (data.dimensions || []).length;
      const mets = (data.metrics || []).length;

      return {
        status: 'OK',
        property_id: pid,
        available_dimensions: dims,
        available_metrics: mets,
        message: `Connected successfully. ${dims} dimensions and ${mets} metrics available.`,
      };
    } catch (err) {
      return {
        status: 'ERROR',
        error: err.message,
        hint: 'Check your OAuth2 credentials and GA4_PROPERTY_ID',
      };
    }
  },

  // ── Overview ──

  async overview(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const rows = formatReportRows(response);

    // Calculate totals
    let totalSessions = 0, totalUsers = 0, totalNewUsers = 0, totalPageviews = 0;
    let totalBounceRate = 0, totalDuration = 0;

    for (const row of rows) {
      totalSessions += Number(row.sessions || 0);
      totalUsers += Number(row.totalUsers || 0);
      totalNewUsers += Number(row.newUsers || 0);
      totalPageviews += Number(row.screenPageViews || 0);
      totalBounceRate += Number(row.bounceRate || 0);
      totalDuration += Number(row.averageSessionDuration || 0);
    }

    const avgBounceRate = rows.length > 0 ? totalBounceRate / rows.length : 0;
    const avgDuration = rows.length > 0 ? totalDuration / rows.length : 0;

    return {
      data: rows,
      summary: {
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
        total_sessions: totalSessions,
        total_users: totalUsers,
        new_users: totalNewUsers,
        total_pageviews: totalPageviews,
        avg_bounce_rate: formatPercent(avgBounceRate),
        avg_session_duration: formatDuration(avgDuration),
      },
      total: rows.length,
    };
  },

  // ── Acquisition ──

  async acquisition(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Pages ──

  async pages(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit,
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Events ──

  async events(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '50', 10);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [
        { name: 'eventName' },
        { name: 'isConversionEvent' },
      ],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' },
        { name: 'eventCountPerUser' },
      ],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit,
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Funnel ──

  async funnel(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);

    // Default funnel steps - user can override with --steps="step1,step2,step3"
    let steps;
    if (flags.steps) {
      steps = flags.steps.split(',').map((name, i) => ({
        name: name.trim(),
        filterExpression: {
          eventFilter: { eventName: name.trim() },
        },
      }));
    } else {
      steps = [
        { name: 'session_start', filterExpression: { eventFilter: { eventName: 'session_start' } } },
        { name: 'page_view', filterExpression: { eventFilter: { eventName: 'page_view' } } },
        { name: 'scroll', filterExpression: { eventFilter: { eventName: 'scroll' } } },
        { name: 'click', filterExpression: { eventFilter: { eventName: 'click' } } },
      ];
    }

    try {
      const response = await ga4Post(`/${property}:runFunnelReport`, {
        dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
        funnel: {
          steps,
        },
      });

      // Parse funnel response
      const funnelTable = response.funnelTable;
      if (!funnelTable || !funnelTable.rows) {
        return { data: [], message: 'No funnel data available for the selected period and steps.' };
      }

      const dimHeaders = (funnelTable.dimensionHeaders || []).map(h => h.name);
      const metHeaders = (funnelTable.metricHeaders || []).map(h => h.name);

      const rows = funnelTable.rows.map(row => {
        const obj = {};
        (row.dimensionValues || []).forEach((v, i) => {
          obj[dimHeaders[i]] = v.value;
        });
        (row.metricValues || []).forEach((v, i) => {
          obj[metHeaders[i]] = v.value;
        });
        return obj;
      });

      return {
        data: rows,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
        steps: steps.map(s => s.name),
        total: rows.length,
      };
    } catch (err) {
      if (err.message && err.message.includes('UNIMPLEMENTED')) {
        return {
          error: 'Funnel reports require a GA4 property with the Funnel exploration feature enabled.',
          hint: 'Try using the "events" command instead to see event drop-off manually.',
        };
      }
      throw err;
    }
  },

  // ── Realtime ──

  async realtime(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();

    const dimensions = [];
    if (flags.by === 'country' || !flags.by) dimensions.push({ name: 'country' });
    if (flags.by === 'device' || !flags.by) dimensions.push({ name: 'deviceCategory' });
    if (flags.by === 'page') dimensions.push({ name: 'unifiedScreenName' });

    const response = await ga4Post(`/${property}:runRealtimeReport`, {
      dimensions,
      metrics: [
        { name: 'activeUsers' },
      ],
    });

    const rows = formatReportRows(response);

    let totalActive = 0;
    for (const row of rows) {
      totalActive += Number(row.activeUsers || 0);
    }

    return {
      data: rows,
      active_users_now: totalActive,
      breakdown: flags.by || 'country + device',
      total: rows.length,
    };
  },

  // ── Audiences ──

  async audiences(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [
        { name: 'audienceName' },
      ],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit,
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Demographics ──

  async demographics(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);
    const limit = parseInt(flags.limit || '25', 10);

    const by = flags.by || 'country';
    const dimMap = {
      'country': 'country',
      'city': 'city',
      'language': 'language',
      'age': 'userAgeBracket',
      'gender': 'userGender',
      'device': 'deviceCategory',
      'browser': 'browser',
      'os': 'operatingSystem',
    };

    const dimension = dimMap[by] || by;

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [{ name: dimension }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit,
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      dimension: by,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Conversions ──

  async conversions(args) {
    const { flags } = parseArgs(args);
    const property = getPropertyId();
    const dateRange = getDateRange(flags);

    const response = await ga4Post(`/${property}:runReport`, {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [
        { name: 'eventName' },
      ],
      metrics: [
        { name: 'conversions' },
        { name: 'totalUsers' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'isConversionEvent',
          stringFilter: { matchType: 'EXACT', value: 'true' },
        },
      },
      orderBys: [{ metric: { metricName: 'conversions' }, desc: true }],
    });

    const rows = formatReportRows(response);
    return {
      data: rows,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      total: rows.length,
    };
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node ga4-analytics.mjs <command> [options]',
      note: 'Uses Google Analytics Data API v1beta. OAuth2 credentials shared with Google Ads.',
      commands: {
        'Auth': {
          'setup': 'Save credentials globally (~/.config/ga4-analytics/.env)',
          'auth': 'Verify GA4 API access and show property info',
        },
        'Reports': {
          'overview': 'Key metrics: sessions, users, pageviews, bounce rate [--days=7|30]',
          'acquisition': 'Traffic sources breakdown (source/medium) [--days=7]',
          'pages': 'Top pages by pageviews [--days=7] [--limit=25]',
          'events': 'Event counts and conversion data [--days=7] [--limit=50]',
          'conversions': 'Conversion events summary [--days=7]',
        },
        'Advanced': {
          'funnel': 'Funnel visualization [--steps=event1,event2,event3] [--days=7]',
          'realtime': 'Real-time active users [--by=country|device|page]',
          'audiences': 'Audience comparisons [--days=7] [--limit=25]',
          'demographics': 'User demographics [--by=country|city|age|gender|device|browser|os]',
        },
      },
      global_flags: {
        '--format=table': 'Output as table instead of JSON',
        '--days=<N>': 'Number of days to look back (default: 7)',
        '--since=YYYY-MM-DD': 'Custom start date',
        '--until=YYYY-MM-DD': 'Custom end date',
        '--limit=<N>': 'Limit number of results',
      },
      env: {
        'GOOGLE_ADS_CLIENT_ID': 'Required. OAuth2 Client ID (shared with Google Ads)',
        'GOOGLE_ADS_CLIENT_SECRET': 'Required. OAuth2 Client Secret (shared with Google Ads)',
        'GOOGLE_ADS_REFRESH_TOKEN': 'Required. OAuth2 Refresh Token (shared with Google Ads)',
        'GA4_PROPERTY_ID': 'Required. GA4 Property ID (e.g., properties/123456789)',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node ga4-analytics.mjs help" for available commands' }));
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
