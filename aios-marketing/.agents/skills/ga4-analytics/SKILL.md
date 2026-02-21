---
name: ga4-analytics
description: GA4 Analytics CLI for accessing Google Analytics Data API v1beta. Use when the user needs to analyze website traffic, check sessions, users, pageviews, bounce rate, acquisition sources, top pages, events, funnel data, real-time users, audience comparisons, or demographics. Triggers include "google analytics", "GA4", "analytics", "sessoes", "usuarios", "pageviews", "bounce rate", "aquisicao de trafego", "fontes de trafego", "paginas mais acessadas", "eventos", "funil", "tempo real", "audiencias", "demograficos", or any task requiring website analytics data.
allowed-tools: Bash(node *ga4-analytics.mjs:*)
---

# GA4 Analytics CLI - Google Analytics Data API

## Quando Usar Esta Skill

Use esta skill quando precisar acessar dados do Google Analytics 4. Isso inclui:

- Verificar metricas de trafego (sessoes, usuarios, pageviews, bounce rate)
- Analisar fontes de aquisicao de trafego (source/medium)
- Identificar paginas mais acessadas e performance de conteudo
- Monitorar eventos e conversoes
- Visualizar funis de conversao
- Verificar usuarios ativos em tempo real
- Comparar audiencias e demograficos

## Pre-Requisitos

1. Credenciais OAuth2 configuradas (compartilhadas com Google Ads)
2. GA4_PROPERTY_ID configurado
3. Node.js 18+ instalado
4. CLI: `aios-marketing/bin/ga4-analytics.mjs`

Setup rapido:
```bash
# Verificar acesso
node aios-marketing/bin/ga4-analytics.mjs auth

# Configurar Property ID
node aios-marketing/bin/ga4-analytics.mjs setup --property-id=properties/123456789
```

## CLI Syntax

```bash
node aios-marketing/bin/ga4-analytics.mjs <command> [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela (legivel)
- `--days=N` - Numero de dias para olhar (default: 7)
- `--since=YYYY-MM-DD` - Data inicio customizada
- `--until=YYYY-MM-DD` - Data fim customizada
- `--limit=N` - Limitar numero de resultados

## Workflow Padrao

### 1. Autenticacao (primeira vez)
```bash
node aios-marketing/bin/ga4-analytics.mjs auth
# Seguir instrucoes -> configurar credenciais e property ID
```

### 2. Visao Geral do Site
```bash
# Ultimos 7 dias
node aios-marketing/bin/ga4-analytics.mjs overview --format=table
# Ultimos 30 dias
node aios-marketing/bin/ga4-analytics.mjs overview --days=30 --format=table
# Periodo customizado
node aios-marketing/bin/ga4-analytics.mjs overview --since=2026-01-01 --until=2026-01-31
```

### 3. Fontes de Trafego
```bash
node aios-marketing/bin/ga4-analytics.mjs acquisition --days=30 --format=table
```

### 4. Paginas Mais Acessadas
```bash
node aios-marketing/bin/ga4-analytics.mjs pages --days=30 --limit=20 --format=table
```

### 5. Eventos e Conversoes
```bash
# Todos os eventos
node aios-marketing/bin/ga4-analytics.mjs events --days=30 --format=table
# Apenas conversoes
node aios-marketing/bin/ga4-analytics.mjs conversions --days=30 --format=table
```

### 6. Funil de Conversao
```bash
# Funil padrao (session_start -> page_view -> scroll -> click)
node aios-marketing/bin/ga4-analytics.mjs funnel --days=30
# Funil customizado
node aios-marketing/bin/ga4-analytics.mjs funnel --steps=session_start,add_to_cart,begin_checkout,purchase
```

### 7. Tempo Real
```bash
# Usuarios ativos agora
node aios-marketing/bin/ga4-analytics.mjs realtime --format=table
# Por device
node aios-marketing/bin/ga4-analytics.mjs realtime --by=device --format=table
# Por pagina
node aios-marketing/bin/ga4-analytics.mjs realtime --by=page --format=table
```

### 8. Audiencias e Demograficos
```bash
# Audiencias
node aios-marketing/bin/ga4-analytics.mjs audiences --days=30 --format=table
# Demograficos por pais
node aios-marketing/bin/ga4-analytics.mjs demographics --by=country --format=table
# Por device
node aios-marketing/bin/ga4-analytics.mjs demographics --by=device --format=table
# Por idade
node aios-marketing/bin/ga4-analytics.mjs demographics --by=age --format=table
```

## Padroes de Uso Comuns

### Relatorio Semanal de Performance
```bash
node aios-marketing/bin/ga4-analytics.mjs overview --days=7 --format=table
node aios-marketing/bin/ga4-analytics.mjs acquisition --days=7 --format=table
node aios-marketing/bin/ga4-analytics.mjs pages --days=7 --limit=10 --format=table
node aios-marketing/bin/ga4-analytics.mjs conversions --days=7 --format=table
```

### Analise de Campanha (apos lancamento)
```bash
# Verificar trafego de aquisicao
node aios-marketing/bin/ga4-analytics.mjs acquisition --days=7 --format=table
# Verificar paginas de destino
node aios-marketing/bin/ga4-analytics.mjs pages --days=7 --format=table
# Verificar conversoes
node aios-marketing/bin/ga4-analytics.mjs conversions --days=7 --format=table
```

### Monitoramento em Tempo Real (dia de lancamento)
```bash
node aios-marketing/bin/ga4-analytics.mjs realtime --format=table
node aios-marketing/bin/ga4-analytics.mjs realtime --by=page --format=table
```

## Regras

- Todas as operacoes sao READ-ONLY (nao modifica dados do GA4)
- Credenciais OAuth2 sao compartilhadas com Google Ads
- GA4_PROPERTY_ID e especifico (formato: properties/123456789)
- Dados podem ter ate 24-48h de atraso (exceto realtime)
- Bounce rate e retornado como decimal (0.55 = 55%)
- Session duration e em segundos

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
