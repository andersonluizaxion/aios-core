# Campaign Monitor CLI - Referencia Completa de Comandos

## Visao Geral

O Campaign Monitor agrega dados de Meta Ads e Google Ads em uma visao unificada para monitoramento de saude de campanhas. Ele reutiliza credenciais dos CLIs meta-ads.mjs e google-ads.mjs.

## Convencoes

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Monetario | BRL (Real) | R$ 150.00 |
| Percentual | Com sufixo % | 2.35% |
| ROAS | Multiplicador | 3.50 (= 3.5x retorno) |
| Periodo | Preset string | last_7d, last_30d, yesterday |

---

## Auth

### auth
Verificar se as credenciais Meta e Google estao configuradas.
```bash
node campaign-monitor.mjs auth
```

Output mostra status de cada plataforma:
- META_ACCESS_TOKEN: SET/NOT SET
- GOOGLE_ADS_DEVELOPER_TOKEN: SET/NOT SET
- GOOGLE_ADS_CLIENT_ID: SET/NOT SET
- GOOGLE_ADS_CLIENT_SECRET: SET/NOT SET
- GOOGLE_ADS_REFRESH_TOKEN: SET/NOT SET
- GOOGLE_ADS_CUSTOMER_ID: SET/NOT SET

**Nota:** Este CLI nao possui comando `setup` proprio. Configure as credenciais via meta-ads.mjs e google-ads.mjs:
```bash
node meta-ads.mjs setup --token=YOUR_TOKEN
node google-ads.mjs setup --developer-token=X --client-id=X --client-secret=X --refresh-token=X --customer-id=X
```

---

## Monitoring

### health
Health check rapido de todas as campanhas ativas em ambas as plataformas.
```bash
node campaign-monitor.mjs health [--format=table] [--date-preset=last_7d]
```

**Output (table):**

| Coluna | Descricao |
|--------|-----------|
| Campaign | Nome da campanha |
| Platform | Meta ou Google |
| Status | ACTIVE, ENABLED, etc. |
| Spend | Gasto total no periodo (BRL) |
| CPA | Custo por aquisicao (BRL) |
| ROAS | Retorno sobre gasto em ads |
| CTR | Click-through rate (%) |
| Freq | Frequencia (Meta only) |
| Conv | Numero de conversoes |
| Health | HEALTHY / WARNING / CRITICAL |

**Output (JSON):**
```json
{
  "campaigns": [...],
  "total": 12,
  "healthy": 8,
  "warning": 3,
  "critical": 1
}
```

**Exemplos:**
```bash
# Health check padrao (ultimos 7 dias)
node campaign-monitor.mjs health --format=table

# Ultimos 30 dias
node campaign-monitor.mjs health --format=table --date-preset=last_30d

# Output JSON para integracao
node campaign-monitor.mjs health
```

---

### alerts
Mostrar campanhas que dispararam regras de alerta.
```bash
node campaign-monitor.mjs alerts [--format=table] [--date-preset=last_7d]
```

**Output (table):**

| Coluna | Descricao |
|--------|-----------|
| Campaign | Nome da campanha |
| Platform | Meta ou Google |
| Alert | Nome da regra disparada |
| Severity | CRITICAL ou WARNING |
| Value | Valor atual da metrica |
| Threshold | Limiar configurado |

Apos a tabela, mostra acoes recomendadas para cada tipo de alerta.

**Output (JSON):**
```json
{
  "alerts": [...],
  "total": 5,
  "critical": 2,
  "warning": 3
}
```

**Exemplos:**
```bash
# Ver todos os alertas ativos
node campaign-monitor.mjs alerts --format=table

# Alertas dos ultimos 30 dias
node campaign-monitor.mjs alerts --format=table --date-preset=last_30d

# Output JSON
node campaign-monitor.mjs alerts
```

---

### summary
Resumo executivo de todas as plataformas com metricas consolidadas.
```bash
node campaign-monitor.mjs summary [--format=table] [--date-preset=last_7d]
```

**Output (table) inclui:**
1. **Overall Metrics** - Total spend, conversions, blended CPA, blended ROAS, blended CTR
2. **Platform Breakdown** - Metricas por plataforma (Meta vs Google)
3. **Health Distribution** - Contagem de HEALTHY / WARNING / CRITICAL
4. **Top 3 by Spend** - Campanhas com maior investimento
5. **Bottom 3 by Spend** - Campanhas com menor investimento

**Output (JSON):**
```json
{
  "period": "last_7d",
  "overall": {
    "total_spend": "5432.10",
    "total_conversions": 156,
    "blended_cpa": "34.82",
    "blended_roas": "3.21",
    "blended_ctr": "2.15",
    "active_campaigns": 12
  },
  "platforms": {
    "Meta": { "campaigns": 7, "spend": "3200.00", ... },
    "Google": { "campaigns": 5, "spend": "2232.10", ... }
  },
  "health": { "healthy": 8, "warning": 3, "critical": 1 },
  "top_3": [...],
  "bottom_3": [...]
}
```

**Exemplos:**
```bash
# Resumo semanal
node campaign-monitor.mjs summary --format=table

# Resumo mensal
node campaign-monitor.mjs summary --format=table --date-preset=last_30d

# Output JSON para relatorio
node campaign-monitor.mjs summary
```

---

### rules
Listar regras de monitoramento e seus limiares.
```bash
node campaign-monitor.mjs rules [--format=table]
```

**Output (table):**

| Coluna | Descricao |
|--------|-----------|
| Rule | Nome da regra |
| Metric | Metrica monitorada |
| Condition | Operador de comparacao |
| Threshold | Valor limiar |
| Severity | CRITICAL ou WARNING |
| Min Days | Dias minimos para disparar |

Apos a tabela, mostra descricao detalhada e acao recomendada para cada regra.

**Exemplos:**
```bash
# Ver todas as regras em tabela
node campaign-monitor.mjs rules --format=table

# Output JSON
node campaign-monitor.mjs rules
```

---

## Flags Globais

| Flag | Descricao | Valores |
|------|-----------|---------|
| `--format=table` | Saida formatada em tabela com cores | table (padrao: JSON) |
| `--date-preset=<preset>` | Periodo de analise | last_7d (padrao), last_30d, yesterday, today, last_90d |

---

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao | Origem |
|----------|-------------|-----------|--------|
| META_ACCESS_TOKEN | Para Meta | Token da Graph API | meta-ads.mjs setup |
| GOOGLE_ADS_DEVELOPER_TOKEN | Para Google | Developer token | google-ads.mjs setup |
| GOOGLE_ADS_CLIENT_ID | Para Google | OAuth2 Client ID | google-ads.mjs setup |
| GOOGLE_ADS_CLIENT_SECRET | Para Google | OAuth2 Client Secret | google-ads.mjs setup |
| GOOGLE_ADS_REFRESH_TOKEN | Para Google | OAuth2 Refresh Token | google-ads.mjs setup |
| GOOGLE_ADS_CUSTOMER_ID | Para Google | Customer ID (sem hifens) | google-ads.mjs setup |
| GOOGLE_ADS_LOGIN_CUSTOMER_ID | Opcional | MCC Manager ID | google-ads.mjs setup |

**Prioridade de carregamento:**
1. Variaveis de ambiente do shell (maior prioridade)
2. `.env` no diretorio atual
3. `.env` no diretorio aios-marketing/
4. `~/.config/campaign-monitor/.env`
5. `~/.config/meta-ads/.env` (fallback para vars Meta)
6. `~/.config/google-ads/.env` (fallback para vars Google)

---

## Codigos de Saida

| Codigo | Significado |
|--------|-------------|
| 0 | Sucesso |
| 1 | Erro (credenciais, API, comando invalido) |

---

## Exemplos de Workflow Completo

### Morning Check (Diario)
```bash
# 1. Verificar saude geral
node campaign-monitor.mjs health --format=table

# 2. Se ha CRITICAL, ver alertas detalhados
node campaign-monitor.mjs alerts --format=table

# 3. Investigar campanha especifica no CLI da plataforma
node meta-ads.mjs insights CAMPAIGN_ID --date-preset=yesterday
node google-ads.mjs insights CAMPAIGN_ID --date-range=LAST_7_DAYS
```

### Weekly Report
```bash
# 1. Resumo executivo
node campaign-monitor.mjs summary --format=table --date-preset=last_7d

# 2. Alertas da semana
node campaign-monitor.mjs alerts --format=table --date-preset=last_7d
```

### Monthly Report
```bash
# Resumo consolidado do mes
node campaign-monitor.mjs summary --format=table --date-preset=last_30d
```
