#!/usr/bin/env node

// WhatsApp Business CLI - Direct Graph API Integration
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node whatsapp-business.mjs <command> [options]
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/whatsapp-business/.env (global - works from any project)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline';

const API_VERSION = 'v24.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'whatsapp-business');
const GLOBAL_ENV_FILE = join(GLOBAL_CONFIG_DIR, '.env');

// Template categories reference
const TEMPLATE_CATEGORIES = {
  MARKETING: 'Promotional messages, offers, product announcements',
  UTILITY: 'Order updates, account alerts, appointment reminders',
  AUTHENTICATION: 'OTP codes, verification messages',
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
        'WhatsApp Business API uses the same Meta Graph API token.',
        'If you already have meta-ads configured, the same token works.',
        '',
        'Quick setup:',
        '  node whatsapp-business.mjs setup --token=YOUR_TOKEN --waba-id=YOUR_WABA_ID',
      ]
    }, null, 2));
    process.exit(1);
  }
  return token;
}

function getWabaId() {
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!wabaId) {
    console.error(JSON.stringify({
      error: 'WHATSAPP_BUSINESS_ACCOUNT_ID not set',
      help: 'Set your WhatsApp Business Account ID:',
      options: [
        '1. Run: node whatsapp-business.mjs accounts (to find your WABA ID)',
        '2. Then: node whatsapp-business.mjs setup --waba-id=YOUR_WABA_ID',
        '3. Or: export WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_WABA_ID',
      ],
      find_waba_id: [
        '1. Go to Meta Business Manager > Business Settings',
        '2. Navigate to Accounts > WhatsApp Accounts',
        '3. Your WABA ID is listed there',
      ]
    }, null, 2));
    process.exit(1);
  }
  return wabaId;
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

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

// ─── Confirmation ────────────────────────────────────────────────────────────

async function confirmAction(message) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`\n${message}\nType "yes" to confirm: `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
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

// ─── Date Helpers ────────────────────────────────────────────────────────────

function getDateRange(flags) {
  const now = new Date();
  let since, until;

  if (flags.since && flags.until) {
    since = flags.since;
    until = flags.until;
  } else if (flags['date-preset']) {
    until = now.toISOString().split('T')[0];
    const preset = flags['date-preset'];
    const d = new Date(now);
    switch (preset) {
      case 'yesterday':
        d.setDate(d.getDate() - 1);
        since = d.toISOString().split('T')[0];
        until = since;
        break;
      case 'last_7d':
        d.setDate(d.getDate() - 7);
        since = d.toISOString().split('T')[0];
        break;
      case 'last_14d':
        d.setDate(d.getDate() - 14);
        since = d.toISOString().split('T')[0];
        break;
      case 'last_30d':
        d.setDate(d.getDate() - 30);
        since = d.toISOString().split('T')[0];
        break;
      case 'last_90d':
        d.setDate(d.getDate() - 90);
        since = d.toISOString().split('T')[0];
        break;
      default:
        d.setDate(d.getDate() - 30);
        since = d.toISOString().split('T')[0];
    }
  } else {
    // Default: last 30 days
    until = now.toISOString().split('T')[0];
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    since = d.toISOString().split('T')[0];
  }

  // Convert to Unix timestamps (seconds)
  const sinceTs = Math.floor(new Date(since + 'T00:00:00Z').getTime() / 1000);
  const untilTs = Math.floor(new Date(until + 'T23:59:59Z').getTime() / 1000);

  return { since: sinceTs, until: untilTs, sinceDate: since, untilDate: until };
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];
    const wabaId = flags['waba-id'];

    if (!token && !wabaId) {
      return {
        message: 'Save WhatsApp Business credentials globally (works in any project)',
        usage: 'node whatsapp-business.mjs setup --token=<meta_access_token> --waba-id=<whatsapp_business_account_id>',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/whatsapp-business/.env',
          'This file is loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
          'META_ACCESS_TOKEN is shared with meta-ads CLI (same Graph API)',
        ],
        find_waba_id: [
          '1. Go to Meta Business Manager > Business Settings',
          '2. Navigate to Accounts > WhatsApp Accounts',
          '3. Your WABA ID is the numeric ID listed there',
          '4. Or run: node whatsapp-business.mjs accounts',
        ],
      };
    }

    // Create config dir if needed
    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    // Build env content, preserving existing values
    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.META_ACCESS_TOKEN = token;
    if (wabaId) existing.WHATSAPP_BUSINESS_ACCOUNT_ID = wabaId;

    const content = [
      '# WhatsApp Business API - Global Configuration',
      '# This file is loaded automatically by whatsapp-business.mjs from any project',
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
      test: 'Run: node whatsapp-business.mjs auth',
    };
  },

  // ── Auth ──

  async auth() {
    const token = getAccessToken();

    // Verify token works and check WhatsApp Business access
    const me = await graphGet('/me', { fields: 'id,name' });

    const result = {
      status: 'authenticated',
      user: me.name,
      user_id: me.id,
      token_preview: token.substring(0, 12) + '...' + token.substring(token.length - 4),
    };

    // Check if WABA ID is configured
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    if (wabaId) {
      try {
        const waba = await graphGet(`/${wabaId}`, { fields: 'id,name,currency,timezone_id,message_template_namespace' });
        result.whatsapp_business_account = {
          id: waba.id,
          name: waba.name,
          currency: waba.currency,
          timezone_id: waba.timezone_id,
          namespace: waba.message_template_namespace,
        };
      } catch (err) {
        result.whatsapp_business_account = { error: err.message, waba_id: wabaId };
      }
    } else {
      result.whatsapp_business_account = 'Not configured. Run: node whatsapp-business.mjs accounts (to find) then setup --waba-id=ID';
    }

    return result;
  },

  // ── Accounts ──

  async accounts(args) {
    const { flags } = parseArgs(args);

    // Get businesses the user has access to
    const businesses = await graphGet('/me/businesses', { fields: 'id,name' });

    if (!businesses.data || businesses.data.length === 0) {
      return {
        message: 'No businesses found for this user',
        help: 'Make sure your Meta Access Token has business_management permission',
      };
    }

    // For each business, get owned WhatsApp Business Accounts
    const results = [];
    for (const biz of businesses.data) {
      try {
        const wabas = await graphGet(`/${biz.id}/owned_whatsapp_business_accounts`, {
          fields: 'id,name,currency,timezone_id,message_template_namespace,account_review_status',
        });
        if (wabas.data) {
          for (const waba of wabas.data) {
            results.push({
              business_id: biz.id,
              business_name: biz.name,
              waba_id: waba.id,
              waba_name: waba.name || '',
              currency: waba.currency || '',
              review_status: waba.account_review_status || '',
            });
          }
        }
      } catch (err) {
        results.push({
          business_id: biz.id,
          business_name: biz.name,
          waba_id: 'error',
          waba_name: err.message,
          currency: '',
          review_status: '',
        });
      }
    }

    if (results.length === 0) {
      return {
        message: 'No WhatsApp Business Accounts found',
        businesses: businesses.data.map(b => ({ id: b.id, name: b.name })),
        help: 'Make sure you have a WhatsApp Business Account linked to your Business Manager',
      };
    }

    if (flags.format === 'table') {
      return { data: results };
    }
    return { whatsapp_business_accounts: results, total: results.length };
  },

  // ── Phone Numbers ──

  async 'phone-numbers'(args) {
    const { positional, flags } = parseArgs(args);
    const wabaId = positional[0] || flags['waba-id'] || getWabaId();
    const fields = flags.fields || 'id,display_phone_number,verified_name,quality_rating,status,name_status,code_verification_status';

    const result = await graphGet(`/${wabaId}/phone_numbers`, { fields, limit: flags.limit || 50 });

    if (flags.format === 'table' && result.data) {
      return {
        data: result.data.map(p => ({
          id: p.id,
          phone: p.display_phone_number,
          verified_name: p.verified_name || '',
          quality: p.quality_rating || '',
          status: p.status || '',
          name_status: p.name_status || '',
        }))
      };
    }

    return result;
  },

  // ── Templates ──

  async templates(args) {
    const { positional, flags } = parseArgs(args);
    const wabaId = positional[0] || flags['waba-id'] || getWabaId();
    const fields = flags.fields || 'name,status,category,language,components,quality_score';
    const params = { fields, limit: flags.limit || 100 };

    if (flags.status) params.status = flags.status.toUpperCase();
    if (flags.category) params.category = flags.category.toUpperCase();
    if (flags.after) params.after = flags.after;

    const result = await graphGet(`/${wabaId}/message_templates`, params);

    if (flags.format === 'table' && result.data) {
      return {
        data: result.data.map(t => ({
          name: t.name,
          status: t.status,
          category: t.category,
          language: t.language,
          quality: t.quality_score?.score || '',
        })),
        paging: result.paging,
      };
    }

    return result;
  },

  async 'template-details'(args) {
    const { positional, flags } = parseArgs(args);
    const wabaId = positional[0] || flags['waba-id'] || getWabaId();
    const templateName = positional[1] || flags.name;
    if (!templateName) throw new Error('Usage: template-details [waba_id] --name=<template_name> OR template-details <waba_id> <template_name>');

    const result = await graphGet(`/${wabaId}/message_templates`, {
      name: templateName,
      fields: 'name,status,category,language,components,quality_score',
    });

    return result;
  },

  // ── Template Analytics ──

  async 'template-analytics'(args) {
    const { positional, flags } = parseArgs(args);
    const wabaId = positional[0] || flags['waba-id'] || getWabaId();
    const { since, until, sinceDate, untilDate } = getDateRange(flags);

    const params = {
      start: since,
      end: until,
      granularity: flags.granularity || 'DAILY',
      metric_types: flags.metrics || 'sent,delivered,read,clicked',
    };

    if (flags['template-ids']) {
      params.template_ids = flags['template-ids'];
    }

    try {
      const result = await graphGet(`/${wabaId}/template_analytics`, params);

      if (flags.format === 'table' && result.data) {
        const rows = [];
        for (const entry of result.data) {
          const templateName = entry.template_id || 'unknown';
          const dataPoints = entry.data_points || [];
          for (const dp of dataPoints) {
            rows.push({
              template: templateName,
              date: dp.start ? new Date(dp.start * 1000).toISOString().split('T')[0] : '',
              sent: dp.sent || 0,
              delivered: dp.delivered || 0,
              read: dp.read || 0,
              clicked: dp.clicked || 0,
            });
          }
        }
        return { data: rows.length > 0 ? rows : [{ message: 'No template analytics data for this period' }] };
      }

      return { period: { since: sinceDate, until: untilDate }, ...result };
    } catch (err) {
      // Template analytics may not be available for all accounts
      if (err.code === 100 || err.code === 10) {
        return {
          message: 'Template analytics not available',
          error: err.message,
          help: 'Template analytics requires WhatsApp Business API v2.0+ and may not be available for all account tiers',
          period: { since: sinceDate, until: untilDate },
        };
      }
      throw err;
    }
  },

  // ── Conversation Analytics ──

  async analytics(args) {
    const { positional, flags } = parseArgs(args);
    const wabaId = positional[0] || flags['waba-id'] || getWabaId();
    const { since, until, sinceDate, untilDate } = getDateRange(flags);

    const granularity = flags.granularity || 'DAY';

    const params = {
      start: since,
      end: until,
      granularity,
      metric_types: flags.metrics || 'conversation,cost',
    };

    if (flags['phone-numbers']) {
      params.phone_numbers = flags['phone-numbers'];
    }

    if (flags['conversation-types']) {
      params.conversation_types = flags['conversation-types'];
    }

    if (flags['conversation-directions']) {
      params.conversation_directions = flags['conversation-directions'];
    }

    try {
      const result = await graphGet(`/${wabaId}/analytics`, params);

      if (flags.format === 'table' && result.data) {
        const rows = [];
        for (const entry of result.data) {
          const dataPoints = entry.data_points || [];
          for (const dp of dataPoints) {
            rows.push({
              date: dp.start ? new Date(dp.start * 1000).toISOString().split('T')[0] : '',
              conversations: dp.conversation || 0,
              user_initiated: dp.conversation_direction?.user_initiated || 0,
              business_initiated: dp.conversation_direction?.business_initiated || 0,
              cost: dp.cost ? `${(dp.cost / 100).toFixed(2)}` : '0.00',
            });
          }
        }

        if (rows.length === 0) {
          rows.push({ message: 'No analytics data for this period' });
        }

        return { data: rows };
      }

      return { period: { since: sinceDate, until: untilDate }, ...result };
    } catch (err) {
      if (err.code === 100 || err.code === 10) {
        return {
          message: 'Conversation analytics not available',
          error: err.message,
          help: 'Conversation analytics requires WhatsApp Business API and may not be available for all account tiers',
          period: { since: sinceDate, until: untilDate },
        };
      }
      throw err;
    }
  },

  // ── Send Template Message ──

  async 'send-template'(args) {
    const { flags } = parseArgs(args);
    const phoneNumberId = flags['phone-number-id'] || flags.from;
    const to = flags.to;
    const templateName = flags.template || flags.name;
    const language = flags.language || flags.lang || 'pt_BR';

    if (!phoneNumberId || !to || !templateName) {
      throw new Error(
        'Usage: send-template --phone-number-id=<id> --to=<phone> --template=<name> [--language=pt_BR] [--params=<json>]\n\n' +
        'Parameters:\n' +
        '  --phone-number-id  Your registered phone number ID (from phone-numbers command)\n' +
        '  --to               Recipient phone number with country code (e.g., 5511999999999)\n' +
        '  --template         Template name (must be approved)\n' +
        '  --language         Template language code (default: pt_BR)\n' +
        '  --params           JSON array of component parameters\n' +
        '                     Example: \'[{"type":"body","parameters":[{"type":"text","text":"John"}]}]\'\n\n' +
        'SAFETY: This command ALWAYS asks for confirmation before sending.'
      );
    }

    // Build the message payload
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
      },
    };

    // Add component parameters if provided
    if (flags.params) {
      try {
        messageBody.template.components = JSON.parse(flags.params);
      } catch (e) {
        throw new Error(`Invalid --params JSON: ${e.message}`);
      }
    }

    // Show preview
    console.log('\n--- MESSAGE PREVIEW ---');
    console.log(`From: Phone Number ID ${phoneNumberId}`);
    console.log(`To: ${to}`);
    console.log(`Template: ${templateName}`);
    console.log(`Language: ${language}`);
    if (messageBody.template.components) {
      console.log(`Parameters: ${JSON.stringify(messageBody.template.components, null, 2)}`);
    }
    console.log('--- END PREVIEW ---\n');

    // Require explicit confirmation
    const confirmed = await confirmAction('Are you sure you want to send this template message?');
    if (!confirmed) {
      return { status: 'cancelled', message: 'Message sending cancelled by user' };
    }

    const result = await graphPost(`/${phoneNumberId}/messages`, messageBody);

    return {
      status: 'sent',
      message_id: result.messages?.[0]?.id || result.id,
      to: to,
      template: templateName,
      result,
    };
  },

  // ── Help ──

  async help() {
    return {
      usage: 'node whatsapp-business.mjs <command> [options]',
      commands: {
        'Auth & Setup': {
          'setup --token=<t> --waba-id=<id>': 'Save credentials globally (~/.config/whatsapp-business/.env)',
          'auth': 'Verify WhatsApp Business API access and account info',
        },
        'Account Discovery': {
          'accounts': 'List WhatsApp Business Accounts across businesses',
          'phone-numbers [waba_id]': 'List registered phone numbers with quality ratings',
        },
        'Templates': {
          'templates [waba_id]': 'List message templates [--status=APPROVED|PENDING|REJECTED] [--category=MARKETING|UTILITY|AUTHENTICATION]',
          'template-details [waba_id] --name=<name>': 'Get template details with components',
        },
        'Analytics': {
          'template-analytics [waba_id]': 'Template performance (sent, delivered, read, clicked)',
          'analytics [waba_id]': 'Conversation analytics (volume, direction, cost)',
        },
        'Messaging': {
          'send-template': 'Send template message --phone-number-id=<id> --to=<phone> --template=<name> [--params=<json>]',
        },
      },
      global_flags: {
        '--format=table': 'Output as table instead of JSON',
        '--fields=<f1,f2,...>': 'Custom fields to return',
        '--limit=<N>': 'Limit number of results',
        '--date-preset=<preset>': 'Date preset for analytics (last_7d, last_30d, last_90d)',
        '--since=YYYY-MM-DD --until=YYYY-MM-DD': 'Custom date range for analytics',
      },
      env: {
        'META_ACCESS_TOKEN': 'Required. Same token as Meta Ads (Graph API)',
        'WHATSAPP_BUSINESS_ACCOUNT_ID': 'Required for most commands. Your WABA ID from Business Manager',
      },
      notes: [
        'This CLI uses the same META_ACCESS_TOKEN as meta-ads.mjs',
        'WABA ID defaults to WHATSAPP_BUSINESS_ACCOUNT_ID env var, or pass as first positional arg',
        'send-template ALWAYS requires explicit user confirmation',
        'All analytics commands are READ-ONLY',
        'Only template messages are supported (no free-form messaging)',
      ],
    };
  },
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node whatsapp-business.mjs help" for available commands' }));
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
