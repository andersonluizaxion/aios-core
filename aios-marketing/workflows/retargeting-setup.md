# Retargeting Setup Workflow

```yaml
workflow:
  name: retargeting-setup
  description: Configuracao completa de retargeting cross-platform com segmentacao por funil
  version: 1.0.0
  agents: [gestor-trafego, copywriter, data-analyst]
  estimated_duration: 3-5 dias
```

---

## Prerequisites

- [ ] Pixel Meta instalado e com historico (min 1000 visitantes)
- [ ] Google Tag instalado e com historico
- [ ] Eventos de conversao configurados (PageView, AddToCart, Purchase, Lead)
- [ ] GA4 conectado com audiencias ativas
- [ ] Landing pages com UTMs padronizados
- [ ] Budget separado para retargeting definido

---

## Step 1: Define Audience Segments

**Owner:** @gestor-trafego
**Duration:** 1 dia

### Segment Map

| Segmento | Definicao | Janela | Funil | Prioridade |
|----------|-----------|--------|-------|------------|
| **Site Visitors** | Visitou qualquer pagina | 30 dias | TOFU -> MOFU | Media |
| **Content Engagers** | Tempo > 60s ou 2+ paginas | 30 dias | TOFU -> MOFU | Media |
| **Product Viewers** | Visitou pagina de produto/servico | 14 dias | MOFU -> BOFU | Alta |
| **Cart Abandoners** | Adicionou ao carrinho sem comprar | 7 dias | BOFU | Critica |
| **Lead (no close)** | Preencheu formulario sem fechar | 14 dias | BOFU | Critica |
| **Past Buyers** | Comprou nos ultimos 90 dias | 90 dias | Retention | Media |
| **Social Engagers** | Interagiu com perfil/pagina IG/FB | 30 dias | TOFU -> MOFU | Baixa |
| **Video Viewers** | Assistiu 50%+ de video | 30 dias | TOFU -> MOFU | Baixa |

### Steps
- [ ] Mapear eventos disponiveis no pixel/tag (quais segmentos sao possiveis)
- [ ] Definir janelas de retargeting por segmento
- [ ] Estimar tamanho de cada audiencia
- [ ] Priorizar segmentos com base em volume e intent
- [ ] Documentar segmentos que NAO sao possiveis (e o que falta para habilitar)

---

## Step 2: Map Content Per Segment

**Owner:** @copywriter + @gestor-trafego
**Duration:** 1-2 dias

### Content Strategy by Funnel Position

#### TOFU -> MOFU (Site Visitors + Social Engagers + Video Viewers)
- **Objetivo:** Aprofundar interesse e construir autoridade
- **Conteudo:**
  - [ ] Depoimentos e casos de sucesso
  - [ ] Conteudo educativo aprofundado (carrossel, video longo)
  - [ ] Prova social (numeros, certificacoes, resultados)
  - [ ] Comparativos (por que escolher X)
- **CTA:** Saiba mais / Veja como funciona / Agende uma conversa

#### MOFU -> BOFU (Product Viewers + Content Engagers)
- **Objetivo:** Converter interesse em acao
- **Conteudo:**
  - [ ] Oferta direta com beneficio claro
  - [ ] Urgencia/escassez (vagas limitadas, promocao por tempo limitado)
  - [ ] FAQ com objecoes respondidas
  - [ ] Demo ou trial gratuito
- **CTA:** Compre agora / Agende gratis / Solicite orcamento

#### BOFU (Cart Abandoners + Leads nao convertidos)
- **Objetivo:** Recuperar a conversao perdida
- **Conteudo:**
  - [ ] Lembrete do produto/servico visto
  - [ ] Incentivo (desconto, frete gratis, bonus)
  - [ ] Prova social final (reviews, antes/depois)
  - [ ] Garantia e reversao de risco
- **CTA:** Finalize sua compra / Aproveite o desconto / Ultima chance

#### Retention (Past Buyers)
- **Objetivo:** Upsell, cross-sell, recompra
- **Conteudo:**
  - [ ] Produtos complementares
  - [ ] Programa de fidelidade
  - [ ] Novidades e lancamentos
  - [ ] Conteudo exclusivo para clientes
- **CTA:** Veja novidades / Exclusivo para voce / Indique e ganhe

---

## Step 3: Define Frequency Caps

**Owner:** @gestor-trafego
**Duration:** 0.5 dia

### Frequency Cap por Segmento

| Segmento | Frequency Cap | Justificativa |
|----------|---------------|---------------|
| Cart Abandoners | 3x/dia por 3 dias, depois 1x/dia | Alta urgencia, janela curta |
| Lead (no close) | 2x/dia por 5 dias, depois 1x/dia | Alta urgencia, ciclo de decisao |
| Product Viewers | 1x/dia | Manter presenca sem irritar |
| Site Visitors | 1x/dia | Awareness, nao pressionar |
| Social Engagers | 3x/semana | Relacionamento, nao push |
| Past Buyers | 2x/semana | Manter relacionamento leve |
| Content Engagers | 1x/dia | Nutrir interesse |
| Video Viewers | 3x/semana | Reforcar mensagem |

### Steps
- [ ] Configurar frequency caps por ad set na plataforma
- [ ] Definir burn pixel (parar de mostrar ad apos conversao)
- [ ] Monitorar frequency real vs cap nos primeiros 7 dias
- [ ] Ajustar caps com base em feedback de performance

---

## Step 4: Create Exclusion Rules

**Owner:** @gestor-trafego
**Duration:** 0.5 dia

### Exclusion Matrix

| Campanha Target | Excluir |
|-----------------|---------|
| TOFU -> MOFU | Compradores (90 dias) |
| MOFU -> BOFU | Compradores (90 dias) |
| BOFU (abandono) | Compradores (7 dias) |
| Retention | Nao-compradores |
| Todas | Funcionarios, concorrentes (se possivel) |

### Steps
- [ ] Criar audiencia de compradores para exclusao
- [ ] Configurar exclusoes em cada ad set
- [ ] Verificar que nao ha sobreposicao entre segmentos
- [ ] Criar lista de exclusao de funcionarios/equipe
- [ ] Testar que exclusoes estao funcionando (verificar delivery)

---

## Step 5: Budget Allocation

**Owner:** @gestor-trafego
**Duration:** 0.5 dia

### Budget Distribution by Funnel Stage

| Funil | % do Budget Retargeting | Justificativa |
|-------|-------------------------|---------------|
| **BOFU** (Cart Abandoners + Leads) | **60%** | Maior intent, melhor ROI imediato |
| **MOFU** (Product Viewers + Engagers) | **25%** | Nutrir leads qualificados |
| **TOFU -> MOFU** (Visitors + Social) | **15%** | Mover para consideracao |

### Budget Calculation
```
Budget total retargeting = 20-30% do budget total de trafego pago
  BOFU: 60% x budget retargeting
  MOFU: 25% x budget retargeting
  TOFU->MOFU: 15% x budget retargeting
```

### Steps
- [ ] Calcular budget total de retargeting (20-30% do budget total)
- [ ] Distribuir por funil stage conforme tabela acima
- [ ] Calcular budget diario por ad set
- [ ] Verificar que budget diario >= 3x CPA target por ad set
- [ ] Se budget insuficiente para algum segmento, priorizar BOFU e cortar TOFU

---

## Step 6: Cross-Platform Configuration

**Owner:** @gestor-trafego + @data-analyst
**Duration:** 1 dia

### Meta Pixel Setup
- [ ] Verificar pixel instalado: `node aios-marketing/bin/meta-ads.mjs insights <account_id>` (confirmar dados chegando)
- [ ] Confirmar eventos configurados (PageView, ViewContent, AddToCart, Purchase, Lead)
- [ ] Criar Custom Audiences por segmento definido no Step 1
- [ ] Configurar exclusoes (Step 4)
- [ ] Verificar que audiencias tem tamanho suficiente (min 100 para delivery)

### Google Tag Setup
- [ ] Verificar Google Tag instalado e disparando
- [ ] Confirmar conversoes configuradas no Google Ads
- [ ] Criar Remarketing Lists no Google Ads (por pagina, evento, duracao)
- [ ] Configurar RLSA (Remarketing Lists for Search Ads) para campanhas Search
- [ ] Configurar exclusoes de audiencia
- [ ] Verificar que listas tem tamanho suficiente (min 100 para Display, 1000 para Search)

### Cross-Platform Coordination
- [ ] Garantir que pixel Meta e Google Tag estao na mesma pagina (nao duplicado)
- [ ] Alinhar janelas de conversao entre plataformas
- [ ] Evitar mostrar o mesmo ad na Meta e Google ao mesmo usuario (frequency total)
- [ ] Definir qual plataforma lidera por segmento (Meta para social, Google para intent)

---

## Step 7: Launch and Monitor

**Owner:** @gestor-trafego
**Duration:** Ongoing

### Steps
- [ ] Ativar campanhas de retargeting em PAUSED primeiro
- [ ] Executar checklist `campaign-launch.md` para cada campanha
- [ ] Ativar por prioridade: BOFU primeiro, depois MOFU, depois TOFU
- [ ] Monitorar delivery nos primeiros 3 dias (3x/dia)
- [ ] Verificar que frequency caps estao sendo respeitados
- [ ] Verificar que exclusoes estao funcionando
- [ ] Ajustar apos 7 dias com dados reais

---

## Success Criteria

| Metrica | Target |
|---------|--------|
| BOFU CPA | < 0.5x CPA de prospeccao |
| BOFU ROAS | > 2x ROAS de prospeccao |
| Frequency real | Dentro dos caps definidos |
| Sem sobreposicao | 0% de audiencia duplicada entre segmentos |
| Exclusoes funcionando | Compradores nao recebem ads de conversao |
| Todas as plataformas ativas | Meta + Google configurados |

---
*Workflow: Retargeting Setup v1.0 - Synkra AIOS Marketing*
