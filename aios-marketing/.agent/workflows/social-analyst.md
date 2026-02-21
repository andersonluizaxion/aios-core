# Social Analyst Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File / Type | Description |
|---------|-----------------|-------------|
| `*insta-account` | `squads/social-squad/tasks/account-analysis.md` | Analise da conta |
| `*insta-top-posts` | Inline workflow (CLI) | Ranking posts por ER% |
| `*insta-frequency` | `squads/social-squad/tasks/posting-strategy.md` | Frequencia e horarios |
| `*insta-hashtags` | Inline workflow (CLI) | Performance de hashtags |
| `*insta-format-mix` | Inline workflow (CLI) | Mix de formatos |
| `*insta-insights` | Inline workflow (CLI) | Insights de post especifico |
| `*insta-competitor` | Inline workflow (CLI) | Analisar outra conta conectada |
| `*insta-benchmark` | `squads/social-squad/tasks/competitive-benchmark.md` | Benchmark competitivo |
| `*insta-top-competitor` | Inline workflow (CLI) | Top posts de outra conta |
| `*insta-strategy` | Inline workflow | Estrategia completa |
| `*insta-content-calendar` | Inline workflow | Calendario de conteudo |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *insta-strategy
1. Verificar se ja rodou `*insta-account` (pedir para rodar se nao)
2. Perguntar: quais competidores analisar? (sugerir 2-3 do mesmo nicho entre as contas conectadas)
3. Rodar `*insta-benchmark` com os competidores escolhidos
4. Analisar: ER% do cliente vs benchmark, frequencia vs benchmark, mix de formatos vs benchmark
5. Consultar frameworks em `.agents/skills/instagram-analyzer/references/analysis-frameworks.md`
6. Identificar o maior gap (frequencia, formato, ou engajamento)
7. Recomendar: 3 acoes prioritarias com impacto estimado
8. Gerar cronograma de implementacao (semanas 1-4)

### *insta-content-calendar
1. Carregar dados de `*insta-frequency` (melhores dias e horarios)
2. Perguntar: quantos posts por semana? formatos desejados?
3. Consultar mix recomendado (50% Reels / 30% Carrossel / 20% Imagem)
4. Gerar calendario para as proximas 4 semanas
5. Organizar por formato seguindo mix recomendado
6. Incluir sugestoes de temas por post baseadas nos padroes identificados

## Instagram Analyzer CLI Workflows

> Estes workflows usam o CLI `bin/instagram-analyzer.mjs`.
> Pre-requisito: META_ACCESS_TOKEN configurado em ~/.config/instagram-analyzer/.env
> Conta IG: via `--account=username` (todas as contas conectadas ao Meta Business Manager)

### *insta-top-posts (CLI)
1. Perguntar: quantos posts? (default 20)
2. `node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=<username> --limit=N --format=table`
3. Destacar: maior ER%, tipo de formato dominante, melhores horarios dos top posts
4. Insight: "O que esses posts tem em comum?" (formato, tema, hook, horario)
5. Recomendacao: como replicar o padrao

### *insta-hashtags (CLI)
1. `node aios-marketing/bin/instagram-analyzer.mjs hashtag-performance --account=<username> --format=table`
2. Apresentar ranking: Hashtag | Frequencia | Avg_ER% | Avg_Likes
3. Identificar: hashtags que correlacionam com maior engajamento
4. Recomendar: mix de hashtags para proximos posts (nicho + medium + broad)
5. Consultar framework de hashtags em analysis-frameworks.md

### *insta-format-mix (CLI)
1. `node aios-marketing/bin/instagram-analyzer.mjs format-analysis --account=<username> --format=table`
2. Apresentar: % Reels | % Carrossel | % Imagem | ER% medio por formato
3. Comparar com mix ideal (50/30/20)
4. Recomendar: qual formato priorizar

### *insta-insights (CLI)
1. Perguntar: ID ou URL do post
2. Extrair media_id da URL se necessario
3. `node aios-marketing/bin/instagram-analyzer.mjs media-insights <media_id>`
4. Apresentar: Reach, Impressions, Engagement, Saves, Shares, ER%
5. Comparar com media da conta (se disponivel)

### *insta-competitor (CLI)
1. Perguntar: username da conta a analisar (deve ser conta conectada)
2. `node aios-marketing/bin/instagram-analyzer.mjs account --account=<username> --format=table`
3. `node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=<username> --limit=10 --format=table`
4. Apresentar: Followers | Avg_ER% | Posts/Week | Dominant Format | Top 3 Posts
5. Insight: o que funciona para essa conta

### *insta-top-competitor (CLI)
1. Perguntar: username e quantidade de posts (deve ser conta conectada)
2. `node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=<username> --limit=N --format=table`
3. Apresentar ranking: Rank | Date | Type | Likes | Comments | ER% | URL
4. Identificar padroes: tipos de conteudo, formatos, horarios, hooks de caption
