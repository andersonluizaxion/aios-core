# Campaign Monitor - Regras de Alerta

## Visao Geral

O Campaign Monitor aplica 6 regras de alerta automaticamente a cada campanha ativa. As regras sao hardcoded e nao podem ser modificadas via CLI. Cada regra verifica uma metrica especifica contra um limiar definido.

## Severidades

| Severidade | Significado | Acao Esperada |
|------------|-------------|---------------|
| **CRITICAL** | Problema grave que esta causando perda de dinheiro | Acao imediata necessaria. Pausar ou reestruturar. |
| **WARNING** | Indicador de performance degradando | Investigar e planejar correcao em 24-48h. |

## Regras Detalhadas

---

### 1. high_cpa (CPA Alto)

| Campo | Valor |
|-------|-------|
| **Metrica** | CPA (Custo por Aquisicao) |
| **Condicao** | > 2.0x target CPA |
| **Severidade** | CRITICAL |
| **Dias Minimos** | 3 |

**O que detecta:**
O custo por aquisicao esta mais que o dobro do target configurado por 3 ou mais dias consecutivos. Isso indica que a campanha esta gastando significativamente mais por conversao do que o esperado.

**Causas comuns:**
- Targeting muito amplo ou irrelevante
- Criativos com baixa taxa de conversao
- Landing page com problemas de UX ou velocidade
- Competicao aumentou (CPC subiu)
- Publico saturado (frequencia alta)

**Acoes recomendadas:**
1. Revisar targeting - segmentos de publico, interesses, localizacao
2. Analisar criativos - CTR dos ads, creative fatigue
3. Verificar landing page - velocidade, mobile-friendliness, congruencia com ad
4. Considerar pausar e reestruturar se CPA > 3x target
5. Testar novos publicos com budget menor

**Nota:** Esta regra requer um target CPA definido para calcular. Quando o target nao esta disponivel via API, a regra nao dispara.

---

### 2. ctr_drop (Queda de CTR)

| Campo | Valor |
|-------|-------|
| **Metrica** | CTR trend (variacao %) |
| **Condicao** | < -30% vs periodo anterior |
| **Severidade** | WARNING |
| **Dias Minimos** | 3 |

**O que detecta:**
O CTR (Click-Through Rate) caiu mais de 30% comparado ao periodo anterior. Uma queda acentuada no CTR indica que os anuncios estao perdendo relevancia para o publico.

**Causas comuns:**
- Creative fatigue - publico ja viu o anuncio demais
- Mudanca na competicao - novos anunciantes no mesmo publico
- Sazonalidade - comportamento do publico mudou
- Audience overlap - mesmos usuarios em multiplos ad sets

**Acoes recomendadas:**
1. Refresh criativos - novas imagens, novos angulos de copy
2. Testar novos formatos (video vs imagem, carrossel vs single)
3. Revisar audience overlap entre ad sets
4. Verificar se ha novos competidores na mesma audiencia
5. Considerar expandir publico ou testar lookalikes

---

### 3. creative_fatigue (Fadiga Criativa)

| Campo | Valor |
|-------|-------|
| **Metrica** | Frequency (frequencia) |
| **Condicao** | > 4 |
| **Severidade** | WARNING |
| **Dias Minimos** | 1 |

**O que detecta:**
A frequencia (numero medio de vezes que cada pessoa viu o anuncio) esta acima de 4. Isso indica que o publico esta sendo saturado com o mesmo criativo, levando a queda de performance e possivel irritacao do publico.

**Causas comuns:**
- Publico muito pequeno para o budget
- Poucos criativos em rotacao
- Campanha rodando por tempo demais sem refresh
- Budget desproporcional ao tamanho do publico

**Acoes recomendadas:**
1. Rotacionar criativos - adicionar novos ads ao ad set
2. Expandir publico - adicionar interesses, lookalikes, localizacoes
3. Reduzir budget se publico nao pode ser expandido
4. Criar variantes do criativo atual (mesmo conceito, visual diferente)
5. Pausar criativos com frequencia > 6

**Limiares de referencia:**
- 1.0-2.0: Normal
- 2.0-3.5: Monitorar
- 3.5-5.0: WARNING - rotacionar criativos
- 5.0+: CRITICO - pausar e reestruturar

**Nota:** Google Ads nao expoe frequencia no nivel de campanha, entao esta regra aplica-se principalmente a campanhas Meta.

---

### 4. underspend (Subgasto)

| Campo | Valor |
|-------|-------|
| **Metrica** | spend_pct (% do budget gasto) |
| **Condicao** | < 50% do budget diario |
| **Severidade** | WARNING |
| **Dias Minimos** | 2 |

**O que detecta:**
A campanha esta gastando menos de 50% do budget configurado por 2 ou mais dias. Isso indica que a plataforma nao esta conseguindo entregar os anuncios, o que pode significar targeting restrito, bids baixos, ou problemas de qualidade.

**Causas comuns:**
- Bids muito baixos para a competicao
- Targeting muito restrito (publico pequeno)
- Criativo com baixo quality score/relevance score
- Campanha em learning phase (normal nos primeiros 2-3 dias)
- Restricoes de schedule ou placement

**Acoes recomendadas:**
1. Verificar se a campanha ainda esta em learning phase (normal)
2. Aumentar bids ou mudar para estrategia de lance automatico
3. Expandir targeting - adicionar interesses, localizacoes, faixa etaria
4. Verificar quality/relevance score dos criativos
5. Remover restricoes desnecessarias de placement ou schedule

---

### 5. zero_conversions (Zero Conversoes)

| Campo | Valor |
|-------|-------|
| **Metrica** | Conversions (total de conversoes) |
| **Condicao** | == 0 |
| **Severidade** | CRITICAL |
| **Dias Minimos** | 2 |

**O que detecta:**
A campanha nao gerou nenhuma conversao por 2 ou mais dias consecutivos. Isso pode indicar problema tecnico (tracking quebrado) ou problema de performance grave.

**Causas comuns:**
- Pixel/tag de conversao nao esta funcionando
- Landing page com erro ou fora do ar
- Redirect chain quebrando parametros de tracking
- Publico completamente irrelevante
- Budget insuficiente para gerar conversoes
- Campanha otimizada para objetivo errado

**Acoes recomendadas:**
1. **PRIMEIRO:** Verificar se o pixel/conversion tracking esta funcionando
   - Meta: Facebook Pixel Helper (extensao Chrome)
   - Google: Tag Assistant / Google Ads tag diagnostics
2. Testar landing page manualmente (carregar, preencher, converter)
3. Verificar UTMs e redirect chain
4. Se tracking OK, revisar publico e criativos
5. Se budget < 3x CPA target, aumentar budget

---

### 6. low_roas (ROAS Baixo)

| Campo | Valor |
|-------|-------|
| **Metrica** | ROAS (Return on Ad Spend) |
| **Condicao** | < 1.0 |
| **Severidade** | CRITICAL |
| **Dias Minimos** | 5 |

**O que detecta:**
O ROAS esta abaixo de 1.0 por 5 ou mais dias, significando que a campanha esta gerando menos receita do que esta gastando. Para cada R$ 1 investido, esta retornando menos de R$ 1.

**Causas comuns:**
- Produto/oferta nao tem product-market fit para o publico
- CPA muito alto para o ticket medio
- Attribution window nao capturando conversoes tardias
- Publico com baixa intencao de compra
- Criativos nao comunicam valor do produto adequadamente

**Acoes recomendadas:**
1. **Pausar a campanha** para evitar mais perda
2. Analisar o funil completo: impressao > clique > LP > checkout > compra
3. Verificar se attribution window esta configurada corretamente
4. Revisar oferta e pricing - talvez o AOV nao suporte o CAC
5. Considerar reestruturar completamente antes de relancamento
6. Se for campanha de awareness/consideration, ROAS < 1 pode ser aceitavel (mudar avaliacao para CAC/LTV)

**Nota:** ROAS < 1 so e CRITICAL se a campanha for de conversao/vendas. Para campanhas de awareness ou lead gen, esta metrica pode nao ser relevante.

---

## Logica de Classificacao de Saude

Cada campanha recebe um status baseado nos alertas ativos:

```
Se tem pelo menos 1 alerta CRITICAL → CRITICAL
Se tem pelo menos 1 alerta WARNING  → WARNING
Se nao tem alertas                   → HEALTHY
```

## Metricas por Plataforma

| Metrica | Meta Ads | Google Ads |
|---------|----------|------------|
| CPA | cost_per_action_type | cost_per_conversion |
| ROAS | purchase_roas | conversions_value / cost |
| CTR | ctr | ctr |
| Frequency | frequency | N/A (campanha) |
| Spend % | spend / daily_budget | cost_micros / budget |
| Conversions | actions (purchase/lead) | conversions |

## Evolucao Futura

Regras planejadas para versoes futuras:
- **learning_phase_stuck** - Campanha presa na learning phase por > 7 dias
- **impression_share_low** - Search Impression Share < 20% (Google Search)
- **quality_score_low** - Quality Score medio < 5 (Google Search)
- **audience_overlap** - Sobreposicao de publico > 50% entre ad sets
- **landing_page_slow** - Tempo de carregamento da LP > 3s
