# Client Onboarding Workflow

```yaml
workflow:
  name: client-onboarding
  description: Onboarding completo de novo cliente com auditoria, baseline e estrategia
  version: 1.0.0
  agents: [gestor-trafego, data-analyst, social-analyst]
  estimated_duration: 5-10 dias
```

---

## Overview

Workflow executado ao iniciar trabalho com um novo cliente. Garante que todos os acessos estao configurados, tracking funciona, contas estao auditadas, e um baseline de performance eh estabelecido antes de iniciar campanhas.

---

## Step 1: Account Access Verification

**Owner:** @gestor-trafego
**Duration:** 1-2 dias

### Checklist de Acessos

#### Meta Business Suite
- [ ] Acesso ao Business Manager do cliente (Admin ou Advertiser)
- [ ] Acesso a conta de anuncios (Ad Account ID: ___________)
- [ ] Acesso a pagina do Facebook (Page ID: ___________)
- [ ] Acesso ao pixel da Meta (Pixel ID: ___________)
- [ ] Verificar: `node aios-marketing/bin/meta-ads.mjs accounts` - conta do cliente aparece
- [ ] Verificar: `node aios-marketing/bin/meta-ads.mjs account-info <account_id>` - dados corretos

#### Google Ads
- [ ] Acesso a conta Google Ads (Customer ID: ___________)
- [ ] Acesso via MCC (Manager Account) ou direto
- [ ] Verificar: `node aios-marketing/bin/google-ads.mjs accounts` - conta do cliente aparece
- [ ] Verificar: `node aios-marketing/bin/google-ads.mjs account-info <customer_id>` - dados corretos

#### Google Analytics (GA4)
- [ ] Acesso ao GA4 (Property ID: ___________)
- [ ] Verificar eventos de conversao configurados
- [ ] Verificar integracao GA4 <-> Google Ads (linked)

#### Google Search Console
- [ ] Acesso ao Search Console (dominio verificado)
- [ ] Verificar indexacao e sitemap

#### Instagram
- [ ] Conta Instagram Business conectada ao Business Manager
- [ ] Verificar: `node aios-marketing/bin/instagram-analyzer.mjs accounts` - conta do cliente aparece
- [ ] Anotar username: @___________

### Output
- Criar/atualizar `clients/<cliente>/profile.yaml` com todos os IDs

---

## Step 2: Tracking Verification

**Owner:** @data-analyst
**Command:** `*tracking-check`
**Duration:** 1 dia

### Meta Pixel
- [ ] Pixel instalado no site (verificar via Meta Pixel Helper ou Events Manager)
- [ ] Evento PageView disparando em todas as paginas
- [ ] Evento ViewContent disparando em paginas de produto/servico
- [ ] Evento Lead disparando em formularios
- [ ] Evento Purchase disparando com value (se e-commerce)
- [ ] Evento AddToCart disparando (se e-commerce)
- [ ] Conversions API configurada (server-side) - opcional mas recomendado
- [ ] Dominio verificado no Business Manager

### Google Tag
- [ ] Google Tag (gtag.js) instalado no site
- [ ] Eventos de conversao configurados no Google Ads
- [ ] Conversoes importadas do GA4 para Google Ads (se aplicavel)
- [ ] Enhanced Conversions habilitado (se possivel)

### GA4
- [ ] Data stream configurado corretamente
- [ ] Eventos recomendados implementados
- [ ] Metas/conversoes definidas
- [ ] Audiencias criadas para remarketing
- [ ] Linked com Google Ads

### UTMs
- [ ] Padrao de UTMs definido para o cliente
- [ ] Template de UTM documentado: `?utm_source={platform}&utm_medium={type}&utm_campaign={campaign}&utm_content={ad}`

### Output
- Relatorio de tracking com status de cada item
- Lista de acoes corretivas (se houver gaps)

---

## Step 3: Account Audit

**Owner:** @gestor-trafego
**Commands:** `*audit`
**Duration:** 2-3 dias

### Meta Ads Audit
- [ ] `node aios-marketing/bin/meta-ads.mjs campaigns <account_id> --format=table` - levantar estrutura
- [ ] `node aios-marketing/bin/meta-ads.mjs insights <account_id> --date-preset=last_30d --level=campaign` - performance
- [ ] Avaliar estrutura de campanha (nomenclatura, organizacao)
- [ ] Avaliar audiencias ativas (sobreposicao, tamanho, relevancia)
- [ ] Avaliar criativos (variedade, frequencia, performance)
- [ ] Identificar campanhas lucrativas vs deficitarias
- [ ] Identificar spend desperdicado (ads com alto CPA sem conversao)
- [ ] Avaliar bid strategy e otimizacao
- [ ] Documentar findings

### Google Ads Audit
- [ ] `node aios-marketing/bin/google-ads.mjs campaigns <customer_id> --format=table` - levantar estrutura
- [ ] `node aios-marketing/bin/google-ads.mjs insights <customer_id> --level=campaign --date-range=LAST_30_DAYS` - performance
- [ ] Avaliar estrutura de campanha e ad groups
- [ ] `node aios-marketing/bin/google-ads.mjs keyword-performance <adgroup_id> --customer=<cid>` - Quality Scores
- [ ] `node aios-marketing/bin/google-ads.mjs search-terms <campaign_id> --customer=<cid>` - termos irrelevantes
- [ ] Avaliar negativos (faltando ou excesso)
- [ ] Avaliar extensions (sitelinks, callouts, etc.)
- [ ] Avaliar bid strategy e budget pacing
- [ ] Documentar findings

### Output
- Documento de auditoria por plataforma
- Score de saude por area (Estrutura, Audiencia, Criativos, Tracking, Budget)
- Top 5 oportunidades de melhoria imediata
- Top 5 riscos/problemas a corrigir

---

## Step 4: Social Media Analysis

**Owner:** @social-analyst
**Command:** `*insta-account`
**Duration:** 1 dia

### Steps
- [ ] `node aios-marketing/bin/instagram-analyzer.mjs account --account=<username>` - perfil completo
- [ ] `node aios-marketing/bin/instagram-analyzer.mjs top-posts --account=<username>` - melhores posts
- [ ] `node aios-marketing/bin/instagram-analyzer.mjs posting-frequency --account=<username>` - frequencia
- [ ] `node aios-marketing/bin/instagram-analyzer.mjs format-analysis --account=<username>` - mix de formatos
- [ ] `node aios-marketing/bin/instagram-analyzer.mjs hashtag-performance --account=<username>` - hashtags
- [ ] Avaliar bio, highlights, link, CTA
- [ ] Avaliar consistencia visual e identidade
- [ ] Avaliar engagement rate vs benchmark do setor
- [ ] Identificar top formatos e temas que performam
- [ ] Documentar recomendacoes

### Output
- Relatorio de analise Instagram
- ER% atual vs benchmark
- Top 3 oportunidades de conteudo
- Recomendacoes de frequencia e formato

---

## Step 5: Baseline Performance Report

**Owner:** @data-analyst
**Duration:** 1 dia

### Steps
- [ ] Consolidar dados de performance dos ultimos 30/60/90 dias
- [ ] Calcular metricas baseline por plataforma:
  | Metrica | Meta Ads | Google Ads | Instagram |
  |---------|----------|------------|-----------|
  | Spend mensal | R$ | R$ | - |
  | ROAS | | | - |
  | CPA | R$ | R$ | - |
  | CTR | % | % | - |
  | CPC | R$ | R$ | - |
  | Conversoes/mes | | | - |
  | ER% | - | - | % |
  | Followers | - | - | |
- [ ] Identificar tendencias (melhorando/piorando)
- [ ] Comparar com benchmarks do setor
- [ ] Documentar baseline em `clients/<cliente>/benchmarks.yaml`

### Output
- Baseline report com metricas por plataforma
- Benchmarks de referencia
- Status atual: acima/na media/abaixo da media

---

## Step 6: Strategy Presentation

**Owner:** @gestor-trafego + @data-analyst
**Duration:** 1-2 dias

### Steps
- [ ] Compilar findings de todos os steps anteriores
- [ ] Definir objetivos de curto prazo (30 dias) e medio prazo (90 dias)
- [ ] Propor targets realistas baseados no baseline + benchmarks:
  | KPI | Baseline Atual | Target 30d | Target 90d |
  |-----|---------------|------------|------------|
  | ROAS | | | |
  | CPA | R$ | R$ | R$ |
  | Conversoes/mes | | | |
  | Budget recomendado | R$ | R$ | R$ |
- [ ] Definir estrategia por plataforma
- [ ] Definir mix de campanha (prospeccao vs retargeting)
- [ ] Definir timeline de implementacao
- [ ] Preparar apresentacao/documento para o cliente
- [ ] Apresentar e alinhar com cliente

### Output
- Documento de estrategia com targets
- Timeline de implementacao
- Budget aprovado
- Alinhamento com cliente registrado

---

## Step 7: Campaign Setup Begins

**Condition:** Estrategia aprovada pelo cliente

### Steps
- [ ] Atualizar `clients/<cliente>/profile.yaml` com targets aprovados
- [ ] Iniciar workflow `campaign-e2e.md` para primeira campanha
- [ ] Configurar retargeting usando workflow `retargeting-setup.md` (se aplicavel)
- [ ] Definir cadencia de reports (semanal/mensal)
- [ ] Agendar primeiro checkpoint de performance (7 dias apos lancamento)

---

## Onboarding Completion Checklist

| Item | Status |
|------|--------|
| Acessos verificados (Meta, Google, GA4, GSC, Instagram) | [ ] |
| Tracking validado (pixel, tag, eventos, UTMs) | [ ] |
| Audit completo (Meta Ads + Google Ads) | [ ] |
| Analise de Instagram realizada | [ ] |
| Baseline de performance documentado | [ ] |
| Estrategia apresentada e aprovada | [ ] |
| Client profile criado em `clients/` | [ ] |
| Primeira campanha em setup | [ ] |

---
*Workflow: Client Onboarding v1.0 - Synkra AIOS Marketing*
