---
name: campaign-monitor
description: Campaign Monitor CLI for cross-platform campaign health monitoring across Meta Ads and Google Ads. Use when the user needs to check campaign health, view alerts, get an executive summary, or monitor performance across multiple ad platforms simultaneously. Triggers include "campaign health", "campaign monitor", "campaign alerts", "campaign summary", "cross-platform performance", "monitorar campanhas", "saude das campanhas", "alertas de campanha", "resumo executivo", "performance geral", or any task requiring aggregated monitoring of campaigns across Meta and Google platforms.
allowed-tools: Bash(node *campaign-monitor.mjs:*)
---

# Campaign Monitor CLI - Monitoramento Cross-Platform de Campanhas

## Quando Usar Esta Skill

Use esta skill quando precisar monitorar campanhas de forma AGREGADA entre plataformas. Isso inclui:

- Verificar a saude de todas as campanhas ativas (Meta + Google)
- Identificar alertas e problemas que precisam de atencao
- Gerar resumo executivo com metricas consolidadas
- Verificar regras de monitoramento configuradas
- Comparar performance entre plataformas

**NAO use esta skill para:**
- Criar ou editar campanhas (use `meta-ads` ou `google-ads`)
- Analise detalhada de uma unica campanha (use insights dos CLIs especificos)
- Configuracao de targeting ou criativos (use CLIs especificos)

## Pre-Requisitos

1. **Meta Ads:** `META_ACCESS_TOKEN` configurado (mesmo token do meta-ads.mjs)
2. **Google Ads:** `GOOGLE_ADS_*` credenciais configuradas (mesmas do google-ads.mjs)
3. Node.js 18+ instalado
4. CLI: `aios-marketing/bin/campaign-monitor.mjs`

O Campaign Monitor reutiliza as credenciais dos CLIs especificos. Se meta-ads.mjs e google-ads.mjs ja estao configurados, o monitor funciona automaticamente.

Verificar configuracao:
```bash
node aios-marketing/bin/campaign-monitor.mjs auth
```

## CLI Syntax

```bash
node aios-marketing/bin/campaign-monitor.mjs <command> [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela com cores (recomendado)
- `--date-preset=<preset>` - Periodo: last_7d (padrao), last_30d, yesterday, today, last_90d

## Workflow Padrao

### 1. Verificar Credenciais
```bash
node aios-marketing/bin/campaign-monitor.mjs auth
```

### 2. Health Check Rapido
```bash
# Visao geral de todas as campanhas ativas
node aios-marketing/bin/campaign-monitor.mjs health --format=table

# Com periodo customizado
node aios-marketing/bin/campaign-monitor.mjs health --format=table --date-preset=last_30d
```

### 3. Verificar Alertas
```bash
# Ver campanhas com problemas
node aios-marketing/bin/campaign-monitor.mjs alerts --format=table
```

### 4. Resumo Executivo
```bash
# Visao consolidada com top/bottom campaigns
node aios-marketing/bin/campaign-monitor.mjs summary --format=table
```

### 5. Consultar Regras
```bash
# Ver regras de alerta configuradas
node aios-marketing/bin/campaign-monitor.mjs rules --format=table
```

## Padroes de Uso Comuns

### Monitoramento Diario (Morning Check)
```bash
# 1. Check rapido de saude
node aios-marketing/bin/campaign-monitor.mjs health --format=table

# 2. Verificar se ha alertas criticos
node aios-marketing/bin/campaign-monitor.mjs alerts --format=table

# 3. Se ha problemas, investigar no CLI especifico
node aios-marketing/bin/meta-ads.mjs insights act_123 --date-preset=yesterday --level=adset --format=table
node aios-marketing/bin/google-ads.mjs insights 1234567890 --date-range=LAST_7_DAYS --level=campaign --format=table
```

### Report Semanal
```bash
# Resumo executivo da semana
node aios-marketing/bin/campaign-monitor.mjs summary --format=table --date-preset=last_7d

# Historico de alertas
node aios-marketing/bin/campaign-monitor.mjs alerts --format=table --date-preset=last_7d
```

### Report Mensal
```bash
# Resumo executivo do mes
node aios-marketing/bin/campaign-monitor.mjs summary --format=table --date-preset=last_30d
```

## Regras de Alerta

O monitor verifica automaticamente estas regras para cada campanha ativa:

| Regra | Metrica | Condicao | Severidade | Acao |
|-------|---------|----------|------------|------|
| high_cpa | CPA | > 2x target | CRITICAL | Revisar targeting e criativos |
| ctr_drop | CTR trend | < -30% | WARNING | Refresh criativos, testar novo copy |
| creative_fatigue | Frequency | > 4 | WARNING | Rotacionar criativos, expandir publico |
| underspend | % do budget | < 50% | WARNING | Ajustar bids, expandir targeting |
| zero_conversions | Conversions | == 0 por 2d+ | CRITICAL | Verificar pixel/tracking e LP |
| low_roas | ROAS | < 1.0 por 5d+ | CRITICAL | Pausar e reestruturar |

## Status de Saude

Cada campanha recebe um status baseado nos alertas ativos:

- **HEALTHY** - Nenhum alerta ativo
- **WARNING** - Pelo menos um alerta WARNING ativo
- **CRITICAL** - Pelo menos um alerta CRITICAL ativo

## Integracoes

Este CLI agrega dados de:
- **meta-ads.mjs** - Meta Graph API (Facebook/Instagram Ads)
- **google-ads.mjs** - Google Ads REST API (Search, Display, Shopping, Video, PMax)

Credenciais sao compartilhadas. Configure uma vez, use em todos os CLIs.

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/alert-rules.md` - Documentacao completa das regras de alerta
