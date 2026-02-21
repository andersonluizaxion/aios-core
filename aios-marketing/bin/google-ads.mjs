#!/usr/bin/env node

// Google Ads CLI - Direct REST API Integration
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node google-ads.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/google-ads/.env (global - works from any project)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_VERSION = 'v18';
const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`;
const OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const OAUTH2_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'google-ads');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// Channel type mapping - simplified names to API enum
const CHANNEL_MAP = {
  'SEARCH': 'SEARCH',
  'DISPLAY': 'DISPLAY',
  'SHOPPING': 'SHOPPING',
  'VIDEO': 'VIDEO',
  'PERFORMANCE_MAX': 'PERFORMANCE_MAX',
  'LOCAL': 'LOCAL',
  'SMART': 'SMART',
  'DISCOVERY': 'DISCOVERY',
};

// Match type mapping for keywords
const MATCH_TYPE_MAP = {
  'BROAD': 'BROAD',
  'PHRASE': 'PHRASE',
  'EXACT': 'EXACT',
};

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
        '  node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X',
        '',
        'Or run: node google-ads.mjs auth (for step-by-step guide)',
      ]
    }, null, 2));
    process.exit(1);
  }
  return value;
}

async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const clientId = getRequiredEnv('GOOGLE_ADS_CLIENT_ID', 'OAuth2 Client ID from Google Cloud Console');
  const clientSecret = getRequiredEnv('GOOGLE_ADS_CLIENT_SECRET', 'OAuth2 Client Secret from Google Cloud Console');
  const refreshToken = getRequiredEnv('GOOGLE_ADS_REFRESH_TOKEN', 'OAuth2 Refresh Token (run: node google-ads.mjs auth)');

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

function getDeveloperToken() {
  return getRequiredEnv('GOOGLE_ADS_DEVELOPER_TOKEN', 'Developer token from Google Ads API Center (ads.google.com > Tools > API Center)');
}

function getDefaultCustomerId() {
  return getRequiredEnv('GOOGLE_ADS_CUSTOMER_ID', 'Google Ads Customer ID without hyphens (e.g. 1234567890)');
}

function getLoginCustomerId() {
  return process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || null;
}

function formatCustomerId(id) {
  // Remove hyphens and spaces
  return String(id).replace(/[-\s]/g, '');
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function buildHeaders() {
  const token = await getAccessToken();
  const developerToken = getDeveloperToken();
  const headers = {
    'Content-Type': 'application/json',
    'developer-token': developerToken,
    'Authorization': `Bearer ${token}`,
  };
  const loginCustomerId = getLoginCustomerId();
  if (loginCustomerId) {
    headers['login-customer-id'] = formatCustomerId(loginCustomerId);
  }
  return headers;
}

async function googleAdsGet(endpoint) {
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

async function googleAdsPost(endpoint, body) {
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

async function googleAdsQuery(customerId, query) {
  const cid = formatCustomerId(customerId);
  const headers = await buildHeaders();
  const url = `${BASE_URL}/customers/${cid}/googleAds:searchStream`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  const data = await res.json();

  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    throw new ApiError(msg, data.error.code || res.status, 'GAQL_ERROR');
  }

  // searchStream returns array of batches, flatten results
  if (Array.isArray(data)) {
    const results = [];
    for (const batch of data) {
      if (batch.results) {
        results.push(...batch.results);
      }
    }
    return { results, total: results.length };
  }
  return data;
}

async function googleAdsMutate(customerId, resource, operations) {
  const cid = formatCustomerId(customerId);
  return googleAdsPost(`/customers/${cid}/${resource}:mutate`, { operations });
}

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function brlToMicros(brl) {
  return Math.round(Number(brl) * 1_000_000);
}

function microsToBrl(micros) {
  return (Number(micros) / 1_000_000).toFixed(2);
}

function resourceName(customerId, resource, id) {
  return `customers/${formatCustomerId(customerId)}/${resource}/${id}`;
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
    // Flatten nested objects for table display
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

  // ── Auth ──

  async setup(args) {
    const { flags } = parseArgs(args);

    if (!flags['developer-token'] && !flags['client-id'] && !flags['refresh-token'] && !flags['customer-id']) {
      return {
        message: 'Save Google Ads credentials globally (works in any project)',
        usage: 'node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X [--login-customer-id=X]',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/google-ads/.env',
          'This file is loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
        ],
        get_credentials: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Create/select a project and enable "Google Ads API"',
          '3. Create OAuth 2.0 credentials (type: Desktop App)',
          '4. Get Developer Token: https://ads.google.com > Tools > API Center',
          '5. Run: node google-ads.mjs auth (to get refresh token)',
          '6. Run: node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (flags['developer-token']) existing.GOOGLE_ADS_DEVELOPER_TOKEN = flags['developer-token'];
    if (flags['client-id']) existing.GOOGLE_ADS_CLIENT_ID = flags['client-id'];
    if (flags['client-secret']) existing.GOOGLE_ADS_CLIENT_SECRET = flags['client-secret'];
    if (flags['refresh-token']) existing.GOOGLE_ADS_REFRESH_TOKEN = flags['refresh-token'];
    if (flags['customer-id']) existing.GOOGLE_ADS_CUSTOMER_ID = formatCustomerId(flags['customer-id']);
    if (flags['login-customer-id']) existing.GOOGLE_ADS_LOGIN_CUSTOMER_ID = formatCustomerId(flags['login-customer-id']);

    const content = [
      '# Google Ads API - Global Configuration',
      '# This file is loaded automatically by google-ads.mjs from any project',
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
      test: 'Run: node google-ads.mjs accounts',
    };
  },

  async auth() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    if (!clientId) {
      return {
        message: 'Setup Google Ads API access',
        steps: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          '2. Create a project (or select existing)',
          '3. Enable "Google Ads API" in APIs & Services > Library',
          '4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs',
          '5. Application type: Desktop app',
          '6. Copy Client ID and Client Secret',
          '7. Get Developer Token: Sign in to Google Ads > Tools > API Center',
          '8. Save credentials:',
          '   node google-ads.mjs setup --client-id=X --client-secret=X --developer-token=X',
          '9. Run this command again to get the OAuth consent URL',
          '10. After consent, exchange code for refresh token:',
          '    node google-ads.mjs exchange-token <authorization_code>',
        ]
      };
    }

    const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    const scopes = 'https://www.googleapis.com/auth/adwords';
    const authUrl = `${OAUTH2_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent`;

    return {
      message: 'Open this URL in your browser to authenticate:',
      auth_url: authUrl,
      next_step: 'After consent, copy the authorization code and run: node google-ads.mjs exchange-token <code>',
    };
  },

  async 'exchange-token'(args) {
    const { positional } = parseArgs(args);
    const code = positional[0];
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

    if (!code) throw new Error('Usage: exchange-token <authorization_code>');
    if (!clientId || !clientSecret) throw new Error('GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET must be set. Run: node google-ads.mjs setup --client-id=X --client-secret=X');

    const res = await fetch(OAUTH2_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new ApiError(`Token exchange failed: ${data.error_description || data.error}`, 400, 'AUTH_ERROR');
    }

    // Auto-save refresh token to global config
    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }
    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    existing.GOOGLE_ADS_REFRESH_TOKEN = data.refresh_token;
    const content = [
      '# Google Ads API - Global Configuration',
      `# Updated: ${new Date().toISOString()}`,
      '',
      ...Object.entries(existing).map(([k, v]) => `${k}=${v}`),
      ''
    ].join('\n');
    writeFileSync(GLOBAL_ENV_FILE, content, { mode: 0o600 });

    return {
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      expires_in_seconds: data.expires_in,
      saved_to: GLOBAL_ENV_FILE,
      message: 'Refresh token saved globally. Ready to use from any project.',
    };
  },

  // ── Accounts ──

  async accounts() {
    const data = await googleAdsGet('/customers:listAccessibleCustomers');
    const resourceNames = data.resourceNames || [];

    // Fetch details for each accessible customer
    const details = [];
    for (const rn of resourceNames) {
      const cid = rn.replace('customers/', '');
      try {
        const result = await googleAdsQuery(cid,
          `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.manager, customer.status FROM customer LIMIT 1`
        );
        if (result.results && result.results.length > 0) {
          details.push(result.results[0].customer);
        }
      } catch {
        // Some accounts may not be queryable, skip them
        details.push({ id: cid, descriptive_name: '(inaccessible)', status: 'UNKNOWN' });
      }
    }

    return { data: details, total: details.length };
  },

  async 'account-info'(args) {
    const { positional } = parseArgs(args);
    const cid = positional[0] || process.env.GOOGLE_ADS_CUSTOMER_ID;
    if (!cid) throw new Error('Usage: account-info <customer_id>');

    return googleAdsQuery(formatCustomerId(cid),
      `SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager,
        customer.status,
        customer.auto_tagging_enabled,
        customer.tracking_url_template,
        customer.optimization_score,
        customer.optimization_score_weight
      FROM customer
      LIMIT 1`
    );
  },

  // ── Campaigns ──

  async campaigns(args) {
    const { positional, flags } = parseArgs(args);
    const cid = positional[0] || process.env.GOOGLE_ADS_CUSTOMER_ID;
    if (!cid) throw new Error('Usage: campaigns <customer_id> [--status=ENABLED|PAUSED|REMOVED] [--type=SEARCH|DISPLAY|SHOPPING|VIDEO|PERFORMANCE_MAX] [--limit=N]');

    let where = [];
    if (flags.status) where.push(`campaign.status = '${flags.status.toUpperCase()}'`);
    if (flags.type) where.push(`campaign.advertising_channel_type = '${(CHANNEL_MAP[flags.type.toUpperCase()] || flags.type).toUpperCase()}'`);
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const limit = flags.limit || 50;

    return googleAdsQuery(formatCustomerId(cid),
      `SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros,
        campaign.start_date,
        campaign.end_date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      ${whereClause}
      ORDER BY campaign.id
      LIMIT ${limit}`
    );
  },

  async 'campaign-details'(args) {
    const { positional, flags } = parseArgs(args);
    const campaignId = positional[0];
    if (!campaignId) throw new Error('Usage: campaign-details <campaign_id> [--customer=<id>]');

    const cid = flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID;
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required (--customer=X or env var)');

    return googleAdsQuery(formatCustomerId(cid),
      `SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.bidding_strategy_type,
        campaign.manual_cpc.enhanced_cpc_enabled,
        campaign_budget.amount_micros,
        campaign_budget.delivery_method,
        campaign_budget.type,
        campaign.network_settings.target_google_search,
        campaign.network_settings.target_search_network,
        campaign.network_settings.target_content_network,
        campaign.geo_target_type_setting.positive_geo_target_type,
        campaign.start_date,
        campaign.end_date,
        campaign.url_custom_parameters,
        campaign.tracking_url_template,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion
      FROM campaign
      WHERE campaign.id = ${campaignId}
      LIMIT 1`
    );
  },

  async 'create-campaign'(args) {
    const { flags } = parseArgs(args);
    if (!flags.customer || !flags.name || !flags.type) {
      throw new Error('Usage: create-campaign --customer=<id> --name=<name> --type=<SEARCH|DISPLAY|SHOPPING|VIDEO|PERFORMANCE_MAX> --budget-micros=<amount> [--status=PAUSED] [--bid-strategy=<MANUAL_CPC|MAXIMIZE_CONVERSIONS|TARGET_CPA|TARGET_ROAS>] [--target-cpa-micros=<amount>] [--target-roas=<ratio>]');
    }
    const cid = formatCustomerId(flags.customer);

    // Step 1: Create budget
    const budgetName = `${flags.name} Budget #${Date.now()}`;
    const budgetAmount = flags['budget-micros'] || 50_000_000; // default 50 BRL/day
    const budgetResult = await googleAdsMutate(cid, 'campaignBudgets', [{
      create: {
        name: budgetName,
        deliveryMethod: 'STANDARD',
        amountMicros: String(budgetAmount),
      }
    }]);

    const budgetResourceName = budgetResult.results[0].resourceName;

    // Step 2: Create campaign
    const channelType = CHANNEL_MAP[flags.type.toUpperCase()] || flags.type.toUpperCase();
    const campaignData = {
      name: flags.name,
      advertisingChannelType: channelType,
      status: (flags.status || 'PAUSED').toUpperCase(),
      campaignBudget: budgetResourceName,
    };

    // Bidding strategy
    const bidStrategy = (flags['bid-strategy'] || 'MANUAL_CPC').toUpperCase();
    switch (bidStrategy) {
      case 'MANUAL_CPC':
        campaignData.manualCpc = { enhancedCpcEnabled: flags['enhanced-cpc'] === 'true' };
        break;
      case 'MAXIMIZE_CONVERSIONS':
        campaignData.maximizeConversions = {};
        if (flags['target-cpa-micros']) campaignData.maximizeConversions.targetCpaMicros = String(flags['target-cpa-micros']);
        break;
      case 'MAXIMIZE_CONVERSION_VALUE':
        campaignData.maximizeConversionValue = {};
        if (flags['target-roas']) campaignData.maximizeConversionValue.targetRoas = Number(flags['target-roas']);
        break;
      case 'TARGET_CPA':
        campaignData.targetCpa = { targetCpaMicros: String(flags['target-cpa-micros'] || 0) };
        break;
      case 'TARGET_ROAS':
        campaignData.targetRoas = { targetRoas: Number(flags['target-roas'] || 0) };
        break;
      default:
        campaignData.manualCpc = {};
    }

    // Network settings (for Search)
    if (channelType === 'SEARCH') {
      campaignData.networkSettings = {
        targetGoogleSearch: true,
        targetSearchNetwork: flags['search-network'] !== 'false',
        targetContentNetwork: flags['display-network'] === 'true',
        targetPartnerSearchNetwork: false,
      };
    }

    const result = await googleAdsMutate(cid, 'campaigns', [{
      create: campaignData,
    }]);

    return {
      message: 'Campaign created successfully',
      campaign: result.results[0],
      budget: budgetResult.results[0],
      note: 'Campaign created as PAUSED. Activate it after adding ad groups and ads.',
    };
  },

  async 'update-campaign'(args) {
    const { positional, flags } = parseArgs(args);
    const campaignId = positional[0];
    if (!campaignId) throw new Error('Usage: update-campaign <campaign_id> --customer=<id> [--status=ENABLED|PAUSED] [--name=<name>]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const rn = resourceName(cid, 'campaigns', campaignId);
    const updateData = { resourceName: rn };
    const updateMask = [];

    if (flags.status) { updateData.status = flags.status.toUpperCase(); updateMask.push('status'); }
    if (flags.name) { updateData.name = flags.name; updateMask.push('name'); }

    if (updateMask.length === 0) throw new Error('No fields to update. Use --status or --name');

    return googleAdsMutate(cid, 'campaigns', [{
      update: updateData,
      updateMask: updateMask.join(','),
    }]);
  },

  // ── Budgets ──

  async 'create-budget'(args) {
    const { flags } = parseArgs(args);
    if (!flags.customer || !flags.name || !flags['amount-micros']) {
      throw new Error('Usage: create-budget --customer=<id> --name=<name> --amount-micros=<amount> [--delivery=STANDARD]');
    }

    return googleAdsMutate(formatCustomerId(flags.customer), 'campaignBudgets', [{
      create: {
        name: flags.name,
        deliveryMethod: (flags.delivery || 'STANDARD').toUpperCase(),
        amountMicros: String(flags['amount-micros']),
      }
    }]);
  },

  // ── Ad Groups ──

  async adgroups(args) {
    const { positional, flags } = parseArgs(args);
    const campaignId = positional[0];
    if (!campaignId) throw new Error('Usage: adgroups <campaign_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    let where = [`campaign.id = ${campaignId}`];
    if (flags.status) where.push(`ad_group.status = '${flags.status.toUpperCase()}'`);
    const limit = flags.limit || 50;

    return googleAdsQuery(cid,
      `SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group
      WHERE ${where.join(' AND ')}
      ORDER BY ad_group.id
      LIMIT ${limit}`
    );
  },

  async 'adgroup-details'(args) {
    const { positional, flags } = parseArgs(args);
    const adgroupId = positional[0];
    if (!adgroupId) throw new Error('Usage: adgroup-details <adgroup_id> [--customer=<id>]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    return googleAdsQuery(cid,
      `SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        ad_group.cpc_bid_micros,
        ad_group.target_cpa_micros,
        ad_group.target_roas,
        ad_group.url_custom_parameters,
        ad_group.tracking_url_template,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion
      FROM ad_group
      WHERE ad_group.id = ${adgroupId}
      LIMIT 1`
    );
  },

  async 'create-adgroup'(args) {
    const { flags } = parseArgs(args);
    if (!flags.customer || !flags.campaign || !flags.name) {
      throw new Error('Usage: create-adgroup --customer=<id> --campaign=<campaign_id> --name=<name> [--cpc-bid-micros=<amount>] [--type=SEARCH_STANDARD] [--status=ENABLED]');
    }

    const cid = formatCustomerId(flags.customer);
    const campaignRn = resourceName(cid, 'campaigns', flags.campaign);

    const adGroupData = {
      name: flags.name,
      campaign: campaignRn,
      status: (flags.status || 'ENABLED').toUpperCase(),
      type: (flags.type || 'SEARCH_STANDARD').toUpperCase(),
    };

    if (flags['cpc-bid-micros']) {
      adGroupData.cpcBidMicros = String(flags['cpc-bid-micros']);
    }

    return googleAdsMutate(cid, 'adGroups', [{
      create: adGroupData,
    }]);
  },

  async 'update-adgroup'(args) {
    const { positional, flags } = parseArgs(args);
    const adgroupId = positional[0];
    if (!adgroupId) throw new Error('Usage: update-adgroup <adgroup_id> --customer=<id> [--status=ENABLED|PAUSED] [--name=<name>] [--cpc-bid-micros=<amount>]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const rn = resourceName(cid, 'adGroups', adgroupId);
    const updateData = { resourceName: rn };
    const updateMask = [];

    if (flags.status) { updateData.status = flags.status.toUpperCase(); updateMask.push('status'); }
    if (flags.name) { updateData.name = flags.name; updateMask.push('name'); }
    if (flags['cpc-bid-micros']) { updateData.cpcBidMicros = String(flags['cpc-bid-micros']); updateMask.push('cpc_bid_micros'); }

    if (updateMask.length === 0) throw new Error('No fields to update');

    return googleAdsMutate(cid, 'adGroups', [{
      update: updateData,
      updateMask: updateMask.join(','),
    }]);
  },

  // ── Ads ──

  async ads(args) {
    const { positional, flags } = parseArgs(args);
    const adgroupId = positional[0];
    if (!adgroupId) throw new Error('Usage: ads <adgroup_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    let where = [`ad_group.id = ${adgroupId}`];
    if (flags.status) where.push(`ad_group_ad.status = '${flags.status.toUpperCase()}'`);
    const limit = flags.limit || 50;

    return googleAdsQuery(cid,
      `SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.name,
        ad_group_ad.ad.type,
        ad_group_ad.status,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group.id,
        ad_group.name,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group_ad
      WHERE ${where.join(' AND ')}
      ORDER BY ad_group_ad.ad.id
      LIMIT ${limit}`
    );
  },

  async 'ad-details'(args) {
    const { positional, flags } = parseArgs(args);
    const adId = positional[0];
    if (!adId) throw new Error('Usage: ad-details <ad_id> [--customer=<id>]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    return googleAdsQuery(cid,
      `SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.name,
        ad_group_ad.ad.type,
        ad_group_ad.status,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.final_mobile_urls,
        ad_group_ad.ad.tracking_url_template,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.responsive_search_ad.path1,
        ad_group_ad.ad.responsive_search_ad.path2,
        ad_group_ad.policy_summary.approval_status,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion
      FROM ad_group_ad
      WHERE ad_group_ad.ad.id = ${adId}
      LIMIT 1`
    );
  },

  async 'create-ad'(args) {
    const { flags } = parseArgs(args);
    if (!flags.customer || !flags.adgroup || !flags.headlines || !flags.descriptions || !flags['final-url']) {
      throw new Error('Usage: create-ad --customer=<id> --adgroup=<adgroup_id> --headlines="H1|H2|H3" --descriptions="D1|D2" --final-url=<url> [--path1=<text>] [--path2=<text>] [--status=ENABLED]');
    }

    const cid = formatCustomerId(flags.customer);
    const adGroupRn = resourceName(cid, 'adGroups', flags.adgroup);

    const headlines = flags.headlines.split('|').map((text, i) => ({
      text: text.trim(),
      pinnedField: i < 3 ? undefined : undefined, // No pinning by default
    }));

    const descriptions = flags.descriptions.split('|').map(text => ({
      text: text.trim(),
    }));

    const adData = {
      adGroup: adGroupRn,
      status: (flags.status || 'ENABLED').toUpperCase(),
      ad: {
        responsiveSearchAd: {
          headlines,
          descriptions,
        },
        finalUrls: [flags['final-url']],
      },
    };

    if (flags.path1) adData.ad.responsiveSearchAd.path1 = flags.path1;
    if (flags.path2) adData.ad.responsiveSearchAd.path2 = flags.path2;
    if (flags.name) adData.ad.name = flags.name;

    return googleAdsMutate(cid, 'adGroupAds', [{
      create: adData,
    }]);
  },

  async 'update-ad'(args) {
    const { positional, flags } = parseArgs(args);
    const adId = positional[0];
    if (!adId) throw new Error('Usage: update-ad <ad_id> --customer=<id> --adgroup=<adgroup_id> [--status=ENABLED|PAUSED]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');
    if (!flags.adgroup) throw new Error('--adgroup=<adgroup_id> is required for ad updates');

    const rn = `customers/${cid}/adGroupAds/${flags.adgroup}~${adId}`;
    const updateData = { resourceName: rn };
    const updateMask = [];

    if (flags.status) { updateData.status = flags.status.toUpperCase(); updateMask.push('status'); }

    if (updateMask.length === 0) throw new Error('No fields to update. Use --status');

    return googleAdsMutate(cid, 'adGroupAds', [{
      update: updateData,
      updateMask: updateMask.join(','),
    }]);
  },

  // ── Keywords ──

  async keywords(args) {
    const { positional, flags } = parseArgs(args);
    const adgroupId = positional[0];
    if (!adgroupId) throw new Error('Usage: keywords <adgroup_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    let where = [
      `ad_group.id = ${adgroupId}`,
      `ad_group_criterion.type = 'KEYWORD'`,
    ];
    if (flags.status) where.push(`ad_group_criterion.status = '${flags.status.toUpperCase()}'`);
    const limit = flags.limit || 100;

    return googleAdsQuery(cid,
      `SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.system_serving_status,
        ad_group_criterion.approval_status,
        ad_group_criterion.final_urls,
        ad_group_criterion.cpc_bid_micros,
        ad_group.id,
        ad_group.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions
      FROM keyword_view
      WHERE ${where.join(' AND ')}
      ORDER BY metrics.impressions DESC
      LIMIT ${limit}`
    );
  },

  async 'add-keywords'(args) {
    const { flags } = parseArgs(args);
    if (!flags.customer || !flags.adgroup || !flags.keywords) {
      throw new Error('Usage: add-keywords --customer=<id> --adgroup=<adgroup_id> --keywords="keyword1,keyword2,keyword3" [--match-type=BROAD|PHRASE|EXACT] [--cpc-bid-micros=<amount>]');
    }

    const cid = formatCustomerId(flags.customer);
    const adGroupRn = resourceName(cid, 'adGroups', flags.adgroup);
    const matchType = MATCH_TYPE_MAP[(flags['match-type'] || 'BROAD').toUpperCase()] || 'BROAD';
    const keywords = flags.keywords.split(',').map(k => k.trim()).filter(Boolean);

    const operations = keywords.map(keyword => ({
      create: {
        adGroup: adGroupRn,
        status: 'ENABLED',
        keyword: {
          text: keyword,
          matchType: matchType,
        },
        ...(flags['cpc-bid-micros'] ? { cpcBidMicros: String(flags['cpc-bid-micros']) } : {}),
      }
    }));

    const result = await googleAdsMutate(cid, 'adGroupCriteria', operations);
    return {
      message: `${keywords.length} keyword(s) added successfully`,
      keywords: keywords,
      match_type: matchType,
      results: result.results,
    };
  },

  async 'remove-keyword'(args) {
    const { positional, flags } = parseArgs(args);
    const criterionId = positional[0];
    if (!criterionId || !flags.adgroup) {
      throw new Error('Usage: remove-keyword <criterion_id> --adgroup=<adgroup_id> [--customer=<id>]');
    }

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const rn = `customers/${cid}/adGroupCriteria/${flags.adgroup}~${criterionId}`;
    return googleAdsMutate(cid, 'adGroupCriteria', [{ remove: rn }]);
  },

  // ── Insights & Reporting ──

  async insights(args) {
    const { positional, flags } = parseArgs(args);
    const entityId = positional[0];
    if (!entityId) throw new Error('Usage: insights <campaign_id|customer_id> [--level=campaign|adgroup|ad] [--date-range=LAST_7_DAYS|LAST_30_DAYS|THIS_MONTH|LAST_MONTH|LAST_90_DAYS] [--since=YYYY-MM-DD --until=YYYY-MM-DD] [--customer=<id>]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const level = (flags.level || 'campaign').toLowerCase();
    const dateRange = flags['date-range'] || 'LAST_7_DAYS';

    let dateFilter;
    if (flags.since && flags.until) {
      dateFilter = `segments.date BETWEEN '${flags.since}' AND '${flags.until}'`;
    } else {
      dateFilter = `segments.date DURING ${dateRange}`;
    }

    let resource, entityFilter, selectFields;

    switch (level) {
      case 'adgroup':
        resource = 'ad_group';
        entityFilter = `campaign.id = ${entityId}`;
        selectFields = `
          ad_group.id,
          ad_group.name,
          ad_group.status,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_per_conversion,
          metrics.search_impression_share`;
        break;
      case 'ad':
        resource = 'ad_group_ad';
        entityFilter = `campaign.id = ${entityId}`;
        selectFields = `
          ad_group_ad.ad.id,
          ad_group_ad.ad.type,
          ad_group_ad.status,
          ad_group.name,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_per_conversion`;
        break;
      case 'campaign':
      default:
        resource = 'campaign';
        // Check if entityId looks like a customer ID (10 digits) or campaign ID
        entityFilter = String(entityId).length >= 10
          ? '' // customer-level, no filter
          : `campaign.id = ${entityId}`;
        selectFields = `
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_per_conversion,
          metrics.search_impression_share,
          metrics.average_cost`;
        break;
    }

    const where = [dateFilter];
    if (entityFilter) where.push(entityFilter);

    return googleAdsQuery(cid,
      `SELECT ${selectFields}
      FROM ${resource}
      WHERE ${where.join(' AND ')}
      ORDER BY metrics.cost_micros DESC
      LIMIT ${flags.limit || 100}`
    );
  },

  async 'keyword-performance'(args) {
    const { positional, flags } = parseArgs(args);
    const adgroupId = positional[0];
    if (!adgroupId) throw new Error('Usage: keyword-performance <adgroup_id> [--customer=<id>] [--date-range=LAST_7_DAYS]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const dateRange = flags['date-range'] || 'LAST_7_DAYS';

    return googleAdsQuery(cid,
      `SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.quality_info.quality_score,
        ad_group_criterion.quality_info.search_predicted_ctr,
        ad_group_criterion.quality_info.creative_quality_score,
        ad_group_criterion.quality_info.post_click_quality_score,
        ad_group.name,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.cost_per_conversion
      FROM keyword_view
      WHERE ad_group.id = ${adgroupId}
        AND segments.date DURING ${dateRange}
      ORDER BY metrics.cost_micros DESC
      LIMIT ${flags.limit || 100}`
    );
  },

  async 'search-terms'(args) {
    const { positional, flags } = parseArgs(args);
    const campaignId = positional[0];
    if (!campaignId) throw new Error('Usage: search-terms <campaign_id> [--customer=<id>] [--date-range=LAST_7_DAYS] [--limit=N]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    const dateRange = flags['date-range'] || 'LAST_7_DAYS';

    return googleAdsQuery(cid,
      `SELECT
        search_term_view.search_term,
        search_term_view.status,
        ad_group.name,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions
      FROM search_term_view
      WHERE campaign.id = ${campaignId}
        AND segments.date DURING ${dateRange}
      ORDER BY metrics.impressions DESC
      LIMIT ${flags.limit || 100}`
    );
  },

  // ── Targeting ──

  async 'search-locations'(args) {
    const { positional, flags } = parseArgs(args);
    const query = positional.join(' ') || flags.q;
    if (!query) throw new Error('Usage: search-locations <query> [--customer=<id>] [--limit=N]');

    const cid = formatCustomerId(flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('GOOGLE_ADS_CUSTOMER_ID required');

    return googleAdsQuery(cid,
      `SELECT
        geo_target_constant.resource_name,
        geo_target_constant.id,
        geo_target_constant.name,
        geo_target_constant.country_code,
        geo_target_constant.target_type,
        geo_target_constant.canonical_name,
        geo_target_constant.status
      FROM geo_target_constant
      WHERE geo_target_constant.name LIKE '%${query}%'
        AND geo_target_constant.status = 'ENABLED'
      LIMIT ${flags.limit || 25}`
    );
  },

  async audiences(args) {
    const { positional, flags } = parseArgs(args);
    const cid = formatCustomerId(positional[0] || flags.customer || process.env.GOOGLE_ADS_CUSTOMER_ID);
    if (!cid) throw new Error('Usage: audiences [customer_id] [--limit=N]');

    return googleAdsQuery(cid,
      `SELECT
        audience.id,
        audience.name,
        audience.status,
        audience.description
      FROM audience
      LIMIT ${flags.limit || 50}`
    );
  },

  // ── GAQL Direct Query ──

  async query(args) {
    const { positional, flags } = parseArgs(args);
    const cid = positional[0];
    const gaql = positional.slice(1).join(' ') || flags.q;
    if (!cid || !gaql) throw new Error('Usage: query <customer_id> "<GAQL_query>" OR query <customer_id> --q="<GAQL_query>"');

    return googleAdsQuery(formatCustomerId(cid), gaql);
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node google-ads.mjs <command> [options]',
      note: 'Values in micros: 1 BRL = 1,000,000 micros (R$ 50/day = 50000000)',
      commands: {
        'Auth': {
          'setup': 'Save credentials globally (~/.config/google-ads/.env)',
          'auth': 'OAuth2 consent URL (needs GOOGLE_ADS_CLIENT_ID)',
          'exchange-token <code>': 'Exchange authorization code for refresh token (auto-saves)',
        },
        'Accounts': {
          'accounts': 'List accessible Google Ads accounts',
          'account-info [customer_id]': 'Account details',
        },
        'Campaigns': {
          'campaigns [customer_id]': 'List campaigns [--status=ENABLED|PAUSED] [--type=SEARCH|DISPLAY|...]',
          'campaign-details <campaign_id>': 'Campaign details with metrics',
          'create-campaign': '--customer=X --name=Y --type=SEARCH --budget-micros=Z [--bid-strategy=MANUAL_CPC]',
          'update-campaign <campaign_id>': '[--status=ENABLED|PAUSED] [--name=X]',
        },
        'Budgets': {
          'create-budget': '--customer=X --name=Y --amount-micros=Z',
        },
        'Ad Groups': {
          'adgroups <campaign_id>': 'List ad groups [--status=ENABLED|PAUSED]',
          'adgroup-details <adgroup_id>': 'Ad group details with metrics',
          'create-adgroup': '--customer=X --campaign=Y --name=Z [--cpc-bid-micros=W]',
          'update-adgroup <adgroup_id>': '[--status=ENABLED|PAUSED] [--cpc-bid-micros=X]',
        },
        'Ads': {
          'ads <adgroup_id>': 'List ads [--status=ENABLED|PAUSED]',
          'ad-details <ad_id>': 'Ad details with metrics',
          'create-ad': '--customer=X --adgroup=Y --headlines="H1|H2|H3" --descriptions="D1|D2" --final-url=URL',
          'update-ad <ad_id>': '--adgroup=X [--status=ENABLED|PAUSED]',
        },
        'Keywords': {
          'keywords <adgroup_id>': 'List keywords with metrics [--status=ENABLED|PAUSED]',
          'add-keywords': '--customer=X --adgroup=Y --keywords="kw1,kw2" [--match-type=BROAD|PHRASE|EXACT]',
          'remove-keyword <criterion_id>': '--adgroup=X [--customer=Y]',
        },
        'Insights': {
          'insights <id>': 'Performance [--level=campaign|adgroup|ad] [--date-range=LAST_7_DAYS|LAST_30_DAYS]',
          'keyword-performance <adgroup_id>': 'Keyword metrics with quality score',
          'search-terms <campaign_id>': 'Search terms report [--date-range=LAST_7_DAYS]',
        },
        'Targeting': {
          'search-locations <query>': 'Search geo targets (cities, regions, countries)',
          'audiences [customer_id]': 'List available audiences',
        },
        'Advanced': {
          'query <customer_id> "<GAQL>"': 'Execute raw GAQL query directly',
        },
      },
      'global_flags': {
        '--format=table': 'Output as table instead of JSON',
        '--limit=<N>': 'Limit number of results',
        '--customer=<id>': 'Override default customer ID',
      },
      env: {
        'GOOGLE_ADS_DEVELOPER_TOKEN': 'Required. Developer token from Google Ads API Center',
        'GOOGLE_ADS_CLIENT_ID': 'Required. OAuth2 Client ID from Google Cloud Console',
        'GOOGLE_ADS_CLIENT_SECRET': 'Required. OAuth2 Client Secret',
        'GOOGLE_ADS_REFRESH_TOKEN': 'Required. OAuth2 Refresh Token (via auth flow)',
        'GOOGLE_ADS_CUSTOMER_ID': 'Required. Default Customer ID (no hyphens)',
        'GOOGLE_ADS_LOGIN_CUSTOMER_ID': 'Optional. MCC Manager account ID (for managed accounts)',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node google-ads.mjs help" for available commands' }));
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
