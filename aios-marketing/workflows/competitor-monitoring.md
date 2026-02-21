# Competitor Monitoring Workflow

```yaml
workflow:
  name: competitor-monitoring
  description: Monitoramento mensal de concorrentes com analise social e de ads
  version: 1.0.0
  agents: [social-analyst, gestor-trafego, data-analyst]
  estimated_duration: 2-3 dias
  schedule: Primeira semana de cada mes
```

---

## Overview

Monitoramento sistematico de concorrentes para identificar mudancas de estrategia, ameacas e oportunidades. Combina analise de presenca social, biblioteca de anuncios e inteligencia competitiva.

---

## Prerequisites

- [ ] Lista de concorrentes definida em `clients/<cliente>/competitors.yaml`
- [ ] Minimo 2 concorrentes mapeados
- [ ] Contas Instagram dos concorrentes identificadas
- [ ] Acesso a Meta Ad Library e Google Ads Transparency Center

---

## Step 1: Social Presence Analysis

**Owner:** @social-analyst
**Command:** `*insta-benchmark`
**Duration:** 1 dia

### Steps

#### Per Competitor
Para cada concorrente listado em `competitors.yaml`:

- [ ] `node aios-marketing/bin/instagram-analyzer.mjs benchmark --account=<cliente>` - comparar metricas
- [ ] Registrar metricas atuais:
  | Metrica | Cliente | Concorrente 1 | Concorrente 2 | Concorrente 3 |
  |---------|---------|---------------|---------------|---------------|
  | Followers | | | | |
  | Crescimento (mes) | | | | |
  | ER% | % | % | % | % |
  | Posts/semana | | | | |
  | Mix Reels % | % | % | % | % |
  | Mix Carrossel % | % | % | % | % |
  | Mix Imagem % | % | % | % | % |

- [ ] Identificar mudancas vs mes anterior:
  - Mudou frequencia de posting?
  - Mudou mix de formatos?
  - Mudou tom/estilo de comunicacao?
  - Lancou produto/servico novo?
  - Mudou bio ou CTA?

- [ ] Analisar top posts dos concorrentes no mes:
  - Quais temas geraram mais engagement?
  - Quais formatos performaram melhor?
  - Algum conteudo viral? Por que?

- [ ] Identificar padroes:
  - Conteudo que funciona para concorrentes e cliente nao faz
  - Conteudo que cliente faz e concorrentes nao (diferencial)
  - Tendencias emergentes no nicho

### Output
- Tabela comparativa atualizada
- Top 3 insights de conteudo competitivo
- Recomendacoes de conteudo baseadas em gaps

---

## Step 2: Ad Library Analysis

**Owner:** @gestor-trafego
**Duration:** 1 dia

### Meta Ad Library
URL: `https://www.facebook.com/ads/library`

Para cada concorrente:
- [ ] Pesquisar por nome/pagina na Meta Ad Library
- [ ] Registrar:
  | Item | Concorrente 1 | Concorrente 2 | Concorrente 3 |
  |------|---------------|---------------|---------------|
  | Ads ativos | | | |
  | Plataformas (FB/IG/Messenger/AN) | | | |
  | Formatos predominantes | | | |
  | Temas/angulos de copy | | | |
  | Tipos de oferta | | | |
  | CTAs usados | | | |
  | Desde quando anuncia | | | |

- [ ] Identificar ads ativos ha mais tempo (provavelmente performam bem)
- [ ] Capturar screenshots dos melhores ads para referencia
- [ ] Identificar mudancas vs mes anterior:
  - Novos ads lancados?
  - Ads antigos pausados?
  - Mudou angulo de comunicacao?
  - Mudou oferta/preco?

### Google Ads Transparency Center
URL: `https://adstransparency.google.com`

Para cada concorrente:
- [ ] Pesquisar por dominio/marca
- [ ] Registrar:
  - Tipos de campanha ativos (Search, Display, YouTube)
  - Temas dos anuncios
  - Regioes onde anuncia
  - Volume aproximado de ads

### Output
- Inventario de ads ativos por concorrente
- Screenshots de referencia
- Mudancas identificadas vs periodo anterior

---

## Step 3: Strategy Changes Documentation

**Owner:** @social-analyst + @gestor-trafego
**Duration:** 0.5 dia

### Steps
- [ ] Consolidar findings de Step 1 e Step 2
- [ ] Documentar mudancas estrategicas observadas por concorrente:

  ```markdown
  ## Concorrente: [Nome]

  ### Mudancas Observadas (Mes/Ano)
  - **Social:** [mudancas de frequencia, formato, tom]
  - **Ads:** [novos angulos, ofertas, criativos]
  - **Produto:** [lancamentos, mudancas de preco]
  - **Posicionamento:** [mudancas de messaging, publico-alvo]

  ### Implicacao para Nos
  - [Como isso afeta nossa estrategia]
  ```

- [ ] Atualizar `clients/<cliente>/competitors.yaml` com dados atuais
- [ ] Manter historico de mudancas (nao sobrescrever dados anteriores)

---

## Step 4: Recommend Actions

**Owner:** @data-analyst + @gestor-trafego
**Duration:** 0.5 dia

### Defensive Actions (reagir a ameacas)
- [ ] Concorrente atacando nosso publico? -> Reforcar retargeting, oferta diferenciada
- [ ] Concorrente com preco menor? -> Enfatizar valor/diferencial, nao entrar em guerra de preco
- [ ] Concorrente com mais frequencia de ads? -> Avaliar se nosso budget eh suficiente
- [ ] Concorrente com criativo superior? -> Planejar refresh de criativos

### Offensive Actions (explorar oportunidades)
- [ ] Gap no mercado que nenhum concorrente cobre? -> Testar campanha nesse espaco
- [ ] Concorrente parou de anunciar em canal? -> Avaliar oportunidade de presenca
- [ ] Concorrente com criativo fraco? -> Investir mais nesse canal (menos competicao)
- [ ] Tema de conteudo que concorrentes nao abordam? -> Criar conteudo diferenciado

### Action Items
| # | Acao | Tipo | Prioridade | Responsavel | Prazo |
|---|------|------|------------|-------------|-------|
| 1 | | Defensiva/Ofensiva | Alta/Media/Baixa | @agent | DD/MM |
| 2 | | Defensiva/Ofensiva | Alta/Media/Baixa | @agent | DD/MM |
| 3 | | Defensiva/Ofensiva | Alta/Media/Baixa | @agent | DD/MM |

---

## Step 5: Update Competitor Profiles

**Owner:** @social-analyst
**Duration:** 0.5 dia

### Steps
- [ ] Atualizar `clients/<cliente>/competitors.yaml` com:
  - Metricas atuais (followers, ER%, ads ativos)
  - Mudancas observadas neste mes
  - Strengths e weaknesses atualizados
  - Notas sobre estrategia
- [ ] Manter historico mensal para detectar tendencias
- [ ] Incluir insights no proximo monthly report

### Competitor Profile Update
```yaml
# Em competitors.yaml, atualizar para cada concorrente:
last_updated: "YYYY-MM-DD"
instagram_followers: N
instagram_er_percent: N.N
active_meta_ads: N
active_google_ads: N
strategy_notes: "Observacoes do mes"
recent_changes:
  - "Mudanca 1"
  - "Mudanca 2"
```

---

## Monitoring Calendar

| Semana | Atividade | Owner |
|--------|-----------|-------|
| Semana 1 | Social analysis + Ad Library | @social-analyst + @gestor-trafego |
| Semana 1 | Document changes + Recommend | @data-analyst + @gestor-trafego |
| Semana 1 | Update profiles | @social-analyst |
| Ongoing | Ad alerts (new ads from competitors) | @gestor-trafego (adhoc) |

---

## Output Summary

| Deliverable | Formato | Local |
|-------------|---------|-------|
| Tabela comparativa social | Markdown table | Dentro do report |
| Inventario de ads | Screenshots + notas | `docs/competitive/` |
| Action items | Lista priorizada | Dentro do report |
| Competitor profiles atualizados | YAML | `clients/<cliente>/competitors.yaml` |

---

## Rules

1. **Nunca copiar** - Identificar padroes, nao plagiar conteudo ou criativos
2. **Dados reais** - Nao especular sem evidencia
3. **Foco em acoes** - Monitoramento sem acao eh desperdicio de tempo
4. **Historico** - Sempre manter dados anteriores para identificar tendencias
5. **Minimo 2 concorrentes** - Um unico concorrente nao eh benchmark
6. **Mensal** - Frequencia minima para detectar mudancas

---
*Workflow: Competitor Monitoring v1.0 - Synkra AIOS Marketing*
