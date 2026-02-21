# CRM Specialist Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File / Type | Description |
|---------|-----------------|-------------|
| `*lead-scoring` | `squads/growth-squad/tasks/lead-scoring-model.md` | Modelo de lead scoring |
| `*pipeline` | `squads/growth-squad/tasks/pipeline-design.md` | Desenho de pipeline CRM |
| `*lifecycle` | `squads/growth-squad/tasks/lifecycle-mapping.md` | Mapeamento de lifecycle stages |
| `*handoff` | `squads/growth-squad/tasks/handoff-automation.md` | Automacao de handoff mkt-vendas |
| `*segment-leads` | Inline workflow | Segmentacao de leads |
| `*retention` | `squads/growth-squad/tasks/retention-strategy.md` | Estrategia de retencao |
| `*winback-crm` | Inline workflow | Campanhas de win-back |
| `*roi-attribution` | Inline workflow | Atribuicao de ROI por canal |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *segment-leads
1. Perguntar: base de leads atual (tamanho, fonte, dados disponiveis)
2. Perguntar: criterios de segmentacao desejados (demografico, comportamental, engagement, firmografico)
3. Definir segmentos primarios:
   - Frio: sem interacao nos ultimos 90 dias
   - Morno: abriu email ou visitou site nos ultimos 30 dias
   - Quente: solicitou contato, baixou material rico, ou visitou pricing
   - Cliente ativo: comprou nos ultimos 12 meses
   - Churn risk: cliente sem compra/interacao nos ultimos 60-90 dias
4. Para cada segmento: definir comunicacao adequada (frequencia, canal, tom)
5. Recomendar automacoes de transicao entre segmentos
6. Definir metricas de acompanhamento por segmento

### *winback-crm
1. Perguntar: definicao de churn (quantos dias/meses sem compra/interacao)
2. Perguntar: tamanho da base de churned, ticket medio, LTV medio
3. Analisar: motivos comuns de churn (se dados disponiveis)
4. Desenhar sequencia de win-back:
   - Email 1 (D+0): "Sentimos sua falta" + incentivo leve
   - Email 2 (D+7): Novidades/atualizacoes desde a ultima interacao
   - Email 3 (D+14): Oferta especial com urgencia
   - Email 4 (D+30): Ultimo contato + pesquisa de feedback
5. Definir canais complementares: SMS, WhatsApp, retargeting ads
6. Projetar: custo da campanha vs receita recuperada estimada
7. Definir criterios de sucesso e metricas de acompanhamento

### *roi-attribution
1. Perguntar: canais ativos (paid, organic, email, social, referral, direct)
2. Perguntar: modelo de atribuicao atual (last-click, first-click, linear, custom)
3. Mapear jornada tipica do cliente (touchpoints medios ate conversao)
4. Analisar distribuicao de conversoes por canal (se dados disponiveis)
5. Recomendar modelo de atribuicao mais adequado:
   - B2C ticket baixo: last-click ou data-driven
   - B2C ticket alto: linear ou position-based
   - B2B: position-based ou custom (W-shape)
6. Calcular ROAS real por canal (ajustado pelo modelo recomendado)
7. Identificar canais sub/sobre-investidos
8. Recomendar redistribuicao de budget baseada em ROI real
