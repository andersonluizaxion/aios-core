# Google Ads CLI - Referencia Completa de Comandos

## Convencao de Valores

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Monetario | Micros (1 BRL = 1.000.000) | R$ 50/dia = `50000000` |
| Customer ID | Numeros sem hifen | `1234567890` (nao `123-456-7890`) |
| Datas | YYYY-MM-DD | `2026-02-20` |
| Headlines RSA | Separados por `\|` | `"H1\|H2\|H3"` |
| Keywords | Separados por `,` | `"kw1,kw2,kw3"` |

---

## Auth

### setup
Salvar credenciais globalmente.
```bash
node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X [--login-customer-id=X]
```
Config salva em: `~/.config/google-ads/.env`

### auth
Gerar URL de consentimento OAuth2.
```bash
node google-ads.mjs auth
```
Pre-requisito: `GOOGLE_ADS_CLIENT_ID` configurado.

### exchange-token
Trocar authorization code por refresh token.
```bash
node google-ads.mjs exchange-token <authorization_code>
```
Auto-salva refresh token no config global.

---

## Accounts

### accounts
Listar todas as contas acessiveis com detalhes.
```bash
node google-ads.mjs accounts [--format=table]
```
Campos: id, descriptive_name, currency_code, time_zone, manager, status

### account-info
Detalhes de uma conta especifica.
```bash
node google-ads.mjs account-info <customer_id>
```
Campos: id, descriptive_name, currency_code, time_zone, manager, status, auto_tagging_enabled, optimization_score

---

## Campaigns

### campaigns
Listar campanhas.
```bash
node google-ads.mjs campaigns <customer_id> [--status=ENABLED|PAUSED|REMOVED] [--type=SEARCH|DISPLAY|SHOPPING|VIDEO|PERFORMANCE_MAX] [--limit=N] [--format=table]
```
Campos: id, name, status, advertising_channel_type, bidding_strategy_type, budget, metrics

### campaign-details
Detalhes completos de uma campanha.
```bash
node google-ads.mjs campaign-details <campaign_id> [--customer=<id>]
```
Campos: todos os campos de campaign + network_settings + geo_target + metrics completos

### create-campaign
Criar campanha (cria budget automaticamente).
```bash
node google-ads.mjs create-campaign \
  --customer=<id> \
  --name=<name> \
  --type=<SEARCH|DISPLAY|SHOPPING|VIDEO|PERFORMANCE_MAX> \
  --budget-micros=<amount> \
  [--status=PAUSED] \
  [--bid-strategy=MANUAL_CPC|MAXIMIZE_CONVERSIONS|TARGET_CPA|TARGET_ROAS] \
  [--target-cpa-micros=<amount>] \
  [--target-roas=<ratio>] \
  [--enhanced-cpc=true|false] \
  [--search-network=true|false] \
  [--display-network=true|false]
```

### update-campaign
Atualizar campanha existente.
```bash
node google-ads.mjs update-campaign <campaign_id> --customer=<id> [--status=ENABLED|PAUSED] [--name=<name>]
```

---

## Budgets

### create-budget
Criar budget independente.
```bash
node google-ads.mjs create-budget --customer=<id> --name=<name> --amount-micros=<amount> [--delivery=STANDARD]
```

---

## Ad Groups

### adgroups
Listar ad groups de uma campanha.
```bash
node google-ads.mjs adgroups <campaign_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]
```

### adgroup-details
Detalhes de um ad group.
```bash
node google-ads.mjs adgroup-details <adgroup_id> [--customer=<id>]
```

### create-adgroup
Criar ad group.
```bash
node google-ads.mjs create-adgroup \
  --customer=<id> \
  --campaign=<campaign_id> \
  --name=<name> \
  [--cpc-bid-micros=<amount>] \
  [--type=SEARCH_STANDARD] \
  [--status=ENABLED]
```

### update-adgroup
Atualizar ad group.
```bash
node google-ads.mjs update-adgroup <adgroup_id> --customer=<id> [--status=ENABLED|PAUSED] [--name=<name>] [--cpc-bid-micros=<amount>]
```

---

## Ads

### ads
Listar ads de um ad group.
```bash
node google-ads.mjs ads <adgroup_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]
```

### ad-details
Detalhes de um ad.
```bash
node google-ads.mjs ad-details <ad_id> [--customer=<id>]
```

### create-ad
Criar Responsive Search Ad (RSA).
```bash
node google-ads.mjs create-ad \
  --customer=<id> \
  --adgroup=<adgroup_id> \
  --headlines="Headline 1|Headline 2|Headline 3" \
  --descriptions="Description 1|Description 2" \
  --final-url=<url> \
  [--path1=<text>] \
  [--path2=<text>] \
  [--name=<name>] \
  [--status=ENABLED]
```
**Limites RSA:** 3-15 headlines (max 30 chars cada), 2-4 descriptions (max 90 chars cada)

### update-ad
Atualizar ad (status).
```bash
node google-ads.mjs update-ad <ad_id> --customer=<id> --adgroup=<adgroup_id> [--status=ENABLED|PAUSED]
```

---

## Keywords

### keywords
Listar keywords com metricas.
```bash
node google-ads.mjs keywords <adgroup_id> [--customer=<id>] [--status=ENABLED|PAUSED] [--limit=N]
```
Campos: keyword text, match_type, status, serving_status, approval_status, cpc_bid, metrics

### add-keywords
Adicionar keywords em lote.
```bash
node google-ads.mjs add-keywords \
  --customer=<id> \
  --adgroup=<adgroup_id> \
  --keywords="kw1,kw2,kw3" \
  [--match-type=BROAD|PHRASE|EXACT] \
  [--cpc-bid-micros=<amount>]
```

### remove-keyword
Remover keyword.
```bash
node google-ads.mjs remove-keyword <criterion_id> --adgroup=<adgroup_id> [--customer=<id>]
```

---

## Insights & Reporting

### insights
Metricas de performance com filtros.
```bash
node google-ads.mjs insights <campaign_id|customer_id> \
  [--level=campaign|adgroup|ad] \
  [--date-range=LAST_7_DAYS|LAST_30_DAYS|THIS_MONTH|LAST_MONTH|LAST_90_DAYS] \
  [--since=YYYY-MM-DD --until=YYYY-MM-DD] \
  [--customer=<id>] \
  [--limit=N] \
  [--format=table]
```
Metricas: impressions, clicks, ctr, average_cpc, cost_micros, conversions, conversions_value, cost_per_conversion, search_impression_share

### keyword-performance
Performance de keywords com Quality Score.
```bash
node google-ads.mjs keyword-performance <adgroup_id> [--customer=<id>] [--date-range=LAST_7_DAYS]
```
Campos extras: quality_score, search_predicted_ctr, creative_quality_score, post_click_quality_score

### search-terms
Relatorio de termos de busca.
```bash
node google-ads.mjs search-terms <campaign_id> [--customer=<id>] [--date-range=LAST_7_DAYS] [--limit=N]
```

---

## Targeting

### search-locations
Buscar localizacoes para geo targeting.
```bash
node google-ads.mjs search-locations <query> [--customer=<id>] [--limit=N]
```
Campos: id, name, country_code, target_type, canonical_name

### audiences
Listar audiencias disponiveis.
```bash
node google-ads.mjs audiences [customer_id] [--limit=N]
```

---

## Advanced

### query
Executar GAQL (Google Ads Query Language) direto.
```bash
node google-ads.mjs query <customer_id> "SELECT campaign.name, metrics.clicks FROM campaign LIMIT 10"
```

---

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Sim | Developer token (Google Ads > Tools > API Center) |
| `GOOGLE_ADS_CLIENT_ID` | Sim | OAuth2 Client ID (Google Cloud Console) |
| `GOOGLE_ADS_CLIENT_SECRET` | Sim | OAuth2 Client Secret |
| `GOOGLE_ADS_REFRESH_TOKEN` | Sim | OAuth2 Refresh Token (via `auth` + `exchange-token`) |
| `GOOGLE_ADS_CUSTOMER_ID` | Sim | Customer ID padrao (sem hifens) |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Nao | MCC Manager account ID (para contas gerenciadas) |

Prioridade de carregamento:
1. Shell environment (maior)
2. `.env` do diretorio atual
3. `.env` do aios-marketing/
4. `~/.config/google-ads/.env` (menor)
