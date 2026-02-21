---
name: linkedin-analyzer
description: LinkedIn Analyzer CLI for social intelligence via LinkedIn Marketing API. Use when analyzing LinkedIn organization pages, post performance, follower demographics, visitor demographics, or comparing competitor pages. Triggers include "analisar linkedin", "page stats linkedin", "followers linkedin", "post performance linkedin", "competidores linkedin", or any task requiring LinkedIn organization page analysis.
allowed-tools: Bash(node *linkedin-analyzer.mjs:*)
---

# LinkedIn Analyzer CLI - Inteligencia Social via Marketing API

## Quando Usar Esta Skill

Use esta skill quando precisar analisar paginas de organizacoes no LinkedIn via Marketing API.

**LinkedIn Marketing API (organization pages):**
- Analytics de pagina: followers, views, engagement
- Performance de posts: likes, comments, shares, impressions
- Demograficos de followers: seniority, industry, location, function
- Demograficos de visitantes: visao geral de trafego
- Comparacao com paginas concorrentes
- Use `--org=ID` para selecionar qual organizacao analisar

## Pre-Requisitos

1. `LINKEDIN_ACCESS_TOKEN` - Token OAuth2 do LinkedIn
   - Criar app em: https://www.linkedin.com/developers/
   - Solicitar acesso a Marketing Developer Platform
   - Scopes necessarios: `r_organization_admin`, `r_organization_social`, `rw_organization_admin`
2. `LINKEDIN_ORGANIZATION_ID` - ID da organizacao (opcional, pode usar --org)

Setup rapido:
```bash
# Verificar acesso
node aios-marketing/bin/linkedin-analyzer.mjs auth

# Listar paginas administradas
node aios-marketing/bin/linkedin-analyzer.mjs accounts

# Salvar credenciais
node aios-marketing/bin/linkedin-analyzer.mjs setup --token=YOUR_TOKEN --org=YOUR_ORG_ID
```

## Selecao de Organizacao

O CLI acessa paginas de organizacao do LinkedIn. Resolucao:

1. **`--org=ID`** - Flag explicita em qualquer comando (maior prioridade)
2. **LINKEDIN_ORGANIZATION_ID** - Variavel de ambiente como fallback
3. **Erro com instrucoes** - Se nao especificado, mostra como descobrir

```bash
# Analisar pagina especifica
node aios-marketing/bin/linkedin-analyzer.mjs page-stats --org=123456789

# Top posts por engajamento
node aios-marketing/bin/linkedin-analyzer.mjs top-posts --org=123456789 --limit=10

# Demograficos de followers
node aios-marketing/bin/linkedin-analyzer.mjs follower-demographics --org=123456789
```

## CLI Syntax

```bash
node aios-marketing/bin/linkedin-analyzer.mjs <command> [args] [--flags]
```

Flags globais:
- `--org=<id>` - Selecionar qual organizacao analisar
- `--format=table` - Output formatado em tabela
- `--limit=N` - Limitar numero de resultados
- `--days=N` - Periodo de analise em dias (default 30)

## Workflow Padrao

### 1. Setup (uma vez)
```bash
node aios-marketing/bin/linkedin-analyzer.mjs auth
node aios-marketing/bin/linkedin-analyzer.mjs setup --token=YOUR_TOKEN --org=YOUR_ORG_ID
```

### 2. Analise de Pagina
```bash
# Visao geral da pagina
node aios-marketing/bin/linkedin-analyzer.mjs page-stats --org=ID
# Performance de posts
node aios-marketing/bin/linkedin-analyzer.mjs post-performance --org=ID --format=table
# Top posts
node aios-marketing/bin/linkedin-analyzer.mjs top-posts --org=ID --limit=10
# Demograficos de followers
node aios-marketing/bin/linkedin-analyzer.mjs follower-demographics --org=ID
# Demograficos de visitantes
node aios-marketing/bin/linkedin-analyzer.mjs visitor-demographics --org=ID
```

### 3. Benchmark Competitivo
```bash
# Comparar com concorrentes
node aios-marketing/bin/linkedin-analyzer.mjs competitor-pages --org=MY_ORG --competitors=ORG_ID1,ORG_ID2 --format=table
```

## Padroes de Uso Comuns

### Auditoria Completa de Pagina LinkedIn
```bash
node aios-marketing/bin/linkedin-analyzer.mjs page-stats --org=ID
node aios-marketing/bin/linkedin-analyzer.mjs post-performance --org=ID --limit=20 --format=table
node aios-marketing/bin/linkedin-analyzer.mjs top-posts --org=ID --limit=10
node aios-marketing/bin/linkedin-analyzer.mjs follower-demographics --org=ID
```

### Benchmark Rapido
```bash
node aios-marketing/bin/linkedin-analyzer.mjs competitor-pages --org=MY_ORG --competitors=COMP1,COMP2 --format=table
```

## Regras de Seguranca

- Todas as operacoes sao READ-ONLY - este CLI nao cria nem modifica conteudo
- Dados de concorrentes limitados a informacoes publicas (nome, followers, tamanho)
- NUNCA expor access tokens em outputs ou logs
- Scopes minimos: r_organization_admin, r_organization_social
- Rate limits: respeitar limites da LinkedIn API (~100 requests/dia para algumas endpoints)

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
