---
name: meta-ads
description: Meta Ads CLI for managing Facebook and Instagram advertising campaigns via Graph API. Use when the user needs to manage Meta ad accounts, create campaigns, ad sets, ads, upload creatives, analyze performance metrics, search targeting interests, configure audiences, or optimize Meta Ads campaigns. Triggers include "meta ads", "facebook ads", "instagram ads", "criar campanha meta", "analisar performance meta", "publico meta", "interesses meta", "criativo meta", "insights meta", "budget meta", or any task requiring direct interaction with Meta's advertising platform API.
allowed-tools: Bash(node *meta-ads.mjs:*)
---

# Meta Ads CLI - Gestao de Campanhas via Graph API

## Quando Usar Esta Skill

Use esta skill quando precisar interagir DIRETAMENTE com a plataforma Meta Ads (Facebook/Instagram). Isso inclui:

- Consultar contas de anuncios e suas configuracoes
- Criar, editar e analisar campanhas, ad sets e ads
- Upload de imagens e criacao de criativos
- Buscar interesses, comportamentos e demograficos para targeting
- Extrair insights e metricas de performance
- Gerenciar budgets e schedules

## Pre-Requisitos

1. `META_ACCESS_TOKEN` configurado no ambiente
2. Node.js 18+ instalado
3. CLI: `aios-marketing/bin/meta-ads.mjs`

Setup rapido:
```bash
# Ver guia de setup completo
node aios-marketing/bin/meta-ads.mjs auth

# Apos obter o token
export META_ACCESS_TOKEN=your_long_lived_token
```

## CLI Syntax

```bash
node aios-marketing/bin/meta-ads.mjs <command> [args] [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela (legivel)
- `--fields=f1,f2,...` - Selecionar campos especificos
- `--limit=N` - Limitar numero de resultados

## Workflow Padrao

### 1. Autenticacao (primeira vez)
```bash
node aios-marketing/bin/meta-ads.mjs auth
# Seguir instrucoes → export META_ACCESS_TOKEN=...
```

### 2. Descoberta de Conta
```bash
node aios-marketing/bin/meta-ads.mjs accounts
node aios-marketing/bin/meta-ads.mjs account-info act_123456789
node aios-marketing/bin/meta-ads.mjs pages act_123456789
```

### 3. Operacoes de Campanha
```bash
# Listar
node aios-marketing/bin/meta-ads.mjs campaigns act_123456789 --status=ACTIVE
# Detalhes
node aios-marketing/bin/meta-ads.mjs campaign-details 123456789
# Criar
node aios-marketing/bin/meta-ads.mjs create-campaign --account=act_123 --name="SALES-ProdutoX-0220" --objective=SALES --status=PAUSED
# Insights
node aios-marketing/bin/meta-ads.mjs insights 123456789 --date-preset=last_7d --level=campaign
```

### 4. Operacoes de Ad Set
```bash
# Listar
node aios-marketing/bin/meta-ads.mjs adsets 123456789
# Criar
node aios-marketing/bin/meta-ads.mjs create-adset --account=act_123 --campaign=123 --name="PROSP-Interesses-BR" --daily-budget=5000 --optimization-goal=OFFSITE_CONVERSIONS --billing-event=IMPRESSIONS --targeting='{"geo_locations":{"countries":["BR"]},"age_min":25,"age_max":55}'
# Atualizar
node aios-marketing/bin/meta-ads.mjs update-adset 123456789 --daily-budget=6000
node aios-marketing/bin/meta-ads.mjs update-adset 123456789 --status=PAUSED
```

### 5. Operacoes de Ad
```bash
# Listar
node aios-marketing/bin/meta-ads.mjs ads 123456789
# Criar
node aios-marketing/bin/meta-ads.mjs create-ad --account=act_123 --adset=123 --name="IMG-Depoimento-v1" --creative=456
# Atualizar
node aios-marketing/bin/meta-ads.mjs update-ad 123456789 --status=PAUSED
```

### 6. Criativos
```bash
# Upload imagem
node aios-marketing/bin/meta-ads.mjs upload-image act_123 /path/to/image.jpg
node aios-marketing/bin/meta-ads.mjs upload-image act_123 --url=https://example.com/image.jpg
# Criar criativo
node aios-marketing/bin/meta-ads.mjs create-creative --account=act_123 --name="ProdutoX-IMG-v1" --page=111 --image-hash=abc123 --link=https://site.com --message="Texto do anuncio" --headline="Headline" --cta=SHOP_NOW
# Listar
node aios-marketing/bin/meta-ads.mjs creatives act_123456789
```

### 7. Targeting & Audiencia
```bash
# Interesses
node aios-marketing/bin/meta-ads.mjs search-interests "marketing digital"
node aios-marketing/bin/meta-ads.mjs interest-suggestions '["6003139266461"]'
node aios-marketing/bin/meta-ads.mjs validate-interests '["6003139266461"]'
# Comportamentos
node aios-marketing/bin/meta-ads.mjs search-behaviors "online shopping"
# Demograficos
node aios-marketing/bin/meta-ads.mjs search-demographics "business owner"
# Localizacao
node aios-marketing/bin/meta-ads.mjs search-locations "Sao Paulo" --type=city
```

### 8. Insights & Performance
```bash
# Por campanha
node aios-marketing/bin/meta-ads.mjs insights 123456789 --date-preset=last_7d
# Por ad set com breakdowns
node aios-marketing/bin/meta-ads.mjs insights 123456789 --date-preset=last_30d --breakdowns=age,gender
# Periodo customizado
node aios-marketing/bin/meta-ads.mjs insights 123456789 --since=2026-01-01 --until=2026-01-31
# Por ad
node aios-marketing/bin/meta-ads.mjs insights 123456789 --level=ad --date-preset=yesterday
```

## Padroes de Uso Comuns

### Auditoria de Conta
```bash
node aios-marketing/bin/meta-ads.mjs accounts --format=table
node aios-marketing/bin/meta-ads.mjs campaigns act_123 --format=table
node aios-marketing/bin/meta-ads.mjs insights act_123 --date-preset=last_30d --level=campaign --format=table
```

### Criar Campanha Completa
```bash
# 1. Verificar paginas
node aios-marketing/bin/meta-ads.mjs pages act_123
# 2. Pesquisar interesses
node aios-marketing/bin/meta-ads.mjs search-interests "fitness"
# 3. Buscar localizacoes
node aios-marketing/bin/meta-ads.mjs search-locations "Brasil" --type=country
# 4. Criar campanha (PAUSED por seguranca)
node aios-marketing/bin/meta-ads.mjs create-campaign --account=act_123 --name="SALES-ProdutoX" --objective=SALES
# 5. Criar ad set com targeting
node aios-marketing/bin/meta-ads.mjs create-adset --account=act_123 --campaign=CAMPAIGN_ID --name="PROSP-Fitness-BR" --daily-budget=5000 --optimization-goal=OFFSITE_CONVERSIONS --billing-event=IMPRESSIONS --targeting='{"geo_locations":{"countries":["BR"]},"interests":[{"id":"123","name":"Fitness"}],"age_min":25,"age_max":45}'
# 6. Upload imagem
node aios-marketing/bin/meta-ads.mjs upload-image act_123 /path/to/creative.jpg
# 7. Criar criativo
node aios-marketing/bin/meta-ads.mjs create-creative --account=act_123 --name="ProdutoX-IMG-v1" --page=PAGE_ID --image-hash=HASH --link=https://site.com/lp --message="Copy do anuncio" --headline="Headline" --cta=SHOP_NOW
# 8. Criar ad
node aios-marketing/bin/meta-ads.mjs create-ad --account=act_123 --adset=ADSET_ID --name="IMG-v1" --creative=CREATIVE_ID
```

### Otimizacao Diaria
```bash
# Metricas de ontem por ad set
node aios-marketing/bin/meta-ads.mjs insights act_123 --date-preset=yesterday --level=adset --format=table
# Pausar ad com CTR baixo
node aios-marketing/bin/meta-ads.mjs update-ad AD_ID --status=PAUSED
# Ajustar budget (max 20%/dia)
node aios-marketing/bin/meta-ads.mjs update-adset ADSET_ID --daily-budget=6000
```

### Analise de Publico
```bash
node aios-marketing/bin/meta-ads.mjs search-interests "yoga"
node aios-marketing/bin/meta-ads.mjs interest-suggestions '["6003384513438"]'
node aios-marketing/bin/meta-ads.mjs search-behaviors "engaged shoppers"
node aios-marketing/bin/meta-ads.mjs search-locations "Rio de Janeiro" --type=city
```

## Objetivos de Campanha Validos (Meta)

| Objetivo | Uso | Metricas Chave |
|----------|-----|----------------|
| AWARENESS | Brand awareness, alcance | CPM, Reach, Frequency |
| TRAFFIC | Enviar trafego para site/LP | CPC, CTR, Sessions |
| ENGAGEMENT | Engajamento com posts/pagina | CPE, Engagement Rate |
| LEADS | Geracao de leads (formularios) | CPL, Lead Volume, SQL Rate |
| SALES | Conversoes e vendas | ROAS, CPA, CR, AOV |
| APP_PROMOTION | Instalacoes de app | CPI, ROAS |

## Regras de Seguranca

- NUNCA criar campanhas sem confirmacao explicita do usuario
- SEMPRE mostrar preview do que sera criado antes de executar
- NUNCA alterar budgets acima de 20% sem aprovacao
- SEMPRE validar interesses antes de usar em targeting
- Precos sao em centavos (ex: R$ 50/dia = 5000 centavos)
- Campanhas SEMPRE criadas como PAUSED (usuario ativa manualmente)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/campaign-patterns.md` - Padroes de campanha por objetivo
