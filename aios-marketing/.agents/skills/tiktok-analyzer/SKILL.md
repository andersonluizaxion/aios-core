---
name: tiktok-analyzer
description: TikTok Analyzer CLI for social intelligence via TikTok Business API. Use when analyzing TikTok advertiser performance, top videos, audience demographics, trending hashtags/sounds, or ad posting frequency. Triggers include "analisar tiktok", "top videos tiktok", "audience tiktok", "trending tiktok", "performance tiktok", or any task requiring TikTok account analysis.
allowed-tools: Bash(node *tiktok-analyzer.mjs:*)
---

# TikTok Analyzer CLI - Inteligencia Social via Business API

## Quando Usar Esta Skill

Use esta skill quando precisar analisar contas de anunciantes no TikTok via Business API.

**TikTok Business API (contas de anunciante):**
- Metricas de ads: impressions, clicks, CTR, video views, engagement
- Audience demographics: age, gender, geography
- Trending content: hashtags e sounds por nicho
- Analise de cadencia de ads por dia da semana
- Use `--advertiser=ID` para selecionar qual conta analisar

## Pre-Requisitos

1. `TIKTOK_ACCESS_TOKEN` - Token do TikTok Business Center
   - Obter em: https://business-api.tiktok.com/
2. `TIKTOK_ADVERTISER_ID` - ID do anunciante (opcional, pode usar --advertiser)

Setup rapido:
```bash
# Verificar acesso
node aios-marketing/bin/tiktok-analyzer.mjs auth

# Listar contas de anunciante
node aios-marketing/bin/tiktok-analyzer.mjs accounts

# Salvar credenciais
node aios-marketing/bin/tiktok-analyzer.mjs setup --token=YOUR_TOKEN --advertiser=YOUR_ID
```

## Selecao de Conta

O CLI acessa contas de anunciante do TikTok Business. Resolucao:

1. **`--advertiser=ID`** - Flag explicita em qualquer comando (maior prioridade)
2. **TIKTOK_ADVERTISER_ID** - Variavel de ambiente como fallback
3. **Erro com instrucoes** - Se nao especificado, mostra como descobrir

```bash
# Analisar conta especifica
node aios-marketing/bin/tiktok-analyzer.mjs account --advertiser=123456789

# Top videos por engajamento
node aios-marketing/bin/tiktok-analyzer.mjs top-videos --advertiser=123456789 --sort=clicks

# Trending no nicho
node aios-marketing/bin/tiktok-analyzer.mjs trending --keyword=fitness --country=BR
```

## CLI Syntax

```bash
node aios-marketing/bin/tiktok-analyzer.mjs <command> [args] [--flags]
```

Flags globais:
- `--advertiser=<id>` - Selecionar qual conta de anunciante usar
- `--format=table` - Output formatado em tabela
- `--limit=N` - Limitar numero de resultados
- `--days=N` - Periodo de analise em dias (default 30)
- `--sort=<field>` - Campo para ordenacao em top-videos

## Workflow Padrao

### 1. Setup (uma vez)
```bash
node aios-marketing/bin/tiktok-analyzer.mjs auth
node aios-marketing/bin/tiktok-analyzer.mjs setup --token=YOUR_TOKEN --advertiser=YOUR_ID
```

### 2. Analise de Conta
```bash
# Visao geral
node aios-marketing/bin/tiktok-analyzer.mjs account --advertiser=ID
# Top videos
node aios-marketing/bin/tiktok-analyzer.mjs top-videos --advertiser=ID --limit=20 --format=table
# Insights de video especifico
node aios-marketing/bin/tiktok-analyzer.mjs video-insights AD_ID --advertiser=ID
# Audience
node aios-marketing/bin/tiktok-analyzer.mjs audience --advertiser=ID
# Frequencia
node aios-marketing/bin/tiktok-analyzer.mjs posting-frequency --advertiser=ID --days=60
```

### 3. Trending
```bash
# Hashtags e sons em alta no nicho
node aios-marketing/bin/tiktok-analyzer.mjs trending --keyword=estetica --country=BR
```

## Padroes de Uso Comuns

### Auditoria de Conta TikTok Ads
```bash
node aios-marketing/bin/tiktok-analyzer.mjs account --advertiser=ID
node aios-marketing/bin/tiktok-analyzer.mjs top-videos --advertiser=ID --limit=10 --format=table
node aios-marketing/bin/tiktok-analyzer.mjs audience --advertiser=ID
node aios-marketing/bin/tiktok-analyzer.mjs posting-frequency --advertiser=ID --days=60
```

### Pesquisa de Trending
```bash
node aios-marketing/bin/tiktok-analyzer.mjs trending --keyword=cirurgia+plastica --country=BR
```

## Regras de Seguranca

- Todas as operacoes sao READ-ONLY - este CLI nao cria nem modifica anuncios
- NUNCA expor access tokens em outputs ou logs
- Rate limits: respeitar limites da TikTok Business API
- Dados de audience sao agregados (nao individuais)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
