---
name: google-ads
description: Google Ads CLI for managing Search, Display, Shopping, Video and Performance Max campaigns via REST API. Use when the user needs to manage Google Ads accounts, create campaigns, ad groups, ads, manage keywords, analyze performance metrics, search targeting locations, configure audiences, or optimize Google Ads campaigns. Triggers include "google ads", "criar campanha google", "analisar performance google", "keywords google", "search ads", "display ads", "shopping ads", "performance max", "youtube ads", or any task requiring direct interaction with Google's advertising platform API.
allowed-tools: Bash(node *google-ads.mjs:*)
---

# Google Ads CLI - Gestao de Campanhas via REST API

## Quando Usar Esta Skill

Use esta skill quando precisar interagir DIRETAMENTE com a plataforma Google Ads. Isso inclui:

- Consultar contas de anuncios e suas configuracoes
- Criar, editar e analisar campanhas, ad groups e ads
- Gerenciar keywords (adicionar, pausar, remover)
- Extrair insights e metricas de performance via GAQL
- Buscar localizacoes geograficas para targeting
- Consultar termos de busca (search terms report)
- Executar queries GAQL customizadas

## Pre-Requisitos

1. Credenciais configuradas no ambiente (ver abaixo)
2. Node.js 18+ instalado
3. CLI: `aios-marketing/bin/google-ads.mjs`

Setup rapido:
```bash
# Ver guia de setup completo
node aios-marketing/bin/google-ads.mjs auth

# Apos obter as credenciais
node aios-marketing/bin/google-ads.mjs setup \
  --developer-token=XXXXX \
  --client-id=XXXXX.apps.googleusercontent.com \
  --client-secret=XXXXX \
  --refresh-token=XXXXX \
  --customer-id=1234567890
```

## CLI Syntax

```bash
node aios-marketing/bin/google-ads.mjs <command> [args] [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela (legivel)
- `--limit=N` - Limitar numero de resultados
- `--customer=<id>` - Override do customer ID padrao

**IMPORTANTE:** Valores monetarios em MICROS (1 BRL = 1.000.000 micros). Ex: R$ 50/dia = 50000000

## Workflow Padrao

### 1. Autenticacao (primeira vez)
```bash
node aios-marketing/bin/google-ads.mjs auth
# Seguir instrucoes → configurar credenciais
```

### 2. Descoberta de Conta
```bash
node aios-marketing/bin/google-ads.mjs accounts
node aios-marketing/bin/google-ads.mjs account-info 1234567890
```

### 3. Operacoes de Campanha
```bash
# Listar
node aios-marketing/bin/google-ads.mjs campaigns 1234567890 --status=ENABLED
# Detalhes
node aios-marketing/bin/google-ads.mjs campaign-details 123456 --customer=1234567890
# Criar (cria budget + campanha automaticamente)
node aios-marketing/bin/google-ads.mjs create-campaign --customer=1234567890 --name="SEARCH-ProdutoX-0220" --type=SEARCH --budget-micros=50000000 --status=PAUSED
# Insights
node aios-marketing/bin/google-ads.mjs insights 123456 --level=campaign --date-range=LAST_7_DAYS
```

### 4. Operacoes de Ad Group
```bash
# Listar
node aios-marketing/bin/google-ads.mjs adgroups 123456 --customer=1234567890
# Criar
node aios-marketing/bin/google-ads.mjs create-adgroup --customer=1234567890 --campaign=123456 --name="Grupo-Keywords-Produto" --cpc-bid-micros=2000000
# Atualizar
node aios-marketing/bin/google-ads.mjs update-adgroup 789012 --customer=1234567890 --status=PAUSED
```

### 5. Operacoes de Ad (Responsive Search Ad)
```bash
# Listar
node aios-marketing/bin/google-ads.mjs ads 789012 --customer=1234567890
# Criar RSA (separar headlines e descriptions com |)
node aios-marketing/bin/google-ads.mjs create-ad --customer=1234567890 --adgroup=789012 --headlines="Compre ProdutoX|Oferta Especial|Frete Gratis" --descriptions="Aproveite desconto exclusivo|Entrega rapida para todo Brasil" --final-url=https://site.com/produto
# Pausar
node aios-marketing/bin/google-ads.mjs update-ad 345678 --customer=1234567890 --adgroup=789012 --status=PAUSED
```

### 6. Gerenciamento de Keywords
```bash
# Listar com metricas
node aios-marketing/bin/google-ads.mjs keywords 789012 --customer=1234567890
# Adicionar keywords (separar com virgula)
node aios-marketing/bin/google-ads.mjs add-keywords --customer=1234567890 --adgroup=789012 --keywords="produto x,comprar produto x,produto x preco" --match-type=PHRASE
# Remover keyword
node aios-marketing/bin/google-ads.mjs remove-keyword 456789 --adgroup=789012 --customer=1234567890
# Performance de keywords
node aios-marketing/bin/google-ads.mjs keyword-performance 789012 --customer=1234567890
# Termos de busca
node aios-marketing/bin/google-ads.mjs search-terms 123456 --customer=1234567890
```

### 7. Insights & Performance
```bash
# Por campanha
node aios-marketing/bin/google-ads.mjs insights 123456 --date-range=LAST_7_DAYS
# Por ad group
node aios-marketing/bin/google-ads.mjs insights 123456 --level=adgroup --date-range=LAST_30_DAYS
# Periodo customizado
node aios-marketing/bin/google-ads.mjs insights 123456 --since=2026-01-01 --until=2026-01-31
# Por ad
node aios-marketing/bin/google-ads.mjs insights 123456 --level=ad --date-range=LAST_7_DAYS
```

### 8. GAQL Direto (Avancado)
```bash
# Executar qualquer query GAQL
node aios-marketing/bin/google-ads.mjs query 1234567890 "SELECT campaign.name, metrics.clicks FROM campaign WHERE campaign.status = 'ENABLED' LIMIT 10"
```

## Padroes de Uso Comuns

### Auditoria de Conta
```bash
node aios-marketing/bin/google-ads.mjs accounts --format=table
node aios-marketing/bin/google-ads.mjs campaigns 1234567890 --format=table
node aios-marketing/bin/google-ads.mjs insights 1234567890 --date-range=LAST_30_DAYS --level=campaign --format=table
```

### Criar Campanha Search Completa
```bash
# 1. Criar campanha (com budget automatico)
node aios-marketing/bin/google-ads.mjs create-campaign --customer=1234567890 --name="SEARCH-ProdutoX" --type=SEARCH --budget-micros=50000000 --bid-strategy=MANUAL_CPC
# 2. Criar ad group
node aios-marketing/bin/google-ads.mjs create-adgroup --customer=1234567890 --campaign=CAMPAIGN_ID --name="AG-ProdutoX-Exato" --cpc-bid-micros=2000000
# 3. Adicionar keywords
node aios-marketing/bin/google-ads.mjs add-keywords --customer=1234567890 --adgroup=ADGROUP_ID --keywords="produto x,comprar produto x" --match-type=EXACT
# 4. Criar RSA
node aios-marketing/bin/google-ads.mjs create-ad --customer=1234567890 --adgroup=ADGROUP_ID --headlines="Compre ProdutoX|Oferta Especial Hoje|Frete Gratis Brasil" --descriptions="Aproveite desconto exclusivo de lancamento|Entrega rapida. Satisfacao garantida" --final-url=https://site.com/produto --path1=produto --path2=oferta
```

### Otimizacao Diaria
```bash
# Metricas por ad group
node aios-marketing/bin/google-ads.mjs insights 1234567890 --level=adgroup --date-range=LAST_7_DAYS --format=table
# Keywords com quality score
node aios-marketing/bin/google-ads.mjs keyword-performance ADGROUP_ID --customer=1234567890
# Termos de busca (negativar irrelevantes)
node aios-marketing/bin/google-ads.mjs search-terms CAMPAIGN_ID --customer=1234567890
# Pausar ad com CTR baixo
node aios-marketing/bin/google-ads.mjs update-ad AD_ID --customer=1234567890 --adgroup=ADGROUP_ID --status=PAUSED
```

## Tipos de Campanha Validos (Google Ads)

| Tipo | Uso | Metricas Chave |
|------|-----|----------------|
| SEARCH | Anuncios na busca Google | CPC, CTR, Quality Score, CPA |
| DISPLAY | Anuncios em sites parceiros (GDN) | CPM, Reach, Viewability, CPA |
| SHOPPING | Anuncios de produtos (e-commerce) | ROAS, CPC, Conversion Rate |
| VIDEO | Anuncios no YouTube | CPV, View Rate, CPA |
| PERFORMANCE_MAX | Campanha automatizada multi-canal | CPA, ROAS, Conversions |

## Estrategias de Lance Validas

| Estrategia | Quando Usar |
|------------|-------------|
| MANUAL_CPC | Controle total, contas novas |
| MAXIMIZE_CONVERSIONS | Foco em volume de conversoes |
| MAXIMIZE_CONVERSION_VALUE | Foco em ROAS |
| TARGET_CPA | CPA target definido |
| TARGET_ROAS | ROAS target definido |

## Regras de Seguranca

- NUNCA criar campanhas sem confirmacao explicita do usuario
- SEMPRE mostrar preview do que sera criado antes de executar
- NUNCA alterar budgets acima de 20% sem aprovacao
- Valores em MICROS (R$ 50/dia = 50.000.000 micros)
- Campanhas SEMPRE criadas como PAUSED (usuario ativa manualmente)
- VALIDAR keywords antes de adicionar (relevancia e match type)
- MONITORAR Quality Score (abaixo de 5 = acao necessaria)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/campaign-patterns.md` - Padroes de campanha por tipo
