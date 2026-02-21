# LinkedIn Analyzer CLI - Referencia Completa de Comandos

## Convencao de Valores

- **Engagement Rate (ER%):** (likes+comments+shares)/impressions * 100
- **Organization ID:** Numerico (ex: `123456789`)
- **Fonte de dados:** LinkedIn Marketing API v2 + REST API
- **Timestamps:** Milliseconds (epoch) para range queries

## Auth & Setup

### setup
Salvar credenciais em `~/.config/linkedin-analyzer/.env`.

```bash
# Ver instrucoes
node linkedin-analyzer.mjs setup

# Salvar credenciais
node linkedin-analyzer.mjs setup --token=ACCESS_TOKEN --org=ORG_ID
```

Flags: `--token`, `--org`

### auth
Verificar access token e mostrar informacoes do usuario.

```bash
node linkedin-analyzer.mjs auth
```

Retorna: status, user (id, first_name, last_name), token_prefix, organization_id_configured, administered_orgs.

### accounts
Listar paginas de organizacao onde o usuario e administrador.

```bash
node linkedin-analyzer.mjs accounts
```

Retorna: lista de organizacoes com org_id, name, vanity, size.

## Page Analytics

### page-stats
Analytics gerais da pagina: info da organizacao, followers, views.

```bash
node linkedin-analyzer.mjs page-stats --org=ID
node linkedin-analyzer.mjs page-stats --org=ID --days=60
```

Flags: `--org` (obrigatorio), `--days` (default 30)
Retorna: org_id, name, vanity_name, website, description, company_size, followers, page_views, unique_visitors.

### post-performance
Metricas de posts individuais: likes, comments, shares, impressions.

```bash
node linkedin-analyzer.mjs post-performance --org=ID --format=table
node linkedin-analyzer.mjs post-performance --org=ID --limit=20
```

Flags: `--org` (obrigatorio), `--limit` (default 20)
Colunas: date, type, likes, comments, shares, impressions, er, text.

### top-posts
Ranking de posts por engajamento total.

```bash
node linkedin-analyzer.mjs top-posts --org=ID --format=table
node linkedin-analyzer.mjs top-posts --org=ID --limit=10 --days=90
```

Flags: `--org` (obrigatorio), `--limit` (default 10), `--days` (default 90)
Colunas: rank, share_urn, likes, comments, shares, clicks, impressions, er, engagement_total.

### follower-demographics
Breakdown de followers por seniority, industry, function, geography.

```bash
node linkedin-analyzer.mjs follower-demographics --org=ID
```

Flags: `--org` (obrigatorio)
Retorna: total_followers, organic, paid, by_seniority, by_industry, by_function, by_geography.

### visitor-demographics
Visao geral de visitantes e trafego da pagina.

```bash
node linkedin-analyzer.mjs visitor-demographics --org=ID
node linkedin-analyzer.mjs visitor-demographics --org=ID --days=60
```

Flags: `--org` (obrigatorio), `--days` (default 30)
Retorna: visitor_overview (total_views, unique_visitors, mobile_views).

## Comparative

### competitor-pages
Comparar pagina propria com concorrentes (dados publicos).

```bash
node linkedin-analyzer.mjs competitor-pages --org=MY_ORG --competitors=ORG_ID1,ORG_ID2 --format=table
```

Flags: `--org` (obrigatorio), `--competitors` (obrigatorio, separados por virgula)
Colunas: org_id, name, vanity, size, followers.

**Nota:** Dados de concorrentes limitados a informacoes publicas. Para dados completos, voce precisa ser admin da pagina.
