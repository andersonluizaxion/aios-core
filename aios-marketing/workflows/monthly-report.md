# Monthly Report Workflow

```yaml
workflow:
  name: monthly-report
  description: Relatorio mensal consolidado de performance cross-platform
  version: 1.0.0
  agents: [gestor-trafego, data-analyst, social-analyst]
  estimated_duration: 2-3 dias
  schedule: Ultimos 3 dias uteis de cada mes
```

---

## Overview

Relatorio mensal consolidado com dados de todas as plataformas (Meta Ads, Google Ads, Instagram), analise de performance, insights acionaveis, e plano para o proximo mes. Gera output em markdown e PDF.

---

## Step 1: Pull Meta Ads Data

**Owner:** @gestor-trafego
**Duration:** 0.5 dia

### Commands
```bash
# Performance geral da conta no mes
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --level=account

# Performance por campanha
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --level=campaign

# Performance por ad set
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --level=adset

# Performance por ad (criativos)
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --level=ad

# Breakdowns uteis
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --breakdowns=age,gender
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --breakdowns=device_platform
node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=this_month --breakdowns=publisher_platform
```

### Steps
- [ ] Extrair metricas de conta: Spend, Impressions, Clicks, CTR, CPC, CPM, Conversions, CPA, ROAS, Revenue
- [ ] Extrair performance por campanha (ranking)
- [ ] Extrair performance por criativo (top e bottom performers)
- [ ] Extrair breakdowns: idade, genero, device, placement
- [ ] Comparar com mes anterior (delta %)
- [ ] Salvar dados brutos para analise

---

## Step 2: Pull Google Ads Data

**Owner:** @gestor-trafego
**Duration:** 0.5 dia

### Commands
```bash
# Performance geral da conta no mes
node aios-marketing/bin/google-ads.mjs insights <customer_id> --level=campaign --date-range=THIS_MONTH

# Performance por ad group
node aios-marketing/bin/google-ads.mjs insights <customer_id> --level=adgroup --date-range=THIS_MONTH

# Quality Scores
node aios-marketing/bin/google-ads.mjs keyword-performance <adgroup_id> --customer=<cid>

# Search terms (para identificar oportunidades e negativos)
node aios-marketing/bin/google-ads.mjs search-terms <campaign_id> --customer=<cid>
```

### Steps
- [ ] Extrair metricas de conta: Spend, Impressions, Clicks, CTR, CPC, Conversions, CPA, ROAS
- [ ] Extrair performance por campanha (ranking)
- [ ] Extrair Quality Scores por keyword
- [ ] Extrair search terms report (oportunidades + negativos)
- [ ] Comparar com mes anterior (delta %)
- [ ] Salvar dados brutos para analise

---

## Step 3: Pull Instagram Data

**Owner:** @social-analyst
**Duration:** 0.5 dia

### Commands
```bash
# Perfil completo com metricas
node aios-marketing/bin/instagram-analyzer.mjs account --account=<username>

# Top posts do periodo
node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=<username>

# Frequencia de posting
node aios-marketing/bin/instagram-analyzer.mjs posting-frequency --account=<username>

# Performance por formato
node aios-marketing/bin/instagram-analyzer.mjs format-analysis --account=<username>

# Performance de hashtags
node aios-marketing/bin/instagram-analyzer.mjs hashtag-performance --account=<username>
```

### Steps
- [ ] Extrair metricas de perfil: Followers, ER%, Reach, Impressions
- [ ] Levantar crescimento de followers no mes (delta)
- [ ] Identificar top 5 posts do mes (por engagement)
- [ ] Analisar mix de formatos (Reels vs Carrossel vs Imagem)
- [ ] Analisar frequencia real vs recomendada
- [ ] Levantar hashtags que melhor performaram
- [ ] Comparar com mes anterior

---

## Step 4: Consolidated Analysis

**Owner:** @data-analyst
**Command:** `*analyze`
**Duration:** 1 dia

### Steps
- [ ] Consolidar dados de todas as plataformas em visao unica
- [ ] Calcular metricas agregadas:
  | Metrica | Meta Ads | Google Ads | Total | vs Mes Anterior | vs Target |
  |---------|----------|------------|-------|-----------------|-----------|
  | Spend | R$ | R$ | R$ | % | % |
  | Revenue | R$ | R$ | R$ | % | % |
  | ROAS | | | | % | % |
  | Conversoes | | | | % | % |
  | CPA | R$ | R$ | R$ | % | % |
  | CTR | % | % | % | pp | pp |
  | CPC | R$ | R$ | R$ | % | % |

- [ ] Analisar performance por plataforma (qual contribui mais)
- [ ] Rankear campanhas por ROAS/CPA
- [ ] Identificar top 5 campanhas e bottom 5 campanhas
- [ ] Analisar tendencias (3 meses: melhorando/piorando/estavel)
- [ ] Identificar creative fatigue (ads com frequency alta + CTR caindo)
- [ ] Avaliar eficiencia de budget allocation entre plataformas
- [ ] Formular top 3 insights com evidencia de dados
- [ ] Definir quick wins para proximo mes
- [ ] Definir recomendacoes estrategicas de medio prazo

---

## Step 5: Compile Executive Report

**Owner:** @data-analyst + @gestor-trafego
**Duration:** 0.5 dia

### Report Structure

Usar template `squads/analytics-squad/templates/analytics-report.md` como base.

### Sections Obrigatorias

1. **Executive Summary** (3-5 bullet points)
   - Resultado principal do mes
   - Melhor performance
   - Maior preocupacao
   - Oportunidade identificada
   - Proxima acao prioritaria

2. **Key Metrics Overview** (tabela com atual vs anterior vs target)

3. **Platform Breakdown** (sub-secao por plataforma)
   - Meta Ads: metricas + top campaigns + insights
   - Google Ads: metricas + top campaigns + quality scores + insights
   - Instagram: followers + ER% + top posts + formato analysis

4. **Top/Bottom Performers** (campanhas rankadas com analise)

5. **Creative Performance** (quais criativos/copies performaram)

6. **Audience Insights** (quais segmentos, devices, faixas etarias)

7. **Learnings** (top 3 aprendizados do mes)

8. **Next Month Plan**
   - Budget recomendado (por plataforma)
   - Testes A/B planejados
   - Novas campanhas a lancar
   - Otimizacoes planejadas
   - Riscos e pontos de atencao

9. **Appendix** (dados brutos em tabelas)

---

## Step 6: Generate Output

**Owner:** @data-analyst
**Duration:** 0.5 dia

### Steps
- [ ] Gerar report em markdown: `docs/reports/<cliente>-monthly-YYYY-MM.md`
- [ ] Revisar formatacao e dados
- [ ] Gerar PDF a partir do markdown (se necessario)
- [ ] Salvar em `docs/reports/`
- [ ] Atualizar `clients/<cliente>/benchmarks.yaml` com dados do mes

### Output Files
```
docs/reports/
  <cliente>-monthly-2026-02.md    # Report completo em markdown
  <cliente>-monthly-2026-02.pdf   # Report em PDF (opcional)
```

---

## Monthly Report Calendar

| Dia | Atividade | Owner |
|-----|-----------|-------|
| D-3 | Pull Meta Ads data | @gestor-trafego |
| D-3 | Pull Google Ads data | @gestor-trafego |
| D-3 | Pull Instagram data | @social-analyst |
| D-2 | Consolidated analysis | @data-analyst |
| D-1 | Compile report + review | @data-analyst + @gestor-trafego |
| D-0 | Entregar ao cliente | @gestor-trafego |

(D = ultimo dia util do mes)

---

## Report Quality Checklist

- [ ] Todos os numeros conferidos (spend real vs reportado)
- [ ] Comparacoes com mes anterior incluidas
- [ ] Comparacoes com targets incluidas
- [ ] Pelo menos 3 insights acionaveis
- [ ] Next steps com responsaveis e prazos
- [ ] Linguagem adequada ao publico (executivo vs tecnico)
- [ ] Tabelas e dados formatados corretamente
- [ ] Nenhum dado sensivel exposto (tokens, IDs internos)

---
*Workflow: Monthly Report v1.0 - Synkra AIOS Marketing*
