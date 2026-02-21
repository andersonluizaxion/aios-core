# Meta Ads CLI - Referencia Completa de Comandos

Todos os comandos usam: `node aios-marketing/bin/meta-ads.mjs <comando> [args] [--flags]`

## Conta & Autenticacao

### auth
Guia de setup e link de autenticacao OAuth.
```bash
node aios-marketing/bin/meta-ads.mjs auth
```
- **Quando:** Primeira utilizacao ou quando token expirar
- **Requer:** `META_APP_ID` no ambiente para gerar link OAuth

### exchange-token
Troca token de curta duracao por um de longa duracao.
```bash
node aios-marketing/bin/meta-ads.mjs exchange-token <short_lived_token>
```
- **Requer:** `META_APP_ID` e `META_APP_SECRET` no ambiente

### accounts
Lista todas as contas de anuncio acessiveis.
```bash
node aios-marketing/bin/meta-ads.mjs accounts [--format=table] [--fields=...] [--limit=N]
```
- **Campos padrao:** id, name, account_status, currency, timezone_name, amount_spent, balance

### account-info
Informacoes detalhadas de uma conta especifica.
```bash
node aios-marketing/bin/meta-ads.mjs account-info act_123456789
```

### pages
Lista paginas do Facebook associadas a conta.
```bash
node aios-marketing/bin/meta-ads.mjs pages act_123456789
```
- **Quando:** Necessario para criar criativos (requer page_id)

---

## Campanhas

### campaigns
Lista campanhas com filtros opcionais.
```bash
node aios-marketing/bin/meta-ads.mjs campaigns act_123456789 [--status=ACTIVE|PAUSED|ARCHIVED] [--format=table]
```

### campaign-details
Detalhes completos de uma campanha.
```bash
node aios-marketing/bin/meta-ads.mjs campaign-details 123456789
```

### create-campaign
Cria nova campanha.
```bash
node aios-marketing/bin/meta-ads.mjs create-campaign \
  --account=act_123 \
  --name="SALES-ProdutoX-0220" \
  --objective=SALES \
  [--status=PAUSED] \
  [--daily-budget=5000] \
  [--lifetime-budget=150000] \
  [--bid-strategy=LOWEST_COST_WITHOUT_CAP] \
  [--special-ad-categories='[]']
```
- **Objetivos:** AWARENESS, TRAFFIC, ENGAGEMENT, LEADS, SALES, APP_PROMOTION
- **IMPORTANTE:** Budget em centavos. Sempre cria como PAUSED.

---

## Ad Sets

### adsets
Lista ad sets.
```bash
node aios-marketing/bin/meta-ads.mjs adsets 123456789 [--status=ACTIVE] [--format=table]
```
- Aceita campaign_id ou account_id

### adset-details
Detalhes de um ad set com targeting completo.
```bash
node aios-marketing/bin/meta-ads.mjs adset-details 123456789
```

### create-adset
Cria novo ad set com targeting e budget.
```bash
node aios-marketing/bin/meta-ads.mjs create-adset \
  --account=act_123 \
  --campaign=123456789 \
  --name="PROSP-Interesses-BR" \
  --daily-budget=5000 \
  --optimization-goal=OFFSITE_CONVERSIONS \
  --billing-event=IMPRESSIONS \
  --targeting='{"geo_locations":{"countries":["BR"]},"interests":[{"id":"123","name":"Fitness"}],"age_min":25,"age_max":45}' \
  [--bid-amount=500] \
  [--start-time=2026-03-01T00:00:00] \
  [--end-time=2026-03-31T23:59:59] \
  [--promoted-object='{"pixel_id":"123","custom_event_type":"PURCHASE"}']
```
- **Budget em centavos.** Minimo 3x CPA target.
- **optimization_goal:** LINK_CLICKS, OFFSITE_CONVERSIONS, IMPRESSIONS, REACH, LEAD_GENERATION, etc.

### update-adset
Atualiza ad set existente.
```bash
node aios-marketing/bin/meta-ads.mjs update-adset 123456789 \
  [--status=ACTIVE|PAUSED] \
  [--daily-budget=6000] \
  [--name="Novo Nome"] \
  [--targeting='...'] \
  [--bid-amount=600] \
  [--end-time=2026-04-30]
```
- **REGRA:** Max 20% de aumento de budget por dia

---

## Ads

### ads
Lista ads.
```bash
node aios-marketing/bin/meta-ads.mjs ads 123456789 [--status=ACTIVE] [--format=table]
```
- Aceita adset_id, campaign_id ou account_id

### ad-details
Detalhes de um ad com criativo vinculado.
```bash
node aios-marketing/bin/meta-ads.mjs ad-details 123456789
```

### create-ad
Cria novo ad vinculando criativo a ad set.
```bash
node aios-marketing/bin/meta-ads.mjs create-ad \
  --account=act_123 \
  --adset=123456789 \
  --name="IMG-Depoimento-v1" \
  --creative=987654321 \
  [--status=PAUSED]
```
- **Pre-req:** Ter creative_id de um criativo ja existente

### update-ad
Atualiza ad existente.
```bash
node aios-marketing/bin/meta-ads.mjs update-ad 123456789 \
  [--status=ACTIVE|PAUSED] \
  [--name="Novo Nome"] \
  [--creative=NEW_CREATIVE_ID]
```

---

## Criativos

### creatives
Lista criativos.
```bash
node aios-marketing/bin/meta-ads.mjs creatives act_123456789
```

### create-creative
Cria novo criativo com imagem e copy.
```bash
node aios-marketing/bin/meta-ads.mjs create-creative \
  --account=act_123 \
  --name="ProdutoX-IMG-PainPoint-v1" \
  --page=111222333 \
  --image-hash=abc123def456 \
  --link=https://site.com/lp \
  --message="Texto principal do anuncio" \
  --headline="Headline do anuncio" \
  [--description="Descricao adicional"] \
  [--cta=SHOP_NOW|LEARN_MORE|SIGN_UP|DOWNLOAD|CONTACT_US]
```
- Use `--image-url=https://...` como alternativa a `--image-hash`

### update-creative
Atualiza criativo existente.
```bash
node aios-marketing/bin/meta-ads.mjs update-creative 123456789 --name="Novo Nome"
```

### upload-image
Faz upload de imagem para uso em criativos.
```bash
# Via arquivo local
node aios-marketing/bin/meta-ads.mjs upload-image act_123 /path/to/image.jpg
# Via URL
node aios-marketing/bin/meta-ads.mjs upload-image act_123 --url=https://example.com/image.jpg
```
- **Retorna:** image_hash para usar em create-creative

---

## Insights & Performance

### insights
Metricas de performance em qualquer nivel.
```bash
node aios-marketing/bin/meta-ads.mjs insights 123456789 \
  [--level=campaign|adset|ad] \
  [--date-preset=today|yesterday|last_7d|last_14d|last_30d|last_90d|this_month|last_month] \
  [--since=2026-01-01 --until=2026-01-31] \
  [--breakdowns=age,gender,country,placement,device_platform] \
  [--fields=impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,purchase_roas] \
  [--time-increment=1] \
  [--format=table]
```
- Aceita campaign_id, adset_id, ad_id ou account_id
- `--time-increment=1` retorna dados dia a dia

---

## Targeting & Audiencia

### search-interests
Busca interesses para targeting.
```bash
node aios-marketing/bin/meta-ads.mjs search-interests "marketing digital" [--limit=25]
```
- Retorna: ID, nome, audience_size, path, topic

### interest-suggestions
Sugestoes de interesses relacionados.
```bash
node aios-marketing/bin/meta-ads.mjs interest-suggestions '["6003139266461","6003277229371"]'
```

### validate-interests
Valida se interesses sao validos e ativos.
```bash
node aios-marketing/bin/meta-ads.mjs validate-interests '["6003139266461"]'
```

### search-behaviors
Busca comportamentos para targeting.
```bash
node aios-marketing/bin/meta-ads.mjs search-behaviors "online shopping"
```

### search-demographics
Busca opcoes demograficas.
```bash
node aios-marketing/bin/meta-ads.mjs search-demographics "business owner"
```

### search-locations
Busca localizacoes para targeting geografico.
```bash
node aios-marketing/bin/meta-ads.mjs search-locations "Sao Paulo" [--type=country|region|city|zip|geo_market]
```

---

## Outros

### search
Busca cross-entity por nome.
```bash
node aios-marketing/bin/meta-ads.mjs search act_123 "produto x"
```

### budget-schedule
Define schedule de budget variavel.
```bash
node aios-marketing/bin/meta-ads.mjs budget-schedule 123456789 \
  --schedule='[{"start_time":"2026-03-01","end_time":"2026-03-07","budget_value":"5000"}]'
```
