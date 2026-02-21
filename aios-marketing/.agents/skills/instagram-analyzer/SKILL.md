---
name: instagram-analyzer
description: Instagram Analyzer CLI for social intelligence via Instagram Graph API. Use when analyzing Instagram performance, benchmarking competitors, identifying top posts, analyzing posting frequency, hashtag performance, content format mix, or comparing connected accounts. All accounts must be connected via Meta Business Manager. Triggers include "analisar instagram", "benchmark concorrente", "top posts instagram", "frequencia de postagem", "hashtags instagram", "performance instagram", or any task requiring Instagram account analysis.
allowed-tools: Bash(node *instagram-analyzer.mjs:*)
---

# Instagram Analyzer CLI - Inteligencia Social via Graph API

## Quando Usar Esta Skill

Use esta skill quando precisar analisar contas de Instagram conectadas via Meta Business Manager.

**Instagram Graph API (todas as contas conectadas):**
- Analise completa com metricas reais (reach, saves, shares, impressions)
- Acesso a todas as contas gerenciadas pelo Meta Business Manager
- Use `--account=username` para selecionar qual conta analisar
- Dados ricos e precisos para qualquer conta conectada

## Pre-Requisitos

1. `META_ACCESS_TOKEN` - Token da Meta (reusa o mesmo do meta-ads)
   - Permissoes necessarias: `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list`

Setup rapido:
```bash
# Verificar contas conectadas
node aios-marketing/bin/instagram-analyzer.mjs auth

# Listar todas as contas IG acessiveis pelo app
node aios-marketing/bin/instagram-analyzer.mjs accounts

# Salvar credenciais
node aios-marketing/bin/instagram-analyzer.mjs setup --token=META_TOKEN
```

## Selecao de Conta

O CLI acessa **todas** as contas IG Business conectadas ao app Meta. Resolucao:

1. **`--account=username`** - Flag explicita em qualquer comando (maior prioridade)
2. **Auto-detect** - Se apenas 1 conta conectada, usa automaticamente
3. **Erro com lista** - Se multiplas contas sem especificar, mostra todas para escolher

```bash
# Analisar conta especifica
node aios-marketing/bin/instagram-analyzer.mjs account --account=minha_marca

# Benchmark entre contas conectadas
node aios-marketing/bin/instagram-analyzer.mjs benchmark --account=marca_cliente --competitors=comp1,comp2

# Listar todas as contas disponiveis
node aios-marketing/bin/instagram-analyzer.mjs accounts
```

## CLI Syntax

```bash
node aios-marketing/bin/instagram-analyzer.mjs <command> [args] [--flags]
```

Flags globais:
- `--account=<username>` - Selecionar qual conta IG analisar (por username ou ID)
- `--format=table` - Output formatado em tabela
- `--limit=N` - Limitar numero de resultados
- `--after=<cursor>` - Cursor de paginacao
- `--pages=N` - Paginas de paginacao a carregar (default 3)

## Workflow Padrao

### 1. Setup (uma vez)
```bash
node aios-marketing/bin/instagram-analyzer.mjs auth
node aios-marketing/bin/instagram-analyzer.mjs setup --token=YOUR_TOKEN
```

### 2. Analise de Conta
```bash
# Visao geral
node aios-marketing/bin/instagram-analyzer.mjs account --account=username --format=table
# Top posts
node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=username --limit=20 --format=table
# Frequencia
node aios-marketing/bin/instagram-analyzer.mjs posting-frequency --account=username --format=table
# Hashtags
node aios-marketing/bin/instagram-analyzer.mjs hashtag-performance --account=username --format=table
# Mix de formatos
node aios-marketing/bin/instagram-analyzer.mjs format-analysis --account=username --format=table
# Insights de post especifico
node aios-marketing/bin/instagram-analyzer.mjs media-insights MEDIA_ID
```

### 3. Benchmark Competitivo
```bash
# Comparar contas conectadas lado a lado
node aios-marketing/bin/instagram-analyzer.mjs benchmark --account=marca_cliente --competitors=comp1,comp2,comp3 --format=table
```

## Padroes de Uso Comuns

### Auditoria Completa de Conta
```bash
node aios-marketing/bin/instagram-analyzer.mjs account --account=username --format=table
node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=username --limit=10 --format=table
node aios-marketing/bin/instagram-analyzer.mjs posting-frequency --account=username --format=table
node aios-marketing/bin/instagram-analyzer.mjs format-analysis --account=username --format=table
node aios-marketing/bin/instagram-analyzer.mjs hashtag-performance --account=username --format=table
```

### Benchmark Rapido
```bash
node aios-marketing/bin/instagram-analyzer.mjs benchmark --account=marca --competitors=comp1,comp2 --format=table
```

## Regras de Seguranca

- Todas as operacoes sao READ-ONLY — este CLI nao cria nem modifica conteudo
- Todas as contas devem estar conectadas via Meta Business Manager
- ER% calculado como (likes+comments)/followers para visao geral; usar media-insights para ER% real baseado em reach
- NUNCA recomendar copiar conteudo de competidores — identificar padroes e reinterpretar
- Respeitar rate limits: Graph API ~200 requests/hora

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/analysis-frameworks.md` - Frameworks de analise e benchmarks
