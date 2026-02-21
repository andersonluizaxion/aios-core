#!/usr/bin/env node

// Campaign Monitor CLI - Cross-Platform Campaign Health Monitoring
// Zero dependencies - uses native fetch (Node 18+)
// Aggregates data from Meta Ads (Graph API) and Google Ads (REST API)
// Usage: node campaign-monitor.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/campaign-monitor/.env (global - works from any project)

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const META_API_VERSION = 'v24.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const GOOGLE_API_VERSION = 'v18';
const GOOGLE_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_API_VERSION}`;
const GOOGLE_OAUTH2_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'campaign-monitor');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// ─── Alert Rules ────────────────────────────────────────────────────────────

const ALERT_RULES = [
  { name: 'high_cpa', metric: 'cpa', condition: '>', threshold: 2.0, unit: 'x target', severity: 'CRITICAL', minDays: 3, description: 'CPA exceeds 2x target for 3+ days', action: 'Review targeting and creatives. Consider pausing low-performing ad sets.' },
  { name: 'ctr_drop', metric: 'ctr_trend', condition: '<', threshold: -30, unit: '%', severity: 'WARNING', minDays: 3, description: 'CTR dropped more than 30% vs previous period', action: 'Refresh creatives, test new ad copy. Check audience overlap.' },
  { name: 'creative_fatigue', metric: 'frequency', condition: '>', threshold: 4, unit: '', severity: 'WARNING', minDays: 1, description: 'Frequency above 4 indicates audience saturation', action: 'Rotate creatives, expand audience, or reduce budget.' },
  { name: 'underspend', metric: 'spend_pct', condition: '<', threshold: 50, unit: '% of budget', severity: 'WARNING', minDays: 2, description: 'Spending less than 50% of daily budget for 2+ days', action: 'Check bid strategy, expand targeting, or raise bids.' },
  { name: 'zero_conversions', metric: 'conversions', condition: '==', threshold: 0, unit: '', severity: 'CRITICAL', minDays: 2, description: 'Zero conversions for 2+ consecutive days', action: 'Verify pixel/conversion tracking. Check landing page. Review audience relevance.' },
  { name: 'low_roas', metric: 'roas', condition: '<', threshold: 1.0, unit: '', severity: 'CRITICAL', minDays: 5, description: 'ROAS below 1.0 for 5+ days (losing money)', action: 'Pause campaign. Analyze funnel. Consider restructuring before relaunch.' },
];

// ─── Env Loader ─────────────────────────────────────────────────────────────

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
  // Also check meta-ads and google-ads global configs as fallback
  const metaGlobalVars = parseEnvFile(join(homedir(), '.config', 'meta-ads', '.env'));
  const googleGlobalVars = parseEnvFile(join(homedir(), '.config', 'google-ads', '.env'));
  const scriptProjectVars = parseEnvFile(join(scriptProjectDir, '.env'));
  const cwdVars = parseEnvFile(join(process.cwd(), '.env'));

  // Apply: globals < script project < cwd < shell
  const merged = { ...metaGlobalVars, ...googleGlobalVars, ...globalVars, ...scriptProjectVars, ...cwdVars };
  for (const [key, value] of Object.entries(merged)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// ─── Error Class ────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

// ─── Meta Ads API ───────────────────────────────────────────────────────────

function getMetaToken() {
  return process.env.META_ACCESS_TOKEN || null;
}

function getMetaAccountId() {
  return process.env.META_AD_ACCOUNT_ID || null;
}

async function metaGraphGet(endpoint, params = {}) {
  const token = getMetaToken();
  if (!token) throw new ApiError('META_ACCESS_TOKEN not set', 401, 'AUTH_ERROR');

  const url = new URL(`${META_BASE_URL}${endpoint}`);
  url.searchParams.set('access_token', token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new ApiError(data.error.message, data.error.code, data.error.type);
  }
  return data;
}

async function fetchMetaAccounts() {
  const fields = 'id,name,account_status,currency,timezone_name';
  return metaGraphGet('/me/adaccounts', { fields, limit: 50 });
}

async function fetchMetaActiveCampaigns(accountId) {
  const fields = 'id,name,objective,status,effective_status,daily_budget,lifetime_budget,budget_remaining';
  return metaGraphGet(`/${accountId}/campaigns`, {
    fields,
    effective_status: JSON.stringify(['ACTIVE']),
    limit: 100,
  });
}

async function fetchMetaCampaignInsights(campaignId, datePreset = 'last_7d') {
  const fields = 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type,purchase_roas,conversions,cost_per_conversion';
  return metaGraphGet(`/${campaignId}/insights`, { fields, date_preset: datePreset });
}

// ─── Google Ads API ─────────────────────────────────────────────────────────

let googleCachedAccessToken = null;
let googleTokenExpiresAt = 0;

function getGoogleConfig() {
  return {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || null,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || null,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || null,
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || null,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || null,
  };
}

function isGoogleConfigured() {
  const config = getGoogleConfig();
  return !!(config.clientId && config.clientSecret && config.refreshToken && config.developerToken && config.customerId);
}

async function getGoogleAccessToken() {
  if (googleCachedAccessToken && Date.now() < googleTokenExpiresAt - 60_000) {
    return googleCachedAccessToken;
  }

  const config = getGoogleConfig();
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new ApiError('Google Ads credentials not configured', 401, 'AUTH_ERROR');
  }

  const res = await fetch(GOOGLE_OAUTH2_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new ApiError(`OAuth2 token refresh failed: ${data.error_description || data.error}`, 401, 'AUTH_ERROR');
  }

  googleCachedAccessToken = data.access_token;
  googleTokenExpiresAt = Date.now() + (data.expires_in * 1000);
  return googleCachedAccessToken;
}

function formatCustomerId(id) {
  return String(id).replace(/[-\s]/g, '');
}

async function googleAdsQuery(customerId, query) {
  const config = getGoogleConfig();
  const cid = formatCustomerId(customerId);
  const token = await getGoogleAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    'developer-token': config.developerToken,
    'Authorization': `Bearer ${token}`,
  };
  if (config.loginCustomerId) {
    headers['login-customer-id'] = formatCustomerId(config.loginCustomerId);
  }

  const url = `${GOOGLE_BASE_URL}/customers/${cid}/googleAds:searchStream`;
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

async function fetchGoogleActiveCampaigns(customerId) {
  return googleAdsQuery(customerId,
    `SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion,
      metrics.average_cpc
    FROM campaign
    WHERE campaign.status = 'ENABLED'
      AND segments.date DURING LAST_7_DAYS
    ORDER BY metrics.cost_micros DESC
    LIMIT 100`
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function microsToCurrency(micros) {
  return (Number(micros) / 1_000_000).toFixed(2);
}

function extractMetaConversions(actions) {
  if (!actions || !Array.isArray(actions)) return 0;
  const purchaseAction = actions.find(a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
  if (purchaseAction) return Number(purchaseAction.value) || 0;
  const leadAction = actions.find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.fb_pixel_lead');
  if (leadAction) return Number(leadAction.value) || 0;
  const completeReg = actions.find(a => a.action_type === 'offsite_conversion.fb_pixel_complete_registration');
  if (completeReg) return Number(completeReg.value) || 0;
  // Fallback to total actions
  const totalActions = actions.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  return totalActions;
}

function extractMetaCPA(costPerAction) {
  if (!costPerAction || !Array.isArray(costPerAction)) return null;
  const purchase = costPerAction.find(a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase');
  if (purchase) return Number(purchase.value) || null;
  const lead = costPerAction.find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.fb_pixel_lead');
  if (lead) return Number(lead.value) || null;
  return null;
}

function extractMetaROAS(purchaseRoas) {
  if (!purchaseRoas || !Array.isArray(purchaseRoas)) return null;
  const roas = purchaseRoas.find(r => r.action_type === 'omni_purchase' || r.action_type === 'purchase');
  return roas ? Number(roas.value) || null : null;
}

function assessHealth(campaign) {
  const alerts = [];

  // Check each rule
  for (const rule of ALERT_RULES) {
    let value = null;
    let triggered = false;

    switch (rule.metric) {
      case 'cpa':
        if (campaign.cpa !== null && campaign.targetCpa !== null && campaign.targetCpa > 0) {
          value = campaign.cpa / campaign.targetCpa;
          triggered = value > rule.threshold;
        }
        break;
      case 'frequency':
        if (campaign.frequency !== null) {
          value = campaign.frequency;
          triggered = value > rule.threshold;
        }
        break;
      case 'conversions':
        value = campaign.conversions;
        triggered = value === rule.threshold;
        break;
      case 'roas':
        if (campaign.roas !== null) {
          value = campaign.roas;
          triggered = value < rule.threshold;
        }
        break;
      case 'spend_pct':
        if (campaign.spendPct !== null) {
          value = campaign.spendPct;
          triggered = value < rule.threshold;
        }
        break;
      case 'ctr_trend':
        // CTR trend requires historical comparison, simplified here
        break;
    }

    if (triggered) {
      alerts.push({
        rule: rule.name,
        severity: rule.severity,
        value,
        threshold: rule.threshold,
        unit: rule.unit,
        description: rule.description,
        action: rule.action,
      });
    }
  }

  // Determine overall health
  const hasCritical = alerts.some(a => a.severity === 'CRITICAL');
  const hasWarning = alerts.some(a => a.severity === 'WARNING');

  let health = 'HEALTHY';
  if (hasCritical) health = 'CRITICAL';
  else if (hasWarning) health = 'WARNING';

  return { health, alerts };
}

// ─── Terminal Colors ────────────────────────────────────────────────────────

const isTTY = process.stdout.isTTY;

const colors = {
  reset: isTTY ? '\x1b[0m' : '',
  bold: isTTY ? '\x1b[1m' : '',
  red: isTTY ? '\x1b[31m' : '',
  green: isTTY ? '\x1b[32m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  dim: isTTY ? '\x1b[2m' : '',
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

function healthColor(health) {
  switch (health) {
    case 'HEALTHY': return colorize(health, colors.green);
    case 'WARNING': return colorize(health, colors.yellow);
    case 'CRITICAL': return colorize(health, colors.red);
    default: return health;
  }
}

function severityColor(severity) {
  switch (severity) {
    case 'CRITICAL': return colorize(severity, colors.red);
    case 'WARNING': return colorize(severity, colors.yellow);
    default: return severity;
  }
}

// ─── Args Parser ────────────────────────────────────────────────────────────

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

// ─── Output ─────────────────────────────────────────────────────────────────

function outputTable(headers, rows, opts = {}) {
  if (rows.length === 0) {
    console.log('No results found.');
    return;
  }

  const widths = headers.map((h, idx) =>
    Math.max(h.length, ...rows.map(r => stripAnsi(String(r[idx] ?? '')).length))
  );

  const headerLine = headers.map((h, idx) => h.padEnd(widths[idx])).join(' | ');
  const sep = widths.map(w => '-'.repeat(w)).join('-+-');

  if (opts.title) {
    console.log(`\n${colors.bold}${opts.title}${colors.reset}`);
  }
  console.log(headerLine);
  console.log(sep);
  for (const row of rows) {
    const line = row.map((cell, idx) => {
      const str = String(cell ?? '');
      const stripped = stripAnsi(str);
      const pad = widths[idx] - stripped.length;
      return str + ' '.repeat(Math.max(0, pad));
    }).join(' | ');
    console.log(line);
  }
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function output(data, flags = {}) {
  if (flags.format === 'table' && Array.isArray(data.data || data.results || data)) {
    const items = data.data || data.results || data;
    if (items.length === 0) {
      console.log('No results found.');
      return;
    }
    const keys = Object.keys(items[0]);
    const widths = keys.map(k =>
      Math.max(k.length, ...items.map(i => String(i[k] ?? '').length))
    );
    const header = keys.map((k, idx) => k.padEnd(widths[idx])).join(' | ');
    const sepLine = widths.map(w => '-'.repeat(w)).join('-+-');
    console.log(header);
    console.log(sepLine);
    for (const item of items) {
      const row = keys.map((k, idx) => String(item[k] ?? '').padEnd(widths[idx])).join(' | ');
      console.log(row);
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Data Aggregation ───────────────────────────────────────────────────────

async function aggregateCampaigns(flags = {}) {
  const campaigns = [];
  const errors = [];
  const metaToken = getMetaToken();
  const googleConfig = getGoogleConfig();
  const datePreset = flags['date-preset'] || 'last_7d';

  // ── Fetch Meta campaigns ──
  if (metaToken) {
    try {
      const accounts = await fetchMetaAccounts();
      const adAccounts = accounts.data || [];

      for (const account of adAccounts) {
        if (account.account_status !== 1) continue; // Only active accounts

        try {
          const campaignData = await fetchMetaActiveCampaigns(account.id);
          const activeCampaigns = campaignData.data || [];

          for (const c of activeCampaigns) {
            try {
              const insightsData = await fetchMetaCampaignInsights(c.id, datePreset);
              const insights = insightsData.data && insightsData.data[0] ? insightsData.data[0] : {};

              const spend = Number(insights.spend) || 0;
              const conversions = extractMetaConversions(insights.actions);
              const cpa = extractMetaCPA(insights.cost_per_action_type);
              const roas = extractMetaROAS(insights.purchase_roas);
              const dailyBudget = Number(c.daily_budget) / 100 || null; // Meta stores in cents
              const spendPct = dailyBudget ? (spend / (dailyBudget * 7)) * 100 : null; // 7 days

              campaigns.push({
                name: c.name,
                platform: 'Meta',
                status: c.effective_status || c.status,
                spend: spend.toFixed(2),
                cpa: cpa !== null ? cpa.toFixed(2) : '-',
                roas: roas !== null ? roas.toFixed(2) : '-',
                ctr: insights.ctr ? `${Number(insights.ctr).toFixed(2)}%` : '-',
                frequency: insights.frequency ? Number(insights.frequency).toFixed(1) : '-',
                conversions,
                impressions: Number(insights.impressions) || 0,
                clicks: Number(insights.clicks) || 0,
                // Internal fields for health assessment
                _cpa: cpa,
                _roas: roas,
                _frequency: insights.frequency ? Number(insights.frequency) : null,
                _spendPct: spendPct,
                _targetCpa: null, // Not available from API directly
                _dailyBudget: dailyBudget,
              });
            } catch (insightErr) {
              // Campaign may not have insights yet
              campaigns.push({
                name: c.name,
                platform: 'Meta',
                status: c.effective_status || c.status,
                spend: '0.00',
                cpa: '-',
                roas: '-',
                ctr: '-',
                frequency: '-',
                conversions: 0,
                impressions: 0,
                clicks: 0,
                _cpa: null,
                _roas: null,
                _frequency: null,
                _spendPct: null,
                _targetCpa: null,
                _dailyBudget: null,
              });
            }
          }
        } catch (campaignErr) {
          errors.push({ platform: 'Meta', account: account.id, error: campaignErr.message });
        }
      }
    } catch (metaErr) {
      errors.push({ platform: 'Meta', error: metaErr.message });
    }
  }

  // ── Fetch Google campaigns ──
  if (isGoogleConfigured()) {
    try {
      const cid = formatCustomerId(googleConfig.customerId);
      const result = await fetchGoogleActiveCampaigns(cid);
      const googleCampaigns = result.results || [];

      for (const row of googleCampaigns) {
        const c = row.campaign || {};
        const m = row.metrics || {};
        const b = row.campaignBudget || {};

        const spend = Number(m.costMicros) ? Number(m.costMicros) / 1_000_000 : 0;
        const conversions = Number(m.conversions) || 0;
        const cpa = m.costPerConversion ? Number(m.costPerConversion) / 1_000_000 : (conversions > 0 ? spend / conversions : null);
        const convValue = Number(m.conversionsValue) || 0;
        const roas = spend > 0 ? convValue / spend : null;
        const dailyBudget = b.amountMicros ? Number(b.amountMicros) / 1_000_000 : null;
        const spendPct = dailyBudget ? (spend / (dailyBudget * 7)) * 100 : null;
        const ctr = m.ctr ? (Number(m.ctr) * 100).toFixed(2) : null;

        campaigns.push({
          name: c.name || c.id,
          platform: 'Google',
          status: c.status || 'ENABLED',
          spend: spend.toFixed(2),
          cpa: cpa !== null ? cpa.toFixed(2) : '-',
          roas: roas !== null ? roas.toFixed(2) : '-',
          ctr: ctr !== null ? `${ctr}%` : '-',
          frequency: '-', // Google does not expose frequency at campaign level
          conversions,
          impressions: Number(m.impressions) || 0,
          clicks: Number(m.clicks) || 0,
          _cpa: cpa,
          _roas: roas,
          _frequency: null,
          _spendPct: spendPct,
          _targetCpa: null,
          _dailyBudget: dailyBudget,
        });
      }
    } catch (googleErr) {
      errors.push({ platform: 'Google', error: googleErr.message });
    }
  }

  return { campaigns, errors };
}

// ─── Commands ───────────────────────────────────────────────────────────────

const commands = {

  // ── Auth ──

  async auth() {
    const metaToken = getMetaToken();
    const googleConfigured = isGoogleConfigured();
    const googleConfig = getGoogleConfig();

    const status = {
      meta: {
        configured: !!metaToken,
        token_preview: metaToken ? `${metaToken.substring(0, 10)}...${metaToken.substring(metaToken.length - 5)}` : 'NOT SET',
        help: metaToken ? null : 'Run: node meta-ads.mjs setup --token=YOUR_TOKEN',
      },
      google: {
        configured: googleConfigured,
        developer_token: googleConfig.developerToken ? 'SET' : 'NOT SET',
        client_id: googleConfig.clientId ? 'SET' : 'NOT SET',
        client_secret: googleConfig.clientSecret ? 'SET' : 'NOT SET',
        refresh_token: googleConfig.refreshToken ? 'SET' : 'NOT SET',
        customer_id: googleConfig.customerId || 'NOT SET',
        help: googleConfigured ? null : 'Run: node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X',
      },
      overall: metaToken || googleConfigured
        ? 'At least one platform configured. Ready to monitor.'
        : 'No platform configured. Set up Meta and/or Google credentials first.',
    };

    return status;
  },

  // ── Health ──

  async health(args) {
    const { flags } = parseArgs(args);
    const { campaigns, errors } = await aggregateCampaigns(flags);

    if (campaigns.length === 0 && errors.length > 0) {
      return { error: 'No campaigns found', errors };
    }

    if (campaigns.length === 0) {
      return { message: 'No active campaigns found across platforms.' };
    }

    // Assess health for each campaign
    const results = campaigns.map(c => {
      const { health, alerts } = assessHealth({
        cpa: c._cpa,
        targetCpa: c._targetCpa,
        roas: c._roas,
        frequency: c._frequency,
        conversions: c.conversions,
        spendPct: c._spendPct,
      });
      return { ...c, health, alertCount: alerts.length };
    });

    if (flags.format === 'table') {
      const headers = ['Campaign', 'Platform', 'Status', 'Spend', 'CPA', 'ROAS', 'CTR', 'Freq', 'Conv', 'Health'];
      const rows = results.map(r => [
        r.name.length > 35 ? r.name.substring(0, 32) + '...' : r.name,
        r.platform,
        r.status,
        r.spend,
        r.cpa,
        r.roas,
        r.ctr,
        r.frequency,
        r.conversions,
        healthColor(r.health),
      ]);
      outputTable(headers, rows, { title: 'Campaign Health Monitor' });

      if (errors.length > 0) {
        console.log(`\n${colors.dim}Errors: ${errors.map(e => `[${e.platform}] ${e.error}`).join('; ')}${colors.reset}`);
      }
      return;
    }

    return {
      campaigns: results.map(r => ({
        name: r.name,
        platform: r.platform,
        status: r.status,
        spend: r.spend,
        cpa: r.cpa,
        roas: r.roas,
        ctr: r.ctr,
        frequency: r.frequency,
        conversions: r.conversions,
        health: r.health,
        alert_count: r.alertCount,
      })),
      total: results.length,
      healthy: results.filter(r => r.health === 'HEALTHY').length,
      warning: results.filter(r => r.health === 'WARNING').length,
      critical: results.filter(r => r.health === 'CRITICAL').length,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  // ── Alerts ──

  async alerts(args) {
    const { flags } = parseArgs(args);
    const { campaigns, errors } = await aggregateCampaigns(flags);

    if (campaigns.length === 0) {
      return { message: 'No active campaigns to check for alerts.' };
    }

    const allAlerts = [];

    for (const c of campaigns) {
      const { alerts } = assessHealth({
        cpa: c._cpa,
        targetCpa: c._targetCpa,
        roas: c._roas,
        frequency: c._frequency,
        conversions: c.conversions,
        spendPct: c._spendPct,
      });

      for (const alert of alerts) {
        allAlerts.push({
          campaign: c.name,
          platform: c.platform,
          alert: alert.rule,
          severity: alert.severity,
          value: alert.value !== null ? Number(alert.value).toFixed(2) : '-',
          threshold: `${alert.threshold}${alert.unit ? ' ' + alert.unit : ''}`,
          description: alert.description,
          action: alert.action,
        });
      }
    }

    // Sort: CRITICAL first, then WARNING
    allAlerts.sort((a, b) => {
      if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
      if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
      return 0;
    });

    if (flags.format === 'table') {
      if (allAlerts.length === 0) {
        console.log(`\n${colors.green}${colors.bold}All campaigns healthy. No alerts triggered.${colors.reset}\n`);
        return;
      }

      const headers = ['Campaign', 'Platform', 'Alert', 'Severity', 'Value', 'Threshold'];
      const rows = allAlerts.map(a => [
        a.campaign.length > 30 ? a.campaign.substring(0, 27) + '...' : a.campaign,
        a.platform,
        a.alert,
        severityColor(a.severity),
        a.value,
        a.threshold,
      ]);
      outputTable(headers, rows, { title: 'Campaign Alerts' });

      // Show recommended actions
      const uniqueAlerts = [...new Set(allAlerts.map(a => a.alert))];
      console.log(`\n${colors.bold}Recommended Actions:${colors.reset}`);
      for (const alertName of uniqueAlerts) {
        const alertInfo = allAlerts.find(a => a.alert === alertName);
        console.log(`  ${severityColor(alertInfo.severity)} ${alertName}: ${alertInfo.action}`);
      }
      console.log('');
      return;
    }

    return {
      alerts: allAlerts,
      total: allAlerts.length,
      critical: allAlerts.filter(a => a.severity === 'CRITICAL').length,
      warning: allAlerts.filter(a => a.severity === 'WARNING').length,
    };
  },

  // ── Rules ──

  async rules(args) {
    const { flags } = parseArgs(args);

    if (flags.format === 'table') {
      const headers = ['Rule', 'Metric', 'Condition', 'Threshold', 'Severity', 'Min Days'];
      const rows = ALERT_RULES.map(r => [
        r.name,
        r.metric,
        r.condition,
        `${r.threshold}${r.unit ? ' ' + r.unit : ''}`,
        severityColor(r.severity),
        String(r.minDays),
      ]);
      outputTable(headers, rows, { title: 'Alert Rules' });

      console.log(`\n${colors.bold}Rule Details:${colors.reset}`);
      for (const rule of ALERT_RULES) {
        console.log(`  ${colors.bold}${rule.name}${colors.reset}: ${rule.description}`);
        console.log(`    Action: ${rule.action}`);
      }
      console.log('');
      return;
    }

    return {
      rules: ALERT_RULES.map(r => ({
        name: r.name,
        metric: r.metric,
        condition: `${r.condition} ${r.threshold}${r.unit ? ' ' + r.unit : ''}`,
        severity: r.severity,
        min_days: r.minDays,
        description: r.description,
        recommended_action: r.action,
      })),
      total: ALERT_RULES.length,
    };
  },

  // ── Summary ──

  async summary(args) {
    const { flags } = parseArgs(args);
    const { campaigns, errors } = await aggregateCampaigns(flags);

    if (campaigns.length === 0) {
      return { message: 'No active campaigns found across platforms.' };
    }

    // Overall metrics
    const totalSpend = campaigns.reduce((sum, c) => sum + Number(c.spend), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const blendedCPA = totalConversions > 0 ? totalSpend / totalConversions : null;

    // Calculate blended ROAS from campaigns that have it
    const campaignsWithROAS = campaigns.filter(c => c._roas !== null && c._roas !== undefined);
    const totalRevenue = campaignsWithROAS.reduce((sum, c) => sum + (c._roas * Number(c.spend)), 0);
    const blendedROAS = totalSpend > 0 && campaignsWithROAS.length > 0 ? totalRevenue / totalSpend : null;

    const blendedCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : null;

    // Per-platform breakdown
    const platforms = {};
    for (const c of campaigns) {
      if (!platforms[c.platform]) {
        platforms[c.platform] = { spend: 0, conversions: 0, impressions: 0, clicks: 0, campaigns: 0 };
      }
      platforms[c.platform].spend += Number(c.spend);
      platforms[c.platform].conversions += c.conversions;
      platforms[c.platform].impressions += c.impressions;
      platforms[c.platform].clicks += c.clicks;
      platforms[c.platform].campaigns += 1;
    }

    // Top and bottom campaigns by spend
    const sortedBySpend = [...campaigns].sort((a, b) => Number(b.spend) - Number(a.spend));
    const top3 = sortedBySpend.slice(0, 3);
    const bottom3 = sortedBySpend.slice(-3).reverse();

    // Health summary
    const healthResults = campaigns.map(c => {
      const { health } = assessHealth({
        cpa: c._cpa,
        targetCpa: c._targetCpa,
        roas: c._roas,
        frequency: c._frequency,
        conversions: c.conversions,
        spendPct: c._spendPct,
      });
      return health;
    });

    if (flags.format === 'table') {
      console.log(`\n${colors.bold}Executive Summary - Campaign Monitor${colors.reset}`);
      console.log(`${colors.dim}Period: ${flags['date-preset'] || 'last_7d'}${colors.reset}\n`);

      // Overall
      console.log(`${colors.bold}Overall Metrics${colors.reset}`);
      console.log(`  Total Spend:       R$ ${totalSpend.toFixed(2)}`);
      console.log(`  Total Conversions: ${totalConversions}`);
      console.log(`  Blended CPA:       ${blendedCPA !== null ? 'R$ ' + blendedCPA.toFixed(2) : '-'}`);
      console.log(`  Blended ROAS:      ${blendedROAS !== null ? blendedROAS.toFixed(2) + 'x' : '-'}`);
      console.log(`  Blended CTR:       ${blendedCTR !== null ? blendedCTR.toFixed(2) + '%' : '-'}`);
      console.log(`  Active Campaigns:  ${campaigns.length}`);
      console.log('');

      // Platform breakdown
      const platHeaders = ['Platform', 'Campaigns', 'Spend', 'Conversions', 'CPA', 'CTR'];
      const platRows = Object.entries(platforms).map(([name, p]) => [
        name,
        String(p.campaigns),
        `R$ ${p.spend.toFixed(2)}`,
        String(p.conversions),
        p.conversions > 0 ? `R$ ${(p.spend / p.conversions).toFixed(2)}` : '-',
        p.impressions > 0 ? `${(p.clicks / p.impressions * 100).toFixed(2)}%` : '-',
      ]);
      outputTable(platHeaders, platRows, { title: 'Platform Breakdown' });

      // Health distribution
      const healthy = healthResults.filter(h => h === 'HEALTHY').length;
      const warning = healthResults.filter(h => h === 'WARNING').length;
      const critical = healthResults.filter(h => h === 'CRITICAL').length;
      console.log(`\n${colors.bold}Health Distribution${colors.reset}`);
      console.log(`  ${colorize('HEALTHY', colors.green)}: ${healthy}  |  ${colorize('WARNING', colors.yellow)}: ${warning}  |  ${colorize('CRITICAL', colors.red)}: ${critical}`);

      // Top 3
      if (top3.length > 0) {
        const topHeaders = ['#', 'Campaign', 'Platform', 'Spend', 'Conv', 'CPA', 'ROAS'];
        const topRows = top3.map((c, i) => [
          String(i + 1),
          c.name.length > 30 ? c.name.substring(0, 27) + '...' : c.name,
          c.platform,
          `R$ ${c.spend}`,
          String(c.conversions),
          c.cpa,
          c.roas,
        ]);
        outputTable(topHeaders, topRows, { title: '\nTop 3 by Spend' });
      }

      // Bottom 3
      if (bottom3.length > 0 && campaigns.length > 3) {
        const botHeaders = ['#', 'Campaign', 'Platform', 'Spend', 'Conv', 'CPA', 'ROAS'];
        const botRows = bottom3.map((c, i) => [
          String(i + 1),
          c.name.length > 30 ? c.name.substring(0, 27) + '...' : c.name,
          c.platform,
          `R$ ${c.spend}`,
          String(c.conversions),
          c.cpa,
          c.roas,
        ]);
        outputTable(botHeaders, botRows, { title: '\nBottom 3 by Spend' });
      }

      if (errors.length > 0) {
        console.log(`\n${colors.dim}Errors: ${errors.map(e => `[${e.platform}] ${e.error}`).join('; ')}${colors.reset}`);
      }
      console.log('');
      return;
    }

    return {
      period: flags['date-preset'] || 'last_7d',
      overall: {
        total_spend: totalSpend.toFixed(2),
        total_conversions: totalConversions,
        blended_cpa: blendedCPA !== null ? blendedCPA.toFixed(2) : null,
        blended_roas: blendedROAS !== null ? blendedROAS.toFixed(2) : null,
        blended_ctr: blendedCTR !== null ? blendedCTR.toFixed(2) : null,
        active_campaigns: campaigns.length,
      },
      platforms: Object.fromEntries(
        Object.entries(platforms).map(([name, p]) => [name, {
          campaigns: p.campaigns,
          spend: p.spend.toFixed(2),
          conversions: p.conversions,
          cpa: p.conversions > 0 ? (p.spend / p.conversions).toFixed(2) : null,
          ctr: p.impressions > 0 ? (p.clicks / p.impressions * 100).toFixed(2) : null,
        }])
      ),
      health: {
        healthy: healthResults.filter(h => h === 'HEALTHY').length,
        warning: healthResults.filter(h => h === 'WARNING').length,
        critical: healthResults.filter(h => h === 'CRITICAL').length,
      },
      top_3: top3.map(c => ({ name: c.name, platform: c.platform, spend: c.spend, conversions: c.conversions, cpa: c.cpa, roas: c.roas })),
      bottom_3: campaigns.length > 3 ? bottom3.map(c => ({ name: c.name, platform: c.platform, spend: c.spend, conversions: c.conversions, cpa: c.cpa, roas: c.roas })) : [],
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node campaign-monitor.mjs <command> [options]',
      description: 'Cross-platform campaign health monitoring. Aggregates Meta Ads and Google Ads data.',
      commands: {
        'Monitoring': {
          'health': 'Quick health check across all active campaigns',
          'alerts': 'Show campaigns that triggered alert rules',
          'summary': 'Executive summary of all platforms',
          'rules': 'List monitoring rules and thresholds',
        },
        'Auth': {
          'auth': 'Verify Meta and Google credentials are configured',
        },
      },
      global_flags: {
        '--format=table': 'Output as formatted table with colors (recommended)',
        '--date-preset=<preset>': 'Time period: last_7d (default), last_30d, yesterday, today, last_90d',
      },
      env: {
        'META_ACCESS_TOKEN': 'Meta Graph API token (shared with meta-ads.mjs)',
        'GOOGLE_ADS_DEVELOPER_TOKEN': 'Google Ads developer token (shared with google-ads.mjs)',
        'GOOGLE_ADS_CLIENT_ID': 'Google OAuth2 Client ID',
        'GOOGLE_ADS_CLIENT_SECRET': 'Google OAuth2 Client Secret',
        'GOOGLE_ADS_REFRESH_TOKEN': 'Google OAuth2 Refresh Token',
        'GOOGLE_ADS_CUSTOMER_ID': 'Google Ads Customer ID (no hyphens)',
      },
      setup: [
        'This tool reuses credentials from meta-ads.mjs and google-ads.mjs.',
        'If you have already set up those tools, campaign-monitor will work automatically.',
        '',
        'Quick check: node campaign-monitor.mjs auth',
        '',
        'If not yet configured:',
        '  Meta:   node meta-ads.mjs setup --token=YOUR_TOKEN',
        '  Google: node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X',
      ],
    };
  },
};

// ─── Main ───────────────────────────────────────────────────────────────────

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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node campaign-monitor.mjs help" for available commands' }));
    process.exit(1);
  }

  try {
    const result = await handler(commandArgs);
    if (result !== undefined) {
      output(result, flags);
    }
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
