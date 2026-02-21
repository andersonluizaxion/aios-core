# Campaign End-to-End Workflow

```yaml
workflow:
  name: campaign-e2e
  description: Orquestracao completa de campanha do briefing ao report final
  version: 1.0.0
  stages: 8
  agents: [gestor-trafego, data-analyst, social-analyst, copywriter, designer]
  estimated_duration: 30-90 dias (dependendo do ciclo de campanha)
```

---

## Stage 1: Briefing

**Owner:** @gestor-trafego
**Command:** `*strategy`
**Duration:** 1-2 dias

### Inputs
- Objetivo de negocio do cliente
- Produto/servico a promover
- Budget disponivel (mensal e diario)

### Steps
- [ ] Definir objetivo da campanha (ROAS target, CPA target, CPL target)
- [ ] Mapear publico-alvo (demografico, interesses, comportamentos)
- [ ] Definir budget total e distribuicao por plataforma
- [ ] Estabelecer KPIs primarios e secundarios
- [ ] Definir timeline da campanha (start, checkpoints, end)
- [ ] Estruturar funil (TOFU / MOFU / BOFU)
- [ ] Documentar briefing completo

### Outputs
- Briefing de campanha preenchido (`squads/traffic-squad/templates/campaign-brief.md`)
- KPI targets definidos
- Budget aprovado

### Handoff Condition
> Briefing documentado e aprovado pelo cliente/stakeholder. Budget confirmado.

---

## Stage 2: Research

**Owners:** @data-analyst + @social-analyst
**Commands:** `*benchmark` (data-analyst), `*insta-benchmark` (social-analyst)
**Duration:** 1-3 dias

### Inputs
- Briefing aprovado do Stage 1
- Lista de concorrentes
- Historico de campanhas anteriores (se houver)

### Steps
- [ ] @data-analyst: Levantar benchmarks do setor (CPA, ROAS, CTR medios)
- [ ] @data-analyst: Analisar historico de performance do cliente (se houver)
- [ ] @social-analyst: `node aios-marketing/bin/instagram-analyzer.mjs benchmark --account=<cliente>` - presenca social
- [ ] @social-analyst: Analisar concorrentes no Instagram (formatos, frequencia, engagement)
- [ ] @social-analyst: Identificar padroes de conteudo que performam no nicho
- [ ] Consolidar findings em documento de research

### Outputs
- Benchmarks de referencia por metrica
- Analise competitiva
- Insights de conteudo/formato que performam no nicho

### Handoff Condition
> Research completo com benchmarks e insights documentados. Dados suficientes para informar criativos e estrategia de audiencia.

---

## Stage 3: Creative

**Owners:** @copywriter + @designer
**Commands:** `*ad-copy` (copywriter), `*brief` (designer)
**Duration:** 2-5 dias

### Inputs
- Briefing de campanha (Stage 1)
- Research e benchmarks (Stage 2)
- Brand voice do cliente (se disponivel em `clients/<cliente>/brand-voice.md`)

### Steps
- [ ] @copywriter: Receber briefing e research
- [ ] @copywriter: `*ad-copy` - Criar 3+ variantes de copy por posicao no funil
  - TOFU: copies de awareness/dor
  - MOFU: copies de consideracao/autoridade
  - BOFU: copies de conversao/urgencia/oferta
- [ ] @copywriter: Incluir headlines, body text, CTAs para cada variante
- [ ] @copywriter: Executar checklist `copy-review.md`
- [ ] @designer: Receber copies aprovados
- [ ] @designer: `*brief` - Criar brief de criativos com specs por plataforma
- [ ] @designer: Definir formatos (imagem, carrossel, video) por posicao no funil
- [ ] @designer: Executar checklist `creative-specs.md`
- [ ] Validar congruencia copy + criativo + landing page

### Outputs
- Copies aprovados (3+ variantes por posicao de funil)
- Brief de criativo com specs
- Assets prontos para upload

### Handoff Condition
> Copies aprovados por checklist. Brief de criativo com specs validados. Todos os assets nos formatos corretos da plataforma.

---

## Stage 4: Campaign Setup

**Owner:** @gestor-trafego
**Commands:** `*meta-criar` e/ou `*google-criar`
**Duration:** 1-2 dias

### Inputs
- Briefing aprovado (Stage 1)
- Copies e criativos finalizados (Stage 3)
- Audiencias definidas

### Steps

#### Meta Ads (se aplicavel)
- [ ] `node aios-marketing/bin/meta-ads.mjs pages <account_id>` - confirmar pagina
- [ ] `node aios-marketing/bin/meta-ads.mjs search-interests "<nicho>"` - definir interesses
- [ ] `node aios-marketing/bin/meta-ads.mjs search-locations "<local>"` - definir geo
- [ ] Criar campanha: `node aios-marketing/bin/meta-ads.mjs create-campaign --account=<id> --name=<n> --objective=<obj>`
- [ ] Criar ad sets por segmento/posicao no funil
- [ ] Upload de criativos: `node aios-marketing/bin/meta-ads.mjs upload-image <account_id> <file>`
- [ ] Criar criativos e ads
- [ ] Configurar exclusoes e frequency caps

#### Google Ads (se aplicavel)
- [ ] `node aios-marketing/bin/google-ads.mjs search-locations "<local>"` - definir geo
- [ ] Criar campanha: `node aios-marketing/bin/google-ads.mjs create-campaign --customer=<cid> --name=<n> --type=SEARCH --budget-micros=<amount>`
- [ ] Criar ad groups por tema/intencao
- [ ] Adicionar keywords com match types adequados
- [ ] Criar Responsive Search Ads (RSAs)
- [ ] Configurar negativos iniciais

### Outputs
- Campanhas criadas (status PAUSED)
- IDs de campanha, ad set, criativos documentados
- Estrutura completa pronta para review

### Handoff Condition
> Todas as campanhas criadas em status PAUSED. Estrutura revisada e documentada com IDs.

---

## Stage 5: Pre-Launch

**Owners:** @data-analyst + @gestor-trafego
**Commands:** `*tracking-check` (data-analyst)
**Duration:** 1 dia

### Inputs
- Campanhas criadas em PAUSED (Stage 4)
- URLs de landing pages
- Checklist pre-lancamento

### Steps
- [ ] @data-analyst: Verificar pixel/tags instalados e disparando
- [ ] @data-analyst: Testar eventos de conversao (PageView, Lead, Purchase)
- [ ] @data-analyst: Validar UTMs em todos os links
- [ ] @data-analyst: Confirmar integracao GA4/CRM
- [ ] @gestor-trafego: Executar checklist `campaign-launch.md` completo
- [ ] @gestor-trafego: Revisao final de estrutura (budget, audiencia, criativos)
- [ ] @gestor-trafego: Validar landing pages (mobile, velocidade, congruencia)
- [ ] Aprovacao final do cliente/stakeholder

### Outputs
- Checklist campaign-launch.md 100% preenchido
- Tracking validado e funcionando
- Aprovacao de lancamento

### Handoff Condition
> TODOS os itens do checklist campaign-launch.md marcados [x]. Tracking confirmado. Aprovacao registrada.

---

## Stage 6: Launch

**Owner:** @gestor-trafego
**Duration:** 1 dia

### Inputs
- Pre-launch checklist aprovado (Stage 5)
- Campanhas em PAUSED prontas para ativar

### Steps
- [ ] Ativar campanhas: alterar status para ACTIVE
  - Meta: `node aios-marketing/bin/meta-ads.mjs update-campaign <id> --status=ACTIVE`
  - Google: `node aios-marketing/bin/google-ads.mjs update-campaign <id> --customer=<cid> --status=ENABLED`
- [ ] Confirmar que impressoes estao chegando (primeiros 30 min)
- [ ] Confirmar que budget esta sendo gasto
- [ ] Confirmar que pixel esta disparando em producao
- [ ] Verificar que nenhum ad foi reprovado
- [ ] Definir schedule de monitoramento (dias 1-3: 3x/dia)
- [ ] Documentar hora exata de lancamento

### Outputs
- Campanhas ativas e rodando
- Primeiras metricas confirmadas
- Schedule de monitoramento definido

### Handoff Condition
> Campanhas ativas com impressoes, cliques e budget sendo gasto. Nenhum ad reprovado. Monitoramento configurado.

---

## Stage 7: Optimize

**Owner:** @gestor-trafego
**Commands:** `*meta-otimizar`, `*google-otimizar`
**Duration:** Ongoing (dias 1-7 diario, depois semanal)

### Inputs
- Campanhas ativas (Stage 6)
- KPI targets (Stage 1)
- Benchmarks (Stage 2)

### Schedule
| Periodo | Frequencia | Foco |
|---------|-----------|------|
| Dias 1-3 | 3x/dia | Verificar delivery, rejeicoes, bugs |
| Dias 4-7 | 1x/dia | Otimizacao de performance |
| Semana 2+ | 2-3x/semana | Otimizacao e scaling |
| Mensal | 1x/mes | Review estrategico |

### Steps - Daily (Dias 1-7)
- [ ] Puxar insights: `node aios-marketing/bin/meta-ads.mjs insights <id> --date-preset=yesterday --level=ad`
- [ ] Verificar metricas vs targets (ROAS, CPA, CTR)
- [ ] Identificar ads com CTR < 0.5% e impressions > 1000 -- pausar
- [ ] Identificar ad sets com Frequency > 4 -- sinalizar creative fatigue
- [ ] Identificar ad sets com CPA > 1.5x target -- reduzir budget
- [ ] Identificar winners com CPA < target -- candidatos a scaling (max 20%/dia)
- [ ] Documentar acoes tomadas

### Steps - Weekly (Semana 2+)
- [ ] Analisar tendencias de 7 dias
- [ ] Testar novos criativos/copies para combater fatigue
- [ ] Realocar budget entre plataformas/campanhas
- [ ] Revisar audiencias (expandir ou refinar)
- [ ] Atualizar negativos (Google)
- [ ] Preparar mini-report semanal

### Kill Rules
- CPA > 2x target por 5 dias consecutivos -- pausar campanha
- ROAS < 0.5x target por 7 dias -- pausar e reavaliar
- Frequency > 6 sem refresh de criativo -- pausar ad set

### Outputs
- Log de otimizacoes executadas
- Metricas atualizadas
- Alertas de performance

### Handoff Condition
> Campanha estabilizada com CPA dentro do target ou decisao de pausar/pivotar tomada. Dados suficientes para report.

---

## Stage 8: Report

**Owners:** @gestor-trafego + @data-analyst
**Commands:** `*report` (gestor-trafego), `*analyze` (data-analyst)
**Duration:** 1-2 dias

### Inputs
- Dados de performance do periodo completo
- Log de otimizacoes (Stage 7)
- KPI targets originais (Stage 1)

### Steps
- [ ] @gestor-trafego: `*report` - Compilar dados de performance
- [ ] @data-analyst: `*analyze` - Analise aprofundada cross-platform
- [ ] Comparar resultados vs targets originais
- [ ] Identificar top 3 learnings do ciclo
- [ ] Documentar o que funcionou e o que nao funcionou
- [ ] Calcular ROAS real e CAC real
- [ ] Formular recomendacoes para proximo ciclo
- [ ] Gerar report usando template `analytics-report.md`

### Outputs
- Report completo com metricas, insights e recomendacoes
- Learnings documentados
- Plano para proximo ciclo

### Handoff Condition
> Report entregue ao cliente/stakeholder. Learnings documentados. Proximo ciclo planejado.

---

## Success Criteria (End-to-End)

| Criterio | Threshold |
|----------|-----------|
| ROAS atingido | >= target definido no Stage 1 |
| CPA dentro do target | <= CPA target do Stage 1 |
| Todas as etapas documentadas | 8/8 stages com outputs |
| Checklist pre-launch completo | 100% dos itens |
| Tracking funcionando | Eventos disparando corretamente |
| Report final entregue | Com insights e next steps |

---

## Workflow Diagram

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

---
*Workflow: Campaign End-to-End v1.0 - Synkra AIOS Marketing*
