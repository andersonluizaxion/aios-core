# aios-marketing - AIOS Marketing Operations

Template de projeto AIOS focado em Marketing Operations.

## Agentes Disponiveis

| Agente | Comando | Squad | Area |
|--------|---------|-------|------|
| Theo (Gestor de Trafego) | `@gestor-trafego` | traffic-squad | Paid Traffic (Meta, Google, YouTube) |
| Cleo (Copywriter) | `@copywriter` | creative-squad | Ad copy, LP copy, email copy, video scripts |
| Pixel (Designer) | `@designer` | creative-squad | Creative briefs, format specs, visual strategy |
| Nova (Data Analyst) | `@data-analyst` | analytics-squad | Performance analysis, attribution, funnels |
| Saga (Social Analyst) | `@social-analyst` | social-squad | Instagram analysis, competitive benchmarking, content strategy |

## Squads

| Squad | Diretorio | Agentes | Descricao |
|-------|-----------|---------|-----------|
| Traffic Squad | `squads/traffic-squad/` | Theo | Gestao de trafego pago |
| Creative Squad | `squads/creative-squad/` | Cleo, Pixel | Copywriting e criativos |
| Analytics Squad | `squads/analytics-squad/` | Nova | Analise de dados e reporting |
| Social Squad | `squads/social-squad/` | Saga | Inteligencia social e analise Instagram |

## Como Usar

### Ativar um agente
```
@gestor-trafego    # Trafego pago
@copywriter        # Copy de anuncios
@designer          # Criativos e briefs
@data-analyst      # Analise de dados
@social-analyst    # Inteligencia social e Instagram
```

### Comandos por Agente

**@gestor-trafego (Theo)**
```
*audit      - Auditoria de conta de ads
*campaign   - Estruturar campanha
*optimize   - Otimizar campanhas ativas
*report     - Gerar relatorio de performance
*copy-ad    - Criar copy de anuncio
*audience   - Definir publico-alvo
```

**@copywriter (Cleo)**
```
*ad-copy        - Criar copy de anuncio
*lp-copy        - Copy de landing page
*video-script   - Script de video
*angles         - Brainstorm de angulos
*headline-test  - Variantes de headline
*rewrite        - Melhorar copy existente
```

**@designer (Pixel)**
```
*brief           - Briefing de criativo
*formats         - Recomendar formatos
*specs           - Specs de plataforma
*review-creative - Revisar criativos
*thumbnail       - Brief de thumbnail
*carousel        - Planejar carrossel
```

**@data-analyst (Nova)**
```
*analyze      - Analise de performance
*funnel       - Analise de funil
*attribution  - Auditoria de atribuicao
*cohort       - Analise de cohorts
*dashboard    - Especificar dashboard
*benchmark    - Comparar com benchmarks
*forecast     - Projecao de performance
```

**@social-analyst (Saga)**
```
*insta-account       - Analise completa de conta Instagram
*insta-top-posts     - Ranking de posts por engajamento
*insta-frequency     - Frequencia e melhores horarios
*insta-hashtags      - Performance de hashtags
*insta-format-mix    - Mix de formatos (Reels/Carrossel/Imagem)
*insta-insights      - Insights de post especifico
*insta-competitor    - Analisar outra conta conectada
*insta-benchmark     - Benchmark competitivo entre contas
*insta-top-competitor - Top posts de conta conectada
*insta-strategy      - Estrategia completa baseada em dados
*insta-content-calendar - Calendario de conteudo
```

## Estrutura

```
aios-marketing/
├── .claude/                    # Configuracao Claude Code
│   ├── CLAUDE.md              # Regras do projeto
│   ├── commands/Marketing/    # Agentes de marketing
│   └── rules/                 # Regras de workflow
├── .agent/workflows/          # Workflows dos agentes
├── .agents/skills/            # Skills especializadas
│   ├── meta-ads/              # Meta Ads CLI reference
│   ├── google-ads/            # Google Ads CLI reference
│   ├── instagram-analyzer/    # Instagram Analyzer CLI reference
│   └── content-generation/    # Frameworks de persuasao e specs
├── squads/                    # Squads de marketing
│   ├── traffic-squad/         # Squad de trafego pago
│   ├── creative-squad/        # Squad de copy e criativos
│   ├── analytics-squad/       # Squad de analytics
│   └── social-squad/          # Squad de inteligencia social
├── bin/                       # CLI tools
│   ├── meta-ads.mjs          # Meta Graph API CLI
│   ├── google-ads.mjs        # Google Ads REST API CLI
│   └── instagram-analyzer.mjs # Instagram Graph API CLI
├── docs/                      # Documentacao e auditorias
│   ├── audits/                # Relatorios de auditoria
│   └── design/                # Design e organigrama
└── workflows/                 # Workflows customizados
```

## Meta Ads CLI

Integracao direta com Meta Graph API v24.0 via CLI proprio (`bin/meta-ads.mjs`).
Sem dependencias externas - usa `fetch` nativo do Node 18+.

**Setup (uma vez):**
```bash
node aios-marketing/bin/meta-ads.mjs auth
node aios-marketing/bin/meta-ads.mjs setup --token=your_long_lived_token
node aios-marketing/bin/meta-ads.mjs accounts
```

**Prioridade de credenciais:** Shell env > `.env` do projeto > `~/.config/meta-ads/.env`

**Operacoes:**
- Listar contas e campanhas ativas
- Criar campanhas completas (campanha + ad set + criativo + ad)
- Extrair insights de performance com breakdowns
- Pesquisar interesses, comportamentos e demograficos
- Upload de imagens e gestao de criativos
- Otimizacao diaria automatizada

**Valores em centavos:** R$ 50/dia = 5000

Referencia completa: `.agents/skills/meta-ads/SKILL.md`

## Google Ads CLI

Integracao direta com Google Ads REST API v19 via CLI proprio (`bin/google-ads.mjs`).
Sem dependencias externas - usa `fetch` nativo do Node 18+.
Usa GAQL (Google Ads Query Language) para queries e REST API para mutacoes.

**Setup (uma vez):**
```bash
node aios-marketing/bin/google-ads.mjs auth
node aios-marketing/bin/google-ads.mjs setup \
  --developer-token=XXXXX \
  --client-id=XXXXX.apps.googleusercontent.com \
  --client-secret=XXXXX \
  --refresh-token=XXXXX \
  --customer-id=1234567890
node aios-marketing/bin/google-ads.mjs accounts
```

**Prioridade de credenciais:** Shell env > `.env` do projeto > `.env` aios-marketing > `~/.config/google-ads/.env`

**Operacoes:**
- Listar contas e campanhas ativas
- Criar campanhas Search, Display, Shopping, Video, Performance Max
- Gerenciar keywords (adicionar, pausar, remover, quality score)
- Consultar termos de busca (search terms report)
- Executar queries GAQL customizadas
- Otimizacao diaria automatizada

**Valores em MICROS:** R$ 50/dia = 50.000.000 micros (1 BRL = 1.000.000 micros)

Referencia completa: `.agents/skills/google-ads/SKILL.md`

## Instagram Analyzer CLI

Integracao direta com Instagram Graph API v24.0 via CLI proprio (`bin/instagram-analyzer.mjs`).
Sem dependencias externas - usa `fetch` nativo do Node 18+. Todas as operacoes sao READ-ONLY.
Acessa todas as contas IG Business conectadas ao Meta Business Manager.

**Setup (uma vez):**
```bash
node aios-marketing/bin/instagram-analyzer.mjs auth
node aios-marketing/bin/instagram-analyzer.mjs setup --token=META_TOKEN
node aios-marketing/bin/instagram-analyzer.mjs accounts
```

**Prioridade de credenciais:** Shell env > `.env` do projeto > `.env` aios-marketing > `~/.config/instagram-analyzer/.env`

**Selecao de conta:** `--account=username` em qualquer comando. Se apenas 1 conta conectada, auto-detecta.

**Operacoes:**
- Analise completa de conta (bio, followers, ER%, frequencia, formatos)
- Ranking de top posts por engajamento
- Analise de frequencia e melhores horarios
- Performance de hashtags correlacionada com ER%
- Insights detalhados de posts (reach, saves, shares)
- Benchmark comparativo entre contas conectadas
- Mix de formatos (Reels/Carrossel/Imagem)

**Regras:** READ-ONLY. Nunca recomendar copiar conteudo -- apenas identificar padroes.

Referencia completa: `.agents/skills/instagram-analyzer/SKILL.md`

## Roadmap de Agentes

- [x] Gestor de Trafego (Meta Ads, Google Ads, YouTube Ads)
- [x] Copywriter (Copy de anuncios, landing pages, emails)
- [x] Designer (Criativos, banners, videos)
- [x] Analista de Dados (GA4, dashboards, atribuicao)
- [x] Social Analyst (Instagram analysis, competitive benchmarking)
- [ ] SEO Specialist (Organico, conteudo, technical SEO)
- [ ] Email Marketing (Automacao, nurturing, segmentacao)
