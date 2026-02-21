# Cross-Squad Integration - Synkra AIOS Marketing

Este documento formaliza como todos os squads e agentes colaboram no ecossistema de marketing.

---

## 1. Squad Dependency Map

```
traffic-squad (foundation)
    |
    +-- creative-squad (depends on traffic)
    +-- analytics-squad (depends on traffic)
    |       |
    +-- social-squad (depends on analytics + creative)
    +-- email-squad (depends on traffic + analytics)
    |
    +-- content-squad (depends on analytics) [planned]
    |
    +-- growth-squad (depends on traffic + analytics + email) [planned]
```

### Descricao dos Squads

| Squad | Status | Agentes | Responsabilidade |
|-------|--------|---------|------------------|
| **traffic-squad** | Active | @gestor-trafego | Gestao de trafego pago (Meta Ads, Google Ads, YouTube Ads). Base de todo o ecossistema. |
| **creative-squad** | Active | @copywriter, @designer | Criacao de copies e criativos para campanhas. |
| **analytics-squad** | Active | @data-analyst | Analise de dados, atribuicao, funis, dashboards. |
| **social-squad** | Active | @social-analyst, @social-media-manager | Inteligencia social, Instagram analysis, gestao de redes. |
| **email-squad** | Active | @email-marketing | Email marketing, automacao, segmentacao, deliverability. |
| **content-squad** | Planned | @seo-specialist | SEO, conteudo organico, keyword research. |
| **growth-squad** | Planned | @crm-specialist | CRM, lead scoring, lifecycle marketing, growth loops. |

### Dependencias Declaradas (squad.yaml)

| Squad | Depende De |
|-------|------------|
| traffic-squad | (nenhum - foundation) |
| creative-squad | traffic-squad |
| analytics-squad | traffic-squad |
| social-squad | analytics-squad, creative-squad |
| email-squad | traffic-squad, analytics-squad |
| content-squad | analytics-squad |
| growth-squad | traffic-squad, analytics-squad, email-squad |

---

## 2. Agent Collaboration Matrix

### Todos os Agentes

| Agent | Persona | Squad | Expertise |
|-------|---------|-------|-----------|
| `@gestor-trafego` | Theo (Traffic Manager) | traffic-squad | Meta Ads, Google Ads, YouTube Ads, paid traffic |
| `@copywriter` | Cleo (Wordsmith) | creative-squad | Ad copy, LP copy, email copy, video scripts, persuasion |
| `@designer` | Pixel (Visual Strategist) | creative-squad | Creative briefs, format specs, visual strategy, compliance |
| `@data-analyst` | Nova (Decoder) | analytics-squad | Performance analysis, attribution, funnels, dashboards |
| `@social-analyst` | Saga (Oracle) | social-squad | Instagram analysis, competitive benchmarking, content patterns |
| `@social-media-manager` | Echo (Conductor) | social-squad | Content calendar, captions, community management, trends |
| `@email-marketing` | Iris (Alchemist) | email-squad | Sequences, segmentation, deliverability, nurturing, lifecycle |
| `@seo-specialist` | Atlas (Navigator) | content-squad | Keyword research, on-page SEO, content briefs, SERP analysis |
| `@crm-specialist` | Nexus (Connector) | growth-squad | Lead scoring, segmentation, lifecycle, retention, growth loops |

### Interaction Matrix

A tabela abaixo mostra as interacoes diretas entre agentes. Celulas marcadas indicam colaboracao ativa.

| | Theo | Cleo | Pixel | Nova | Saga | Echo | Iris | Atlas | Nexus |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Theo** (@gestor-trafego) | - | SEND | RECV | BOTH | RECV | - | SEND | RECV | BOTH |
| **Cleo** (@copywriter) | RECV | - | SEND | RECV | RECV | SEND | SEND | RECV | - |
| **Pixel** (@designer) | SEND | RECV | - | - | - | SEND | - | - | - |
| **Nova** (@data-analyst) | SEND | SEND | - | - | SEND | SEND | SEND | SEND | SEND |
| **Saga** (@social-analyst) | SEND | SEND | - | RECV | - | SEND | - | - | - |
| **Echo** (@social-media-manager) | - | RECV | RECV | RECV | RECV | - | - | - | - |
| **Iris** (@email-marketing) | RECV | RECV | - | RECV | - | - | - | - | BOTH |
| **Atlas** (@seo-specialist) | SEND | SEND | - | RECV | - | - | - | - | - |
| **Nexus** (@crm-specialist) | RECV | - | - | RECV | - | - | BOTH | - | - |

**Legenda:** SEND = envia dados/artefatos para o agente da coluna. RECV = recebe dados/artefatos do agente da coluna. BOTH = troca bidirecional.

### Resumo de Interacoes por Agente

- **@gestor-trafego (Theo)** -- Hub central. Envia briefs para copy/design, recebe criativos de volta, troca dados com analytics e CRM, recebe keywords de SEO.
- **@copywriter (Cleo)** -- Recebe briefs de Theo e keywords de Atlas, envia copy para Pixel e Echo, alimenta Iris com copy de email.
- **@designer (Pixel)** -- Recebe copy de Cleo, entrega specs de criativo para Theo e Echo.
- **@data-analyst (Nova)** -- Fornece insights para todos os agentes. Recebe dados brutos de todas as plataformas.
- **@social-analyst (Saga)** -- Envia padroes de conteudo para Echo, hooks para Cleo, dados de benchmark para Nova.
- **@social-media-manager (Echo)** -- Recebe inputs de Saga (padroes), Cleo (copy), Pixel (criativos), Nova (dados).
- **@email-marketing (Iris)** -- Recebe copy de Cleo, dados de Nova, troca segmentos e scoring com Nexus.
- **@seo-specialist (Atlas)** -- Envia keyword research para Cleo e content briefs, recebe dados de performance de Nova.
- **@crm-specialist (Nexus)** -- Troca dados de lead scoring com Iris, recebe insights de Nova, envia segmentos qualificados para Theo.

---

## 3. Handoff Protocols

### 3.1 Theo --> Cleo: Campaign Brief --> Ad Copy Variants

| Item | Detalhe |
|------|---------|
| **Trigger** | Nova campanha aprovada ou refresh de criativos necessario |
| **Dados Passados** | Briefing de campanha (`squads/traffic-squad/templates/campaign-brief.md`): objetivo, publico-alvo, tom de voz, plataforma, budget, KPI targets, posicao no funil (TOFU/MOFU/BOFU) |
| **Formato Esperado** | Documento markdown com briefing preenchido |
| **Receptor Faz** | Cleo gera minimo 3 variantes de copy por posicao no funil, cada uma com headline, body text e CTA. Executa checklist `copy-review.md` antes de entregar. |
| **Exemplo** | "@copywriter preciso de 3 variantes de ad copy para campanha de leads do cliente X. Brief: squads/traffic-squad/templates/campaign-brief.md preenchido. Plataformas: Meta + Google. Prazo: hoje." |

### 3.2 Cleo --> Pixel: Copy Approved --> Creative Brief with Copy

| Item | Detalhe |
|------|---------|
| **Trigger** | Copy aprovado via checklist `copy-review.md` |
| **Dados Passados** | Copies finalizados (`squads/creative-squad/templates/copy-variants.md`): headlines, body text, CTAs por variante. Informacoes de plataforma e formato desejado. |
| **Formato Esperado** | Documento com copies aprovados + indicacao de plataforma e formato |
| **Receptor Faz** | Pixel cria brief de criativo (`squads/creative-squad/templates/creative-brief.md`) com specs por plataforma, define formatos (imagem, carrossel, video), valida compliance, executa checklist `creative-specs.md`. |

### 3.3 Pixel --> Theo: Creative Specs --> Campaign Setup with Creatives

| Item | Detalhe |
|------|---------|
| **Trigger** | Brief de criativo aprovado via checklist `creative-specs.md` |
| **Dados Passados** | Brief de criativo com specs (`squads/creative-squad/templates/design-specs.md`): dimensoes, formatos, assets prontos para upload, texto overlay, compliance checklist. |
| **Formato Esperado** | Assets nos formatos corretos da plataforma + documento de specs |
| **Receptor Faz** | Theo faz upload de criativos via CLI (`node aios-marketing/bin/meta-ads.mjs upload-image`), cria campanhas completas, configura ad sets e ads com os criativos recebidos. |

### 3.4 Theo --> Nova: Campaign Data --> Performance Analysis

| Item | Detalhe |
|------|---------|
| **Trigger** | Campanha ativa com dados suficientes (minimo 3 dias) ou report agendado (semanal/mensal) |
| **Dados Passados** | IDs de campanha, conta, periodo de analise, KPI targets originais, benchmarks de referencia. |
| **Formato Esperado** | IDs + periodo + targets em formato estruturado |
| **Receptor Faz** | Nova extrai insights via CLI, analisa cross-platform, compara com benchmarks, gera report com insights acionaveis usando template `squads/analytics-squad/templates/analytics-report.md`. |

### 3.5 Nova --> Theo: Insights --> Optimization Recommendations

| Item | Detalhe |
|------|---------|
| **Trigger** | Analise de performance concluida |
| **Dados Passados** | Report de performance com metricas, tendencias, comparacao vs targets, insights acionaveis, recomendacoes priorizadas (pausar/escalar/ajustar). |
| **Formato Esperado** | Report markdown com tabelas de metricas e lista de recomendacoes priorizadas |
| **Receptor Faz** | Theo executa otimizacoes recomendadas via CLI (`*meta-otimizar`, `*google-otimizar`), documenta acoes tomadas, reporta resultados. |

### 3.6 Saga --> Echo: Content Patterns --> Content Calendar

| Item | Detalhe |
|------|---------|
| **Trigger** | Analise de Instagram concluida (`*insta-strategy`) ou planejamento mensal |
| **Dados Passados** | Padroes de conteudo identificados: melhores formatos, horarios, mix ideal (50/30/20), temas que performam, ER% por tipo, frequencia recomendada. |
| **Formato Esperado** | Report de analise com dados quantitativos e recomendacoes |
| **Receptor Faz** | Echo cria calendario editorial (`*calendar`) com distribuicao de formatos conforme mix recomendado, programa publicacoes nos melhores horarios, adapta conteudo cross-platform. |

### 3.7 Saga --> Cleo: Top Hooks --> Copy Inspiration

| Item | Detalhe |
|------|---------|
| **Trigger** | Analise de top posts ou benchmark competitivo |
| **Dados Passados** | Top hooks que funcionam no nicho (primeiras linhas de captions com alto ER%), padroes de CTA eficazes, temas que geram engagement, insights de conteudo dos competidores. |
| **Formato Esperado** | Lista de hooks com ER% associado + padroes identificados |
| **Receptor Faz** | Cleo usa hooks como inspiracao para novos copies (ad copy e captions). Adapta linguagem ao tom da marca. NAO copia -- apenas identifica padroes. |

### 3.8 Iris --> Nexus: Email Engagement Data --> Lead Scoring Updates

| Item | Detalhe |
|------|---------|
| **Trigger** | Ciclo de nurturing completo ou analise periodica de engagement |
| **Dados Passados** | Metricas de email por lead: open rate, click rate, links clicados, downloads, tempo de leitura, respostas. Score de engajamento acumulado. |
| **Formato Esperado** | Lista de leads com scores de engagement + eventos relevantes |
| **Receptor Faz** | Nexus atualiza lead scoring no CRM, reclassifica leads (MQL/SQL), identifica leads prontos para sales handoff, atualiza segmentos. |

### 3.9 Nexus --> Iris: Qualified Segments --> Targeted Sequences

| Item | Detalhe |
|------|---------|
| **Trigger** | Novos segmentos qualificados ou mudanca nos criterios de scoring |
| **Dados Passados** | Segmentos de leads qualificados: criterios de segmentacao, tamanho do segmento, estagio no funil, historico de interacoes, score atual. |
| **Formato Esperado** | Definicao de segmento com criterios + lista de leads ou regras de filtro |
| **Receptor Faz** | Iris cria sequencias de email direcionadas por segmento (nurturing para MQLs, re-engagement para inativos, upsell para clientes). Personaliza conteudo e timing por segmento. |

### 3.10 Atlas --> Cleo: Keyword Research --> Content Briefs

| Item | Detalhe |
|------|---------|
| **Trigger** | Pesquisa de keywords concluida ou planejamento de conteudo organico |
| **Dados Passados** | Keyword research: keywords primarias e secundarias, volume de busca, dificuldade, intencao (informacional/transacional/navegacional), SERP analysis, content gaps. |
| **Formato Esperado** | Documento de keyword research com clusters tematicos + content briefs |
| **Receptor Faz** | Cleo escreve conteudo otimizado para SEO: blog posts, landing page copy, FAQs. Integra keywords naturalmente no texto. Segue as diretrizes de intencao de busca. |

---

## 4. Shared Artifacts

### Artefatos que Trafegam entre Squads

| Artefato | Criado Por | Consumido Por | Localizacao |
|----------|------------|---------------|-------------|
| **campaign-brief** | traffic-squad (@gestor-trafego) | creative-squad (@copywriter, @designer) | `squads/traffic-squad/templates/campaign-brief.md` |
| **copy-variants** | creative-squad (@copywriter) | traffic-squad (@gestor-trafego), social-squad (@echo) | `squads/creative-squad/templates/copy-variants.md` |
| **creative-brief** | creative-squad (@designer) | traffic-squad (@gestor-trafego) | `squads/creative-squad/templates/creative-brief.md` |
| **design-specs** | creative-squad (@designer) | traffic-squad (@gestor-trafego) | `squads/creative-squad/templates/design-specs.md` |
| **analytics-report** | analytics-squad (@data-analyst) | all squads | `squads/analytics-squad/templates/analytics-report.md` |
| **dashboard-spec** | analytics-squad (@data-analyst) | all squads | `squads/analytics-squad/templates/dashboard-spec.md` |
| **instagram-report** | social-squad (@social-analyst) | creative-squad, traffic-squad | `squads/social-squad/templates/instagram-report.md` |
| **benchmark-report** | social-squad (@social-analyst) | all squads | `squads/social-squad/templates/benchmark-report.md` |
| **content-calendar** | social-squad (@social-media-manager) | creative-squad | (social-squad tasks) |
| **email-sequence-plan** | email-squad (@email-marketing) | growth-squad (@crm-specialist) | `squads/email-squad/templates/email-sequence-plan.md` |
| **segmentation-map** | email-squad (@email-marketing) | growth-squad (@crm-specialist) | `squads/email-squad/templates/segmentation-map.md` |
| **drip-campaign-spec** | email-squad (@email-marketing) | creative-squad (@copywriter) | `squads/email-squad/templates/drip-campaign-spec.md` |
| **client-profile** | traffic-squad (onboarding) | all squads | `clients/<cliente>/profile.yaml` |
| **benchmark-data** | analytics-squad + social-squad | all squads | `squads/*/data/` directories |
| **weekly-report** | traffic-squad (@gestor-trafego) | analytics-squad | `squads/traffic-squad/templates/weekly-report.md` |

### Data Directories

| Diretorio | Squad | Conteudo |
|-----------|-------|----------|
| `squads/traffic-squad/data/` | traffic-squad | Benchmarks por vertical, naming conventions |
| `squads/creative-squad/data/` | creative-squad | Hook library, CTA library |
| `squads/analytics-squad/data/` | analytics-squad | Dados de performance, dashboards |
| `squads/social-squad/data/` | social-squad | Dados de Instagram, benchmarks sociais |
| `squads/email-squad/data/` | email-squad | Templates de email, metricas de deliverability |
| `clients/` | cross-squad | Perfil, benchmarks, historico por cliente |

---

## 5. Cross-Squad Workflows

Os workflows em `workflows/` orquestram colaboracao entre multiplos squads.

### Workflows Ativos

| Workflow | Arquivo | Squads Envolvidos | Duracao Estimada |
|----------|---------|-------------------|------------------|
| **Campaign E2E** | `workflows/campaign-e2e.md` | traffic, creative, analytics, social | 30-90 dias |
| **Client Onboarding** | `workflows/client-onboarding.md` | traffic, analytics, social | 5-10 dias |
| **A/B Testing Cycle** | `workflows/ab-testing-cycle.md` | creative, traffic, analytics | 14-30 dias por ciclo |
| **Retargeting Setup** | `workflows/retargeting-setup.md` | traffic, creative, analytics | 3-5 dias |

### Workflows Planejados

| Workflow | Arquivo | Squads Envolvidos | Descricao |
|----------|---------|-------------------|-----------|
| **Monthly Report** | `workflows/monthly-report.md` | traffic, analytics, social, email | Consolidacao mensal de performance cross-platform |
| **Competitor Monitoring** | `workflows/competitor-monitoring.md` | social, analytics, creative | Monitoramento continuo de concorrentes e reacao |

### Workflow: Campaign E2E (8 Stages)

```
Stage 1          Stage 2              Stage 3            Stage 4
BRIEFING  -----> RESEARCH  ---------> CREATIVE --------> SETUP
@trafego         @data + @social      @copy + @design    @trafego
                                                            |
                                                            v
Stage 8          Stage 7              Stage 6            Stage 5
REPORT  <------- OPTIMIZE <---------- LAUNCH <---------- PRE-LAUNCH
@trafego         @trafego             @trafego           @data + @trafego
+ @data          (ongoing)
```

### Workflow: Client Onboarding (7 Steps)

```
Step 1           Step 2           Step 3           Step 4
ACCESS  -------> TRACKING ------> AUDIT  --------> SOCIAL
@trafego         @data            @trafego         @social
                                                      |
                                                      v
Step 7           Step 6           Step 5
SETUP   <------- STRATEGY <------ BASELINE
@trafego         @trafego+@data   @data
```

### Workflow: A/B Testing Cycle (6 Steps)

```
Step 1           Step 2           Step 3           Step 4
HYPOTHESIS ----> SPLIT TEST ----> SAMPLE SIZE ---> ANALYZE
@copywriter      @trafego         @data+@trafego   @data
                                                      |
                                                      v
Step 6           Step 5
NEXT TEST <----- IMPLEMENT
@copy+@data      @trafego+@copy
```

---

## 6. Communication Protocol

### Como Agentes Solicitam Trabalho de Outros Agentes

Toda solicitacao entre agentes deve seguir este formato:

```
@{agent-name} preciso de {o que voce precisa}.
- Contexto: {breve contexto da demanda}
- Formato: {formato esperado do entregavel}
- Prazo: {quando precisa}
- Referencia: {link para brief/dados relevantes}
```

### Exemplos de Solicitacao

**Theo solicitando copy para Cleo:**
```
@copywriter preciso de 3 variantes de ad copy para campanha de leads do cliente X.
- Contexto: Campanha TOFU para cirurgiao plastico, Meta Ads, publico mulheres 30-55
- Formato: Headlines (max 40 chars) + body (125 chars) + CTA para cada variante
- Prazo: hoje
- Referencia: squads/traffic-squad/templates/campaign-brief.md (preenchido para cliente X)
```

**Cleo solicitando criativo para Pixel:**
```
@designer preciso de brief de criativo para 3 variantes de ad aprovadas.
- Contexto: Copies aprovados para campanha TOFU, formatos: Feed (1:1) + Stories (9:16)
- Formato: Brief de criativo com specs por plataforma + compliance check
- Prazo: amanha
- Referencia: squads/creative-squad/templates/copy-variants.md (preenchido)
```

**Theo solicitando analise para Nova:**
```
@data-analyst preciso de analise de performance dos ultimos 30 dias.
- Contexto: Campanha de leads rodando ha 45 dias, CPA subindo
- Formato: Report com metricas, tendencias, e 5 recomendacoes acionaveis
- Prazo: fim do dia
- Referencia: Meta Account ID: act_12345, Google CID: 9876543210
```

**Saga solicitando copy para Cleo:**
```
@copywriter identifiquei 5 hooks que geram alto ER% no nicho de estetica.
- Contexto: Benchmark de 3 concorrentes mostrou padrao de perguntas diretas no hook
- Formato: Adaptar hooks para tom da marca, gerar 3 captions por hook
- Prazo: 2 dias
- Referencia: squads/social-squad/templates/benchmark-report.md (cliente X)
```

**Iris solicitando segmentos para Nexus:**
```
@crm-specialist preciso dos segmentos atualizados de leads qualificados.
- Contexto: Lancando sequencia de nurturing para MQLs dos ultimos 30 dias
- Formato: Criterios de segmentacao + regras de filtro no CRM
- Prazo: inicio da semana
- Referencia: Campanha de leads ativa desde DD/MM
```

### Regras de Comunicacao

1. **Sempre mencionar o agente destino** com @agent-name no inicio
2. **Incluir contexto suficiente** para o agente receptor executar sem ambiguidade
3. **Especificar formato do entregavel** para evitar retrabalho
4. **Referenciar artefatos existentes** quando aplicavel (briefs, reports, templates)
5. **Respeitar a cadeia de handoffs** -- nao pular etapas do workflow

### Regras de Prioridade

| Prioridade | Criterio | Prazo |
|------------|----------|-------|
| Urgente | Campanha ativa com problema (CPA >2x, ad reprovado) | Mesmo dia |
| Alta | Setup de campanha nova, report agendado | 1-2 dias |
| Normal | Refresh de criativos, analise periodica | 3-5 dias |
| Baixa | Planejamento estrategico, pesquisa | 1-2 semanas |

---

## 7. CLI Tools Cross-Reference

### Quais Agentes Usam Quais CLIs

| CLI | Arquivo | Agentes que Usam | Operacoes |
|-----|---------|-------------------|-----------|
| **meta-ads.mjs** | `bin/meta-ads.mjs` | @gestor-trafego (primario), @data-analyst (leitura) | Campanhas, insights, criativos, audiencias |
| **google-ads.mjs** | `bin/google-ads.mjs` | @gestor-trafego (primario), @data-analyst (leitura) | Campanhas, keywords, insights, search terms |
| **instagram-analyzer.mjs** | `bin/instagram-analyzer.mjs` | @social-analyst (primario), @gestor-trafego (leitura) | Account analysis, top posts, benchmarks |

### CLIs Planejados

| CLI | Agentes | Operacoes |
|-----|---------|-----------|
| **campaign-monitor** | @data-analyst, @gestor-trafego | Monitoramento automatico cross-platform |
| **whatsapp-business** | @crm-specialist | Mensagens, templates, automacoes |
| **ga4-analytics** | @data-analyst | Eventos, audiencias, reports |
| **search-console** | @seo-specialist | Keywords, indexacao, performance |
| **tiktok-analyzer** | @social-analyst | Analise de contas TikTok |
| **linkedin-analyzer** | @social-analyst | Analise de paginas LinkedIn |
| **ad-library** | @social-analyst, @copywriter | Pesquisa de anuncios de concorrentes |

---

## 8. Checklists Cross-Squad

### Checklists por Squad

| Squad | Checklist | Usado Em |
|-------|-----------|----------|
| traffic-squad | `campaign-launch.md` | Pre-lancamento de campanha (Stage 5 do E2E) |
| creative-squad | `copy-review.md` | Antes de entregar copy para designer ou trafego |
| creative-squad | `creative-specs.md` | Antes de entregar criativos para trafego |
| analytics-squad | `tracking-audit.md` | Onboarding e pre-lancamento |
| social-squad | `instagram-analysis.md` | Antes de entregar report de Instagram |
| email-squad | `email-launch.md` | Antes de ativar sequencia de email |
| email-squad | `deliverability-check.md` | Antes de enviar para lista grande |

### Checklists Cross-Squad

Alguns checklists sao executados por multiplos agentes em sequencia:

1. **Pre-Launch (campaign-e2e Stage 5):**
   - @data-analyst executa `tracking-audit.md` (tracking ok?)
   - @gestor-trafego executa `campaign-launch.md` (campanha ok?)
   - Ambos devem passar antes de ativar

2. **Creative Handoff (campaign-e2e Stage 3):**
   - @copywriter executa `copy-review.md` (copy ok?)
   - @designer executa `creative-specs.md` (specs ok?)
   - Ambos devem passar antes de setup

---

*Cross-Squad Integration v1.0 - Synkra AIOS Marketing*
*Ultima atualizacao: 2026-02-20*
