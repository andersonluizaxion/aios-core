# Audit Report - Meta Ads - Dr. Leandro Gontijo

**Conta:** Leandro Gontijo [Principal] (`act_178997036529031`)
**Data da Auditoria:** 20/02/2026
**Auditor:** Gestor de Trafego

---

## 1. Estrutura de Campanhas

### Campanhas Ativas (19 total)

| # | Campanha | Objetivo | Budget Diario | Tipo | Criada em |
|---|----------|----------|---------------|------|-----------|
| 1 | [TOFU] [SEGUIDORES] [BH] 10/12/025 | TRAFFIC | R$ 27 | ABO | 10/12/2025 |
| 2 | [TOFU] [SEGUIDORES] [BH] 10/12/025 | TRAFFIC | R$ 20 | ABO | 10/12/2025 |
| 3 | [TOFU] [SEGUIDORES] [BR] 14/11 \| 01 | TRAFFIC | R$ 137 | ABO | 14/11/2025 |
| 4 | [TOFU] [SEGUIDORES] [BR] 14/11 \| 02 | TRAFFIC | R$ 137 | ABO | 14/11/2025 |
| 5 | R$ 55,00 [BoFu] [VENDAS] [RESPONDI] [ABO] | SALES | ABO por ad set | ABO | 25/09/2025 |
| 6 | [TOFU] [SEGUIDORES] [BR] 11/09 | TRAFFIC | R$ 137 | ABO | 11/09/2025 |
| 7 | [TOFU] [SEGUIDORES] [SP] 11/09 | TRAFFIC | R$ 137 | ABO | 11/09/2025 |
| 8 | [TOFU] [SEGUIDORES] [BH] 11/09 | TRAFFIC | R$ 137 | ABO | 11/09/2025 |
| 9 | R$ 55,00 [BoFu] [VENDAS] [MENSAGENS] [WPP] [ABO] | SALES | ABO por ad set | ABO | 14/08/2025 |
| 10 | R$ 50,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #PAISES | ENGAGEMENT | ABO por ad set | ABO | 14/08/2025 |
| 11 | R$ 30,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #ESCALA #CIDADES | ENGAGEMENT | ABO por ad set | ABO | 14/08/2025 |
| 12 | [BoFu] [VENDAS] [MENSAGENS] [WPP] [CBO] #ESCALA 20/11 - Copia | SALES | R$ 160 | CBO | 14/08/2025 |
| 13 | R$ 95,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] | ENGAGEMENT | ABO por ad set | ABO | 14/08/2025 |
| 14 | R$ 116,67 [TOFU] [ROBUSTA] [LOL] [UFs] | TRAFFIC | ABO por ad set | ABO | 02/07/2025 |
| 15 | R$ 60,00 [Mofu] [RECONHECIMENTO DE MARCA] [VIDEO VIEW] | AWARENESS | ABO por ad set | ABO | 04/06/2025 |
| 16 | R$ 95,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #ESCALA #UF | ENGAGEMENT | ABO por ad set | ABO | 10/12/2024 |
| 17 | [BoFu] [VENDAS] [MENSAGENS] [WPP] [CBO] #ESCALA 20/11 - Copia | SALES | R$ 160 | CBO | 08/12/2024 |
| 18 | R$ 50,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #ESCALA #PAISES | ENGAGEMENT | ABO por ad set | ABO | 18/11/2024 |
| 19 | R$ 55,00 [BoFu] [VENDAS] [MENSAGENS] [WPP] [ABO] | SALES | ABO por ad set | ABO | 07/04/2024 |

### Distribuicao por Funil

| Etapa | Qtd Campanhas | Objetivos |
|-------|---------------|-----------|
| **TOFU** | 7 | TRAFFIC (seguidores) |
| **MOFU** | 1 | AWARENESS (video views) |
| **BOFU** | 11 | SALES + ENGAGEMENT (mensagens WPP) |

### Problemas Estruturais Identificados

1. **Campanhas duplicadas:** Duas campanhas "[TOFU] [SEGUIDORES] [BH] 10/12/025" com budgets diferentes (R$27 e R$20) — provavel sobreposicao de audiencia
2. **Nomenclatura inconsistente:** Mix de formatos — algumas com valor no nome (`R$ 55,00 [BoFu]...`), outras sem; sufixos "Copia - Copia"
3. **Campanhas antigas sem refresh:** Campanha de abril/2024 ainda ativa (10+ meses)
4. **Mix ABO/CBO sem estrategia clara:** 2 campanhas CBO (R$160/dia cada) + 17 ABO

---

## 2. Performance Geral

### Metricas de Conta - Ultimos 30 Dias

| Metrica | Valor | Benchmark Saude | Status |
|---------|-------|-----------------|--------|
| **Spend Total** | R$ 51.272 | - | - |
| **Impressoes** | 5.655.234 | - | - |
| **Cliques** | 135.756 | - | - |
| **CTR** | 2,40% | > 1,5% | OK |
| **CPC** | R$ 0,38 | < R$ 1,00 | OK |
| **CPM** | R$ 9,07 | < R$ 15 | OK |
| **Reach** | 2.411.356 | - | - |
| **Frequencia** | 2,35 | < 3,0 | ATENCAO |
| **Mensagens Iniciadas** | 6.902 | - | - |
| **Custo/Mensagem** | R$ 7,43 | < R$ 10 | OK (media) |
| **First Reply** | 6.296 | - | - |
| **Custo/First Reply** | R$ 8,14 | - | - |
| **Video Views** | 1.044.778 | - | BOM |
| **Conversoes Respondi** | 582 | - | - |
| **CPA Respondi** | R$ 88,10 | depende ticket | AVALIAR |
| **Link Clicks** | 117.584 | - | - |

### Distribuicao de Spend por Funil (30 dias)

| Funil | Spend Estimado | % | Resultado Principal |
|-------|---------------|---|---------------------|
| BOFU Mensagens | ~R$ 34.000 | 66% | 6.902 msgs, R$4,93/msg |
| TOFU Seguidores | ~R$ 13.500 | 26% | CTR 3,3%, CPC R$0,25 |
| MOFU Video/Brand | ~R$ 1.800 | 4% | 1M+ video views |
| BOFU Respondi | ~R$ 1.972 | 4% | 582 conversoes |

---

## 3. Performance por Campanha - Ultimos 7 Dias

### BOFU - Campanhas de Mensagens (Top Performers)

| Campanha | Spend | Msgs | Cost/Msg | CTR | Freq |
|----------|-------|------|----------|-----|------|
| BOFU Engaj WPP R$30 BH | R$ 382 | 152 | **R$ 2,52** | 2,42% | 1,41 |
| BOFU Engaj WPP R$95 (set) | R$ 662 | 236 | **R$ 2,81** | 2,44% | 1,32 |
| BOFU Engaj WPP R$50 Escala | R$ 213 | 76 | **R$ 2,81** | 2,12% | 1,22 |
| BOFU Vendas WPP CBO Escala | R$ 1.125 | 351 | R$ 3,20 | 2,44% | 1,43 |
| BOFU Engaj WPP R$95 Escala UF | R$ 1.124 | 318 | R$ 3,54 | 2,48% | 1,44 |
| BOFU Vendas WPP R$55 ABO | R$ 352 | 101 | R$ 3,48 | 1,87% | 1,33 |
| BOFU Engaj WPP R$50 Paises | R$ 392 | 127 | R$ 3,08 | 2,32% | 1,46 |
| BOFU Vendas WPP CBO Escala (copia) | R$ 667 | 212 | R$ 3,14 | 2,34% | 1,30 |

### BOFU - Underperformers

| Campanha | Spend | Msgs | Cost/Msg | Problema |
|----------|-------|------|----------|----------|
| BOFU Vendas WPP ABO R$55 (antiga) | R$ 417 | 5 | **R$ 83,43** | Freq 4,76 / CTR 0,30% |

### TOFU - Campanhas de Seguidores

| Campanha | Spend | CTR | CPC | Link Clicks |
|----------|-------|-----|-----|-------------|
| TOFU ROBUSTA LOL UFs | R$ 967 | 4,29% | R$ 0,23 | 4.347 |
| TOFU Seguidores BR 11/09 | R$ 965 | 4,05% | R$ 0,22 | 4.491 |
| TOFU Seguidores SP 11/09 | R$ 949 | 4,17% | R$ 0,27 | 3.736 |
| TOFU Seguidores BH 11/09 | R$ 824 | 3,06% | R$ 0,23 | 3.688 |
| TOFU Seguidores BR 14/11 \| 01 | R$ 967 | 3,63% | R$ 0,24 | 4.185 |
| TOFU Seguidores BR 14/11 \| 02 | R$ 963 | 4,29% | R$ 0,23 | 4.347 |
| TOFU Seguidores BH 10/12 (1) | R$ 141 | 1,61% | R$ 0,44 | 327 |
| TOFU Seguidores BH 10/12 (2) | R$ 190 | 1,52% | R$ 0,42 | 460 |

### MOFU - Reconhecimento de Marca

| Campanha | Spend | Video Views | CPM | CTR |
|----------|-------|-------------|-----|-----|
| MOFU Video View R$60 | R$ 386 | alto volume | R$ 1,31 | 3,94% |

---

## 4. Analise Completa de Criativos - Ultimos 3 Dias

**Periodo:** 17-19/02/2026
**Total de ads ativos:** 100 (59 com spend >= R$5)
**Spend total 3 dias:** R$ 3.959
**Total de mensagens:** 732

### 4.1 Ranking Geral - Todos os Criativos com Spend >= R$5

#### BOFU - CBO Vendas WPP #CAMPANHA ESCALA (Copia)
**Campaign:** [BoFu] [VENDAS] [MENSAGENS] [WPP] [CBO] #CAMPANHA ESCALA - 20/11 - Copia
**Ad Set:** [ENGAJAMENTO + SEGUIDORES] 365 #BRASIL

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD01]** | 120229110377730461 | R$ 296,23 | 21.116 | 2,54% | R$ 0,55 | **95** | R$ 3,12 | 202 | 3 | 4 |
| **[AD02]** | 120212474556250461 | R$ 283,53 | 20.823 | 2,20% | R$ 0,62 | **85** | R$ 3,34 | 150 | 4 | 3 |
| [AD01] | 120212474556280461 | R$ 123,05 | 8.388 | 2,34% | R$ 0,63 | 32 | R$ 3,85 | 93 | 1 | 1 |
| [AD03] | 120229110377710461 | R$ 114,31 | 7.940 | 2,59% | R$ 0,55 | 30 | R$ 3,81 | 53 | 3 | 6 |
| [AD03] | 120212474556230461 | R$ 53,10 | 3.494 | 2,63% | R$ 0,58 | 18 | R$ 2,95 | 15 | 0 | 4 |
| [AD02] | 120229110377770461 | R$ 52,51 | 3.801 | 2,16% | R$ 0,64 | 15 | R$ 3,50 | 31 | 1 | 4 |

**Ad Set:** [ENGAJAMENTO + SEGUIDORES] 365 #BH - Copia

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg |
|----|----|-------|-----|-----|-----|------|----------|
| [AD03] | 120212474556320461 | R$ 9,12 | 763 | 2,62% | R$ 0,46 | 0 | - |
| [AD03] | 120229110377790461 | R$ 6,04 | 345 | 1,74% | R$ 1,01 | 1 | R$ 6,04 |

**Analise:** A campanha CBO Escala e o maior investimento BOFU. [AD01] e [AD02] no ad set Brasil sao os cavalos de batalha — alto volume (95 e 85 msgs) com custo aceitavel (R$3,12-3,34). O ad set BH Copia recebe pouco budget e entrega pouco — considerar pausar ou consolidar.

---

#### BOFU - Engajamento WPP ABO R$95 #CAMPANHA ESCALA #UF
**Campaign:** R$ 95,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #CAMPANHA ESCALA #UF

**Ad Set:** [ENGAJAMENTO 365D] [UF] [MINAS GERAIS]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD03]** | 120212530056610461 | R$ 130,05 | 9.089 | 2,13% | R$ 0,67 | **43** | R$ 3,02 | 38 | 3 | 2 |

**Ad Set:** [ENGAJAMENTO 365D] [UF] [SAO PAULO]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| [AD02] | 120212530056660461 | R$ 91,42 | 5.251 | 1,92% | R$ 0,91 | 26 | R$ 3,52 | 27 | 4 | 3 |
| [AD03] | 120212530056640461 | R$ 53,14 | 2.718 | 2,91% | R$ 0,67 | 21 | **R$ 2,53** | 12 | 1 | 2 |

---

#### BOFU - Engajamento WPP ABO R$95
**Campaign:** R$ 95,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO]

**Ad Set:** [ENGAJAMENTO 365D] [UF] [MINAS GERAIS]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD02]** | 120229110337880461 | R$ 127,24 | 10.095 | 1,96% | R$ 0,64 | **50** | **R$ 2,54** | 33 | 3 | 0 |

**Ad Set:** [ENGAJAMENTO 365D] [UF] [SAO PAULO]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| [AD03] | 120229110337930461 | R$ 94,71 | 4.855 | 2,70% | R$ 0,72 | 26 | R$ 3,64 | 27 | 0 | 5 |
| [AD02] | 120229110337910461 | R$ 48,76 | 2.980 | 1,98% | R$ 0,83 | 17 | R$ 2,87 | 13 | 1 | 1 |

**Analise:** [AD02] em MG e destaque absoluto — 50 msgs a R$2,54 com alto volume. [AD03] em SP tambem performa bem com CTR de 2,70%.

---

#### BOFU - Engajamento WPP ABO R$50 #ESCALA
**Campaign:** R$ 50,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #CAMPANHA ESCALA #PAISES

**Ad Set:** [ENGAJAMENTO 365D] [BRASIL]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD02]** | 120211930125390461 | R$ 146,14 | 11.323 | 2,02% | R$ 0,64 | **47** | R$ 3,11 | 57 | 7 | 2 |

---

#### BOFU - Engajamento WPP ABO R$50 #PAISES
**Campaign:** R$ 50,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #PAISES

**Ad Set:** [ENGAJAMENTO 365D] [BRASIL]

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| [AD02] | 120229110487970461 | R$ 78,07 | 5.714 | 2,07% | R$ 0,66 | 20 | R$ 3,90 | 34 | 4 | 6 |
| **[AD03]** | 120229110487950461 | R$ 68,37 | 5.065 | 2,45% | R$ 0,55 | **27** | **R$ 2,53** | 25 | 3 | 2 |

---

#### BOFU - Engajamento WPP ABO R$30 #BAIRROS NOBRES BH
**Campaign:** R$ 30,00 [BoFu] [ENGAJAMENTO] [MENSAGENS] [WPP] [ABO] #CAMPANHA ESCALA #CIDADES

**Ad Set:** [ENGAJAMENTO 365D] #BAIRROS NOBRES BH

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD02]** | 120229110404620461 | R$ 47,33 | 3.271 | 1,77% | R$ 0,82 | 24 | **R$ 1,97** | 12 | 0 | 1 |
| [AD03] | 120229110404600461 | R$ 25,04 | 949 | 1,79% | R$ 1,47 | 4 | R$ 6,26 | 4 | 1 | 0 |
| **[AD01]** | 120229110404610461 | R$ 14,82 | 845 | 3,91% | R$ 0,45 | 9 | **R$ 1,65** | 10 | 1 | 1 |

**Analise:** Melhor ad set da conta para custo/msg! [AD01] a R$1,65 e [AD02] a R$1,97. Budget muito baixo (R$30/dia) — forte candidato a scaling. [AD03] esta 3x mais caro que os outros — pausar ou trocar criativo.

---

#### BOFU - Vendas WPP ABO R$55 (WhatsApp)
**Campaign:** R$ 55,00 [BoFu] [VENDAS] [MENSANGES] [WHATSAPP] [ABO]

**Ad Set:** [MIX PERSONALIZADO 30D] [MG] 25/11

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| **[AD12] Copia Copia** | 120214578643170461 | R$ 39,52 | 2.876 | 2,71% | R$ 0,51 | **24** | **R$ 1,65** | 14 | 3 | 2 |
| [AD01] Copia Copia | 120229110592410461 | R$ 38,87 | 1.542 | 2,46% | R$ 1,02 | 15 | R$ 2,59 | 20 | 2 | 0 |
| **[AD02] Copia Copia** | 120214578643120461 | R$ 27,23 | 2.440 | 1,72% | R$ 0,65 | **18** | **R$ 1,51** | 5 | 0 | 0 |
| **[AD02] Copia Copia** | 120229110592420461 | R$ 18,40 | 1.312 | 2,36% | R$ 0,59 | **11** | **R$ 1,67** | 12 | 0 | 0 |
| **[AD12] Copia Copia** | 120229110592390461 | R$ 13,96 | 883 | 2,60% | R$ 0,61 | **9** | **R$ 1,55** | 4 | 0 | 0 |

**Ad Set:** [MIX PERSONALIZADO 30D] [SP] - ATUALIZADO

| Ad | ID | Spend | Imp | CTR | CPC | Msgs | Cost/Msg | Reactions | Comments | Saves |
|----|----|-------|-----|-----|-----|------|----------|-----------|----------|-------|
| [AD01] Copia | 120229110592460461 | R$ 60,64 | 2.887 | 2,18% | R$ 0,96 | 14 | R$ 4,33 | 28 | 0 | 1 |
| [AD01] Copia | 120212474615630461 | R$ 36,58 | 2.155 | 1,81% | R$ 0,94 | 6 | R$ 6,10 | 16 | 1 | 0 |
| [AD12] Copia | 120212474615610461 | R$ 27,71 | 1.193 | 2,93% | R$ 0,79 | 8 | R$ 3,46 | 6 | 1 | 3 |
| [AD02] Copia | 120229110592450461 | R$ 18,43 | 881 | 1,70% | R$ 1,23 | 2 | R$ 9,21 | 6 | 1 | 0 |
| [AD02] Copia | 120212474615560461 | R$ 16,12 | 794 | 2,27% | R$ 0,90 | 3 | R$ 5,37 | 4 | 2 | 0 |
| [AD12] Copia | 120229110592490461 | R$ 9,21 | 411 | 2,92% | R$ 0,77 | 2 | R$ 4,61 | 1 | 0 | 0 |
| [AD03] Copia | 120212474615600461 | R$ 6,88 | 359 | 6,13% | R$ 0,31 | 1 | R$ 6,88 | 1 | 0 | 1 |

**Analise:** Diferenca brutal entre MG e SP. Ad set MG entrega mensagens a R$1,51-1,67 enquanto SP fica em R$3,46-9,21. Os criativos [AD12] e [AD02] sao os campeoes em MG. Considerar realocar budget de SP para MG ou testar criativos novos em SP.

---

#### BOFU - Vendas RESPONDI ABO R$55 (Conversao Pixel)
**Campaign:** R$ 55,00 [BoFu] [VENDAS] [RESPONDI] [ABO]

**Ad Set:** [MIX PERSONALIZADO 30D] [SP] - ATUALIZADO

| Ad | ID | Spend | Imp | CTR | CPC | Conversoes | Cost/Conv | Freq |
|----|----|-------|-----|-----|-----|------------|-----------|------|
| **[AD12] Copia** | 120231153361340461 | R$ 63,67 | 4.163 | 2,86% | R$ 0,54 | **13** | **R$ 4,90** | 1,21 |
| **[AD03] Copia** | 120231153361350461 | R$ 22,54 | 1.053 | 5,32% | R$ 0,40 | **8** | **R$ 2,82** | 1,56 |

**Ad Set:** [MIX PERSONALIZADO 30D] [MG] 25/11

| Ad | ID | Spend | Imp | CTR | CPC | Conversoes | Cost/Conv | Freq |
|----|----|-------|-----|-----|-----|------------|-----------|------|
| **[AD02] Copia Copia** | 120231153361410461 | R$ 17,55 | 1.374 | 4,44% | R$ 0,29 | **9** | **R$ 1,95** | 1,21 |

**Analise:** Performance excepcional! CPA de R$1,95 a R$4,90 por conversao Respondi. [AD02] em MG e o melhor criativo da conta inteira em termos de conversao. [AD03] em SP tem CTR de 5,32% — criativo muito engajante. **Forte candidato a scaling imediato.**

---

#### TOFU - Seguidores BR/SP/BH
**Campaign:** [TOFU] [SEGUIDORES] [BR/SP/BH] 11/09

| Ad | Campaign | Ad Set | Spend | CTR | CPC | CPM | Reach | Video Views |
|----|----------|--------|-------|-----|-----|-----|-------|-------------|
| 31/mar | BR 11/09 | LUXO | R$ 260,18 | **3,80%** | R$ 0,19 | R$ 7,40 | 34.340 | 11.979 |
| 31/mar | SP 11/09 | LUXO | R$ 250,01 | **3,93%** | R$ 0,23 | R$ 9,08 | 27.429 | 10.087 |
| 31/mar | BH 11/09 | LUXO | R$ 157,19 | 2,15% | R$ 0,34 | R$ 7,37 | 19.761 | 6.010 |
| 31/mar | BH 11/09 | LAL2% | R$ 134,90 | 1,99% | R$ 0,42 | R$ 8,40 | 14.992 | 3.344 |
| 29/mai | SP 11/09 | LAL1% | R$ 104,34 | **4,30%** | R$ 0,27 | R$ 11,46 | 8.522 | 2.970 |
| 29/mai | BR 11/09 | LAL1% | R$ 82,46 | **3,55%** | R$ 0,26 | R$ 9,18 | 8.490 | 2.756 |
| 29/mai | BH 11/09 | LAL3% | R$ 48,14 | 1,86% | R$ 0,35 | R$ 6,45 | 7.090 | 1.882 |
| 4/ago | BH 11/09 | LUXO | R$ 38,00 | 2,38% | R$ 0,43 | R$ 10,30 | 3.305 | 972 |
| 4/ago | SP 11/09 | LUXO | R$ 29,07 | **6,73%** | R$ 0,19 | R$ 12,79 | 2.110 | 930 |
| 31/mar | BR 11/09 | LAL1% | R$ 27,55 | **4,82%** | R$ 0,21 | R$ 9,98 | 2.721 | 945 |
| 4/ago | BR 11/09 | LUXO | R$ 18,27 | **5,02%** | R$ 0,19 | R$ 9,46 | 1.852 | 717 |
| 31/mar | SP 11/09 | LAL2% | R$ 10,20 | 3,08% | R$ 0,34 | R$ 10,47 | 961 | 317 |
| 31/mar | BR 11/09 | LAL2% | R$ 9,13 | **5,13%** | R$ 0,19 | R$ 9,76 | 932 | 317 |

**Analise:** Os criativos de "31 de mar" e "4 de ago" sao os mesmos posts organicos impulsionados. Sao muito eficientes (CPC R$0,19-0,42) e geram muito alcance. O criativo "4/ago" em SP tem **CTR 6,73%** — impressionante. Os ad sets LUXO recebem mais budget que LAL, o que faz sentido pelo alcance.

---

#### TOFU - ROBUSTA LOL UFs
**Campaign:** R$ 116,67 [TOFU] [ROBUSTA] [LOL] [UFs]

| Ad | Ad Set | Spend | CTR | CPC | CPM | Reach | Video Views |
|----|--------|-------|-----|-----|-----|-------|-------------|
| ad01 - Voce ja imaginou... Copia | LOL 1-4% [BR] | R$ 147,07 | 2,91% | R$ 0,20 | R$ 5,72 | 23.871 | 7.886 |
| ad04 - Desde a primeira... Copia | LOL 1-4% [MG] | R$ 97,47 | 2,70% | R$ 0,22 | R$ 5,90 | 15.263 | 4.375 |
| ad04 - Desde a primeira... Copia | LOL 1-4% [SP] | R$ 97,07 | 3,30% | R$ 0,26 | R$ 8,45 | 11.469 | 3.368 |

**Analise:** CPM muito baixo (R$5,72-8,45) e CPC excelente (R$0,20-0,26). Campanhas Lookalike performando bem para crescimento de audiencia.

---

#### MOFU - Reconhecimento de Marca / Video Views
**Campaign:** R$ 60,00 [Mofu] [RECONHECIMENTO DE MARCA] [VIDEO VIEW]

| Ad | Ad Set | Spend | Impressoes | Video Views | CPM | CTR |
|----|--------|-------|------------|-------------|-----|-----|
| [AD01] | Prova Social [Carrosel] | R$ 29,21 | 35.733 | 0 | **R$ 0,82** | 0,14% |
| [AD02] | Quebra Objecao [Carrosel] | R$ 28,62 | 35.679 | 0 | **R$ 0,80** | 0,14% |
| [AD04] | Elevar Nivel [Carrosel] | R$ 27,81 | 33.034 | 0 | **R$ 0,84** | 0,23% |
| [AD01] | Depoimento [Video View] | R$ 24,59 | 10.750 | **3.220** | R$ 2,29 | 0,36% |
| [AD01] | Quebra Objecao [Video View] | R$ 19,97 | 13.581 | **2.905** | R$ 1,47 | 0,27% |
| [AD03] | Storytelling [Video View] | R$ 18,17 | 8.241 | **3.066** | R$ 2,20 | 1,61% |
| [AD02] | Storytelling [Video View] | R$ 10,43 | 4.092 | 1.333 | R$ 2,55 | 1,25% |
| [AD03] | Quebra Objecao [Video View] | R$ 9,04 | 4.337 | 1.298 | R$ 2,08 | 0,30% |

**Analise:** Carrosseis tem CPM absurdamente baixo (R$0,80-0,84) — otimos para frequencia e reconhecimento, mas CTR baixo (0,14%). Videos tem mais engajamento (CTR 1,61% em Storytelling). O [AD03] Storytelling e o mais engajante de todos os MOFU.

---

### 4.2 TOP 10 Criativos por Custo/Mensagem

| # | Ad | Campaign | Ad Set | Spend | Msgs | Cost/Msg |
|---|-----|----------|--------|-------|------|----------|
| 1 | **[AD02] Copia Copia** | Vendas WPP R$55 | Mix 30D [MG] | R$ 27 | 18 | **R$ 1,51** |
| 2 | **[AD12] Copia Copia** | Vendas WPP R$55 | Mix 30D [MG] | R$ 14 | 9 | **R$ 1,55** |
| 3 | **[AD01]** | Engaj WPP R$30 | Bairros Nobres BH | R$ 15 | 9 | **R$ 1,65** |
| 4 | **[AD12] Copia Copia** | Vendas WPP R$55 | Mix 30D [MG] | R$ 40 | 24 | **R$ 1,65** |
| 5 | **[AD02] Copia Copia** | Vendas WPP R$55 | Mix 30D [MG] | R$ 18 | 11 | **R$ 1,67** |
| 6 | **[AD02]** | Engaj WPP R$30 | Bairros Nobres BH | R$ 47 | 24 | **R$ 1,97** |
| 7 | [AD03] | Engaj WPP R$95 Escala | Engaj 365D [MG] | R$ 53 | 21 | R$ 2,53 |
| 8 | [AD03] | Engaj WPP R$50 Paises | Engaj 365D [BR] | R$ 68 | 27 | R$ 2,53 |
| 9 | [AD02] | Engaj WPP R$95 | Engaj 365D [MG] | R$ 127 | 50 | R$ 2,54 |
| 10 | [AD01] Copia Copia | Vendas WPP R$55 | Mix 30D [MG] | R$ 39 | 15 | R$ 2,59 |

### 4.3 TOP 5 Criativos por Volume de Mensagens

| # | Ad | Campaign | Spend | Msgs | Cost/Msg |
|---|-----|----------|-------|------|----------|
| 1 | **[AD01]** | CBO Escala 20/11 | R$ 296 | **95** | R$ 3,12 |
| 2 | **[AD02]** | CBO Escala 20/11 | R$ 284 | **85** | R$ 3,34 |
| 3 | **[AD02]** | Engaj R$95 [MG] | R$ 127 | **50** | R$ 2,54 |
| 4 | **[AD02]** | Engaj R$50 Escala [BR] | R$ 146 | **47** | R$ 3,11 |
| 5 | **[AD03]** | Engaj R$95 Escala [MG] | R$ 130 | **43** | R$ 3,02 |

### 4.4 TOP 3 Criativos por Conversao Respondi

| Ad | Ad Set | Spend | Conversoes | Cost/Conv | CTR |
|----|--------|-------|------------|-----------|-----|
| **[AD02] Copia Copia** | Mix 30D [MG] | R$ 18 | 9 | **R$ 1,95** | 4,44% |
| **[AD03] Copia** | Mix 30D [SP] | R$ 23 | 8 | **R$ 2,82** | 5,32% |
| **[AD12] Copia** | Mix 30D [SP] | R$ 64 | 13 | **R$ 4,90** | 2,86% |

### 4.5 Criativos com Performance Problematica

| Ad | Problema | Spend | Resultado | Recomendacao |
|----|----------|-------|-----------|--------------|
| [AD03] Engaj R$30 BH | Cost/Msg alto | R$ 25 | 4 msgs, R$6,26 | Pausar - outros ads no mesmo adset a R$1,65-1,97 |
| [AD02] Copia SP | CPC alto + poucos msgs | R$ 18 | 2 msgs, R$9,21 | Pausar ou trocar criativo |
| [AD01] Copia SP | Freq subindo + CPC alto | R$ 37 | 6 msgs, R$6,10 | Monitorar - freq 1,34 |
| Ads no ad set BH Copia | Volume minimo | R$ 15 | 1 msg total | Pausar ad set inteiro |

---

## 5. Problemas Encontrados (Consolidado)

### Severidade ALTA

| # | Problema | Impacto | Evidencia |
|---|----------|---------|-----------|
| 1 | **Creative fatigue na campanha BOFU Vendas R$55 (antiga)** | R$417/semana desperdicados | Freq 4,76, CTR 0,30%, R$83/msg (7d) |
| 2 | **Disparidade MG vs SP nos criativos** | SP paga 3-6x mais por msg | MG: R$1,51-1,67/msg vs SP: R$4,33-9,21/msg |
| 3 | **Budget sub-alocado em Bairros Nobres BH** | Oportunidade perdida | R$30/dia com R$1,65-1,97/msg — melhor da conta |

### Severidade MEDIA

| # | Problema | Impacto | Evidencia |
|---|----------|---------|-----------|
| 4 | **Campanhas duplicadas TOFU BH** | Competicao interna | 2 campanhas identicas, budgets diferentes |
| 5 | **Campanhas antigas sem refresh (abr/2024)** | Criativos desgastados | 10+ meses sem atualizacao |
| 6 | **Nomenclatura inconsistente** | Dificulta gestao | "Copia Copia", datas no nome, R$ no nome |
| 7 | **Mix ABO/CBO sem estrategia documentada** | Otimizacao subotima | 2 CBO + 17 ABO sem criterio claro |
| 8 | **41 ads com spend < R$5 em 3 dias** | Fragmentacao | Budget pulverizado em ads inativos |

### Severidade BAIXA

| # | Problema | Impacto | Evidencia |
|---|----------|---------|-----------|
| 9 | **MOFU carrosseis com CTR 0,14%** | Baixo engajamento | CPM barato mas quase sem interacao |
| 10 | **Contas inativas no BM** | Limpeza necessaria | 2 contas desabilitadas |

---

## 6. Acoes Recomendadas

### Quick Wins (implementar esta semana)

| # | Acao | Impacto Estimado | Esforco |
|---|------|------------------|---------|
| 1 | **Pausar campanha BOFU Vendas R$55 com freq 4,76** | Economia ~R$420/semana | 5 min |
| 2 | **Aumentar budget de Bairros Nobres BH** de R$30 para R$50/dia | +33 msgs/semana a R$1,80 | 5 min |
| 3 | **Pausar [AD03] no ad set Bairros Nobres BH** (R$6,26/msg vs R$1,65 dos outros) | Melhora CPA medio do adset | 5 min |
| 4 | **Pausar [AD02] Copia SP** (R$9,21/msg) na campanha Vendas WPP R$55 | Economia ~R$18/3d | 5 min |
| 5 | **Consolidar TOFU BH duplicadas** em 1 campanha | Elimina competicao interna | 15 min |

### Medium Term (proximo mes)

| # | Acao | Impacto Estimado | Esforco |
|---|------|------------------|---------|
| 6 | **Escalar campanha RESPONDI** — aumentar budget 20%/dia | Mais conversoes a R$1,95-4,90 | Progressivo |
| 7 | **Realocar budget SP → MG** nas campanhas Vendas WPP R$55 | Reduzir CPA medio de R$4,33 para R$2,00 | 15 min |
| 8 | **Testar 3 criativos novos** nos ad sets MG (onde performance e melhor) | Descobrir novos winners | 2h |
| 9 | **Padronizar nomenclatura**: `[FUNNEL]-[OBJ]-[GEO]-[DATA]-[VER]` | Facilitar gestao | 1h |
| 10 | **Criar campanha de retargeting** para viewers >50% dos videos MOFU | Nutrir audiencia aquecida | 2h |

### Long Term (proximo trimestre)

| # | Acao | Impacto Estimado | Esforco |
|---|------|------------------|---------|
| 11 | **Implementar testes A/B sistematicos** com hipoteses documentadas | Melhoria continua | Ongoing |
| 12 | **Estruturar funil exclusivo**: TOFU → MOFU → BOFU com audiences exclusivas | Eliminar sobreposicao | 4h |
| 13 | **Avaliar ROAS real** do CPA Respondi (R$88/30d) vs ticket medio | Dimensionar ROI verdadeiro | 1h |
| 14 | **Limpar ads com spend < R$1** (41 ads fantasma) | Simplificar conta | 30 min |
| 15 | **Documentar estrategia ABO vs CBO** com criterios de uso | Padronizar decisoes | 1h |

---

## 7. Resumo Executivo

A conta Leandro Gontijo [Principal] movimenta **R$51k/mes** em Meta Ads com uma estrutura de funil completa (TOFU/MOFU/BOFU). Os pontos fortes sao:

- **CPC e CPM abaixo do benchmark** — a conta compra bem
- **Criativos BOFU performam bem em MG** — custo/msg de R$1,51-2,54
- **Campanha RESPONDI com CPA excelente** — R$1,95-4,90/conversao
- **TOFU com CTR alto** (3-6%) e bom volume de alcance

Os principais pontos de melhoria sao:

- **67% do budget esta em BOFU** com disparidade enorme entre geos (MG performa 3-6x melhor que SP)
- **Creative fatigue** em campanhas antigas sem refresh
- **Budget mal distribuido** — melhor campanha (Bairros Nobres BH, R$1,65/msg) recebe apenas R$30/dia
- **41 ads com spend minimo** fragmentando a conta
- **Nomenclatura e organizacao** dificultam analise e otimizacao

**Estimativa de impacto das otimizacoes Quick Wins:** reducao de ~15% no CPA medio de mensagens (de R$7,43 para ~R$6,30) apenas com realocacao de budget e pausas de underperformers.

---

*Gerado por Gestor de Trafego - 20/02/2026*
