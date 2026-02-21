# Ad Library CLI - Referencia Completa de Comandos

## Convencao de Valores

- **Page ID:** Numerico, identifica o anunciante (Facebook page)
- **Fonte de dados:** Meta Ad Library API (Graph API v24.0, endpoint /ads_archive)
- **Acesso:** Publico e gratuito (mesmo token do Meta Ads)
- **Pais padrao:** BR (Brasil)

## Auth & Setup

### setup
Salvar credenciais em `~/.config/ad-library/.env`.

```bash
# Ver instrucoes
node ad-library.mjs setup

# Salvar credenciais (mesmo token do Meta Ads)
node ad-library.mjs setup --token=META_TOKEN
```

Flags: `--token`

### auth
Verificar token e testar acesso a Ad Library API.

```bash
node ad-library.mjs auth
```

Retorna: status, facebook_user, token_prefix, ad_library_access.

## Competitive Intelligence

### search
Pesquisar anuncios por nome do anunciante ou keyword.

```bash
node ad-library.mjs search "cirurgia plastica" --format=table
node ad-library.mjs search "nome concorrente" --country=BR --status=ALL
node ad-library.mjs search "estetica" --limit=50 --format=table
```

Args: `<search_terms>` (obrigatorio, posicional)
Flags: `--country` (default BR), `--status` (ACTIVE ou ALL, default ACTIVE), `--limit` (default 25)
Colunas: ad_id, advertiser, status, start_date, platforms, creative.

### advertiser
Todos os anuncios de um anunciante especifico (por page ID).

```bash
node ad-library.mjs advertiser PAGE_ID --format=table
node ad-library.mjs advertiser PAGE_ID --country=BR --limit=100
```

Args: `<page_id>` (obrigatorio, posicional ou --page-id)
Flags: `--country` (default BR), `--limit` (default 50)
Colunas: ad_id, start_date, days_running, status, platforms, creative, title.

### active
Anuncios atualmente ativos de um anunciante.

```bash
node ad-library.mjs active PAGE_ID --format=table
node ad-library.mjs active PAGE_ID --country=BR
```

Args: `<page_id>` (obrigatorio, posicional ou --page-id)
Flags: `--country` (default BR), `--limit` (default 50)
Colunas: ad_id, start_date, days_running, platforms, format, creative.

### trends
Tendencias de atividade de anuncios (novos anuncios por mes).

```bash
node ad-library.mjs trends PAGE_ID
node ad-library.mjs trends PAGE_ID --country=BR
```

Args: `<page_id>` (obrigatorio, posicional ou --page-id)
Flags: `--country` (default BR)
Retorna: total_ads_found, currently_active, stopped, avg_ads_per_month, by_month (month, ads_started, ads_stopped, net).

### formats
Distribuicao de formatos criativos dos anuncios de um anunciante.

```bash
node ad-library.mjs formats PAGE_ID --format=table
node ad-library.mjs formats PAGE_ID --country=BR
```

Args: `<page_id>` (obrigatorio, posicional ou --page-id)
Flags: `--country` (default BR)
Retorna: total_ads, active_ads, format_distribution (format, count, pct), platform_distribution (platform, ads, pct).

## Como Encontrar Page IDs

1. Pesquisar pelo nome: `node ad-library.mjs search "nome" --format=table`
2. Da URL do Facebook: `facebook.com/PAGE_NAME` -> precisa do ID numerico
3. Via Graph API: `https://graph.facebook.com/PAGE_NAME?fields=id`

## Limitacoes da API

- Dados de reach/spend podem nao estar disponiveis para todos os anuncios
- Ad Library API retorna dados publicos apenas
- Formatos criativos sao detectados por heuristica (nao ha campo explicito)
- Paginacao limitada a ~500 resultados por query
- Anuncios politicos vs comerciais podem ter niveis de acesso diferentes
