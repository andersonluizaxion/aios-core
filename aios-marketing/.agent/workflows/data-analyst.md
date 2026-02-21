# Data Analyst Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File | Description |
|---------|-----------|-------------|
| `*analyze` | `squads/analytics-squad/tasks/performance-analysis.md` | Analise de performance |
| `*attribution` | `squads/analytics-squad/tasks/attribution-audit.md` | Auditoria de atribuicao |
| `*funnel` | `squads/analytics-squad/tasks/funnel-analysis.md` | Analise de funil |
| `*dashboard` | `squads/analytics-squad/tasks/dashboard-setup.md` | Especificacao de dashboard |
| `*cohort` | `squads/analytics-squad/tasks/cohort-analysis.md` | Analise de cohorts |
| `*benchmark` | Inline workflow | Comparar com benchmarks |
| `*forecast` | Inline workflow | Projecao de performance |
| `*tracking-check` | `squads/analytics-squad/checklists/tracking-audit.md` | Auditoria de tracking |
| `*cross-platform` | Inline workflow | Analise consolidada cross-platform |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *benchmark
1. Perguntar: setor/nicho, plataforma(s), metricas a comparar
2. Levantar benchmarks do setor (CTR, CPC, CPM, CPA, ROAS, CR por vertical)
3. Comparar metricas atuais do usuario vs benchmarks
4. Classificar cada metrica: acima, na media ou abaixo do benchmark
5. Identificar maiores gaps e priorizar otimizacoes
6. Recomendar targets realistas baseados nos benchmarks

### *forecast
1. Perguntar: metrica(s) a projetar, periodo historico, periodo de projecao, premissas
2. Coletar dados historicos da(s) metrica(s)
3. Identificar tendencias e sazonalidade nos dados
4. Aplicar modelo de projecao (linear, media movel, ou exponential smoothing)
5. Gerar cenarios: conservador, realista, otimista
6. Apresentar projecao com intervalos de confianca
7. Listar premissas e riscos da projecao

### *cross-platform
1. Perguntar: periodo, metricas de interesse
2. Pull Meta Ads: `node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=<periodo>`
3. Pull Google Ads: `node aios-marketing/bin/google-ads.mjs insights <customer_id> --date-range=<periodo>`
4. Consolidar em tabela unica:
   | Metrica | Meta Ads | Google Ads | Total |
   |---------|----------|-----------|-------|
   | Investimento | R$ X | R$ Y | R$ Z |
   | Impressoes | N | N | N |
   | Clicks | N | N | N |
   | CTR | X% | Y% | Z% |
   | CPC | R$ X | R$ Y | R$ avg |
   | Conversoes | N | N | N |
   | CPA | R$ X | R$ Y | R$ avg |
   | ROAS | X | Y | Z |
5. Identificar: melhor plataforma por metrica, tendencias, oportunidades de realocacao
6. Recomendar: distribuicao ideal de budget entre plataformas
