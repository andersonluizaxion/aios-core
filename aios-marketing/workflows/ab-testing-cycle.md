# A/B Testing Cycle Workflow

```yaml
workflow:
  name: ab-testing-cycle
  description: Ciclo completo de teste A/B - da hipotese a implementacao do vencedor
  version: 1.0.0
  agents: [copywriter, gestor-trafego, data-analyst]
  estimated_duration: 14-30 dias por ciclo
```

---

## Overview

Workflow para conduzir testes A/B estruturados com rigor estatistico. Garante que cada teste tenha hipotese clara, execucao controlada, e analise com significancia antes de tomar decisoes.

---

## Step 1: Define Hypothesis and Variants

**Owner:** @copywriter
**Command:** `*ab-test`
**Duration:** 1-2 dias

### Steps
- [ ] Definir o que sera testado (uma variavel por vez):
  | Elemento | Exemplos |
  |----------|----------|
  | Headline | Foco em dor vs foco em beneficio |
  | Body copy | Curto vs longo, tom formal vs informal |
  | CTA | Agende gratis vs Solicite orcamento |
  | Imagem/video | Antes/depois vs depoimento vs produto |
  | Angulo | Prova social vs urgencia vs autoridade |
  | Landing page | Layout A vs Layout B |
  | Audiencia | Interest-based vs lookalike |

- [ ] Escrever hipotese clara:
  ```
  Se [mudanca especifica],
  entao [metrica] vai [aumentar/diminuir] em [X%],
  porque [justificativa baseada em dados/insight].
  ```

- [ ] Documentar Controle (A) com detalhes completos
- [ ] Documentar Variante (B) com detalhes completos
- [ ] Garantir que APENAS UMA variavel eh diferente
- [ ] Definir metrica primaria de sucesso (CTR, CR, CPA, ROAS)
- [ ] Definir metricas secundarias para contexto

### Output
- Documento de teste A/B preenchido (template `copy-variants.md`)
- Hipotese, controle, variante documentados

---

## Step 2: Create Split Test in Platform

**Owner:** @gestor-trafego
**Duration:** 0.5-1 dia

### Meta Ads Setup
- [ ] Criar campanha com objetivo adequado
- [ ] Habilitar A/B Test nativo da Meta (se disponivel) ou criar manualmente:
  - Ad Set A (Controle): mesma audiencia, budget igual
  - Ad Set B (Variante): mesma audiencia, budget igual
- [ ] Garantir split de budget: 50% / 50%
- [ ] Garantir mesma audiencia para ambos (sem sobreposicao)
- [ ] Configurar mesmo schedule (horarios identicos)
- [ ] Upload de criativos A e B
- [ ] Campanha em PAUSED para review

### Google Ads Setup (se aplicavel)
- [ ] Criar Experiment no Google Ads ou ad variants:
  - Ad Group com Ad A (controle)
  - Ad Group com Ad B (variante)
- [ ] Garantir split de trafego: 50% / 50%
- [ ] Mesmo targeting e bids para ambos
- [ ] Campanha em PAUSED para review

### Validation
- [ ] Confirmar que TUDO eh identico exceto a variavel testada
- [ ] Confirmar budget igual entre variantes
- [ ] Confirmar audiencia identica (sem overlap)
- [ ] Confirmar tracking/pixel identico para ambas

---

## Step 3: Calculate Sample Size and Launch

**Owner:** @data-analyst + @gestor-trafego
**Duration:** Launch day + wait period

### Sample Size Calculator

```
Parametros:
  - Baseline conversion rate: [X%]
  - Minimum detectable effect: [X%] (tipicamente 10-20%)
  - Statistical significance: 95% (alpha = 0.05)
  - Statistical power: 80% (beta = 0.20)

Formula simplificada:
  n = (16 * p * (1-p)) / (MDE^2)
  Onde: p = baseline CR, MDE = minimum detectable effect

Exemplo:
  Baseline CR = 2%, MDE = 20% (detectar mudanca de 2% para 2.4%)
  n = (16 * 0.02 * 0.98) / (0.004^2) = 19.600 visitantes POR variante
```

### Steps
- [ ] Calcular amostra minima necessaria por variante
- [ ] Estimar duracao com base no trafego diario esperado
- [ ] Garantir duracao minima de 7 dias (capturar sazonalidade semanal)
- [ ] Definir data de inicio e data minima de analise
- [ ] Definir regras de parada antecipada:
  - Parar se CPA > 3x target (protecao de budget)
  - NAO parar por "parece estar ganhando" sem amostra suficiente
- [ ] Ativar teste
- [ ] Registrar data/hora de inicio

### Wait Period Rules
- **Minimo:** 7 dias (capturar dia-a-dia semanal completo)
- **Ideal:** 14 dias (dois ciclos semanais)
- **Maximo:** 30 dias (apos isso, fatores externos contaminam)
- **NAO olhar resultados** antes de atingir amostra minima
- **NAO alterar nada** durante o teste (budget, audiencia, copy)

---

## Step 4: Analyze Results

**Owner:** @data-analyst
**Duration:** 1 dia (apos wait period)

### Data Collection
- [ ] Exportar dados de performance de ambas variantes
- [ ] Verificar que amostra minima foi atingida
- [ ] Verificar que nao houve contaminacao (mudancas externas, sazonalidade atipica)

### Statistical Analysis

| Metrica | Controle (A) | Variante (B) | Diferenca | Significativo? |
|---------|-------------|--------------|-----------|----------------|
| Impressoes | | | | - |
| Cliques | | | | - |
| CTR | % | % | pp | Sim/Nao |
| Conversoes | | | | - |
| CR | % | % | pp | Sim/Nao |
| CPA | R$ | R$ | % | Sim/Nao |
| ROAS | | | % | Sim/Nao |
| Spend | R$ | R$ | - | - |

### Significance Test
- [ ] Calcular p-value para metrica primaria
- [ ] Nivel de confianca: 95% (p < 0.05)
- [ ] Calcular intervalo de confianca da diferenca
- [ ] Verificar que resultado nao eh influenciado por outliers
- [ ] Documentar resultado com evidencia

### Decision Framework

| Resultado | Condicao | Acao |
|-----------|----------|------|
| **Vencedor claro** | p < 0.05, diferenca > MDE | Implementar vencedor |
| **Tendencia** | p entre 0.05 e 0.10 | Estender teste por mais 7 dias |
| **Inconclusivo** | p > 0.10 apos amostra completa | Encerrar, testar hipotese diferente |
| **Resultado invertido** | Variante significativamente pior | Pausar variante, manter controle |

---

## Step 5: Decision and Implementation

**Owner:** @gestor-trafego + @copywriter
**Duration:** 1 dia

### If Winner Found
- [ ] Documentar vencedor e por que ganhou
- [ ] Pausar variante perdedora
- [ ] Escalar vencedor para todas as campanhas relevantes
- [ ] Atualizar copies/criativos padrao com a versao vencedora
- [ ] Registrar learning para futuros testes

### If Inconclusive
- [ ] Documentar que resultado foi inconclusivo
- [ ] Analisar se a diferenca era relevante o suficiente para testar
- [ ] Decidir: testar com amostra maior OU testar hipotese diferente
- [ ] Documentar learning (mesmo negativo eh informacao)

### If Extended
- [ ] Manter teste rodando por mais 7 dias
- [ ] Nao alterar nada durante extensao
- [ ] Re-analisar ao final da extensao

---

## Step 6: Next Test Planning

**Owner:** @copywriter + @data-analyst
**Duration:** 0.5 dia

### Steps
- [ ] Registrar resultado no historico de testes do cliente
- [ ] Atualizar `clients/<cliente>/benchmarks.yaml` com novos baselines
- [ ] Identificar proxima hipotese a testar baseada no resultado:
  - Se headline venceu, testar body copy
  - Se copy venceu, testar criativo visual
  - Se criativo venceu, testar audiencia
  - Se audiencia venceu, testar oferta
- [ ] Documentar proxima hipotese
- [ ] Agendar proximo ciclo de teste

### Testing Roadmap (exemplo)
```
Ciclo 1: Headline (dor vs beneficio) ............ DONE - Winner: beneficio
Ciclo 2: Body copy (curto vs longo) ............. IN PROGRESS
Ciclo 3: CTA (urgencia vs valor) ................ PLANNED
Ciclo 4: Criativo (antes/depois vs depoimento) .. PLANNED
Ciclo 5: Audiencia (interest vs lookalike) ....... PLANNED
```

---

## Test History Template

| # | Data | Elemento | Hipotese | Winner | Lift | Confianca | Learning |
|---|------|----------|----------|--------|------|-----------|----------|
| 1 | DD/MM | | | A/B | % | % | |
| 2 | DD/MM | | | A/B | % | % | |

---

## Rules

1. **Uma variavel por teste** - Nunca testar multiplas mudancas simultaneamente
2. **Minimo 7 dias** - Capturar ciclo semanal completo
3. **95% de confianca** - Nao declarar vencedor sem significancia
4. **Nao espiar** - Nao olhar resultados antes da amostra minima
5. **Nao alterar** - Nenhuma mudanca durante o teste (budget, audiencia, nada)
6. **Documentar tudo** - Mesmo resultados negativos sao valiosos
7. **Testar continuamente** - Sempre ter um teste rodando

---
*Workflow: A/B Testing Cycle v1.0 - Synkra AIOS Marketing*
