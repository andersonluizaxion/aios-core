# Gestor de Trafego Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File | Description |
|---------|-----------|-------------|
| `*audit` | `squads/traffic-squad/tasks/account-audit.md` | Auditoria de conta |
| `*campaign` | `squads/traffic-squad/tasks/campaign-setup.md` | Setup de campanha |
| `*optimize` | `squads/traffic-squad/tasks/daily-optimization.md` | Otimizacao diaria |
| `*report` | `squads/traffic-squad/tasks/reporting.md` | Relatorio performance |
| `*copy-ad` | Inline workflow | Criar copy de anuncio |
| `*audience` | Inline workflow | Definir publico-alvo |
| `*scale` | Inline workflow | Estrategia de scaling |
| `*diagnose` | Inline workflow | Diagnosticar problemas |
| `*strategy` | Inline workflow | Estrategia completa |
| `*funnel` | Inline workflow | Estruturar funil |
| `*budget` | Inline workflow | Planejamento de budget |
| `*meta-contas` | Inline workflow (MCP) | Listar contas Meta Ads |
| `*meta-campanhas` | Inline workflow (MCP) | Ver campanhas ativas na Meta |
| `*meta-criar` | Inline workflow (MCP) | Criar campanha completa na Meta via API |
| `*meta-insights` | Inline workflow (MCP) | Extrair metricas de performance da Meta |
| `*meta-publicos` | Inline workflow (MCP) | Pesquisar interesses e audiencias na Meta |
| `*meta-criativos` | Inline workflow (MCP) | Gerenciar criativos e imagens na Meta |
| `*meta-otimizar` | Inline workflow (MCP) | Otimizacao diaria via API Meta |
| `*google-contas` | Inline workflow (API) | Listar contas Google Ads |
| `*google-campanhas` | Inline workflow (API) | Ver campanhas ativas no Google Ads |
| `*google-criar` | Inline workflow (API) | Criar campanha completa no Google Ads via API |
| `*google-insights` | Inline workflow (API) | Extrair metricas de performance do Google Ads |
| `*google-keywords` | Inline workflow (API) | Gerenciar keywords no Google Ads |
| `*google-otimizar` | Inline workflow (API) | Otimizacao diaria via API Google Ads |
| `*fatigue-check` | Inline workflow | Verificar creative fatigue em campanhas ativas |
| `*full-audit` | Inline workflow | Auditoria completa one-command (Meta + Google + IG) |
| `*auto-report` | Inline workflow | Relatorio consolidado automatico cross-platform |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *copy-ad
1. Perguntar: plataforma, produto, publico, tom de voz, objetivo
2. Gerar 3 variantes de copy (headline + texto + CTA)
3. Adaptar formato para a plataforma (limites de caracteres)
4. Sugerir testes A/B

### *audience
1. Perguntar: produto, cliente ideal, budget, plataforma
2. Sugerir segmentacao por interesses/comportamentos
3. Definir lookalike strategy
4. Montar funil de retargeting
5. Estimar tamanho e custo por publico

### *scale
1. Analisar dados atuais (ROAS, CPA, budget)
2. Verificar se campanha esta estavel (min 5 dias de dados)
3. Recomendar estrategia de scaling (vertical vs horizontal)
4. Definir incrementos de budget (max 20%/dia)
5. Definir kill rules (quando parar de escalar)

### *diagnose
1. Perguntar: qual campanha, qual o problema, desde quando
2. Analisar metricas vs benchmarks
3. Identificar gargalo no funil (impressao → click → LP → conversao)
4. Recomendar acoes corretivas priorizadas

### *strategy
1. Entender negocio (produto, ticket, margem, LTV)
2. Definir mix de plataformas
3. Calcular budget ideal
4. Estruturar funil completo
5. Definir timeline de implementacao

### *funnel
1. Mapear jornada do cliente
2. TOFU: awareness, alcance
3. MOFU: consideracao, engajamento
4. BOFU: conversao, retargeting
5. Definir conteudo/oferta por estagio

### *budget
1. Entender objetivo de faturamento/leads
2. Calcular CAC maximo aceitavel (LTV / margem)
3. Definir budget por plataforma
4. Distribuir por campanha/objetivo
5. Projetar resultados esperados

### *fatigue-check
1. `node aios-marketing/bin/meta-ads.mjs campaigns <account_id> --status=ACTIVE` - listar campanhas ativas
2. `node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=last_7d --level=ad` - metricas por ad
3. Para cada ad: verificar sinais de fatigue:
   - Frequency > 4 → ALERTA: creative fatigue provavel
   - CTR declinando 3+ dias consecutivos → ALERTA: perda de relevancia
   - CPC subindo 3+ dias com targeting estavel → ALERTA: saturacao
   - CPM subindo sem mudanca de audiencia → ALERTA: competicao ou fatigue
4. Repetir para Google Ads se configurado:
   - `node aios-marketing/bin/google-ads.mjs campaigns <customer_id> --status=ENABLED`
   - `node aios-marketing/bin/google-ads.mjs insights <customer_id> --level=ad --date-range=LAST_7_DAYS`
5. Apresentar tabela: Ad | Platform | Frequency | CTR_Trend | CPC_Trend | Status | Acao
6. Recomendar: quais criativos pausar, quais renovar, solicitar @copywriter + @designer

### *full-audit
1. Perguntar: qual cliente? (carregar perfil de clients/ se existir)
2. Meta Ads: `*audit` (account audit completo)
3. Google Ads: `*audit` (se configurado)
4. Instagram: solicitar @social-analyst `*insta-account`
5. Compilar: Score geral (0-100), resumo executivo, top 3 acoes prioritarias
6. Gerar relatorio em markdown (opcionalmente PDF)

### *auto-report
1. Perguntar: periodo (semana/mes), cliente
2. Meta Ads: `node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=<periodo> --level=campaign`
3. Google Ads: `node aios-marketing/bin/google-ads.mjs insights <customer_id> --date-range=<periodo> --level=campaign`
4. Instagram: `node aios-marketing/bin/instagram-analyzer.mjs account --account=<username>`
5. Compilar relatorio consolidado:
   - Resumo executivo (investimento total, resultados, ROAS global)
   - Performance por plataforma (tabela comparativa)
   - Top campanhas
   - Social media growth
   - Aprendizados e recomendacoes
6. Salvar em docs/reports/ ou docs/audits/

## Meta Ads CLI Workflows

> Estes workflows usam o CLI `bin/meta-ads.mjs` para interacao direta com a Graph API da Meta.
> Referencia completa: `.agents/skills/meta-ads/SKILL.md`
> Pre-requisito: `META_ACCESS_TOKEN` configurado no ambiente

### *meta-contas
1. `node aios-marketing/bin/meta-ads.mjs auth` - Verificar autenticacao (se primeira vez)
2. `node aios-marketing/bin/meta-ads.mjs accounts --format=table` - Listar todas as contas acessiveis
3. `node aios-marketing/bin/meta-ads.mjs account-info <account_id>` - Detalhar conta selecionada
4. `node aios-marketing/bin/meta-ads.mjs pages <account_id>` - Listar paginas vinculadas
5. Apresentar resumo formatado ao usuario

### *meta-campanhas
1. Perguntar: qual conta? (ou usar conta padrao)
2. `node aios-marketing/bin/meta-ads.mjs campaigns <account_id> --status=ACTIVE --format=table`
3. Para cada campanha: `node aios-marketing/bin/meta-ads.mjs insights <campaign_id> --date-preset=last_7d`
4. Apresentar tabela: Campanha | Objetivo | Spend | ROAS | CPA | CTR | Status
5. Destacar campanhas com performance abaixo do benchmark

### *meta-criar
1. Elicitar: objetivo, produto, publico, budget, pagina, tem criativos?
2. `node aios-marketing/bin/meta-ads.mjs pages <account_id>` - confirmar pagina
3. `node aios-marketing/bin/meta-ads.mjs search-interests "<nicho>"` - pesquisar interesses
4. `node aios-marketing/bin/meta-ads.mjs search-locations "<local>"` - definir geo targeting
5. PREVIEW: mostrar estrutura completa antes de criar
6. Apos confirmacao do usuario:
   a. `node aios-marketing/bin/meta-ads.mjs create-campaign --account=<id> --name=<n> --objective=<obj>`
   b. `node aios-marketing/bin/meta-ads.mjs create-adset --account=<id> --campaign=<id> --name=<n> --daily-budget=<cents> --targeting='<json>'`
   c. `node aios-marketing/bin/meta-ads.mjs upload-image <account_id> <file>` (se fornecidas)
   d. `node aios-marketing/bin/meta-ads.mjs create-creative --account=<id> --name=<n> --page=<id> --image-hash=<hash> --link=<url> --message=<text> --headline=<text>`
   e. `node aios-marketing/bin/meta-ads.mjs create-ad --account=<id> --adset=<id> --name=<n> --creative=<id>`
7. Confirmar criacao e mostrar IDs para referencia

### *meta-insights
1. Perguntar: nivel (conta/campanha/adset/ad), periodo, breakdowns
2. `node aios-marketing/bin/meta-ads.mjs insights <id> --date-preset=<periodo> --level=<nivel> [--breakdowns=<b>]`
3. Formatar relatorio com metricas: Spend, Impressions, Clicks, CTR, CPC, CPM, ROAS, CPA
4. Comparar com benchmarks do setor
5. Gerar insights acionaveis e recomendacoes
6. Se breakdown solicitado: mostrar tabela segmentada (idade, genero, device, etc.)

### *meta-publicos
1. Perguntar: nicho/produto, tipo de busca (interesses/comportamentos/demograficos/geo)
2. `node aios-marketing/bin/meta-ads.mjs search-interests "<nicho>"` - buscar interesses primarios
3. `node aios-marketing/bin/meta-ads.mjs interest-suggestions '<ids_json>'` - expandir com sugestoes
4. `node aios-marketing/bin/meta-ads.mjs validate-interests '<ids_json>'` - validar interesses
5. `node aios-marketing/bin/meta-ads.mjs search-behaviors "<comportamento>"` - complementar
6. `node aios-marketing/bin/meta-ads.mjs search-demographics "<demografico>"` - adicionar filtros
7. `node aios-marketing/bin/meta-ads.mjs search-locations "<local>" --type=city` - definir geo
8. Apresentar mapa de audiencia completo com estimativa de tamanho

### *meta-criativos
1. Perguntar: operacao (listar/criar/upload/atualizar)
2. Se listar: `node aios-marketing/bin/meta-ads.mjs creatives <account_id>`
3. Se upload: `node aios-marketing/bin/meta-ads.mjs upload-image <account_id> <file_or_url>`
4. Se criar:
   a. Elicitar: pagina, imagem, URL destino, headline, description, CTA
   b. `node aios-marketing/bin/meta-ads.mjs create-creative --account=<id> --name=<n> --page=<id> --image-hash=<h> --link=<url> --message=<text> --headline=<text> --cta=<type>`
5. Se atualizar: `node aios-marketing/bin/meta-ads.mjs update-creative <id> --name=<n>`
6. Confirmar operacao e mostrar resultado

### *meta-otimizar
1. `node aios-marketing/bin/meta-ads.mjs campaigns <account_id> --status=ACTIVE` - campanhas ativas
2. `node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=yesterday --level=adset` - metricas
3. Para cada campanha: analisar ROAS, CPA, CTR, Frequency
4. Identificar:
   - Ads com CTR < 0.5% e impressions > 1000 → recomendar pausar
   - Ad sets com Frequency > 4 → sinalizar creative fatigue
   - Ad sets com CPA > 1.5x target → recomendar reducao de budget
   - Ad sets com ROAS > target → candidatos a scaling
5. PREVIEW: mostrar acoes recomendadas antes de executar
6. Apos confirmacao:
   - `node aios-marketing/bin/meta-ads.mjs update-ad <id> --status=PAUSED` → pausar ads ruins
   - `node aios-marketing/bin/meta-ads.mjs update-adset <id> --daily-budget=<new>` → ajustar budgets
7. Resumo de acoes executadas

## Google Ads CLI Workflows

> Estes workflows usam o CLI `bin/google-ads.mjs` para interacao direta com a REST API do Google Ads.
> Referencia completa: `.agents/skills/google-ads/SKILL.md`
> Pre-requisito: Credenciais Google Ads configuradas (GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID)
> IMPORTANTE: Valores monetarios em MICROS (1 BRL = 1.000.000 micros). R$ 50/dia = 50000000

### *google-contas
1. `node aios-marketing/bin/google-ads.mjs auth` - Verificar autenticacao (se primeira vez)
2. `node aios-marketing/bin/google-ads.mjs accounts --format=table` - Listar todas as contas acessiveis
3. `node aios-marketing/bin/google-ads.mjs account-info <customer_id>` - Detalhar conta selecionada
4. Apresentar resumo formatado ao usuario

### *google-campanhas
1. Perguntar: qual conta? (ou usar conta padrao via GOOGLE_ADS_CUSTOMER_ID)
2. `node aios-marketing/bin/google-ads.mjs campaigns <customer_id> --status=ENABLED --format=table`
3. Para cada campanha: `node aios-marketing/bin/google-ads.mjs insights <campaign_id> --date-range=LAST_7_DAYS --customer=<cid>`
4. Apresentar tabela: Campanha | Tipo | Spend | Conversions | CPA | CTR | Status
5. Destacar campanhas com performance abaixo do benchmark

### *google-criar
1. Elicitar: objetivo, produto, tipo de campanha (SEARCH/DISPLAY/SHOPPING/PMAX), budget, keywords
2. `node aios-marketing/bin/google-ads.mjs search-locations "<local>"` - definir geo targeting
3. PREVIEW: mostrar estrutura completa antes de criar
4. Apos confirmacao do usuario:
   a. `node aios-marketing/bin/google-ads.mjs create-campaign --customer=<cid> --name=<n> --type=SEARCH --budget-micros=<amount> --bid-strategy=MANUAL_CPC`
   b. `node aios-marketing/bin/google-ads.mjs create-adgroup --customer=<cid> --campaign=<id> --name=<n> --cpc-bid-micros=<amount>`
   c. `node aios-marketing/bin/google-ads.mjs add-keywords --customer=<cid> --adgroup=<id> --keywords="kw1,kw2" --match-type=PHRASE`
   d. `node aios-marketing/bin/google-ads.mjs create-ad --customer=<cid> --adgroup=<id> --headlines="H1|H2|H3" --descriptions="D1|D2" --final-url=<url>`
5. Confirmar criacao e mostrar IDs para referencia

### *google-insights
1. Perguntar: nivel (conta/campanha/adgroup/ad), periodo
2. `node aios-marketing/bin/google-ads.mjs insights <id> --level=<nivel> --date-range=<periodo> --customer=<cid>`
3. Formatar relatorio com metricas: Spend, Impressions, Clicks, CTR, CPC, Conversions, CPA, ROAS
4. `node aios-marketing/bin/google-ads.mjs keyword-performance <adgroup_id> --customer=<cid>` - Quality Scores
5. Comparar com benchmarks do setor
6. Gerar insights acionaveis e recomendacoes

### *google-keywords
1. Perguntar: operacao (listar/adicionar/remover/analisar)
2. Se listar: `node aios-marketing/bin/google-ads.mjs keywords <adgroup_id> --customer=<cid> --format=table`
3. Se adicionar:
   a. Elicitar: keywords, match type (BROAD/PHRASE/EXACT), bid
   b. `node aios-marketing/bin/google-ads.mjs add-keywords --customer=<cid> --adgroup=<id> --keywords="kw1,kw2" --match-type=PHRASE`
4. Se remover: `node aios-marketing/bin/google-ads.mjs remove-keyword <criterion_id> --adgroup=<id> --customer=<cid>`
5. Se analisar:
   a. `node aios-marketing/bin/google-ads.mjs keyword-performance <adgroup_id> --customer=<cid>`
   b. `node aios-marketing/bin/google-ads.mjs search-terms <campaign_id> --customer=<cid>`
6. Apresentar resultado e recomendar acoes

### *google-otimizar
1. `node aios-marketing/bin/google-ads.mjs campaigns <customer_id> --status=ENABLED` - campanhas ativas
2. `node aios-marketing/bin/google-ads.mjs insights <customer_id> --level=adgroup --date-range=LAST_7_DAYS` - metricas
3. `node aios-marketing/bin/google-ads.mjs keyword-performance <adgroup_id> --customer=<cid>` - quality scores
4. `node aios-marketing/bin/google-ads.mjs search-terms <campaign_id> --customer=<cid>` - termos irrelevantes
5. Identificar:
   - Keywords com Quality Score < 5 → melhorar relevancia ou pausar
   - Ads com CTR < 1% e impressions > 500 → testar novas variantes
   - Ad groups com CPA > 1.5x target → reduzir bid ou pausar
   - Ad groups com CPA < target e Search IS < 50% → candidatos a scaling
   - Termos de busca irrelevantes → adicionar como negativos
6. PREVIEW: mostrar acoes recomendadas antes de executar
7. Apos confirmacao:
   - `node aios-marketing/bin/google-ads.mjs update-ad <id> --customer=<cid> --adgroup=<ag> --status=PAUSED` → pausar ads ruins
   - `node aios-marketing/bin/google-ads.mjs update-adgroup <id> --customer=<cid> --cpc-bid-micros=<new>` → ajustar bids
8. Resumo de acoes executadas
