---
name: ad-library
description: Ad Library CLI for competitive intelligence via Meta Ad Library API (public, free). Use when searching competitor ads, analyzing ad creative formats, tracking ad activity cadence, or monitoring advertiser strategies. Triggers include "ad library", "biblioteca de anuncios", "anuncios concorrente", "competitor ads", "creative analysis", "espionagem de anuncios", or any task requiring Meta Ad Library research.
allowed-tools: Bash(node *ad-library.mjs:*)
---

# Ad Library CLI - Inteligencia Competitiva via Meta Ad Library

## Quando Usar Esta Skill

Use esta skill quando precisar pesquisar e analisar anuncios de concorrentes na Meta Ad Library.

**Meta Ad Library API (publica, gratuita):**
- Pesquisar anuncios por nome do anunciante ou keyword
- Ver todos os anuncios de um anunciante especifico
- Filtrar anuncios ativos de concorrentes
- Analisar tendencias de atividade (cadencia de novos anuncios)
- Distribuicao de formatos criativos (imagem vs video vs carrossel)
- Usa o mesmo `META_ACCESS_TOKEN` do Meta Ads / Instagram Analyzer

## Pre-Requisitos

1. `META_ACCESS_TOKEN` - Token da Meta (mesmo do meta-ads/instagram-analyzer)
   - Se ja configurou Meta Ads ou Instagram Analyzer, o token e o mesmo

Setup rapido:
```bash
# Verificar acesso
node aios-marketing/bin/ad-library.mjs auth

# Salvar credenciais (se ainda nao configurou meta-ads)
node aios-marketing/bin/ad-library.mjs setup --token=META_TOKEN
```

## CLI Syntax

```bash
node aios-marketing/bin/ad-library.mjs <command> [args] [--flags]
```

Flags globais:
- `--country=<code>` - Pais para filtro de alcance (default: BR)
- `--format=table` - Output formatado em tabela
- `--limit=N` - Limitar numero de resultados
- `--status=<status>` - Filtro de status: ACTIVE, ALL

## Workflow Padrao

### 1. Pesquisar Concorrentes
```bash
# Pesquisar por nome ou keyword
node aios-marketing/bin/ad-library.mjs search "nome do concorrente" --format=table

# Pesquisar por nicho
node aios-marketing/bin/ad-library.mjs search "cirurgia plastica" --country=BR --format=table
```

### 2. Analisar Anunciante Especifico
```bash
# Pegar page_id dos resultados de search e analisar
node aios-marketing/bin/ad-library.mjs advertiser PAGE_ID --format=table

# Ver apenas anuncios ativos
node aios-marketing/bin/ad-library.mjs active PAGE_ID --format=table
```

### 3. Inteligencia Competitiva
```bash
# Tendencias de atividade (novos anuncios por mes)
node aios-marketing/bin/ad-library.mjs trends PAGE_ID

# Distribuicao de formatos criativos
node aios-marketing/bin/ad-library.mjs formats PAGE_ID --format=table
```

## Padroes de Uso Comuns

### Auditoria de Concorrente
```bash
# 1. Encontrar o concorrente
node aios-marketing/bin/ad-library.mjs search "nome concorrente" --format=table
# 2. Ver todos os anuncios
node aios-marketing/bin/ad-library.mjs advertiser PAGE_ID --format=table
# 3. Ver anuncios ativos
node aios-marketing/bin/ad-library.mjs active PAGE_ID --format=table
# 4. Analisar cadencia
node aios-marketing/bin/ad-library.mjs trends PAGE_ID
# 5. Analisar formatos
node aios-marketing/bin/ad-library.mjs formats PAGE_ID --format=table
```

### Pesquisa de Nicho
```bash
# Quem esta anunciando neste nicho?
node aios-marketing/bin/ad-library.mjs search "estetica facial" --country=BR --format=table
node aios-marketing/bin/ad-library.mjs search "harmonizacao facial" --country=BR --format=table
```

## Regras de Seguranca

- Todas as operacoes sao READ-ONLY - este CLI nao cria nem modifica anuncios
- A Ad Library API e publica e gratuita
- NUNCA recomendar copiar criativos de concorrentes - apenas identificar padroes
- Alguns tipos de anuncio podem ter acesso restrito (political ads vs all ads)
- Rate limits: respeitar limites da Graph API (~200 requests/hora)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/competitive-analysis-patterns.md` - Padroes de analise competitiva
