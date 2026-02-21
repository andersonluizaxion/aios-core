#!/usr/bin/env node

// LinkedIn Analyzer CLI - Social Intelligence via LinkedIn Marketing API
// Zero dependencies - uses native fetch (Node 18+)
// Usage: node linkedin-analyzer.mjs <command> [options]
//
// All data comes from LinkedIn Marketing API (organization pages).
// Use --org=ID to select which organization to analyze.
//
// Env loading priority (highest wins):
//   1. Shell environment variables
//   2. .env in current working directory
//   3. .env in script's parent directory (aios-marketing/)
//   4. ~/.config/linkedin-analyzer/.env (global)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const API_BASE_URL = 'https://api.linkedin.com/v2';
const RESTLI_BASE_URL = 'https://api.linkedin.com/rest';
const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'linkedin-analyzer');
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
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    console.error(JSON.stringify({
      error: 'LINKEDIN_ACCESS_TOKEN not set',
      help: 'Configure your token in one of these locations:',
      options: [
        `1. Global (all projects): ${GLOBAL_ENV_FILE}`,
        '2. Project-level: .env in your project root',
        '3. Shell: export LINKEDIN_ACCESS_TOKEN=your_token',
      ],
      setup: 'Run: node linkedin-analyzer.mjs setup --token=YOUR_TOKEN'
    }, null, 2));
    process.exit(1);
  }
  return token;
}

function getOrganizationId(flags = {}) {
  const id = flags.org || flags['org-id'] || flags.organization || process.env.LINKEDIN_ORGANIZATION_ID;
  if (!id) {
    console.error(JSON.stringify({
      error: 'Organization ID required',
      help: 'Specify via --org=ID or set LINKEDIN_ORGANIZATION_ID in .env',
      discover: 'Run: node linkedin-analyzer.mjs accounts',
    }, null, 2));
    process.exit(1);
  }
  return id;
}

// ─── HTTP: LinkedIn API ─────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
  }
}

async function linkedinGet(endpoint, params = {}, useRestli = false) {
  const token = getAccessToken();
  const baseUrl = useRestli ? RESTLI_BASE_URL : API_BASE_URL;
  const url = new URL(`${baseUrl}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202402',
  };

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const errorBody = await res.text();
    let errorMsg;
    try {
      const parsed = JSON.parse(errorBody);
      errorMsg = parsed.message || parsed.error_description || errorBody;
    } catch {
      errorMsg = errorBody;
    }
    throw new ApiError(errorMsg, res.status, 'LINKEDIN_API_ERROR');
  }

  const text = await res.text();
  if (!text) return {};
  return JSON.parse(text);
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

function formatDate(timestamp) {
  if (!timestamp) return '-';
  const d = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatNumber(num) {
  if (num === undefined || num === null) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.getTime(),
    endDate: end.getTime(),
    startDateStr: start.toISOString().split('T')[0],
    endDateStr: end.toISOString().split('T')[0],
  };
}

function calcEngagementRate(likes, comments, shares, impressions) {
  if (!impressions || impressions === 0) return 0;
  return parseFloat(((likes + comments + shares) / impressions * 100).toFixed(2));
}

// ─── Commands ────────────────────────────────────────────────────────────────

const commands = {

  // ── Auth & Setup ──

  async setup(args) {
    const { flags } = parseArgs(args);
    const token = flags.token || flags['access-token'];
    const orgId = flags.org || flags['org-id'] || flags.organization;

    if (!token && !orgId) {
      return {
        message: 'Save LinkedIn Analyzer credentials globally',
        usage: 'node linkedin-analyzer.mjs setup --token=<access_token> [--org=<org_id>]',
        config_file: GLOBAL_ENV_FILE,
        current_status: existsSync(GLOBAL_ENV_FILE)
          ? `Config exists at ${GLOBAL_ENV_FILE}`
          : 'No global config found',
        how_it_works: [
          'Credentials are saved to ~/.config/linkedin-analyzer/.env',
          'Loaded automatically from any project directory',
          'Project .env overrides global config, shell env overrides both',
        ],
        step_by_step: [
          '1. Create LinkedIn app at https://www.linkedin.com/developers/',
          '2. Request Marketing Developer Platform access',
          '3. Generate OAuth2 access token with required scopes',
          '4. Run: node linkedin-analyzer.mjs setup --token=YOUR_TOKEN --org=YOUR_ORG_ID',
          '5. Verify: node linkedin-analyzer.mjs auth',
        ],
        required_scopes: [
          'r_organization_admin',
          'r_organization_social',
          'rw_organization_admin',
          'r_ads_reporting',
        ],
      };
    }

    if (!existsSync(GLOBAL_CONFIG_DIR)) {
      mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }

    const existing = parseEnvFile(GLOBAL_ENV_FILE);
    if (token) existing.LINKEDIN_ACCESS_TOKEN = token;
    if (orgId) existing.LINKEDIN_ORGANIZATION_ID = orgId;

    const content = [
      '# LinkedIn Analyzer - Global Configuration',
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
      test: 'Run: node linkedin-analyzer.mjs auth',
    };
  },

  async auth(args) {
    const token = getAccessToken();

    // Verify token by getting current user profile
    const me = await linkedinGet('/me');

    // Try to get administered pages
    let pages = [];
    try {
      const orgs = await linkedinGet('/organizationAcls', {
        q: 'roleAssignee',
        role: 'ADMINISTRATOR',
        projection: '(elements*(organizationalTarget))',
      });
      pages = (orgs.elements || []).map(e => ({
        org_urn: e.organizationalTarget || '-',
      }));
    } catch (e) {
      pages = [{ note: 'Could not list organizations. Check r_organization_admin scope.' }];
    }

    return {
      status: 'authenticated',
      user: {
        id: me.id,
        first_name: me.localizedFirstName || me.firstName?.localized?.en_US || '-',
        last_name: me.localizedLastName || me.lastName?.localized?.en_US || '-',
      },
      token_prefix: token.substring(0, 12) + '...',
      organization_id_configured: process.env.LINKEDIN_ORGANIZATION_ID || 'not set',
      administered_orgs: pages,
      hint: pages.length > 0
        ? 'Use --org=ID in commands or set LINKEDIN_ORGANIZATION_ID'
        : 'Grant r_organization_admin scope to see organizations',
    };
  },

  async accounts(args) {
    const token = getAccessToken();

    // List organizations where user is admin
    const orgs = await linkedinGet('/organizationAcls', {
      q: 'roleAssignee',
      role: 'ADMINISTRATOR',
      projection: '(elements*(organizationalTarget,role,state))',
    });

    const orgUrns = (orgs.elements || []).map(e => e.organizationalTarget).filter(Boolean);
    const accounts = [];

    for (const urn of orgUrns) {
      const orgId = urn.split(':').pop();
      try {
        const orgInfo = await linkedinGet(`/organizations/${orgId}`, {
          projection: '(id,localizedName,vanityName,logoV2,staffCountRange)',
        });
        accounts.push({
          org_id: orgId,
          name: orgInfo.localizedName || '-',
          vanity: orgInfo.vanityName || '-',
          size: orgInfo.staffCountRange || '-',
        });
      } catch (e) {
        accounts.push({
          org_id: orgId,
          name: '(access denied)',
          vanity: '-',
          size: '-',
        });
      }
    }

    return {
      total_accounts: accounts.length,
      accounts,
      usage: [
        'Use --org=ID in any command to select organization:',
        '  node linkedin-analyzer.mjs page-stats --org=123456789',
        '',
        'Or set LINKEDIN_ORGANIZATION_ID in .env for default.',
      ],
    };
  },

  // ── Page Analytics ──

  async 'page-stats'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);
    const days = parseInt(flags.days) || 30;
    const { startDateStr, endDateStr } = getDateRange(days);

    // Get organization info
    const orgInfo = await linkedinGet(`/organizations/${orgId}`, {
      projection: '(id,localizedName,vanityName,localizedDescription,staffCountRange,industries,specialties,websiteUrl)',
    });

    // Get follower count
    let followerCount = '-';
    try {
      const stats = await linkedinGet(`/organizationalEntityFollowerStatistics`, {
        q: 'organizationalEntity',
        organizationalEntity: `urn:li:organization:${orgId}`,
      });
      const elements = stats.elements || [];
      if (elements.length > 0) {
        const el = elements[0];
        followerCount = (el.followerCounts?.organicFollowerCount || 0) + (el.followerCounts?.paidFollowerCount || 0);
      }
    } catch (e) {
      // Fallback: try network size
      try {
        const netStats = await linkedinGet(`/networkSizes/urn:li:organization:${orgId}`, {
          edgeType: 'CompanyFollowedByMember',
        });
        followerCount = netStats.firstDegreeSize || '-';
      } catch (e2) {
        // ignore
      }
    }

    // Get page statistics
    let pageViews = '-';
    let uniqueVisitors = '-';
    try {
      const pageStats = await linkedinGet('/organizationPageStatistics', {
        q: 'organization',
        organization: `urn:li:organization:${orgId}`,
        'timeIntervals.timeGranularityType': 'DAY',
        'timeIntervals.timeRange.start': getDateRange(days).startDate,
        'timeIntervals.timeRange.end': getDateRange(days).endDate,
      });
      const elements = pageStats.elements || [];
      let totalViews = 0;
      let totalVisitors = 0;
      for (const el of elements) {
        const views = el.totalPageStatistics?.views?.allPageViews?.pageViews || 0;
        const visitors = el.totalPageStatistics?.views?.allPageViews?.uniquePageViews || 0;
        totalViews += views;
        totalVisitors += visitors;
      }
      if (totalViews > 0) pageViews = totalViews;
      if (totalVisitors > 0) uniqueVisitors = totalVisitors;
    } catch (e) {
      // ignore
    }

    return {
      org_id: orgId,
      name: orgInfo.localizedName || '-',
      vanity_name: orgInfo.vanityName || '-',
      website: orgInfo.websiteUrl || '-',
      description: (orgInfo.localizedDescription || '').substring(0, 120) || '-',
      company_size: orgInfo.staffCountRange || '-',
      followers: followerCount,
      period: `${days} days`,
      page_views: pageViews,
      unique_visitors: uniqueVisitors,
    };
  },

  async 'post-performance'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);
    const limit = parseInt(flags.limit) || 20;

    // Get organization posts (UGC posts)
    let posts = [];
    try {
      const ugcData = await linkedinGet('/ugcPosts', {
        q: 'authors',
        authors: `List(urn:li:organization:${orgId})`,
        count: limit,
        sortBy: 'LAST_MODIFIED',
      });
      posts = ugcData.elements || [];
    } catch (e) {
      // Try shares endpoint as fallback
      try {
        const sharesData = await linkedinGet(`/shares`, {
          q: 'owners',
          owners: `urn:li:organization:${orgId}`,
          count: limit,
          sharesPerOwner: limit,
        });
        posts = sharesData.elements || [];
      } catch (e2) {
        return { error: 'Could not fetch posts. Check r_organization_social scope.', details: e.message };
      }
    }

    // Get social actions for each post
    const results = [];
    for (const post of posts.slice(0, limit)) {
      const postUrn = post.id || post.activity;
      const text = post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text
        || post.text?.text || '';

      let likes = 0, comments = 0, shares = 0, impressions = 0;
      try {
        const socialData = await linkedinGet(`/socialActions/${encodeURIComponent(postUrn)}`);
        likes = socialData.likesSummary?.totalLikes || 0;
        comments = socialData.commentsSummary?.totalFirstLevelComments || 0;
      } catch (e) {
        // ignore
      }

      // Try to get share statistics
      try {
        const shareStats = await linkedinGet(`/organizationalEntityShareStatistics`, {
          q: 'organizationalEntity',
          organizationalEntity: `urn:li:organization:${orgId}`,
          'shares[0]': postUrn,
        });
        const stats = (shareStats.elements || [])[0]?.totalShareStatistics;
        if (stats) {
          impressions = stats.impressionCount || 0;
          likes = stats.likeCount || likes;
          comments = stats.commentCount || comments;
          shares = stats.shareCount || 0;
        }
      } catch (e) {
        // ignore
      }

      const er = calcEngagementRate(likes, comments, shares, impressions);

      results.push({
        date: formatDate(post.created?.time || post.lastModified?.time),
        type: post.specificContent ? 'UGC' : 'Share',
        likes,
        comments,
        shares,
        impressions: formatNumber(impressions),
        er: impressions > 0 ? `${er}%` : '-',
        text: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
      });
    }

    return results;
  },

  async 'top-posts'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);
    const limit = parseInt(flags.limit) || 10;
    const days = parseInt(flags.days) || 90;

    // Get share statistics over time
    const { startDate, endDate } = getDateRange(days);

    let shareStats = [];
    try {
      const statsData = await linkedinGet('/organizationalEntityShareStatistics', {
        q: 'organizationalEntity',
        organizationalEntity: `urn:li:organization:${orgId}`,
        'timeIntervals.timeGranularityType': 'DAY',
        'timeIntervals.timeRange.start': startDate,
        'timeIntervals.timeRange.end': endDate,
      });
      shareStats = statsData.elements || [];
    } catch (e) {
      return { error: 'Could not fetch share statistics. Check organization permissions.', details: e.message };
    }

    // Flatten per-share stats if available
    const postMetrics = [];
    for (const el of shareStats) {
      const stats = el.totalShareStatistics;
      if (!stats) continue;

      const share = el.share;
      if (!share) continue;

      const likes = stats.likeCount || 0;
      const comments = stats.commentCount || 0;
      const shares = stats.shareCount || 0;
      const impressions = stats.impressionCount || 0;
      const clicks = stats.clickCount || 0;
      const er = calcEngagementRate(likes, comments, shares, impressions);

      postMetrics.push({
        rank: 0,
        share_urn: share,
        likes,
        comments,
        shares,
        clicks,
        impressions: formatNumber(impressions),
        er: impressions > 0 ? `${er}%` : '-',
        engagement_total: likes + comments + shares + clicks,
      });
    }

    // Sort by total engagement
    const ranked = postMetrics
      .sort((a, b) => b.engagement_total - a.engagement_total)
      .slice(0, limit)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    if (ranked.length === 0) {
      return { message: 'No post data found in period', period: `${days} days`, org_id: orgId };
    }

    return ranked;
  },

  async 'follower-demographics'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);

    const data = await linkedinGet('/organizationalEntityFollowerStatistics', {
      q: 'organizationalEntity',
      organizationalEntity: `urn:li:organization:${orgId}`,
    });

    const elements = data.elements || [];
    if (elements.length === 0) {
      return { message: 'No follower demographic data available', org_id: orgId };
    }

    const el = elements[0];

    // Follower counts
    const followerCounts = el.followerCounts || {};
    const totalFollowers = (followerCounts.organicFollowerCount || 0) + (followerCounts.paidFollowerCount || 0);

    // By seniority
    const bySeniority = (el.followerCountsBySeniority || []).map(item => ({
      seniority: item.seniority || '-',
      organic: item.followerCounts?.organicFollowerCount || 0,
      paid: item.followerCounts?.paidFollowerCount || 0,
      total: (item.followerCounts?.organicFollowerCount || 0) + (item.followerCounts?.paidFollowerCount || 0),
    })).sort((a, b) => b.total - a.total);

    // By industry
    const byIndustry = (el.followerCountsByIndustry || []).map(item => ({
      industry: item.industry || '-',
      organic: item.followerCounts?.organicFollowerCount || 0,
      paid: item.followerCounts?.paidFollowerCount || 0,
      total: (item.followerCounts?.organicFollowerCount || 0) + (item.followerCounts?.paidFollowerCount || 0),
    })).sort((a, b) => b.total - a.total).slice(0, 15);

    // By function
    const byFunction = (el.followerCountsByFunction || []).map(item => ({
      function: item.function || '-',
      organic: item.followerCounts?.organicFollowerCount || 0,
      paid: item.followerCounts?.paidFollowerCount || 0,
      total: (item.followerCounts?.organicFollowerCount || 0) + (item.followerCounts?.paidFollowerCount || 0),
    })).sort((a, b) => b.total - a.total).slice(0, 15);

    // By geo
    const byGeo = (el.followerCountsByGeo || []).map(item => ({
      geo: item.geo || '-',
      organic: item.followerCounts?.organicFollowerCount || 0,
      paid: item.followerCounts?.paidFollowerCount || 0,
      total: (item.followerCounts?.organicFollowerCount || 0) + (item.followerCounts?.paidFollowerCount || 0),
    })).sort((a, b) => b.total - a.total).slice(0, 15);

    return {
      org_id: orgId,
      total_followers: totalFollowers,
      organic: followerCounts.organicFollowerCount || 0,
      paid: followerCounts.paidFollowerCount || 0,
      by_seniority: bySeniority,
      by_industry: byIndustry,
      by_function: byFunction,
      by_geography: byGeo,
    };
  },

  async 'visitor-demographics'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);
    const days = parseInt(flags.days) || 30;
    const { startDate, endDate } = getDateRange(days);

    let pageStats = [];
    try {
      const data = await linkedinGet('/organizationPageStatistics', {
        q: 'organization',
        organization: `urn:li:organization:${orgId}`,
        'timeIntervals.timeGranularityType': 'DAY',
        'timeIntervals.timeRange.start': startDate,
        'timeIntervals.timeRange.end': endDate,
      });
      pageStats = data.elements || [];
    } catch (e) {
      return { error: 'Could not fetch visitor demographics.', details: e.message };
    }

    if (pageStats.length === 0) {
      return { message: 'No visitor data available for this period', period: `${days} days` };
    }

    // Aggregate visitor metrics by dimension
    const bySeniority = {};
    const byIndustry = {};
    const byFunction = {};
    const byGeo = {};

    for (const el of pageStats) {
      const byDim = el.totalPageStatistics?.viewsByPageSection;
      if (!byDim) continue;

      // Process visitor demographics from page stats
      for (const [section, views] of Object.entries(byDim || {})) {
        // Aggregate total views per section
      }
    }

    // Try visitor statistics endpoint
    let visitorData = {};
    try {
      const vStats = await linkedinGet('/organizationPageStatistics', {
        q: 'organization',
        organization: `urn:li:organization:${orgId}`,
      });
      const elements = vStats.elements || [];
      if (elements.length > 0) {
        const el = elements[0];
        visitorData = {
          total_views: el.totalPageStatistics?.views?.allPageViews?.pageViews || 0,
          unique_visitors: el.totalPageStatistics?.views?.allPageViews?.uniquePageViews || 0,
          mobile_views: el.totalPageStatistics?.views?.mobilePageViews?.pageViews || 0,
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      org_id: orgId,
      period: `${days} days`,
      visitor_overview: visitorData,
      note: 'Detailed visitor demographics require LinkedIn Marketing Developer Platform access with r_organization_admin scope.',
    };
  },

  async 'competitor-pages'(args) {
    const { flags } = parseArgs(args);
    const orgId = getOrganizationId(flags);
    const competitors = (flags.competitors || '').split(',').filter(Boolean);

    if (competitors.length === 0) {
      return {
        error: 'Competitors required',
        usage: 'node linkedin-analyzer.mjs competitor-pages --org=MY_ORG --competitors=ORG_ID1,ORG_ID2',
        note: 'Competitor IDs can be found from LinkedIn company page URLs',
      };
    }

    // Get own page stats
    const ownInfo = await linkedinGet(`/organizations/${orgId}`, {
      projection: '(id,localizedName,vanityName,staffCountRange)',
    });

    let ownFollowers = 0;
    try {
      const netStats = await linkedinGet(`/networkSizes/urn:li:organization:${orgId}`, {
        edgeType: 'CompanyFollowedByMember',
      });
      ownFollowers = netStats.firstDegreeSize || 0;
    } catch (e) {
      // ignore
    }

    const rows = [{
      org_id: orgId,
      name: `${ownInfo.localizedName || '-'} (you)`,
      vanity: ownInfo.vanityName || '-',
      size: ownInfo.staffCountRange || '-',
      followers: ownFollowers,
    }];

    for (const compId of competitors) {
      try {
        const compInfo = await linkedinGet(`/organizations/${compId}`, {
          projection: '(id,localizedName,vanityName,staffCountRange)',
        });

        let compFollowers = 0;
        try {
          const netStats = await linkedinGet(`/networkSizes/urn:li:organization:${compId}`, {
            edgeType: 'CompanyFollowedByMember',
          });
          compFollowers = netStats.firstDegreeSize || 0;
        } catch (e) {
          // ignore
        }

        rows.push({
          org_id: compId,
          name: compInfo.localizedName || '-',
          vanity: compInfo.vanityName || '-',
          size: compInfo.staffCountRange || '-',
          followers: compFollowers,
        });
      } catch (e) {
        rows.push({
          org_id: compId,
          name: '(access denied or not found)',
          vanity: '-',
          size: '-',
          followers: '-',
        });
      }
    }

    return rows;
  },

  // ── Help ──

  async help() {
    return {
      name: 'LinkedIn Analyzer CLI',
      description: 'Social intelligence via LinkedIn Marketing API for organization pages',
      usage: 'node linkedin-analyzer.mjs <command> [options]',
      commands: {
        'Auth & Setup': {
          'setup': 'Save credentials globally (--token, --org)',
          'auth': 'Verify access token and show user info',
          'accounts': 'List administered organization pages',
        },
        'Page Analytics': {
          'page-stats': 'Page analytics (followers, views, engagement)',
          'post-performance': 'Post-level analytics (likes, comments, shares, impressions)',
          'top-posts': 'Top posts by total engagement (--limit, --days)',
          'follower-demographics': 'Follower breakdown (seniority, industry, location, function)',
          'visitor-demographics': 'Page visitor demographics and traffic overview',
          'competitor-pages': 'Compare with competitor pages (--competitors=ID1,ID2)',
        },
      },
      global_flags: {
        '--org=<id>': 'Select which organization page to analyze',
        '--format=table': 'Output as table instead of JSON',
        '--limit=<N>': 'Limit number of results (default varies by command)',
        '--days=<N>': 'Number of days for reporting period (default 30)',
      },
      env: {
        'LINKEDIN_ACCESS_TOKEN': 'Required. Your LinkedIn OAuth2 access token',
        'LINKEDIN_ORGANIZATION_ID': 'Optional default organization ID',
      },
      required_scopes: [
        'r_organization_admin',
        'r_organization_social',
        'rw_organization_admin (for full stats)',
        'r_ads_reporting (optional, for ad analytics)',
      ],
      note: 'All operations are READ-ONLY. Get credentials at https://www.linkedin.com/developers/',
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
    console.error(JSON.stringify({ error: `Unknown command: ${command}`, hint: 'Run "node linkedin-analyzer.mjs help" for available commands' }));
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
