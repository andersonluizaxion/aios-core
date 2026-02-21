#!/usr/bin/env node

// Instagram Analyzer CLI - Social Intelligence via Instagram Graph API
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node instagram-analyzer.mjs <command> [options]
//
// All data comes from Instagram Graph API (Meta Business accounts).
// Use --account=username to select which connected account to analyze.
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/instagram-analyzer/.env (global)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_VERSION = 'v24.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'instagram-analyzer');
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
      setup: 'Run: node instagram-analyzer.mjs setup --token=YOUR_TOKEN'
    }, null, 2));
    process.exit(1);
  }
  return token;
}

async function resolveIgUserId(flags = {}) {
  // Priority 1: --account flag (username or numeric ID)
  const accountFlag = flags.account || flags['ig-id'];
  if (accountFlag) {
    // Numeric ID → use directly
    if (/^\d+$/.test(accountFlag)) return accountFlag;
    // Username → resolve via /me/accounts
    const token = getAccessToken();
    const me = await graphGet('/me', { fields: 'id' });
    const pages = await graphGet(`/${me.id}/accounts`, {
      fields: 'id,name,instagram_business_account{id,username}'
    });
    const match = (pages.data || []).find(p =>
      p.instagram_business_account?.username?.toLowerCase() === accountFlag.replace(/^@/, '').toLowerCase()
    );
    if (!match) {
      throw new ApiError(
        `Instagram account @${accountFlag} not found among connected accounts. Run: node instagram-analyzer.mjs accounts`,
        'ACCOUNT_NOT_FOUND',
        'RESOLVE_ERROR'
      );
    }
    return match.instagram_business_account.id;
  }

  // Priority 2: Auto-discover from connected accounts
  const token = getAccessToken();
  const me = await graphGet('/me', { fields: 'id' });
  const pages = await graphGet(`/${me.id}/accounts`, {
    fields: 'id,name,instagram_business_account{id,username,followers_count}'
  });
  const igAccounts = (pages.data || []).filter(p => p.instagram_business_account);

  if (igAccounts.length === 0) {
    throw new ApiError(
      'No Instagram Business accounts found. Connect a Facebook Page with an IG Business account.',
      'NO_ACCOUNTS',
      'RESOLVE_ERROR'
    );
  }

  if (igAccounts.length === 1) {
    const acct = igAccounts[0].instagram_business_account;
    console.error(`[auto-selected] @${acct.username} (${acct.followers_count} followers)`);
    return acct.id;
  }

  // Multiple accounts → user must specify
  const list = igAccounts.map(p => {
    const ig = p.instagram_business_account;
    return `  @${ig.username} (ID: ${ig.id}, ${ig.followers_count} followers)`;
  }).join('\n');
  throw new ApiError(
    `Multiple Instagram accounts found. Use --account=username to select:\n${list}`,
    'MULTIPLE_ACCOUNTS',
    'RESOLVE_ERROR'
  );
}

// ─── HTTP: Instagram Graph API ───────────────────────────────────────────────

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

async function graphGetAllPages(endpoint, params = {}, maxPages = 5) {
  const items = [];
  let cursor = params.after || null;
  let page = 0;

  while (page < maxPages) {
    const p = { ...params };
    if (cursor) p.after = cursor;
    else delete p.after;

    const data = await graphGet(endpoint, p);
    const batch = data.data || [];
    items.push(...batch);

    if (!data.paging?.cursors?.after || batch.length === 0) break;
    cursor = data.paging.cursors.after;
    page++;
  }

  return items;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcEngagementRate(likes, comments, followers) {
  if (!followers || followers === 0) return 0;
  return parseFloat(((likes + comments) / followers * 100).toFixed(2));
}

function formatDate(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function getDayOfWeek(isoDate) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  return days[new Date(isoDate).getDay()];
}

function getHour(isoDate) {
  return new Date(isoDate).getHours();
}

function extractHashtags(caption) {
  if (!caption) return [];
  const matches = caption.match(/#[\w\u00C0-\u017F]+/g);
  return matches ? matches.map(h => h.toLowerCase()) : [];
}

function mediaTypeLabel(type) {
  const map = {
    'IMAGE': 'Imagem',
    'VIDEO': 'Reel/Video',
    'CAROUSEL_ALBUM': 'Carrossel',
  };
  return map[type] || type || 'Outro';
}

// ─── Helper: Analyze account data for benchmark ─────────────────────────────

async function analyzeAccountForBenchmark(igUserId) {
  const profile = await graphGet(`/${igUserId}`, {
    fields: 'username,followers_count,media_count'
  });
  const media = await graphGetAllPages(`/${igUserId}/media`, {
    fields: 'like_count,comments_count,media_type,timestamp',
    limit: 50,
  }, 2);

  const followers = profile.followers_count || 1;
  const avgLikes = media.length > 0 ? Math.round(media.reduce((s, m) => s + (m.like_count || 0), 0) / media.length) : 0;
  const avgComments = media.length > 0 ? Math.round(media.reduce((s, m) => s + (m.comments_count || 0), 0) / media.length) : 0;
  const er = calcEngagementRate(avgLikes, avgComments, followers);

  const timestamps = media.map(m => new Date(m.timestamp).getTime()).sort();
  const span = timestamps.length >= 2 ? (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24) : 0;
  const postsPerWeek = span > 0 ? parseFloat((media.length / (span / 7)).toFixed(1)) : 0;

  const formats = {};
  for (const m of media) {
    const type = mediaTypeLabel(m.media_type);
    formats[type] = (formats[type] || 0) + 1;
  }
  const reelsPct = media.length > 0 ? Math.round(((formats['Reel/Video'] || 0) / media.length) * 100) : 0;

  return {
    username: profile.username,
    followers,
    avgLikes,
    avgComments,
    er,
    postsPerWeek,
    reelsPct,
  };
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth & Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];

    if (!token) {
      return {
        message: 'Save Instagram Analyzer credentials globally',
        usage: 'node instagram-analyzer.mjs setup --token=<meta_token>',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/instagram-analyzer/.env',
          'Loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
        ],
        step_by_step: [
          '1. Get Meta token: node instagram-analyzer.mjs auth (or reuse from meta-ads)',
          '2. Run: node instagram-analyzer.mjs setup --token=YOUR_TOKEN',
          '3. Verify: node instagram-analyzer.mjs accounts',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.META_ACCESS_TOKEN = token;

    const content = [
      '# Instagram Analyzer - Global Configuration',
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
      test: 'Run: node instagram-analyzer.mjs auth',
    };
  },

  async auth(args) {
    const token = getAccessToken();

    // Get user info and connected pages
    const me = await graphGet('/me', { fields: 'id,name' });

    // Get pages with connected IG accounts
    const pages = await graphGet(`/${me.id}/accounts`, {
      fields: 'id,name,instagram_business_account{id,username,name,followers_count,media_count}'
    });

    const igAccounts = (pages.data || [])
      .filter(p => p.instagram_business_account)
      .map(p => ({
        page_name: p.name,
        page_id: p.id,
        ig_user_id: p.instagram_business_account.id,
        ig_username: p.instagram_business_account.username,
        ig_name: p.instagram_business_account.name,
        followers: p.instagram_business_account.followers_count,
        media_count: p.instagram_business_account.media_count,
      }));

    return {
      facebook_user: { id: me.id, name: me.name },
      instagram_accounts: igAccounts,
      hint: igAccounts.length > 0
        ? `${igAccounts.length} account(s) found. Use --account=${igAccounts[0].ig_username} in commands.`
        : 'No Instagram Business accounts connected to your Facebook pages',
    };
  },

  async accounts(args) {
    const me = await graphGet('/me', { fields: 'id,name' });
    const pages = await graphGet(`/${me.id}/accounts`, {
      fields: 'id,name,instagram_business_account{id,username,name,followers_count,media_count,profile_picture_url}'
    });

    const igAccounts = (pages.data || [])
      .filter(p => p.instagram_business_account)
      .map(p => ({
        page_name: p.name,
        page_id: p.id,
        ig_user_id: p.instagram_business_account.id,
        username: `@${p.instagram_business_account.username}`,
        name: p.instagram_business_account.name,
        followers: p.instagram_business_account.followers_count,
        posts: p.instagram_business_account.media_count,
      }));

    return {
      facebook_user: { id: me.id, name: me.name },
      total_accounts: igAccounts.length,
      auto_select: igAccounts.length === 1
        ? `@${igAccounts[0].username} (auto-selected)`
        : 'Use --account=username to select',
      accounts: igAccounts,
      usage: [
        'Use --account=username in any command to select account:',
        '  node instagram-analyzer.mjs account --account=my_brand',
        '  node instagram-analyzer.mjs top-posts --account=other_brand',
        '',
        'If only 1 account is connected, it is auto-selected.',
      ],
    };
  },

  // ── Account Analysis (Graph API) ──

  async account(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);

    // Get account info
    const profile = await graphGet(`/${igUserId}`, {
      fields: 'id,username,name,biography,followers_count,follows_count,media_count,website,profile_picture_url'
    });

    // Get recent media for frequency calculation
    const media = await graphGetAllPages(`/${igUserId}/media`, {
      fields: 'timestamp,like_count,comments_count,media_type',
      limit: 50,
    }, 2);

    // Calculate metrics
    const followers = profile.followers_count || 0;
    let avgLikes = 0, avgComments = 0, avgER = 0, postsPerWeek = 0;
    const formatCounts = {};

    if (media.length > 0) {
      const totalLikes = media.reduce((s, m) => s + (m.like_count || 0), 0);
      const totalComments = media.reduce((s, m) => s + (m.comments_count || 0), 0);
      avgLikes = Math.round(totalLikes / media.length);
      avgComments = Math.round(totalComments / media.length);
      avgER = calcEngagementRate(avgLikes, avgComments, followers);

      // Posts per week
      const timestamps = media.map(m => new Date(m.timestamp).getTime()).sort();
      if (timestamps.length >= 2) {
        const spanDays = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24);
        postsPerWeek = spanDays > 0 ? parseFloat((media.length / (spanDays / 7)).toFixed(1)) : 0;
      }

      // Format distribution
      for (const m of media) {
        const type = mediaTypeLabel(m.media_type);
        formatCounts[type] = (formatCounts[type] || 0) + 1;
      }
    }

    const formatMix = Object.entries(formatCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}: ${count} (${Math.round(count / media.length * 100)}%)`);

    return {
      username: profile.username,
      name: profile.name,
      bio: profile.biography,
      website: profile.website || '-',
      followers: followers,
      following: profile.follows_count,
      total_posts: profile.media_count,
      posts_analyzed: media.length,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      avg_engagement_rate: `${avgER}%`,
      posts_per_week: postsPerWeek,
      format_mix: formatMix,
    };
  },

  async media(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);
    const limit = parseInt(flags.limit) || 25;

    const params = {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit,
    };
    if (flags.after) params.after = flags.after;

    const data = await graphGet(`/${igUserId}/media`, params);
    const items = (data.data || []).map(m => ({
      id: m.id,
      date: formatDate(m.timestamp),
      type: mediaTypeLabel(m.media_type),
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
      caption: (m.caption || '').substring(0, 60) + ((m.caption || '').length > 60 ? '...' : ''),
      url: m.permalink,
    }));

    const result = { data: items };
    if (data.paging) result.paging = data.paging;
    return result;
  },

  async 'media-insights'(args) {
    const { positional } = parseArgs(args);
    const mediaId = positional[0];

    if (!mediaId) {
      return { error: 'Media ID required', usage: 'node instagram-analyzer.mjs media-insights <media_id>' };
    }

    // Get media basic info
    const media = await graphGet(`/${mediaId}`, {
      fields: 'id,caption,media_type,permalink,timestamp,like_count,comments_count'
    });

    // Get insights - metrics vary by media type
    let metrics = 'impressions,reach,saved';
    if (media.media_type === 'VIDEO') {
      metrics = 'impressions,reach,saved,plays,video_views';
    }

    let insights = {};
    try {
      const insightsData = await graphGet(`/${mediaId}/insights`, { metric: metrics });
      for (const item of (insightsData.data || [])) {
        insights[item.name] = item.values?.[0]?.value ?? item.value ?? 0;
      }
    } catch (e) {
      insights = { note: 'Insights only available for own Business account media' };
    }

    const reach = insights.reach || 0;
    const engagement = (media.like_count || 0) + (media.comments_count || 0) + (insights.saved || 0);
    const er = reach > 0 ? parseFloat((engagement / reach * 100).toFixed(2)) : 0;

    return {
      id: media.id,
      date: formatDate(media.timestamp),
      type: mediaTypeLabel(media.media_type),
      likes: media.like_count || 0,
      comments: media.comments_count || 0,
      saves: insights.saved || 0,
      impressions: insights.impressions || 0,
      reach: reach,
      engagement_rate: `${er}%`,
      url: media.permalink,
      caption: (media.caption || '').substring(0, 120),
    };
  },

  async 'top-posts'(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);
    const limit = parseInt(flags.limit) || 20;
    const pages = parseInt(flags.pages) || 3;

    // Get account for followers count
    const profile = await graphGet(`/${igUserId}`, { fields: 'followers_count' });
    const followers = profile.followers_count || 1;

    // Get media with pagination
    const media = await graphGetAllPages(`/${igUserId}/media`, {
      fields: 'id,caption,media_type,permalink,timestamp,like_count,comments_count',
      limit: 50,
    }, pages);

    // Sort by engagement rate
    const ranked = media
      .map(m => ({
        rank: 0,
        date: formatDate(m.timestamp),
        day: getDayOfWeek(m.timestamp),
        hour: getHour(m.timestamp) + 'h',
        type: mediaTypeLabel(m.media_type),
        likes: m.like_count || 0,
        comments: m.comments_count || 0,
        er: calcEngagementRate(m.like_count || 0, m.comments_count || 0, followers),
        url: m.permalink,
      }))
      .sort((a, b) => b.er - a.er)
      .slice(0, limit)
      .map((item, idx) => ({ ...item, rank: idx + 1, er: `${item.er}%` }));

    return ranked;
  },

  async 'posting-frequency'(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);
    const pages = parseInt(flags.pages) || 4;

    const media = await graphGetAllPages(`/${igUserId}/media`, {
      fields: 'timestamp,like_count,comments_count',
      limit: 50,
    }, pages);

    if (media.length < 2) {
      return { message: 'Not enough posts for frequency analysis', posts_found: media.length };
    }

    const followers = (await graphGet(`/${igUserId}`, { fields: 'followers_count' })).followers_count || 1;

    // Posts per week
    const timestamps = media.map(m => new Date(m.timestamp).getTime()).sort();
    const spanDays = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24);
    const postsPerWeek = spanDays > 0 ? parseFloat((media.length / (spanDays / 7)).toFixed(1)) : 0;

    // Distribution by day of week
    const dayDist = { Dom: { count: 0, totalER: 0 }, Seg: { count: 0, totalER: 0 }, Ter: { count: 0, totalER: 0 }, Qua: { count: 0, totalER: 0 }, Qui: { count: 0, totalER: 0 }, Sex: { count: 0, totalER: 0 }, Sab: { count: 0, totalER: 0 } };
    const hourDist = {};

    for (const m of media) {
      const day = getDayOfWeek(m.timestamp);
      const hour = getHour(m.timestamp);
      const er = calcEngagementRate(m.like_count || 0, m.comments_count || 0, followers);

      dayDist[day].count++;
      dayDist[day].totalER += er;

      const hourKey = `${hour}h`;
      if (!hourDist[hourKey]) hourDist[hourKey] = { count: 0, totalER: 0 };
      hourDist[hourKey].count++;
      hourDist[hourKey].totalER += er;
    }

    const byDay = Object.entries(dayDist).map(([day, d]) => ({
      day,
      posts: d.count,
      avg_er: d.count > 0 ? `${(d.totalER / d.count).toFixed(2)}%` : '-',
    }));

    const byHour = Object.entries(hourDist)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([hour, d]) => ({
        hour,
        posts: d.count,
        avg_er: d.count > 0 ? `${(d.totalER / d.count).toFixed(2)}%` : '-',
      }));

    // Best slots
    const bestDay = byDay.filter(d => d.posts > 0).sort((a, b) => parseFloat(b.avg_er) - parseFloat(a.avg_er))[0];
    const bestHour = byHour.filter(h => h.posts >= 2).sort((a, b) => parseFloat(b.avg_er) - parseFloat(a.avg_er))[0];

    return {
      posts_analyzed: media.length,
      period_days: Math.round(spanDays),
      posts_per_week: postsPerWeek,
      by_day: byDay,
      by_hour: byHour,
      best_day: bestDay ? `${bestDay.day} (ER medio: ${bestDay.avg_er})` : '-',
      best_hour: bestHour ? `${bestHour.hour} (ER medio: ${bestHour.avg_er})` : '-',
    };
  },

  async 'format-analysis'(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);
    const profile = await graphGet(`/${igUserId}`, { fields: 'followers_count' });
    const followers = profile.followers_count || 1;

    const raw = await graphGetAllPages(`/${igUserId}/media`, {
      fields: 'media_type,like_count,comments_count',
      limit: 50,
    }, 3);

    const media = raw.map(m => ({
      type: m.media_type,
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
    }));

    // Group by format
    const groups = {};
    for (const m of media) {
      const label = mediaTypeLabel(m.type);
      if (!groups[label]) groups[label] = { count: 0, totalLikes: 0, totalComments: 0 };
      groups[label].count++;
      groups[label].totalLikes += m.likes;
      groups[label].totalComments += m.comments;
    }

    const total = media.length;
    const result = Object.entries(groups)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([format, g]) => ({
        format,
        posts: g.count,
        pct: `${Math.round(g.count / total * 100)}%`,
        avg_likes: Math.round(g.totalLikes / g.count),
        avg_comments: Math.round(g.totalComments / g.count),
        avg_er: `${calcEngagementRate(Math.round(g.totalLikes / g.count), Math.round(g.totalComments / g.count), followers)}%`,
      }));

    return result;
  },

  async 'hashtag-performance'(args) {
    const { flags } = parseArgs(args);
    const igUserId = await resolveIgUserId(flags);
    const pages = parseInt(flags.pages) || 3;

    const profile = await graphGet(`/${igUserId}`, { fields: 'followers_count' });
    const followers = profile.followers_count || 1;

    const media = await graphGetAllPages(`/${igUserId}/media`, {
      fields: 'caption,like_count,comments_count',
      limit: 50,
    }, pages);

    // Extract and aggregate hashtags
    const hashtagStats = {};
    for (const m of media) {
      const hashtags = extractHashtags(m.caption);
      const er = calcEngagementRate(m.like_count || 0, m.comments_count || 0, followers);
      for (const tag of hashtags) {
        if (!hashtagStats[tag]) hashtagStats[tag] = { count: 0, totalLikes: 0, totalComments: 0, totalER: 0 };
        hashtagStats[tag].count++;
        hashtagStats[tag].totalLikes += m.like_count || 0;
        hashtagStats[tag].totalComments += m.comments_count || 0;
        hashtagStats[tag].totalER += er;
      }
    }

    const ranked = Object.entries(hashtagStats)
      .filter(([, s]) => s.count >= 2) // Only hashtags used 2+ times
      .sort((a, b) => (b[1].totalER / b[1].count) - (a[1].totalER / a[1].count))
      .map(([tag, s]) => ({
        hashtag: tag,
        uses: s.count,
        avg_likes: Math.round(s.totalLikes / s.count),
        avg_comments: Math.round(s.totalComments / s.count),
        avg_er: `${(s.totalER / s.count).toFixed(2)}%`,
      }));

    return ranked.length > 0 ? ranked : { message: 'No hashtags with 2+ uses found', posts_analyzed: media.length };
  },

  // ── Comparative ──

  async benchmark(args) {
    const { flags } = parseArgs(args);
    const competitors = (flags.competitors || '').split(',').filter(Boolean);

    if (competitors.length === 0) {
      return {
        error: 'Competitors required',
        usage: 'node instagram-analyzer.mjs benchmark --account=my_brand --competitors=comp1,comp2',
        note: 'Competitors must be connected accounts. Run: node instagram-analyzer.mjs accounts',
      };
    }

    // Get own account data
    const igUserId = await resolveIgUserId(flags);
    const ownData = await analyzeAccountForBenchmark(igUserId);

    const rows = [{
      account: `@${ownData.username} (you)`,
      followers: ownData.followers,
      avg_likes: ownData.avgLikes,
      avg_comments: ownData.avgComments,
      avg_er: `${ownData.er}%`,
      posts_week: ownData.postsPerWeek,
      reels_pct: `${ownData.reelsPct}%`,
    }];

    // Get competitor data via Graph API (must be connected accounts)
    for (const comp of competitors) {
      try {
        const compUserId = await resolveIgUserId({ account: comp });
        const compData = await analyzeAccountForBenchmark(compUserId);

        rows.push({
          account: `@${compData.username}`,
          followers: compData.followers,
          avg_likes: compData.avgLikes,
          avg_comments: compData.avgComments,
          avg_er: `${compData.er}%`,
          posts_week: compData.postsPerWeek,
          reels_pct: `${compData.reelsPct}%`,
        });
      } catch (e) {
        rows.push({
          account: `@${comp}`,
          followers: 'not connected',
          avg_likes: '-',
          avg_comments: '-',
          avg_er: '-',
          posts_week: '-',
          reels_pct: '-',
        });
      }
    }

    return rows;
  },

  // ── Help ──

  async help() {
    return {
      name: 'Instagram Analyzer CLI',
      description: 'Social intelligence via Instagram Graph API for all connected accounts',
      usage: 'node instagram-analyzer.mjs <command> [options]',
      commands: {
        'Auth & Setup': {
          'setup': 'Save credentials globally (--token)',
          'auth': 'Verify token and show connected Instagram accounts',
          'accounts': 'List all Instagram accounts accessible by your app',
        },
        'Account Analysis': {
          'account': 'Full account analysis (bio, followers, ER%, frequency)',
          'media': 'List posts with metrics (--limit=N, --after=cursor)',
          'media-insights <id>': 'Detailed insights for a post (reach, saves, shares)',
          'top-posts': 'Rank posts by engagement rate (--limit=N)',
          'posting-frequency': 'Posting cadence + best days/hours',
          'format-analysis': 'Breakdown by format (Reel/Carousel/Image)',
          'hashtag-performance': 'Hashtag correlation with engagement',
        },
        'Comparative': {
          'benchmark': 'Compare accounts side by side (--competitors=u1,u2,u3)',
        },
      },
      global_flags: {
        '--account=<username>': 'Select which IG account to analyze (by username or ID)',
        '--format=table': 'Output as table instead of JSON',
        '--limit=<N>': 'Limit number of results (default varies by command)',
        '--after=<cursor>': 'Pagination cursor',
        '--pages=<N>': 'Number of pagination pages to load (default 3)',
      },
      account_resolution: [
        '1. --account=username flag (highest priority)',
        '2. Auto-detect: if 1 account connected, uses it automatically',
        '3. If multiple accounts, lists them and asks you to specify --account',
      ],
      env: {
        'META_ACCESS_TOKEN': 'Required. Your Meta long-lived access token',
      },
      note: 'All operations are READ-ONLY. All accounts must be connected via Meta Business Manager.',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node instagram-analyzer.mjs help" for available commands' }));
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
