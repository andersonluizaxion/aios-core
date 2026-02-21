# Source Tree - aios-marketing

Mapa completo do diretorio aios-marketing com todos os squads, agentes, skills, CLIs e seus propositos.

```
aios-marketing/
│
├── .claude/                                    # Configuracao Claude Code
│   ├── CLAUDE.md                              # Regras globais do projeto marketing
│   ├── settings.json.tmpl                     # Template de configuracao Claude Code
│   ├── commands/Marketing/agents/             # Definicoes de agentes para Claude Code
│   │   ├── gestor-trafego.md                  # Theo - Gestor de Trafego Pago
│   │   ├── copywriter.md                      # Cleo - Copywriter
│   │   ├── designer.md                        # Pixel - Designer
│   │   ├── data-analyst.md                    # Nova - Data Analyst
│   │   └── social-analyst.md                  # Saga - Social Analyst
│   └── rules/
│       └── marketing-workflow.md              # Regras de workflow por agente
│
├── .agent/workflows/                          # Workflows de ativacao e routing de comandos
│   ├── gestor-trafego.md                      # Routing: *audit, *campaign, *optimize, *meta-*, *google-*
│   ├── copywriter.md                          # Routing: *ad-copy, *lp-copy, *video-script
│   ├── designer.md                            # Routing: *brief, *formats, *specs
│   ├── data-analyst.md                        # Routing: *analyze, *funnel, *attribution
│   └── social-analyst.md                      # Routing: *insta-account, *insta-benchmark, *insta-strategy
│
├── .agents/skills/                            # Skills especializadas (references + triggers)
│   ├── meta-ads/                              # Meta Ads CLI skill
│   │   ├── SKILL.md                           # Triggers, workflow, pre-requisitos
│   │   └── references/
│   │       ├── tools-reference.md             # Referencia completa de comandos Meta Ads
│   │       └── campaign-patterns.md           # Padroes de campanha por objetivo
│   ├── google-ads/                            # Google Ads CLI skill
│   │   ├── SKILL.md                           # Triggers, workflow, pre-requisitos
│   │   └── references/
│   │       ├── tools-reference.md             # Referencia completa de comandos Google Ads
│   │       ├── campaign-patterns.md           # Padroes de campanha por tipo
│   │       └── setup-guide.md                 # Guia de setup OAuth2
│   ├── instagram-analyzer/                    # Instagram Analyzer CLI skill
│   │   ├── SKILL.md                           # Triggers, workflow, pre-requisitos
│   │   └── references/
│   │       ├── tools-reference.md             # Referencia completa de comandos Instagram
│   │       └── analysis-frameworks.md         # Frameworks de analise e benchmarks
│   └── content-generation/                    # Frameworks de conteudo
│       ├── SKILL.md                           # Copy frameworks e specs
│       └── references/
│           ├── copy-frameworks.md             # Frameworks de persuasao (PAS, AIDA, etc.)
│           └── platform-specs.md              # Specs de plataformas (limites de caracteres, etc.)
│
├── bin/                                       # CLIs executaveis (zero dependencies, Node 18+)
│   ├── meta-ads.mjs                           # Meta Graph API v24.0 - campanhas, insights, criativos
│   ├── google-ads.mjs                         # Google Ads REST API v19 - campanhas, keywords, GAQL
│   └── instagram-analyzer.mjs                 # Instagram Graph API v24.0 - analise, benchmark, hashtags
│
├── squads/                                    # Squads de marketing
│   ├── traffic-squad/                         # Gestao de trafego pago (Meta, Google, YouTube)
│   │   ├── squad.yaml                         # Manifesto do squad
│   │   ├── README.md                          # Documentacao do squad
│   │   ├── agents/
│   │   │   └── traffic-manager.md             # Definicao do agente Theo
│   │   ├── tasks/
│   │   │   ├── account-audit.md               # Auditoria completa de conta de ads
│   │   │   ├── campaign-setup.md              # Estruturar campanha passo a passo
│   │   │   ├── daily-optimization.md          # Otimizacao diaria de campanhas
│   │   │   └── reporting.md                   # Gerar relatorio de performance
│   │   ├── checklists/
│   │   │   └── campaign-launch.md             # Checklist pre-lancamento de campanha
│   │   ├── templates/
│   │   │   ├── campaign-brief.md              # Template de briefing de campanha
│   │   │   └── weekly-report.md               # Template de relatorio semanal
│   │   └── data/                              # Dados do squad (gitkeep)
│   │
│   ├── creative-squad/                        # Copywriting e criativos
│   │   ├── squad.yaml                         # Manifesto do squad
│   │   ├── README.md                          # Documentacao do squad
│   │   ├── agents/
│   │   │   ├── copywriter.md                  # Definicao do agente Cleo
│   │   │   └── designer.md                    # Definicao do agente Pixel
│   │   ├── tasks/
│   │   │   ├── ad-copy.md                     # Criar copy de anuncio
│   │   │   ├── landing-page-copy.md           # Copy de landing page
│   │   │   ├── video-script.md                # Script de video
│   │   │   ├── ab-test-plan.md                # Plano de teste A/B
│   │   │   ├── creative-brief-design.md       # Briefing de criativo para designer
│   │   │   ├── banner-design.md               # Design de banners
│   │   │   └── creative-review.md             # Review de criativos
│   │   ├── checklists/
│   │   │   ├── copy-review.md                 # Checklist de revisao de copy
│   │   │   └── creative-specs.md              # Checklist de specs de criativos
│   │   ├── templates/
│   │   │   ├── creative-brief.md              # Template de briefing criativo
│   │   │   ├── copy-variants.md               # Template de variantes de copy
│   │   │   └── design-specs.md                # Template de specs de design
│   │   ├── data/                              # Dados do squad (gitkeep)
│   │   └── scripts/                           # Scripts do squad (gitkeep)
│   │
│   ├── analytics-squad/                       # Analise de dados e reporting
│   │   ├── squad.yaml                         # Manifesto do squad
│   │   ├── README.md                          # Documentacao do squad
│   │   ├── agents/
│   │   │   └── data-analyst.md                # Definicao do agente Nova
│   │   ├── tasks/
│   │   │   ├── performance-analysis.md        # Analise de performance de campanhas
│   │   │   ├── attribution-audit.md           # Auditoria de atribuicao
│   │   │   ├── funnel-analysis.md             # Analise de funil
│   │   │   ├── dashboard-setup.md             # Especificacao de dashboard
│   │   │   └── cohort-analysis.md             # Analise de cohorts
│   │   ├── checklists/
│   │   │   └── tracking-audit.md              # Checklist de auditoria de tracking
│   │   ├── templates/
│   │   │   ├── analytics-report.md            # Template de relatorio de analytics
│   │   │   └── dashboard-spec.md              # Template de spec de dashboard
│   │   ├── data/                              # Dados do squad (gitkeep)
│   │   └── scripts/                           # Scripts do squad (gitkeep)
│   │
│   └── social-squad/                          # Inteligencia social e Instagram
│       ├── squad.yaml                         # Manifesto do squad
│       ├── README.md                          # Documentacao do squad
│       ├── agents/
│       │   └── social-analyst.md              # Definicao do agente Saga
│       ├── tasks/
│       │   ├── account-analysis.md            # Analise completa de conta Instagram
│       │   ├── competitive-benchmark.md       # Benchmark competitivo entre contas
│       │   ├── content-inspiration.md         # Padroes de conteudo de referencia
│       │   └── posting-strategy.md            # Estrategia de frequencia e formatos
│       ├── checklists/
│       │   └── instagram-analysis.md          # Checklist de analise Instagram
│       ├── templates/
│       │   ├── instagram-report.md            # Template de relatorio de conta
│       │   └── benchmark-report.md            # Template de benchmark competitivo
│       ├── data/                              # Dados do squad (gitkeep)
│       └── scripts/                           # Scripts do squad (gitkeep)
│
├── docs/                                      # Documentacao
│   ├── audits/                                # Relatorios de auditoria gerados
│   │   ├── pdf-style.css                      # Estilo para PDFs de auditoria
│   │   └── *.md / *.pdf                       # Auditorias de contas (Meta, Instagram)
│   └── design/
│       ├── aios-marketing-organigrama.pen     # Organigrama do projeto
│       └── images/                            # Imagens geradas
│
├── workflows/                                 # Workflows customizados (gitkeep)
│
├── .env                                       # Credenciais locais (gitignored)
├── .env.example                               # Exemplo de variaveis de ambiente
├── .mcp.json.tmpl                             # Template de configuracao MCP
├── README.md                                  # Documentacao principal do projeto
├── tech-stack.yaml                            # Stack tecnico e convencoes
├── coding-standards.md                        # Padroes de desenvolvimento de CLIs
└── source-tree.md                             # Este arquivo
```

## Resumo por Tipo

### Agentes (5 ativos)

| Agente | Persona | Squad | CLI |
|--------|---------|-------|-----|
| Theo | Gestor de Trafego | traffic-squad | meta-ads.mjs, google-ads.mjs |
| Cleo | Copywriter | creative-squad | - |
| Pixel | Designer | creative-squad | - |
| Nova | Data Analyst | analytics-squad | - |
| Saga | Social Analyst | social-squad | instagram-analyzer.mjs |

### CLIs (3 ativos)

| CLI | API | Versao | Operacoes |
|-----|-----|--------|-----------|
| `meta-ads.mjs` | Meta Graph API | v24.0 | Campanhas, insights, criativos, targeting |
| `google-ads.mjs` | Google Ads REST | v19 | Campanhas, keywords, GAQL, search terms |
| `instagram-analyzer.mjs` | Instagram Graph API | v24.0 | Analise, benchmark, hashtags (READ-ONLY) |

### Squads (4 ativos)

| Squad | Agentes | Tasks | Templates |
|-------|---------|-------|-----------|
| traffic-squad | 1 | 4 | 2 |
| creative-squad | 2 | 7 | 3 |
| analytics-squad | 1 | 5 | 2 |
| social-squad | 1 | 4 | 2 |
