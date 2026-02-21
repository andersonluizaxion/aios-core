---
name: google-search-console
description: Google Search Console CLI for analyzing search performance, indexing status, and SEO data. Use when the user needs to check search queries, page rankings, click-through rates, sitemap status, URL indexing, coverage issues, or SEO performance. Triggers include "search console", "SEO", "busca organica", "queries de busca", "ranking", "posicao no google", "indexacao", "sitemap", "cobertura", "CTR organico", "impressoes de busca", "termos de busca organica", or any task requiring search engine optimization data.
allowed-tools: Bash(node *search-console.mjs:*)
---

# Google Search Console CLI - SEO & Search Performance

## Quando Usar Esta Skill

Use esta skill quando precisar analisar performance de busca organica. Isso inclui:

- Verificar queries de busca e posicoes no Google
- Analisar performance de paginas nos resultados de busca
- Verificar status de sitemaps
- Inspecionar URLs (indexacao, mobile, rich results)
- Analisar cobertura de indexacao
- Monitorar performance por pais e device
- Acompanhar tendencias de CTR e impressoes

## Pre-Requisitos

1. Credenciais OAuth2 configuradas (compartilhadas com Google Ads)
2. GOOGLE_SEARCH_CONSOLE_SITE_URL configurado
3. Node.js 18+ instalado
4. CLI: `aios-marketing/bin/search-console.mjs`

Setup rapido:
```bash
# Verificar acesso e listar sites
node aios-marketing/bin/search-console.mjs auth

# Configurar site URL
node aios-marketing/bin/search-console.mjs setup --site-url=https://example.com
```

## CLI Syntax

```bash
node aios-marketing/bin/search-console.mjs <command> [args] [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela (legivel)
- `--days=N` - Numero de dias para olhar (default: 28)
- `--since=YYYY-MM-DD` - Data inicio customizada
- `--until=YYYY-MM-DD` - Data fim customizada
- `--limit=N` - Limitar numero de resultados
- `--site=<url>` - Override do site URL padrao

**IMPORTANTE:** Dados do Search Console tem ~3 dias de atraso.

## Workflow Padrao

### 1. Autenticacao (primeira vez)
```bash
node aios-marketing/bin/search-console.mjs auth
# Verificar sites acessiveis e configurar
```

### 2. Listar Sites Acessiveis
```bash
node aios-marketing/bin/search-console.mjs sites --format=table
```

### 3. Queries de Busca (SEO Keywords)
```bash
# Top queries (ultimos 28 dias)
node aios-marketing/bin/search-console.mjs queries --format=table
# Queries de uma pagina especifica
node aios-marketing/bin/search-console.mjs queries --page=/produto --format=table
# Com breakdown por pais
node aios-marketing/bin/search-console.mjs queries --country --format=table
# Com breakdown por device
node aios-marketing/bin/search-console.mjs queries --device --format=table
```

### 4. Performance por Pagina
```bash
# Top paginas
node aios-marketing/bin/search-console.mjs pages --format=table
# Paginas filtradas por query
node aios-marketing/bin/search-console.mjs pages --query=produto --format=table
```

### 5. Performance Diaria
```bash
# Tendencia dos ultimos 28 dias
node aios-marketing/bin/search-console.mjs performance --format=table
# Filtrado por query
node aios-marketing/bin/search-console.mjs performance --query=produto --format=table
# Filtrado por pagina
node aios-marketing/bin/search-console.mjs performance --page=/blog --format=table
```

### 6. Sitemaps
```bash
node aios-marketing/bin/search-console.mjs sitemaps --format=table
```

### 7. Inspecao de URL
```bash
node aios-marketing/bin/search-console.mjs indexing https://example.com/page
```

### 8. Cobertura de Indexacao
```bash
node aios-marketing/bin/search-console.mjs coverage --format=table
```

### 9. Performance por Pais e Device
```bash
node aios-marketing/bin/search-console.mjs countries --format=table
node aios-marketing/bin/search-console.mjs devices --format=table
```

## Padroes de Uso Comuns

### Relatorio SEO Semanal
```bash
node aios-marketing/bin/search-console.mjs performance --days=7 --format=table
node aios-marketing/bin/search-console.mjs queries --days=7 --limit=20 --format=table
node aios-marketing/bin/search-console.mjs pages --days=7 --limit=10 --format=table
```

### Auditoria de Indexacao
```bash
node aios-marketing/bin/search-console.mjs sitemaps --format=table
node aios-marketing/bin/search-console.mjs coverage --format=table
# Inspecionar paginas especificas
node aios-marketing/bin/search-console.mjs indexing https://example.com/pagina-importante
```

### Analise de Oportunidades SEO
```bash
# Queries com muitas impressoes e baixo CTR = oportunidade
node aios-marketing/bin/search-console.mjs queries --days=28 --limit=50 --format=table
# Paginas com posicao 5-15 = oportunidade de subir
node aios-marketing/bin/search-console.mjs pages --days=28 --limit=50 --format=table
```

### Monitoramento Pos-Lancamento de Conteudo
```bash
# Verificar se pagina nova esta indexada
node aios-marketing/bin/search-console.mjs indexing https://example.com/nova-pagina
# Verificar queries associadas
node aios-marketing/bin/search-console.mjs queries --page=/nova-pagina --format=table
```

## Metricas Chave

| Metrica | Descricao |
|---------|-----------|
| **Clicks** | Cliques nos resultados de busca |
| **Impressions** | Vezes que apareceu nos resultados |
| **CTR** | Click-Through Rate (clicks/impressions) |
| **Position** | Posicao media nos resultados (1 = topo) |

## Regras

- Todas as operacoes sao READ-ONLY (nao modifica dados do Search Console)
- Credenciais OAuth2 sao compartilhadas com Google Ads
- Dados tem ~3 dias de atraso (exceto URL inspection que e mais recente)
- Site URL pode ser URL prefix (https://example.com/) ou domain (sc-domain:example.com)
- CTR e retornado como decimal (0.055 = 5.5%) e formatado automaticamente
- Position e a posicao MEDIA (1.0 = primeiro resultado)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
