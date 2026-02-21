#!/usr/bin/env node

// Meta Ads CLI - Direct Graph API Integration
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node meta-ads.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/meta-ads/.env (global - works from any project)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_VERSION = 'v24.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'meta-ads');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// ODAX objective mapping - simplified names to official API enum values
const OBJECTIVE_MAP = {
  'SALES': 'OUTCOME_SALES',
  'TRAFFIC': 'OUTCOME_TRAFFIC',
  'AWARENESS': 'OUTCOME_AWARENESS',
  'ENGAGEMENT': 'OUTCOME_ENGAGEMENT',
  'LEADS': 'OUTCOME_LEADS',
  'APP_PROMOTION': 'OUTCOME_APP_PROMOTION',
};

function resolveObjective(value) {
  const upper = value.toUpperCase();
  return OBJECTIVE_MAP[upper] || upper;
}

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
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function loadEnv() {
  // Load in reverse priority order (lowest first, overwritten by higher)
  // Priority: global < script dir < cwd < shell
  const scriptDir = new URL('.', import.meta.url).pathname;
  const scriptProjectDir = join(scriptDir, '..');

  const globalVars = parseEnvFile(GLOBAL_ENV_FILE);
  const scriptProjectVars = parseEnvFile(join(scriptProjectDir, '.env'));
  const cwdVars = parseEnvFile(join(process.cwd(), '.env'));

  // Apply: global < script project < cwd < shell (shell env already set, only fill gaps)
  const merged = { ...globalVars, ...scriptProjectVars, ...cwdVars };
  for (const [key, value] of Object.entries(merged)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAccessToken() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.error(JSON.stringify({
      error: 'META_ACCESS_TOKEN not set',
      help: 'Configure your token in one of these locations:',
      options: [
        `1. Global (all projects): ${GLOBAL_ENV_FILE}`,
        '2. Project-level: .env in your project root',
        '3. Shell: export META_ACCESS_TOKEN=your_token',
      ],
      setup: [
        '',
        'To get a token:',
        '1. Go to developers.facebook.com and create an App',
        '2. Add "Marketing API" product',
        '3. Go to Tools > Graph API Explorer',
        '4. Select your App and generate a User Access Token',
        '5. Permissions needed: ads_management, ads_read, pages_read_engagement',
        '6. Use the Access Token Tool to generate a Long-Lived Token',
        '',
        'Quick setup (global - works in any project):',
        `  node meta-ads.mjs setup`,
      ]
    }, null, 2));
    process.exit(1);
  }
  return token;
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function graphGet(endpoint, params = {}) {
  const token = getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
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

async function graphPost(endpoint, body = {}) {
  const token = getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.error) {
    throw new ApiError(data.error.message, data.error.code, data.error.type);
  }
  return data;
}

async function graphPostForm(endpoint, formData) {
  const token = getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString(), {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (data.error) {
    throw new ApiError(data.error.message, data.error.code, data.error.type);
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
  if (flags.format === 'table' && Array.isArray(data.data || data)) {
    const items = data.data || data;
    if (items.length === 0) {
      console.log('No results found.');
      return;
    }
    const keys = Object.keys(items[0]);
    const widths = keys.map(k =>
      Math.max(k.length, ...items.map(i => String(i[k] ?? '').length))
    );
    const header = keys.map((k, idx) => k.padEnd(widths[idx])).join(' | ');
    const sep = widths.map(w => '-'.repeat(w)).join('-+-');
    console.log(header);
    console.log(sep);
    for (const item of items) {
      const row = keys.map((k, idx) => String(item[k] ?? '').padEnd(widths[idx])).join(' | ');
      console.log(row);
    }
    if (data.paging?.next) {
      console.log(`\n... more results available (use --after=${data.paging?.cursors?.after})`);
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];
    const appId = flags['app-id'];
    const appSecret = flags['app-secret'];

    if (!token && !appId) {
      return {
        message: 'Save Meta Ads credentials globally (works in any project)',
        usage: 'node meta-ads.mjs setup --token=<your_access_token> [--app-id=<id>] [--app-secret=<secret>]',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/meta-ads/.env',
          'This file is loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
        ],
        get_token: [
          '1. Go to https://developers.facebook.com/apps/',
          '2. Create a new App (type: Business)',
          '3. Add the "Marketing API" product',
          '4. Go to Tools > Graph API Explorer',
          '5. Generate a User Access Token with: ads_management, ads_read, pages_read_engagement',
          '6. Run: node meta-ads.mjs setup --token=YOUR_TOKEN',
        ]
      };
    }

    // Create config dir if needed
    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    // Build env content, preserving existing values
    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.META_ACCESS_TOKEN = token;
    if (appId) existing.META_APP_ID = appId;
    if (appSecret) existing.META_APP_SECRET = appSecret;

    const content = [
      '# Meta Ads API - Global Configuration',
      '# This file is loaded automatically by meta-ads.mjs from any project',
      `# Updated: ${new Date().toISOString()}`,
      '',
      ...Object.entries(existing).map(([k, v]) => `${k}=${v}`),
      ''
    ].join('\n');

    writeFileSync(GLOBAL_ENV_FILE, content, { mode: 0o600 });

    // Reload env so subsequent commands work
    for (const [k, v] of Object.entries(existing)) {
      if (!process.env[k]) process.env[k] = v;
    }

    return {
      message: 'Credentials saved successfully',
      config_file: GLOBAL_ENV_FILE,
      saved_keys: Object.keys(existing),
      test: 'Run: node meta-ads.mjs accounts',
    };
  },

  async auth() {
    const appId = process.env.META_APP_ID;
    if (!appId) {
      return {
        message: 'Setup Meta Ads API access',
        steps: [
          '1. Go to https://developers.facebook.com/apps/',
          '2. Create a new App (type: Business)',
          '3. Add the "Marketing API" product',
          '4. Go to App Settings > Basic to get your App ID and App Secret',
          '5. Save credentials globally:',
          '   node meta-ads.mjs setup --token=<token> --app-id=<id> --app-secret=<secret>',
          '6. Or save to project .env file',
          '7. Run this command again to get the OAuth login link',
          '8. After login, exchange for a long-lived token:',
          '   node meta-ads.mjs exchange-token <short_token>',
        ]
      };
    }
    const redirectUri = 'https://localhost/callback';
    const scopes = 'ads_management,ads_read,pages_read_engagement,pages_show_list';
    const loginUrl = `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    return {
      message: 'Open this URL in your browser to authenticate:',
      login_url: loginUrl,
      next_step: 'After login, copy the "code" parameter from the redirect URL and run: node meta-ads.mjs exchange-token <code>'
    };
  },

  async 'exchange-token'(args) {
    const { positional } = parseArgs(args);
    const code = positional[0];
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!code) throw new Error('Usage: exchange-token <short_lived_token_or_code>');
    if (!appId || !appSecret) throw new Error('META_APP_ID and META_APP_SECRET must be set');

    const url = new URL(`${BASE_URL}/oauth/access_token`);
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', code);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.error) throw new ApiError(data.error.message, data.error.code, data.error.type);

    // Auto-save to global config
    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }
    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    existing.META_ACCESS_TOKEN = data.access_token;
    const content = [
      '# Meta Ads API - Global Configuration',
      `# Updated: ${new Date().toISOString()}`,
      '',
      ...Object.entries(existing).map(([k, v]) => `${k}=${v}`),
      ''
    ].join('\n');
    writeFileSync(GLOBAL_ENV_FILE, content, { mode: 0o600 });

    return {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in_seconds: data.expires_in,
      saved_to: GLOBAL_ENV_FILE,
      message: 'Token saved globally. Ready to use from any project.'
    };
  },

  // ── Accounts ──

  async accounts(args) {
    const { flags } = parseArgs(args);
    const fields = flags.fields || 'id,name,account_status,currency,timezone_name,amount_spent,balance';
    return graphGet('/me/adaccounts', { fields, limit: flags.limit || 50 });
  },

  async 'account-info'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: account-info <account_id>');
    const fields = flags.fields || 'id,name,account_status,currency,timezone_name,amount_spent,balance,spend_cap,business,funding_source,min_daily_budget,owner';
    return graphGet(`/${id}`, { fields });
  },

  async pages(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: pages <account_id>');
    const fields = flags.fields || 'id,name,category,fan_count,link';
    return graphGet(`/${id}/promotable_pages`, { fields });
  },

  // ── Campaigns ──

  async campaigns(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: campaigns <account_id>');
    const fields = flags.fields || 'id,name,objective,status,effective_status,daily_budget,lifetime_budget,budget_remaining,created_time,start_time,stop_time';
    const params = { fields, limit: flags.limit || 50 };
    if (flags.status) params.effective_status = JSON.stringify([flags.status.toUpperCase()]);
    if (flags.after) params.after = flags.after;
    return graphGet(`/${id}/campaigns`, params);
  },

  async 'campaign-details'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: campaign-details <campaign_id>');
    const fields = flags.fields || 'id,name,objective,status,effective_status,daily_budget,lifetime_budget,budget_remaining,bid_strategy,buying_type,special_ad_categories,created_time,start_time,stop_time,updated_time';
    return graphGet(`/${id}`, { fields });
  },

  async 'create-campaign'(args) {
    const { flags } = parseArgs(args);
    if (!flags.account || !flags.name || !flags.objective) {
      throw new Error('Usage: create-campaign --account=<id> --name=<name> --objective=<SALES|TRAFFIC|AWARENESS|ENGAGEMENT|LEADS|APP_PROMOTION> [--status=PAUSED] [--daily-budget=<cents>] [--special-ad-categories=<json>]');
    }
    const body = {
      name: flags.name,
      objective: resolveObjective(flags.objective),
      status: (flags.status || 'PAUSED').toUpperCase(),
      special_ad_categories: flags['special-ad-categories'] ? JSON.parse(flags['special-ad-categories']) : [],
    };
    if (flags['daily-budget']) body.daily_budget = Number(flags['daily-budget']);
    if (flags['lifetime-budget']) body.lifetime_budget = Number(flags['lifetime-budget']);
    if (flags['bid-strategy']) body.bid_strategy = flags['bid-strategy'].toUpperCase();
    return graphPost(`/${flags.account}/campaigns`, body);
  },

  // ── Ad Sets ──

  async adsets(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: adsets <campaign_id|account_id>');
    const fields = flags.fields || 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,start_time,end_time';
    const params = { fields, limit: flags.limit || 50 };
    if (flags.status) params.effective_status = JSON.stringify([flags.status.toUpperCase()]);
    return graphGet(`/${id}/adsets`, params);
  },

  async 'adset-details'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: adset-details <adset_id>');
    const fields = flags.fields || 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,bid_strategy,start_time,end_time,frequency_control_specs,promoted_object';
    return graphGet(`/${id}`, { fields });
  },

  async 'create-adset'(args) {
    const { flags } = parseArgs(args);
    if (!flags.account || !flags.campaign || !flags.name) {
      throw new Error('Usage: create-adset --account=<id> --campaign=<id> --name=<name> --daily-budget=<cents> --targeting=<json> --optimization-goal=<goal> --billing-event=<event> [--status=PAUSED] [--start-time=<iso>] [--end-time=<iso>] [--bid-amount=<cents>]');
    }
    const body = {
      campaign_id: flags.campaign,
      name: flags.name,
      status: (flags.status || 'PAUSED').toUpperCase(),
      optimization_goal: flags['optimization-goal'] || 'LINK_CLICKS',
      billing_event: flags['billing-event'] || 'IMPRESSIONS',
    };
    if (flags['daily-budget']) body.daily_budget = Number(flags['daily-budget']);
    if (flags['lifetime-budget']) body.lifetime_budget = Number(flags['lifetime-budget']);
    if (flags.targeting) body.targeting = JSON.parse(flags.targeting);
    if (flags['bid-amount']) body.bid_amount = Number(flags['bid-amount']);
    if (flags['bid-strategy']) body.bid_strategy = flags['bid-strategy'];
    if (flags['start-time']) body.start_time = flags['start-time'];
    if (flags['end-time']) body.end_time = flags['end-time'];
    if (flags['promoted-object']) body.promoted_object = JSON.parse(flags['promoted-object']);
    return graphPost(`/${flags.account}/adsets`, body);
  },

  async 'update-adset'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: update-adset <adset_id> [--status=<status>] [--daily-budget=<cents>] [--name=<name>] [--targeting=<json>] [--bid-amount=<cents>] [--end-time=<iso>]');
    const body = {};
    if (flags.status) body.status = flags.status.toUpperCase();
    if (flags['daily-budget']) body.daily_budget = Number(flags['daily-budget']);
    if (flags['lifetime-budget']) body.lifetime_budget = Number(flags['lifetime-budget']);
    if (flags.name) body.name = flags.name;
    if (flags.targeting) body.targeting = JSON.parse(flags.targeting);
    if (flags['bid-amount']) body.bid_amount = Number(flags['bid-amount']);
    if (flags['end-time']) body.end_time = flags['end-time'];
    return graphPost(`/${id}`, body);
  },

  // ── Ads ──

  async ads(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: ads <adset_id|campaign_id|account_id>');
    const fields = flags.fields || 'id,name,adset_id,campaign_id,status,effective_status,creative{id,name,title,body,image_url,thumbnail_url},created_time';
    const params = { fields, limit: flags.limit || 50 };
    if (flags.status) params.effective_status = JSON.stringify([flags.status.toUpperCase()]);
    return graphGet(`/${id}/ads`, params);
  },

  async 'ad-details'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: ad-details <ad_id>');
    const fields = flags.fields || 'id,name,adset_id,campaign_id,status,effective_status,creative{id,name,title,body,image_url,thumbnail_url,link_url,call_to_action_type},created_time,updated_time';
    return graphGet(`/${id}`, { fields });
  },

  async 'create-ad'(args) {
    const { flags } = parseArgs(args);
    if (!flags.account || !flags.adset || !flags.name || !flags.creative) {
      throw new Error('Usage: create-ad --account=<id> --adset=<id> --name=<name> --creative=<creative_id> [--status=PAUSED]');
    }
    return graphPost(`/${flags.account}/ads`, {
      adset_id: flags.adset,
      name: flags.name,
      creative: { creative_id: flags.creative },
      status: (flags.status || 'PAUSED').toUpperCase(),
    });
  },

  async 'update-ad'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: update-ad <ad_id> [--status=<status>] [--name=<name>] [--creative=<creative_id>]');
    const body = {};
    if (flags.status) body.status = flags.status.toUpperCase();
    if (flags.name) body.name = flags.name;
    if (flags.creative) body.creative = { creative_id: flags.creative };
    return graphPost(`/${id}`, body);
  },

  // ── Creatives ──

  async creatives(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: creatives <ad_id|account_id>');
    const fields = flags.fields || 'id,name,title,body,image_url,thumbnail_url,link_url,call_to_action_type,object_story_spec';
    return graphGet(`/${id}/adcreatives`, { fields, limit: flags.limit || 50 });
  },

  async 'create-creative'(args) {
    const { flags } = parseArgs(args);
    if (!flags.account || !flags.name || !flags.page) {
      throw new Error('Usage: create-creative --account=<id> --name=<name> --page=<page_id> --image-hash=<hash> --link=<url> --message=<text> --headline=<text> [--description=<text>] [--cta=<LEARN_MORE|SHOP_NOW|SIGN_UP|...>]');
    }
    const body = {
      name: flags.name,
      object_story_spec: {
        page_id: flags.page,
        link_data: {
          link: flags.link || '',
          message: flags.message || '',
          name: flags.headline || '',
          description: flags.description || '',
          call_to_action: flags.cta ? { type: flags.cta.toUpperCase() } : { type: 'LEARN_MORE' },
        }
      }
    };
    if (flags['image-hash']) {
      body.object_story_spec.link_data.image_hash = flags['image-hash'];
    }
    if (flags['image-url']) {
      body.object_story_spec.link_data.picture = flags['image-url'];
    }
    return graphPost(`/${flags.account}/adcreatives`, body);
  },

  async 'update-creative'(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: update-creative <creative_id> [--name=<name>]');
    const body = {};
    if (flags.name) body.name = flags.name;
    return graphPost(`/${id}`, body);
  },

  async 'upload-image'(args) {
    const { positional, flags } = parseArgs(args);
    const account = positional[0] || flags.account;
    const filePath = positional[1] || flags.file;

    if (!account) throw new Error('Usage: upload-image <account_id> <file_path_or_url> OR upload-image --account=<id> --file=<path> OR --url=<image_url>');

    if (flags.url || (filePath && filePath.startsWith('http'))) {
      const imageUrl = flags.url || filePath;
      return graphPost(`/${account}/adimages`, { url: imageUrl });
    }

    if (!filePath) throw new Error('Provide a file path or --url=<image_url>');

    const { readFile } = await import('node:fs/promises');
    const { basename } = await import('node:path');
    const fileBuffer = await readFile(filePath);
    const fileName = basename(filePath);

    const formData = new FormData();
    formData.append('filename', new Blob([fileBuffer]), fileName);

    return graphPostForm(`/${account}/adimages`, formData);
  },

  // ── Insights ──

  async insights(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    if (!id) throw new Error('Usage: insights <campaign_id|adset_id|ad_id|account_id> [--level=campaign|adset|ad] [--date-preset=last_7d|last_30d|yesterday|today|last_90d|this_month|last_month] [--since=YYYY-MM-DD --until=YYYY-MM-DD] [--breakdowns=age,gender,country,placement,device_platform] [--fields=...] [--limit=N]');

    const fields = flags.fields || 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type,purchase_roas,conversions,cost_per_conversion';
    const params = { fields, limit: flags.limit || 100 };

    if (flags.level) params.level = flags.level;
    if (flags['date-preset']) params.date_preset = flags['date-preset'];
    if (flags.since && flags.until) {
      params.time_range = JSON.stringify({ since: flags.since, until: flags.until });
    }
    if (flags.breakdowns) params.breakdowns = flags.breakdowns;
    if (flags.sort) params.sort = flags.sort;
    if (flags['time-increment']) params.time_increment = flags['time-increment'];
    if (flags.filtering) params.filtering = flags.filtering;

    return graphGet(`/${id}/insights`, params);
  },

  // ── Targeting & Audience ──

  async 'search-interests'(args) {
    const { positional, flags } = parseArgs(args);
    const query = positional.join(' ') || flags.q;
    if (!query) throw new Error('Usage: search-interests <query> [--limit=N]');
    return graphGet('/search', {
      type: 'adinterest',
      q: query,
      limit: flags.limit || 25,
    });
  },

  async 'interest-suggestions'(args) {
    const { positional, flags } = parseArgs(args);
    const interests = positional[0] || flags.interests;
    if (!interests) throw new Error('Usage: interest-suggestions <interest_list_json> (e.g. \'["6003139266461","6003277229371"]\')');
    return graphGet('/search', {
      type: 'adinterestsuggestion',
      interest_list: interests,
      limit: flags.limit || 25,
    });
  },

  async 'validate-interests'(args) {
    const { positional, flags } = parseArgs(args);
    const interests = positional[0] || flags.interests;
    if (!interests) throw new Error('Usage: validate-interests <interest_list_json>');
    return graphGet('/search', {
      type: 'adinterestvalid',
      interest_list: interests,
    });
  },

  async 'search-behaviors'(args) {
    const { positional, flags } = parseArgs(args);
    const query = positional.join(' ') || flags.q;
    if (!query) throw new Error('Usage: search-behaviors <query>');
    return graphGet('/search', {
      type: 'adTargetingCategory',
      class: 'behaviors',
      q: query,
      limit: flags.limit || 25,
    });
  },

  async 'search-demographics'(args) {
    const { positional, flags } = parseArgs(args);
    const query = positional.join(' ') || flags.q;
    if (!query) throw new Error('Usage: search-demographics <query>');
    return graphGet('/search', {
      type: 'adTargetingCategory',
      class: 'demographics',
      q: query,
      limit: flags.limit || 25,
    });
  },

  async 'search-locations'(args) {
    const { positional, flags } = parseArgs(args);
    const query = positional.join(' ') || flags.q;
    if (!query) throw new Error('Usage: search-locations <query> [--type=country|region|city|zip|geo_market]');
    const params = {
      type: 'adgeolocation',
      q: query,
      limit: flags.limit || 25,
    };
    if (flags.type) params.location_types = JSON.stringify([flags.type]);
    return graphGet('/search', params);
  },

  // ── Search ──

  async search(args) {
    const { positional, flags } = parseArgs(args);
    const id = positional[0];
    const query = positional.slice(1).join(' ') || flags.q;
    if (!id || !query) throw new Error('Usage: search <account_id> <query>');
    return graphGet(`/${id}/matched_search_applications`, { q: query });
  },

  // ── Budget Schedule ──

  async 'budget-schedule'(args) {
    const { positional, flags } = parseArgs(args);
    const campaignId = positional[0];
    if (!campaignId || !flags.schedule) {
      throw new Error('Usage: budget-schedule <campaign_id> --schedule=<json> (e.g. \'[{"start_time":"2024-01-01","end_time":"2024-01-07","budget_value":"5000"}]\')');
    }
    return graphPost(`/${campaignId}`, {
      budget_schedule_specs: JSON.parse(flags.schedule),
    });
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node meta-ads.mjs <command> [options]',
      commands: {
        'Auth': {
          'setup --token=<t>': 'Save credentials globally (~/.config/meta-ads/.env)',
          'auth': 'OAuth login link (needs META_APP_ID)',
          'exchange-token <token>': 'Exchange for long-lived token (auto-saves)',
        },
        'Accounts': {
          'accounts': 'List ad accounts',
          'account-info <id>': 'Account details',
          'pages <account_id>': 'List pages for account',
        },
        'Campaigns': {
          'campaigns <account_id>': 'List campaigns [--status=ACTIVE|PAUSED]',
          'campaign-details <id>': 'Campaign details',
          'create-campaign': 'Create campaign --account=<id> --name=<n> --objective=<obj>',
        },
        'Ad Sets': {
          'adsets <campaign_id>': 'List ad sets',
          'adset-details <id>': 'Ad set details',
          'create-adset': 'Create ad set --account=<id> --campaign=<id> --name=<n> ...',
          'update-adset <id>': 'Update ad set [--status=X] [--daily-budget=X]',
        },
        'Ads': {
          'ads <adset_id>': 'List ads',
          'ad-details <id>': 'Ad details',
          'create-ad': 'Create ad --account=<id> --adset=<id> --name=<n> --creative=<id>',
          'update-ad <id>': 'Update ad [--status=X]',
        },
        'Creatives': {
          'creatives <id>': 'List creatives',
          'create-creative': 'Create creative --account=<id> --name=<n> --page=<id> ...',
          'update-creative <id>': 'Update creative',
          'upload-image <account_id> <file>': 'Upload image (file path or URL)',
        },
        'Insights': {
          'insights <id>': 'Performance metrics [--date-preset=X] [--breakdowns=X] [--level=X]',
        },
        'Targeting': {
          'search-interests <query>': 'Search interests for targeting',
          'interest-suggestions <ids>': 'Get related interests',
          'validate-interests <ids>': 'Validate interest IDs',
          'search-behaviors <query>': 'Search behaviors',
          'search-demographics <query>': 'Search demographics',
          'search-locations <query>': 'Search geo locations [--type=country|city|...]',
        },
        'Other': {
          'search <account_id> <query>': 'Cross-entity search',
          'budget-schedule <campaign_id>': 'Set budget schedule --schedule=<json>',
        },
      },
      'global_flags': {
        '--format=table': 'Output as table instead of JSON',
        '--fields=<f1,f2,...>': 'Custom fields to return',
        '--limit=<N>': 'Limit number of results',
      },
      env: {
        'META_ACCESS_TOKEN': 'Required. Your Meta long-lived access token',
        'META_APP_ID': 'Optional. For OAuth login flow',
        'META_APP_SECRET': 'Optional. For token exchange',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node meta-ads.mjs help" for available commands' }));
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
