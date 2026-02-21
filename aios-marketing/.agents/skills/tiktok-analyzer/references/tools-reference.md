# TikTok Analyzer CLI - Referencia Completa de Comandos

## Convencao de Valores

- **Engagement Rate (ER%):** (likes+comments+shares)/views * 100
- **Advertiser ID:** Numerico (ex: `7123456789012345678`)
- **Fonte de dados:** TikTok Business API v1.3
- **Valores monetarios:** Na moeda da conta do anunciante

## Auth & Setup

### setup
Salvar credenciais em `~/.config/tiktok-analyzer/.env`.

```bash
# Ver instrucoes
node tiktok-analyzer.mjs setup

# Salvar credenciais
node tiktok-analyzer.mjs setup --token=ACCESS_TOKEN --advertiser=ADVERTISER_ID
```

Flags: `--token`, `--advertiser`

### auth
Verificar access token e mostrar informacoes da conta.

```bash
node tiktok-analyzer.mjs auth
```

Retorna: status, token_prefix, advertiser_id_configured, advertisers.

### accounts
Listar todas as contas de anunciante acessiveis.

```bash
node tiktok-analyzer.mjs accounts
```

Retorna: lista de contas com advertiser_id, name, status, currency, timezone.

## Account Analysis

### account
Visao geral da conta: info do anunciante, total de videos, metricas do periodo.

```bash
node tiktok-analyzer.mjs account --advertiser=ID
node tiktok-analyzer.mjs account --advertiser=ID --days=60
```

Flags: `--advertiser` (obrigatorio), `--days` (default 30)
Retorna: advertiser_id, name, company, status, currency, total_videos, metrics (spend, impressions, clicks, ctr, reach).

### top-videos
Ranking de videos/ads por metricas de performance.

```bash
node tiktok-analyzer.mjs top-videos --advertiser=ID --format=table
node tiktok-analyzer.mjs top-videos --advertiser=ID --sort=clicks --limit=10
```

Flags: `--advertiser` (obrigatorio), `--limit` (default 20), `--days` (default 30), `--sort` (impressions, clicks, ctr, video_views_p100)
Colunas: rank, ad_id, name, impressions, clicks, ctr, views_100pct, likes, comments, shares, spend.

### video-insights
Metricas detalhadas de um ad/video especifico.

```bash
node tiktok-analyzer.mjs video-insights AD_ID --advertiser=ID
node tiktok-analyzer.mjs video-insights AD_ID --advertiser=ID --days=60
```

Args: `AD_ID` (obrigatorio, posicional)
Flags: `--advertiser` (obrigatorio), `--days` (default 30)
Retorna: impressions, reach, frequency, clicks, ctr, cpc, cpm, spend, video_plays, views_25/50/75/100pct, avg_play_duration, likes, comments, shares, follows, profile_visits, engagement_rate.

### audience
Demograficos da audiencia: age, gender, geography.

```bash
node tiktok-analyzer.mjs audience --advertiser=ID
node tiktok-analyzer.mjs audience --advertiser=ID --days=60
```

Flags: `--advertiser` (obrigatorio), `--days` (default 30)
Retorna: by_age, by_gender, by_country (cada um com impressions, clicks, reach, spend).

### trending
Hashtags e sons em alta por nicho e pais.

```bash
node tiktok-analyzer.mjs trending --keyword=fitness --country=BR
node tiktok-analyzer.mjs trending --keyword=estetica --country=BR --limit=30
```

Flags: `--keyword` (recomendado), `--country` (default BR), `--limit` (default 20)
Retorna: trending_hashtags (hashtag, views, posts, trend), trending_sounds (title, artist, duration, uses).

### posting-frequency
Analise de cadencia de atividade de ads por dia da semana.

```bash
node tiktok-analyzer.mjs posting-frequency --advertiser=ID
node tiktok-analyzer.mjs posting-frequency --advertiser=ID --days=90
```

Flags: `--advertiser` (obrigatorio), `--days` (default 60)
Retorna: period, total_days, active_days, activity_rate, by_day (day, active_days, avg_impressions, avg_spend), best_day.
