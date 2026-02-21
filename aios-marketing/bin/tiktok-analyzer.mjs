#!/usr/bin/env node

// TikTok Analyzer CLI - Social Intelligence via TikTok Business API
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node tiktok-analyzer.mjs <command> [options]
//
// All data comes from TikTok Business API (advertiser accounts).
// Use --advertiser=ID to select which advertiser account to analyze.
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/tiktok-analyzer/.env (global)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_VERSION = 'v1.3';
const BASE_URL = `https://business-api.tiktok.com/open_api/${API_VERSION}`;
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'tiktok-analyzer');
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
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    console.error(JSON.stringify({
      error: 'TIKTOK_ACCESS_TOKEN not set',
      help: 'Configure your token in one of these locations:',
      options: [
        `1. Global (all projects): ${GLOBAL_ENV_FILE}`,
        '2. Project-level: .env in your project root',
        '3. Shell: export TIKTOK_ACCESS_TOKEN=your_token',
      ],
      setup: 'Run: node tiktok-analyzer.mjs setup --token=YOUR_TOKEN'
    }, null, 2));
    process.exit(1);
  }
  return token;
}

function getAdvertiserId(flags = {}) {
  const id = flags.advertiser || flags['advertiser-id'] || process.env.TIKTOK_ADVERTISER_ID;
  if (!id) {
    console.error(JSON.stringify({
      error: 'Advertiser ID required',
      help: 'Specify via --advertiser=ID or set TIKTOK_ADVERTISER_ID in .env',
      discover: 'Run: node tiktok-analyzer.mjs accounts',
    }, null, 2));
    process.exit(1);
  }
  return id;
}

// ─── HTTP: TikTok Business API ───────────────────────────────────────────────

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

async function apiGet(endpoint, params = {}) {
  const token = getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Access-Token': token,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();

  if (data.code !== 0) {
    throw new ApiError(
      data.message || `API error (code: ${data.code})`,
      data.code,
      'TIKTOK_API_ERROR'
    );
  }
  return data.data || data;
}

async function apiPost(endpoint, body = {}) {
  const token = getAccessToken();
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.code !== 0) {
    throw new ApiError(
      data.message || `API error (code: ${data.code})`,
      data.code,
      'TIKTOK_API_ERROR'
    );
  }
  return data.data || data;
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
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatNumber(num) {
  if (num === undefined || num === null) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function getDayOfWeek(dateStr) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  return days[new Date(dateStr).getDay()];
}

function getHour(dateStr) {
  return new Date(dateStr).getHours();
}

function calcEngagementRate(likes, comments, shares, views) {
  if (!views || views === 0) return 0;
  return parseFloat(((likes + comments + shares) / views * 100).toFixed(2));
}

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  };
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth & Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];
    const advertiserId = flags.advertiser || flags['advertiser-id'];

    if (!token && !advertiserId) {
      return {
        message: 'Save TikTok Analyzer credentials globally',
        usage: 'node tiktok-analyzer.mjs setup --token=<access_token> [--advertiser=<id>]',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/tiktok-analyzer/.env',
          'Loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
        ],
        step_by_step: [
          '1. Get access token from TikTok Business Center: https://business-api.tiktok.com/',
          '2. Run: node tiktok-analyzer.mjs setup --token=YOUR_TOKEN --advertiser=YOUR_ID',
          '3. Verify: node tiktok-analyzer.mjs auth',
        ]
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.TIKTOK_ACCESS_TOKEN = token;
    if (advertiserId) existing.TIKTOK_ADVERTISER_ID = advertiserId;

    const content = [
      '# TikTok Analyzer - Global Configuration',
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
      test: 'Run: node tiktok-analyzer.mjs auth',
    };
  },

  async auth(args) {
    const token = getAccessToken();

    // Verify token by getting advertiser info
    const data = await apiGet('/oauth2/advertiser/get/', {
      app_id: process.env.TIKTOK_APP_ID || '',
      secret: process.env.TIKTOK_APP_SECRET || '',
    });

    const advertisers = (data.list || []).map(adv => ({
      advertiser_id: adv.advertiser_id,
      advertiser_name: adv.advertiser_name,
      status: adv.status || 'unknown',
    }));

    return {
      status: 'authenticated',
      token_prefix: token.substring(0, 12) + '...',
      advertiser_id_configured: process.env.TIKTOK_ADVERTISER_ID || 'not set',
      advertisers: advertisers.length > 0 ? advertisers : 'Use node tiktok-analyzer.mjs accounts to list',
      hint: 'If empty, provide app_id/secret or use accounts command with --advertiser flag',
    };
  },

  async accounts(args) {
    const { flags } = parseArgs(args);
    const token = getAccessToken();

    const data = await apiGet('/oauth2/advertiser/get/', {
      app_id: process.env.TIKTOK_APP_ID || '',
      secret: process.env.TIKTOK_APP_SECRET || '',
    });

    const accounts = (data.list || []).map(adv => ({
      advertiser_id: adv.advertiser_id,
      name: adv.advertiser_name,
      status: adv.status || '-',
      company: adv.company || '-',
      currency: adv.currency || '-',
      timezone: adv.timezone || '-',
    }));

    return {
      total_accounts: accounts.length,
      accounts,
      usage: [
        'Use --advertiser=ID in any command to select account:',
        '  node tiktok-analyzer.mjs account --advertiser=123456789',
        '',
        'Or set TIKTOK_ADVERTISER_ID in .env for default.',
      ],
    };
  },

  // ── Account Analysis ──

  async account(args) {
    const { flags } = parseArgs(args);
    const advertiserId = getAdvertiserId(flags);

    // Get advertiser info
    const advInfo = await apiGet('/advertiser/info/', {
      advertiser_ids: JSON.stringify([advertiserId]),
    });

    const info = (advInfo.list || [])[0] || {};

    // Get video list for stats
    const days = parseInt(flags.days) || 30;
    const { start_date, end_date } = getDateRange(days);

    let videos = [];
    try {
      const videoData = await apiGet('/creative/video/list/', {
        advertiser_id: advertiserId,
        page_size: 50,
      });
      videos = videoData.list || [];
    } catch (e) {
      // Video listing may not be available for all account types
    }

    // Get basic reporting
    let metrics = {};
    try {
      const reportData = await apiPost('/report/integrated/get/', {
        advertiser_id: advertiserId,
        report_type: 'BASIC',
        data_level: 'AUCTION_ADVERTISER',
        dimensions: ['advertiser_id'],
        metrics: ['spend', 'impressions', 'clicks', 'ctr', 'cpc', 'reach', 'video_views_p100', 'video_views_p50'],
        start_date,
        end_date,
        page_size: 1,
      });
      const row = (reportData.list || [])[0]?.metrics || {};
      metrics = {
        spend: row.spend || '0',
        impressions: row.impressions || '0',
        clicks: row.clicks || '0',
        ctr: row.ctr ? `${parseFloat(row.ctr).toFixed(2)}%` : '-',
        cpc: row.cpc || '-',
        reach: row.reach || '-',
        video_complete_views: row.video_views_p100 || '-',
      };
    } catch (e) {
      metrics = { note: 'Reporting not available or no data in period' };
    }

    return {
      advertiser_id: advertiserId,
      name: info.name || info.advertiser_name || '-',
      company: info.company || '-',
      status: info.status || '-',
      currency: info.currency || '-',
      timezone: info.timezone || '-',
      total_videos: videos.length,
      period: `${days} days`,
      metrics,
    };
  },

  async 'top-videos'(args) {
    const { flags } = parseArgs(args);
    const advertiserId = getAdvertiserId(flags);
    const limit = parseInt(flags.limit) || 20;
    const days = parseInt(flags.days) || 30;
    const sortBy = flags.sort || 'impressions'; // impressions, clicks, ctr, video_views_p100
    const { start_date, end_date } = getDateRange(days);

    // Get ad-level report with video metrics
    const reportData = await apiPost('/report/integrated/get/', {
      advertiser_id: advertiserId,
      report_type: 'BASIC',
      data_level: 'AUCTION_AD',
      dimensions: ['ad_id'],
      metrics: ['ad_name', 'impressions', 'clicks', 'ctr', 'spend', 'video_views_p25', 'video_views_p50', 'video_views_p75', 'video_views_p100', 'reach', 'likes', 'comments', 'shares'],
      start_date,
      end_date,
      page_size: limit,
      order_field: sortBy,
      order_type: 'DESC',
    });

    const items = (reportData.list || []).map((row, idx) => {
      const m = row.metrics || {};
      const d = row.dimensions || {};
      return {
        rank: idx + 1,
        ad_id: d.ad_id || '-',
        name: (m.ad_name || '').substring(0, 40),
        impressions: formatNumber(parseInt(m.impressions) || 0),
        clicks: formatNumber(parseInt(m.clicks) || 0),
        ctr: m.ctr ? `${parseFloat(m.ctr).toFixed(2)}%` : '-',
        views_100pct: formatNumber(parseInt(m.video_views_p100) || 0),
        likes: formatNumber(parseInt(m.likes) || 0),
        comments: formatNumber(parseInt(m.comments) || 0),
        shares: formatNumber(parseInt(m.shares) || 0),
        spend: m.spend || '-',
      };
    });

    return {
      period: `${start_date} to ${end_date}`,
      sort: sortBy,
      data: items,
    };
  },

  async 'video-insights'(args) {
    const { positional, flags } = parseArgs(args);
    const advertiserId = getAdvertiserId(flags);
    const adId = positional[0];
    const days = parseInt(flags.days) || 30;

    if (!adId) {
      return { error: 'Ad ID required', usage: 'node tiktok-analyzer.mjs video-insights <ad_id> --advertiser=ID' };
    }

    const { start_date, end_date } = getDateRange(days);

    const reportData = await apiPost('/report/integrated/get/', {
      advertiser_id: advertiserId,
      report_type: 'BASIC',
      data_level: 'AUCTION_AD',
      dimensions: ['ad_id'],
      filters: [{ field_name: 'ad_id', filter_type: 'IN', filter_value: JSON.stringify([adId]) }],
      metrics: ['ad_name', 'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'spend', 'reach', 'frequency', 'video_play_actions', 'video_views_p25', 'video_views_p50', 'video_views_p75', 'video_views_p100', 'average_video_play', 'average_video_play_per_user', 'likes', 'comments', 'shares', 'follows', 'profile_visits'],
      start_date,
      end_date,
      page_size: 1,
    });

    const row = (reportData.list || [])[0];
    if (!row) {
      return { error: 'No data found for this ad', ad_id: adId };
    }

    const m = row.metrics || {};
    const views = parseInt(m.video_play_actions) || 0;
    const likes = parseInt(m.likes) || 0;
    const comments = parseInt(m.comments) || 0;
    const shares = parseInt(m.shares) || 0;
    const er = calcEngagementRate(likes, comments, shares, views);

    return {
      ad_id: adId,
      name: m.ad_name || '-',
      period: `${start_date} to ${end_date}`,
      impressions: parseInt(m.impressions) || 0,
      reach: parseInt(m.reach) || 0,
      frequency: parseFloat(m.frequency) || 0,
      clicks: parseInt(m.clicks) || 0,
      ctr: m.ctr ? `${parseFloat(m.ctr).toFixed(2)}%` : '-',
      cpc: m.cpc || '-',
      cpm: m.cpm || '-',
      spend: m.spend || '-',
      video_plays: views,
      views_25pct: parseInt(m.video_views_p25) || 0,
      views_50pct: parseInt(m.video_views_p50) || 0,
      views_75pct: parseInt(m.video_views_p75) || 0,
      views_100pct: parseInt(m.video_views_p100) || 0,
      avg_play_duration: m.average_video_play || '-',
      likes,
      comments,
      shares,
      follows: parseInt(m.follows) || 0,
      profile_visits: parseInt(m.profile_visits) || 0,
      engagement_rate: `${er}%`,
    };
  },

  async audience(args) {
    const { flags } = parseArgs(args);
    const advertiserId = getAdvertiserId(flags);
    const days = parseInt(flags.days) || 30;
    const { start_date, end_date } = getDateRange(days);

    const results = {};

    // Age breakdown
    try {
      const ageData = await apiPost('/report/integrated/get/', {
        advertiser_id: advertiserId,
        report_type: 'AUDIENCE',
        data_level: 'AUCTION_ADVERTISER',
        dimensions: ['age'],
        metrics: ['impressions', 'clicks', 'spend', 'reach'],
        start_date,
        end_date,
        page_size: 20,
      });
      results.by_age = (ageData.list || []).map(row => ({
        age: row.dimensions?.age || '-',
        impressions: formatNumber(parseInt(row.metrics?.impressions) || 0),
        clicks: formatNumber(parseInt(row.metrics?.clicks) || 0),
        reach: formatNumber(parseInt(row.metrics?.reach) || 0),
        spend: row.metrics?.spend || '-',
      }));
    } catch (e) {
      results.by_age = { note: 'Age data not available' };
    }

    // Gender breakdown
    try {
      const genderData = await apiPost('/report/integrated/get/', {
        advertiser_id: advertiserId,
        report_type: 'AUDIENCE',
        data_level: 'AUCTION_ADVERTISER',
        dimensions: ['gender'],
        metrics: ['impressions', 'clicks', 'spend', 'reach'],
        start_date,
        end_date,
        page_size: 10,
      });
      results.by_gender = (genderData.list || []).map(row => ({
        gender: row.dimensions?.gender || '-',
        impressions: formatNumber(parseInt(row.metrics?.impressions) || 0),
        clicks: formatNumber(parseInt(row.metrics?.clicks) || 0),
        reach: formatNumber(parseInt(row.metrics?.reach) || 0),
        spend: row.metrics?.spend || '-',
      }));
    } catch (e) {
      results.by_gender = { note: 'Gender data not available' };
    }

    // Country/Region breakdown
    try {
      const geoData = await apiPost('/report/integrated/get/', {
        advertiser_id: advertiserId,
        report_type: 'AUDIENCE',
        data_level: 'AUCTION_ADVERTISER',
        dimensions: ['country_code'],
        metrics: ['impressions', 'clicks', 'spend', 'reach'],
        start_date,
        end_date,
        page_size: 20,
        order_field: 'impressions',
        order_type: 'DESC',
      });
      results.by_country = (geoData.list || []).map(row => ({
        country: row.dimensions?.country_code || '-',
        impressions: formatNumber(parseInt(row.metrics?.impressions) || 0),
        clicks: formatNumber(parseInt(row.metrics?.clicks) || 0),
        reach: formatNumber(parseInt(row.metrics?.reach) || 0),
        spend: row.metrics?.spend || '-',
      }));
    } catch (e) {
      results.by_country = { note: 'Geographic data not available' };
    }

    return {
      advertiser_id: advertiserId,
      period: `${start_date} to ${end_date}`,
      ...results,
    };
  },

  async trending(args) {
    const { flags } = parseArgs(args);
    const limit = parseInt(flags.limit) || 20;
    const country = flags.country || 'BR';

    // TikTok Trending API - discover trending content
    let trendingHashtags = [];
    try {
      const hashData = await apiGet('/creative/hashtag/suggest/', {
        keyword: flags.keyword || flags.niche || '',
        country_code: country,
        limit,
      });
      trendingHashtags = (hashData.list || []).map(h => ({
        hashtag: `#${h.hashtag_name || h.name || '-'}`,
        views: formatNumber(h.video_views || h.views || 0),
        posts: formatNumber(h.video_count || h.publish_cnt || 0),
        trend: h.trend || '-',
      }));
    } catch (e) {
      trendingHashtags = [{ note: 'Hashtag trending requires keyword parameter (--keyword=fitness)' }];
    }

    // Trending sounds/music
    let trendingSounds = [];
    try {
      const soundData = await apiGet('/creative/music/suggest/', {
        keyword: flags.keyword || flags.niche || '',
        country_code: country,
        limit,
      });
      trendingSounds = (soundData.list || []).map(s => ({
        title: (s.title || s.music_name || '-').substring(0, 40),
        artist: (s.author || s.artist || '-').substring(0, 25),
        duration: s.duration ? `${s.duration}s` : '-',
        uses: formatNumber(s.video_count || s.usage_count || 0),
      }));
    } catch (e) {
      trendingSounds = [{ note: 'Sound trending requires keyword parameter (--keyword=fitness)' }];
    }

    return {
      country,
      keyword: flags.keyword || flags.niche || '(none)',
      trending_hashtags: trendingHashtags,
      trending_sounds: trendingSounds,
      note: 'Use --keyword=YOUR_NICHE --country=BR for best results',
    };
  },

  async 'posting-frequency'(args) {
    const { flags } = parseArgs(args);
    const advertiserId = getAdvertiserId(flags);
    const days = parseInt(flags.days) || 60;
    const { start_date, end_date } = getDateRange(days);

    // Get daily reporting to analyze posting/ad cadence
    const reportData = await apiPost('/report/integrated/get/', {
      advertiser_id: advertiserId,
      report_type: 'BASIC',
      data_level: 'AUCTION_ADVERTISER',
      dimensions: ['stat_time_day'],
      metrics: ['impressions', 'clicks', 'spend', 'video_play_actions', 'likes', 'comments', 'shares'],
      start_date,
      end_date,
      page_size: 60,
      order_field: 'stat_time_day',
      order_type: 'ASC',
    });

    const rows = reportData.list || [];
    if (rows.length === 0) {
      return { message: 'No data in period', period: `${start_date} to ${end_date}` };
    }

    // Days with activity
    const activeDays = rows.filter(r => parseInt(r.metrics?.impressions || 0) > 0).length;
    const totalDays = rows.length;
    const activityRate = totalDays > 0 ? parseFloat((activeDays / totalDays * 100).toFixed(1)) : 0;

    // Distribution by day of week
    const dayDist = { Dom: { count: 0, totalSpend: 0, totalImpressions: 0 }, Seg: { count: 0, totalSpend: 0, totalImpressions: 0 }, Ter: { count: 0, totalSpend: 0, totalImpressions: 0 }, Qua: { count: 0, totalSpend: 0, totalImpressions: 0 }, Qui: { count: 0, totalSpend: 0, totalImpressions: 0 }, Sex: { count: 0, totalSpend: 0, totalImpressions: 0 }, Sab: { count: 0, totalSpend: 0, totalImpressions: 0 } };

    for (const row of rows) {
      const date = row.dimensions?.stat_time_day;
      if (!date) continue;
      const day = getDayOfWeek(date);
      const impressions = parseInt(row.metrics?.impressions) || 0;
      const spend = parseFloat(row.metrics?.spend) || 0;
      if (impressions > 0) {
        dayDist[day].count++;
        dayDist[day].totalSpend += spend;
        dayDist[day].totalImpressions += impressions;
      }
    }

    const byDay = Object.entries(dayDist).map(([day, d]) => ({
      day,
      active_days: d.count,
      avg_impressions: d.count > 0 ? formatNumber(Math.round(d.totalImpressions / d.count)) : '-',
      avg_spend: d.count > 0 ? (d.totalSpend / d.count).toFixed(2) : '-',
    }));

    // Best day
    const bestDay = byDay.filter(d => d.active_days > 0)
      .sort((a, b) => {
        const aImp = dayDist[a.day].count > 0 ? dayDist[a.day].totalImpressions / dayDist[a.day].count : 0;
        const bImp = dayDist[b.day].count > 0 ? dayDist[b.day].totalImpressions / dayDist[b.day].count : 0;
        return bImp - aImp;
      })[0];

    return {
      period: `${start_date} to ${end_date}`,
      total_days: totalDays,
      active_days: activeDays,
      activity_rate: `${activityRate}%`,
      by_day: byDay,
      best_day: bestDay ? `${bestDay.day} (avg ${bestDay.avg_impressions} impressions)` : '-',
    };
  },

  // ── Help ──

  async help() {
    return {
      name: 'TikTok Analyzer CLI',
      description: 'Social intelligence via TikTok Business API for advertiser accounts',
      usage: 'node tiktok-analyzer.mjs <command> [options]',
      commands: {
        'Auth & Setup': {
          'setup': 'Save credentials globally (--token, --advertiser)',
          'auth': 'Verify access token and show account info',
          'accounts': 'List all advertiser accounts',
        },
        'Account Analysis': {
          'account': 'Account overview (info, videos, metrics for period)',
          'top-videos': 'Top videos/ads by impressions or engagement (--sort, --limit)',
          'video-insights': 'Detailed metrics for specific ad (video-insights <ad_id>)',
          'audience': 'Audience demographics (age, gender, geography)',
          'trending': 'Trending hashtags and sounds in niche (--keyword, --country)',
          'posting-frequency': 'Ad activity schedule analysis by day of week',
        },
      },
      global_flags: {
        '--advertiser=<id>': 'Select which advertiser account to use',
        '--format=table': 'Output as table instead of JSON',
        '--limit=<N>': 'Limit number of results (default varies by command)',
        '--days=<N>': 'Number of days for reporting period (default 30)',
        '--sort=<field>': 'Sort field for top-videos (impressions, clicks, ctr)',
      },
      env: {
        'TIKTOK_ACCESS_TOKEN': 'Required. Your TikTok Business API access token',
        'TIKTOK_ADVERTISER_ID': 'Optional default advertiser ID',
        'TIKTOK_APP_ID': 'Optional. For account listing via OAuth',
        'TIKTOK_APP_SECRET': 'Optional. For account listing via OAuth',
      },
      note: 'All operations are READ-ONLY. Get credentials at https://business-api.tiktok.com/',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node tiktok-analyzer.mjs help" for available commands' }));
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
