#!/usr/bin/env node

// Ad Library CLI - Competitive Intelligence via Meta Ad Library API
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node ad-library.mjs <command> [options]
//
// All data comes from Meta Ad Library API (public, free).
// Uses the same META_ACCESS_TOKEN as Meta Ads / Instagram Analyzer.
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/ad-library/.env (global)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_VERSION = 'v24.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'ad-library');
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
      setup: 'Run: node ad-library.mjs setup --token=YOUR_TOKEN',
      note: 'Reuses the same META_ACCESS_TOKEN from Meta Ads / Instagram Analyzer'
    }, null, 2));
    process.exit(1);
  }
  return token;
}

// ─── HTTP: Meta Graph API ────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

async function graphGet(endpoint, params = {}) {
  const token = getAccessToken();
  const url = new URL(`${GRAPH_BASE_URL}${endpoint}`);
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

async function graphGetAllPages(endpoint, params = {}, maxPages = 3) {
  const items = [];
  let nextUrl = null;
  let page = 0;

  // First request
  const firstData = await graphGet(endpoint, params);
  items.push(...(firstData.data || []));
  nextUrl = firstData.paging?.next || null;
  page++;

  // Subsequent pages
  while (nextUrl && page < maxPages) {
    const res = await fetch(nextUrl);
    const data = await res.json();
    if (data.error) {
      throw new ApiError(data.error.message, data.error.code, data.error.type);
    }
    items.push(...(data.data || []));
    nextUrl = data.paging?.next || null;
    page++;
  }

  return { data: items, hasMore: !!nextUrl };
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
      Math.max(k.length, ...items.map(i => String(i[k] ?? '').substring(0, 80).length))
    );
    const header = keys.map((k, idx) => k.padEnd(widths[idx])).join(' | ');
    const sep = widths.map(w => '-'.repeat(w)).join('-+-');
    console.log(header);
    console.log(sep);
    for (const item of items) {
      const row = keys.map((k, idx) => String(item[k] ?? '').substring(0, 80).padEnd(widths[idx])).join(' | ');
      console.log(row);
    }
    if (data.hasMore) {
      console.log('\n... more results available');
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function daysSince(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function extractCreativePreview(ad) {
  // Extract text from ad creative snapshot
  const snapshot = ad.ad_creative_bodies || [];
  const linkTitles = ad.ad_creative_link_titles || [];
  const linkDescriptions = ad.ad_creative_link_descriptions || [];

  const body = snapshot.length > 0 ? snapshot[0].substring(0, 80) : '-';
  const title = linkTitles.length > 0 ? linkTitles[0].substring(0, 50) : '-';

  return { body, title };
}

function detectFormat(ad) {
  // Detect creative format from ad data
  if (ad.ad_creative_bodies && ad.ad_creative_link_titles) {
    // Check for video indicators
    if (ad.ad_snapshot_url && ad.ad_snapshot_url.includes('video')) return 'Video';
  }
  // Check media type if available
  const mediaType = ad.media_type;
  if (mediaType === 'video') return 'Video';
  if (mediaType === 'image') return 'Image';
  if (mediaType === 'carousel') return 'Carousel';

  // Default heuristic based on creative bodies count
  if (ad.ad_creative_bodies && ad.ad_creative_bodies.length > 1) return 'Carousel';
  return 'Image/Link';
}

function getPlatforms(ad) {
  const platforms = ad.publisher_platforms || [];
  if (platforms.length === 0) return 'all';
  return platforms.join(', ');
}

// Ad Library API fields
const AD_LIBRARY_FIELDS = [
  'id',
  'ad_creation_time',
  'ad_delivery_start_time',
  'ad_delivery_stop_time',
  'ad_creative_bodies',
  'ad_creative_link_captions',
  'ad_creative_link_descriptions',
  'ad_creative_link_titles',
  'ad_snapshot_url',
  'page_id',
  'page_name',
  'publisher_platforms',
  'estimated_audience_size',
  'impressions',
  'spend',
  'currency',
  'languages',
  'bylines',
  'ad_creative_bodies',
].join(',');

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth & Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];

    if (!token) {
      return {
        message: 'Save Ad Library credentials globally',
        usage: 'node ad-library.mjs setup --token=<meta_token>',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/ad-library/.env',
          'Loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
          'Reuses the same META_ACCESS_TOKEN from Meta Ads / Instagram Analyzer',
        ],
        step_by_step: [
          '1. Get Meta token (same as Meta Ads): node meta-ads.mjs auth',
          '2. Run: node ad-library.mjs setup --token=YOUR_TOKEN',
          '3. Verify: node ad-library.mjs auth',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.META_ACCESS_TOKEN = token;

    const content = [
      '# Ad Library - Global Configuration',
      '# Loaded automatically from any project directory',
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
      test: 'Run: node ad-library.mjs auth',
    };
  },

  async auth(args) {
    const token = getAccessToken();

    // Verify token
    const me = await graphGet('/me', { fields: 'id,name' });

    // Test Ad Library access with a simple search
    let adLibraryAccess = 'unknown';
    try {
      await graphGet('/ads_archive', {
        search_terms: 'test',
        ad_reached_countries: '["BR"]',
        ad_type: 'POLITICAL_AND_ISSUE_ADS',
        limit: 1,
        fields: 'id,page_name',
      });
      adLibraryAccess = 'available';
    } catch (e) {
      adLibraryAccess = `error: ${e.message}`;
    }

    return {
      status: 'authenticated',
      facebook_user: { id: me.id, name: me.name },
      token_prefix: token.substring(0, 12) + '...',
      ad_library_access: adLibraryAccess,
      note: 'Ad Library API access depends on token permissions and ad type (ALL vs POLITICAL_AND_ISSUE_ADS)',
    };
  },

  // ── Search ──

  async search(args) {
    const { positional, flags } = parseArgs(args);
    const searchTerms = positional.join(' ') || flags.query || flags.q;
    const country = flags.country || 'BR';
    const limit = parseInt(flags.limit) || 25;
    const status = flags.status || 'ACTIVE';

    if (!searchTerms) {
      return {
        error: 'Search terms required',
        usage: 'node ad-library.mjs search <search_terms> [--country=BR] [--status=ACTIVE]',
        examples: [
          'node ad-library.mjs search "cirurgia plastica" --format=table',
          'node ad-library.mjs search "estetica facial" --country=BR --status=ALL',
        ],
      };
    }

    const data = await graphGet('/ads_archive', {
      search_terms: searchTerms,
      ad_reached_countries: JSON.stringify([country]),
      ad_active_status: status,
      ad_type: 'ALL',
      limit,
      fields: AD_LIBRARY_FIELDS,
    });

    const ads = (data.data || []).map(ad => {
      const creative = extractCreativePreview(ad);
      return {
        ad_id: ad.id || '-',
        advertiser: ad.page_name || '-',
        status: ad.ad_delivery_stop_time ? 'INACTIVE' : 'ACTIVE',
        start_date: formatDate(ad.ad_delivery_start_time),
        platforms: getPlatforms(ad),
        creative: creative.body,
      };
    });

    return {
      query: searchTerms,
      country,
      status_filter: status,
      total_found: ads.length,
      data: ads,
    };
  },

  // ── Advertiser ──

  async advertiser(args) {
    const { positional, flags } = parseArgs(args);
    const pageId = positional[0] || flags['page-id'] || flags.page;
    const country = flags.country || 'BR';
    const limit = parseInt(flags.limit) || 50;

    if (!pageId) {
      return {
        error: 'Page ID required',
        usage: 'node ad-library.mjs advertiser <page_id> [--country=BR] [--limit=50]',
        how_to_find: [
          '1. Run: node ad-library.mjs search "advertiser name" --format=table',
          '2. Copy the page_id from results',
          '3. Or find page ID from Facebook page URL',
        ],
      };
    }

    const result = await graphGetAllPages('/ads_archive', {
      search_page_ids: pageId,
      ad_reached_countries: JSON.stringify([country]),
      ad_type: 'ALL',
      limit,
      fields: AD_LIBRARY_FIELDS,
    }, 3);

    const ads = result.data.map(ad => {
      const creative = extractCreativePreview(ad);
      const daysRunning = ad.ad_delivery_start_time ? daysSince(ad.ad_delivery_start_time) : '-';
      return {
        ad_id: ad.id || '-',
        start_date: formatDate(ad.ad_delivery_start_time),
        days_running: daysRunning,
        status: ad.ad_delivery_stop_time ? 'STOPPED' : 'RUNNING',
        platforms: getPlatforms(ad),
        creative: creative.body,
        title: creative.title,
      };
    });

    // Sort by start date (newest first)
    ads.sort((a, b) => {
      if (a.start_date === '-' || b.start_date === '-') return 0;
      return new Date(b.start_date.split('/').reverse().join('-')) - new Date(a.start_date.split('/').reverse().join('-'));
    });

    const advertiserName = result.data.length > 0 ? result.data[0].page_name : pageId;

    return {
      advertiser: advertiserName,
      page_id: pageId,
      total_ads: ads.length,
      has_more: result.hasMore,
      data: ads,
    };
  },

  // ── Active Ads ──

  async active(args) {
    const { positional, flags } = parseArgs(args);
    const pageId = positional[0] || flags['page-id'] || flags.page;
    const country = flags.country || 'BR';
    const limit = parseInt(flags.limit) || 50;

    if (!pageId) {
      return {
        error: 'Page ID required',
        usage: 'node ad-library.mjs active <page_id> [--country=BR]',
        how_to_find: 'Run: node ad-library.mjs search "advertiser name" to find page IDs',
      };
    }

    const result = await graphGetAllPages('/ads_archive', {
      search_page_ids: pageId,
      ad_reached_countries: JSON.stringify([country]),
      ad_active_status: 'ACTIVE',
      ad_type: 'ALL',
      limit,
      fields: AD_LIBRARY_FIELDS,
    }, 3);

    const ads = result.data.map(ad => {
      const creative = extractCreativePreview(ad);
      const daysRunning = ad.ad_delivery_start_time ? daysSince(ad.ad_delivery_start_time) : '-';
      return {
        ad_id: ad.id || '-',
        start_date: formatDate(ad.ad_delivery_start_time),
        days_running: daysRunning,
        platforms: getPlatforms(ad),
        format: detectFormat(ad),
        creative: creative.body,
      };
    });

    const advertiserName = result.data.length > 0 ? result.data[0].page_name : pageId;

    return {
      advertiser: advertiserName,
      page_id: pageId,
      active_ads: ads.length,
      has_more: result.hasMore,
      data: ads,
    };
  },

  // ── Trends ──

  async trends(args) {
    const { positional, flags } = parseArgs(args);
    const pageId = positional[0] || flags['page-id'] || flags.page;
    const country = flags.country || 'BR';

    if (!pageId) {
      return {
        error: 'Page ID required',
        usage: 'node ad-library.mjs trends <page_id> [--country=BR]',
        description: 'Shows ad activity cadence over time (ads started per week/month)',
      };
    }

    // Fetch all ads to analyze cadence
    const result = await graphGetAllPages('/ads_archive', {
      search_page_ids: pageId,
      ad_reached_countries: JSON.stringify([country]),
      ad_type: 'ALL',
      limit: 100,
      fields: 'id,ad_delivery_start_time,ad_delivery_stop_time,page_name',
    }, 5);

    if (result.data.length === 0) {
      return { message: 'No ads found for this advertiser', page_id: pageId };
    }

    const advertiserName = result.data[0].page_name || pageId;

    // Group ads by month
    const byMonth = {};
    let activeCount = 0;
    let stoppedCount = 0;

    for (const ad of result.data) {
      const startDate = ad.ad_delivery_start_time;
      if (!startDate) continue;

      const d = new Date(startDate);
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!byMonth[monthKey]) byMonth[monthKey] = { started: 0, stopped: 0 };
      byMonth[monthKey].started++;

      if (ad.ad_delivery_stop_time) {
        stoppedCount++;
        const stopDate = new Date(ad.ad_delivery_stop_time);
        const stopKey = `${stopDate.getFullYear()}-${(stopDate.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!byMonth[stopKey]) byMonth[stopKey] = { started: 0, stopped: 0 };
        byMonth[stopKey].stopped++;
      } else {
        activeCount++;
      }
    }

    // Sort by month
    const trendData = Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, counts]) => ({
        month,
        ads_started: counts.started,
        ads_stopped: counts.stopped,
        net: counts.started - counts.stopped,
      }));

    // Calculate average cadence
    const totalMonths = trendData.length || 1;
    const avgPerMonth = parseFloat((result.data.length / totalMonths).toFixed(1));

    return {
      advertiser: advertiserName,
      page_id: pageId,
      total_ads_found: result.data.length,
      currently_active: activeCount,
      stopped: stoppedCount,
      avg_ads_per_month: avgPerMonth,
      by_month: trendData,
    };
  },

  // ── Formats ──

  async formats(args) {
    const { positional, flags } = parseArgs(args);
    const pageId = positional[0] || flags['page-id'] || flags.page;
    const country = flags.country || 'BR';

    if (!pageId) {
      return {
        error: 'Page ID required',
        usage: 'node ad-library.mjs formats <page_id> [--country=BR]',
        description: 'Analyze creative format distribution (image vs video vs carousel)',
      };
    }

    // Fetch ads
    const result = await graphGetAllPages('/ads_archive', {
      search_page_ids: pageId,
      ad_reached_countries: JSON.stringify([country]),
      ad_type: 'ALL',
      limit: 100,
      fields: AD_LIBRARY_FIELDS,
    }, 5);

    if (result.data.length === 0) {
      return { message: 'No ads found for this advertiser', page_id: pageId };
    }

    const advertiserName = result.data[0].page_name || pageId;

    // Classify and count formats
    const formatCounts = {};
    const platformCounts = {};

    for (const ad of result.data) {
      const format = detectFormat(ad);
      formatCounts[format] = (formatCounts[format] || 0) + 1;

      const platforms = ad.publisher_platforms || ['unknown'];
      for (const p of platforms) {
        platformCounts[p] = (platformCounts[p] || 0) + 1;
      }
    }

    const total = result.data.length;

    const formatBreakdown = Object.entries(formatCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([format, count]) => ({
        format,
        count,
        pct: `${Math.round(count / total * 100)}%`,
      }));

    const platformBreakdown = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([platform, count]) => ({
        platform,
        ads: count,
        pct: `${Math.round(count / total * 100)}%`,
      }));

    // Active vs inactive
    const activeAds = result.data.filter(ad => !ad.ad_delivery_stop_time).length;

    return {
      advertiser: advertiserName,
      page_id: pageId,
      total_ads: total,
      active_ads: activeAds,
      format_distribution: formatBreakdown,
      platform_distribution: platformBreakdown,
    };
  },

  // ── Help ──

  async help() {
    return {
      name: 'Ad Library CLI',
      description: 'Competitive intelligence via Meta Ad Library API (public, free)',
      usage: 'node ad-library.mjs <command> [options]',
      commands: {
        'Auth & Setup': {
          'setup': 'Save credentials globally (--token)',
          'auth': 'Verify token and test Ad Library API access',
        },
        'Competitive Intelligence': {
          'search <terms>': 'Search ads by advertiser name or keyword',
          'advertiser <page_id>': 'All ads from specific advertiser (by page ID)',
          'active <page_id>': 'Currently active ads from advertiser',
          'trends <page_id>': 'Ad activity trends (ads started/stopped by month)',
          'formats <page_id>': 'Creative format distribution (image/video/carousel)',
        },
      },
      global_flags: {
        '--country=<code>': 'Country code for ad reach (default: BR)',
        '--format=table': 'Output as table instead of JSON',
        '--limit=<N>': 'Limit number of results (default varies by command)',
        '--status=<status>': 'Filter by status: ACTIVE, ALL (default: ACTIVE for search)',
        '--page-id=<id>': 'Alternative to positional page ID argument',
      },
      workflow: [
        '1. Search by keyword or advertiser name to find page IDs:',
        '   node ad-library.mjs search "competitor name" --format=table',
        '',
        '2. Analyze specific advertiser\'s ads:',
        '   node ad-library.mjs advertiser PAGE_ID --format=table',
        '',
        '3. See what\'s currently running:',
        '   node ad-library.mjs active PAGE_ID --format=table',
        '',
        '4. Analyze ad activity patterns:',
        '   node ad-library.mjs trends PAGE_ID',
        '',
        '5. Understand creative format strategy:',
        '   node ad-library.mjs formats PAGE_ID --format=table',
      ],
      env: {
        'META_ACCESS_TOKEN': 'Required. Same Meta access token used by Meta Ads / Instagram Analyzer',
      },
      note: 'All operations are READ-ONLY. Ad Library API is public and free. Some ad types may have restricted access.',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node ad-library.mjs help" for available commands' }));
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
