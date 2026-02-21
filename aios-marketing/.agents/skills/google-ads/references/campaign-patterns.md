# Google Ads - Padroes de Campanha por Tipo

## Nomenclatura Padrao

```
[TIPO]-[Produto/Oferta]-[MMDD]
Exemplos: SEARCH-CursoX-0220, DISPLAY-Remarketing-0220, PMAX-EcommerceY-0220
```

---

## 1. Search Campaign (Campanha de Busca)

### Estrutura
```
Campaign: SEARCH-ProdutoX-0220
├── Ad Group: AG-Exato-ProdutoX
│   ├── Keywords: [produto x] (EXACT)
│   ├── Keywords: [comprar produto x] (EXACT)
│   └── RSA: 3+ headlines, 2+ descriptions
├── Ad Group: AG-Frase-ProdutoX
│   ├── Keywords: "produto x preco" (PHRASE)
│   ├── Keywords: "produto x onde comprar" (PHRASE)
│   └── RSA: 3+ headlines, 2+ descriptions
└── Ad Group: AG-Ampla-Categoria
    ├── Keywords: produto categoria (BROAD)
    └── RSA: 3+ headlines, 2+ descriptions
```

### Workflow CLI
```bash
# 1. Campanha
node google-ads.mjs create-campaign --customer=CID --name="SEARCH-ProdutoX-0220" --type=SEARCH --budget-micros=50000000 --bid-strategy=MANUAL_CPC

# 2. Ad Groups
node google-ads.mjs create-adgroup --customer=CID --campaign=CAMP_ID --name="AG-Exato-ProdutoX" --cpc-bid-micros=3000000
node google-ads.mjs create-adgroup --customer=CID --campaign=CAMP_ID --name="AG-Frase-ProdutoX" --cpc-bid-micros=2500000

# 3. Keywords
node google-ads.mjs add-keywords --customer=CID --adgroup=AG1_ID --keywords="produto x,comprar produto x" --match-type=EXACT
node google-ads.mjs add-keywords --customer=CID --adgroup=AG2_ID --keywords="produto x preco,produto x onde comprar" --match-type=PHRASE

# 4. RSA
node google-ads.mjs create-ad --customer=CID --adgroup=AG1_ID --headlines="Compre ProdutoX Agora|Oferta Exclusiva ProdutoX|Frete Gratis ProdutoX" --descriptions="Aproveite desconto de lancamento. Compre agora|Entrega rapida para todo Brasil. Garantia total" --final-url=https://site.com/produto --path1=produto --path2=oferta
```

### Metricas de Sucesso
- Quality Score >= 7
- CTR >= 3%
- CPC dentro do target
- Search Impression Share >= 60%

---

## 2. Display Campaign (Rede de Display)

### Estrutura
```
Campaign: DISPLAY-Remarketing-0220
├── Ad Group: AG-Visitantes-Site
│   ├── Audience: Site visitors (last 30 days)
│   └── Responsive Display Ad
├── Ad Group: AG-Lookalike-Compradores
│   ├── Audience: Similar to purchasers
│   └── Responsive Display Ad
└── Ad Group: AG-InMarket-Categoria
    ├── Audience: In-market for category
    └── Responsive Display Ad
```

### Metricas de Sucesso
- CPM dentro do benchmark do setor
- Viewability >= 50%
- CPA dentro do target
- Frequency < 5 por semana

---

## 3. Shopping Campaign (E-commerce)

### Estrutura
```
Campaign: SHOPPING-Loja-0220
├── Ad Group: AG-Produtos-Top
│   └── Product Groups: Top sellers
├── Ad Group: AG-Categoria-A
│   └── Product Groups: Category A
└── Ad Group: AG-Todos-Produtos
    └── Product Groups: Catch-all
```

### Pre-requisitos
- Google Merchant Center configurado
- Feed de produtos ativo e aprovado
- Conta Merchant vinculada ao Google Ads

### Metricas de Sucesso
- ROAS >= 4x
- CPC competitivo para categoria
- Impression Share >= 40%
- Conversion Rate >= 2%

---

## 4. Performance Max Campaign

### Estrutura
```
Campaign: PMAX-ProdutoX-0220
└── Asset Group: AG-ProdutoX
    ├── Headlines: 5-15 variantes
    ├── Long Headlines: 1-5 variantes
    ├── Descriptions: 2-5 variantes
    ├── Images: 3+ landscape, 3+ square, 1+ portrait
    ├── Logos: 1+ square, 1+ landscape
    ├── Videos: 1+ (opcional mas recomendado)
    └── Final URL: url destino
```

### Workflow CLI
```bash
# PMax usa configuracao automatizada - criar via interface ou API avancada
node google-ads.mjs create-campaign --customer=CID --name="PMAX-ProdutoX-0220" --type=PERFORMANCE_MAX --budget-micros=100000000 --bid-strategy=MAXIMIZE_CONVERSIONS
```

### Metricas de Sucesso
- CPA ou ROAS dentro do target
- Conversions volume crescente
- Asset performance (Best/Good/Low)

---

## 5. Video Campaign (YouTube)

### Estrutura
```
Campaign: VIDEO-Brand-0220
├── Ad Group: AG-InStream-Skip
│   ├── Targeting: Custom audiences + demographics
│   └── Video Ad: 15-30s skippable
├── Ad Group: AG-InStream-NonSkip
│   ├── Targeting: Remarketing
│   └── Video Ad: 15s non-skippable
└── Ad Group: AG-Discovery
    ├── Targeting: In-market + affinity
    └── Video Ad: thumbnail + title
```

### Metricas de Sucesso
- CPV <= R$ 0.10 (video views)
- View Rate >= 25%
- CTR (para Discovery) >= 1%
- Brand Lift (se disponivel)

---

## Distribuicao de Budget por Tipo

### E-commerce / Vendas Diretas
| Tipo | % Budget | Objetivo |
|------|----------|----------|
| Search (Brand) | 15% | Proteger marca |
| Search (Non-Brand) | 35% | Capturar demanda |
| Shopping | 30% | Produtos direto |
| Performance Max | 15% | Multi-canal |
| Display (Remarketing) | 5% | Recuperar visitantes |

### Lead Generation
| Tipo | % Budget | Objetivo |
|------|----------|----------|
| Search (Non-Brand) | 50% | Capturar intencao |
| Search (Brand) | 10% | Proteger marca |
| Display (Remarketing) | 15% | Nurturing |
| YouTube | 15% | Awareness + educacao |
| Performance Max | 10% | Escala multi-canal |

### Awareness / Branding
| Tipo | % Budget | Objetivo |
|------|----------|----------|
| YouTube | 40% | Video views, reach |
| Display | 30% | Impressoes, visibilidade |
| Search (Brand) | 10% | Proteger marca |
| Performance Max | 20% | Multi-canal |

---

## Rotina de Otimizacao Diaria

```bash
# 1. Verificar campanhas ativas
node google-ads.mjs campaigns CID --status=ENABLED --format=table

# 2. Metricas de ontem por ad group
node google-ads.mjs insights CID --level=adgroup --date-range=LAST_7_DAYS --format=table

# 3. Keywords com problemas (Quality Score, CTR)
node google-ads.mjs keyword-performance ADGROUP_ID --customer=CID

# 4. Termos de busca para negativar
node google-ads.mjs search-terms CAMPAIGN_ID --customer=CID

# 5. Pausar ads com CTR baixo
node google-ads.mjs update-ad AD_ID --customer=CID --adgroup=AG_ID --status=PAUSED

# 6. Ajustar bids (max 20%/dia)
node google-ads.mjs update-adgroup AG_ID --customer=CID --cpc-bid-micros=NEW_BID
```

## Criterios de Decisao

| Situacao | Acao |
|----------|------|
| Quality Score < 5 | Melhorar relevancia: keywords, ad copy, landing page |
| CTR < 1% (Search) | Revisar headlines, testar novas variantes |
| CPA > 2x target por 5 dias | Pausar ou reduzir bid |
| ROAS > target consistente | Candidato a scaling (max 20%/dia) |
| Search Impression Share < 30% | Avaliar bid ou budget |
| Frequency > 5 (Display) | Rotacionar criativos ou expandir audiencia |
