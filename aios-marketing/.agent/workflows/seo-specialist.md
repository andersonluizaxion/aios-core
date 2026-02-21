# SEO Specialist Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File / Type | Description |
|---------|-----------------|-------------|
| `*site-audit` | `squads/content-squad/tasks/site-audit.md` | Auditoria tecnica do site |
| `*keywords` | `squads/content-squad/tasks/keyword-research.md` | Pesquisa de keywords |
| `*content-plan` | `squads/content-squad/tasks/content-cluster.md` | Plano de content clusters |
| `*serp-analyze` | `squads/content-squad/tasks/serp-analysis.md` | Analise de SERP |
| `*backlinks` | `squads/content-squad/tasks/backlink-audit.md` | Auditoria de backlinks |
| `*content-brief` | Inline workflow | Brief de conteudo otimizado |
| `*technical-seo` | Inline workflow | Checklist tecnico |
| `*indexing-check` | Inline workflow (CLI) | Status de indexacao |
| `*cannibalization` | Inline workflow (CLI) | Detectar canibalizacao |
| `*competitor-seo` | Inline workflow | Analise SEO do concorrente |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *content-brief
1. Perguntar: keyword principal, search intent, publico-alvo
2. Analisar SERP: top 10 resultados para a keyword
3. Identificar: H1 patterns, word count medio, subtopicos cobertos, perguntas respondidas
4. Gerar brief com:
   - Title tag sugerido (< 60 chars)
   - Meta description sugerida (< 155 chars)
   - H1 recomendado
   - Outline de H2/H3 baseado nos competidores
   - Keywords secundarias e LSI a incluir
   - Perguntas (People Also Ask) a responder
   - Internal links sugeridos
   - Schema markup recomendado
   - Word count target
5. Entregar no template content-brief

### *technical-seo
1. Perguntar: URL do site
2. Verificar (manualmente ou via ferramentas):
   - robots.txt: existe, permite crawl das paginas importantes
   - Sitemap XML: existe, submetido no Search Console, atualizado
   - HTTPS: certificado valido, sem mixed content
   - Canonical tags: implementadas corretamente
   - Hreflang: se site multilingual
   - Schema markup: Organization, BreadcrumbList, Article/Product
   - Page speed: LCP, INP, CLS (Core Web Vitals)
   - Mobile: viewport, touch targets, font size
   - Redirects: sem chains, sem loops
   - 404s: paginas quebradas identificadas
   - Structured data: testado no Rich Results Test
3. Score: 0-100 com detalhamento por categoria
4. Priorizar: acoes por impacto (alto/medio/baixo)

### *indexing-check
1. Perguntar: URLs a verificar (ou todo o site)
2. Se Search Console configurado:
   - `node aios-marketing/bin/search-console.mjs coverage` - status geral
   - `node aios-marketing/bin/search-console.mjs indexing --url=<URL>` - URL especifica
3. Verificar: indexada, crawled, excluded, errors
4. Para URLs nao indexadas: diagnosticar causa (noindex, canonical, redirect, low quality)
5. Recomendar: acoes corretivas por URL

### *cannibalization
1. Perguntar: dominio ou lista de keywords
2. Se Search Console configurado:
   - `node aios-marketing/bin/search-console.mjs queries --limit=500` - todas as queries
   - `node aios-marketing/bin/search-console.mjs pages` - performance por pagina
3. Identificar: mesma keyword rankeando com 2+ paginas diferentes
4. Para cada canibalizacao:
   - Qual pagina deve ser a principal (mais autoridade, mais relevante)
   - Acao: merge content, redirect, re-otimizar, canonical
5. Tabela: Keyword | Pagina 1 | Position 1 | Pagina 2 | Position 2 | Acao Recomendada

### *competitor-seo
1. Perguntar: URL do concorrente, keywords de interesse
2. Analisar (via web search e ferramentas publicas):
   - Estrutura do site (paginas principais, blog, categorias)
   - Estimativa de trafego organico
   - Keywords principais que rankeia
   - Content strategy (frequencia de publicacao, tipos de conteudo)
   - Backlink profile (DA estimado, numero de referring domains)
   - Schema markup implementado
   - Core Web Vitals (PageSpeed Insights publico)
3. Comparar com o site do cliente:
   - Content gaps (keywords que concorrente rankeia e cliente nao)
   - Authority gap (DA, backlinks)
   - Technical gap (velocidade, mobile, schema)
4. Recomendar: top 5 oportunidades de superacao

## Search Console CLI Workflows

> Estes workflows usam o CLI `bin/search-console.mjs`.
> Pre-requisito: Credenciais Google OAuth2 configuradas + GOOGLE_SEARCH_CONSOLE_SITE_URL

### Queries (via *keywords ou *cannibalization)
1. `node aios-marketing/bin/search-console.mjs queries --limit=100 --format=table` - top queries
2. Analisar: queries com alta impressao mas baixo CTR = oportunidade de otimizacao
3. Queries com position 5-15 = quick wins (melhorar on-page para subir)

### Pages (via *site-audit ou *cannibalization)
1. `node aios-marketing/bin/search-console.mjs pages --limit=50 --format=table` - top pages
2. Identificar: paginas com trafego declinando, paginas com alto potencial
