# Meta Ads - Padroes de Campanha por Objetivo

## Campanha de Vendas (E-commerce)

### Estrutura Recomendada
```
Campanha: [SALES]-[Produto]-[Data]
├── Ad Set: Prospecting - Interesses
│   ├── Targeting: interesses do nicho
│   ├── Budget: 60% do total
│   ├── Optimization: PURCHASE
│   └── Ads: 3-5 variantes de criativo
├── Ad Set: Prospecting - Lookalike
│   ├── Targeting: LAL 1-3% de compradores
│   ├── Budget: 25% do total
│   └── Ads: Top 3 criativos do set anterior
└── Ad Set: Retargeting
    ├── Targeting: visitantes 7-30d, cart abandon
    ├── Budget: 15% do total
    └── Ads: criativos com urgencia/prova social
```

### Workflow CLI
```
1. node meta-ads.mjs pages act_ID → selecionar pagina
2. node meta-ads.mjs search-interests "nicho" → buscar interesses do nicho
3. node meta-ads.mjs search-locations "Brasil" → definir geo
4. node meta-ads.mjs create-campaign --account=act_ID --name="SALES-Produto" --objective=SALES
5. node meta-ads.mjs create-adset → 3x (prospecting interesses, LAL, retargeting)
6. node meta-ads.mjs upload-image act_ID /path → upload criativos
7. node meta-ads.mjs create-creative --account=act_ID --name="..." → criar criativos
8. node meta-ads.mjs create-ad --account=act_ID --adset=ID → vincular aos ad sets
```

### Metricas de Sucesso
- ROAS > 3x (minimo viavel)
- CPA < ticket medio * margem
- CTR > 1.5%
- Frequency < 3 (prospecting), < 5 (retargeting)

---

## Campanha de Lead Generation

### Estrutura Recomendada
```
Campanha: [LEADS]-[Oferta]-[Data]
├── Ad Set: Publico Frio - Interesses
│   ├── Targeting: interesses profissionais
│   ├── Budget: 50% do total
│   ├── Optimization: LEAD_GENERATION
│   └── Ads: 3 variantes com lead magnet
├── Ad Set: Publico Frio - Comportamentos
│   ├── Targeting: comportamentos + demograficos
│   ├── Budget: 30% do total
│   └── Ads: 2-3 variantes
└── Ad Set: Retargeting - Engajamento
    ├── Targeting: engajou com pagina/post 30d
    ├── Budget: 20% do total
    └── Ads: criativos com depoimentos
```

### Workflow CLI
```
1. node meta-ads.mjs search-interests "profissao" → interesses profissionais
2. node meta-ads.mjs search-behaviors "comportamento" → comportamentos relevantes
3. node meta-ads.mjs search-demographics "filtro" → filtros demograficos
4. node meta-ads.mjs create-campaign --account=act_ID --name="LEADS-Oferta" --objective=LEADS
5. node meta-ads.mjs create-adset → com instant form ou LP
6. node meta-ads.mjs create-creative --account=act_ID → criativos com lead magnet
7. node meta-ads.mjs create-ad --account=act_ID --adset=ID → vincular
```

### Metricas de Sucesso
- CPL < 10% do ticket medio
- Taxa de conversao LP > 20%
- SQL Rate > 15%
- CTR > 1.0%

---

## Campanha de Trafego

### Estrutura Recomendada
```
Campanha: [TRAFFIC]-[Destino]-[Data]
├── Ad Set: Publico Amplo
│   ├── Targeting: broad + Advantage+ (quando disponivel)
│   ├── Budget: 70% do total
│   ├── Optimization: LINK_CLICKS ou LANDING_PAGE_VIEWS
│   └── Ads: 5+ variantes para discovery
└── Ad Set: Retargeting
    ├── Targeting: visitantes que nao converteram
    ├── Budget: 30% do total
    └── Ads: criativos com prova social
```

---

## Campanha de Awareness

### Estrutura Recomendada
```
Campanha: [AWARENESS]-[Marca]-[Data]
├── Ad Set: Alcance Amplo
│   ├── Targeting: broad demografico
│   ├── Budget: 80% do total
│   ├── Optimization: REACH
│   ├── Frequency cap: max 2/semana
│   └── Ads: video branding + imagem
└── Ad Set: Publico Estrategico
    ├── Targeting: interesses especificos do ICP
    ├── Budget: 20% do total
    └── Ads: conteudo educativo
```

---

## Rotina de Otimizacao Diaria

### Check Matinal (via CLI)
```
1. node meta-ads.mjs insights act_ID --date-preset=yesterday --level=campaign --format=table
   → Verificar: CPA, ROAS, spend, impressions por campanha

2. Para campanhas com CPA > 1.5x target:
   → node meta-ads.mjs insights CAMPAIGN_ID --date-preset=yesterday --level=adset
   → Identificar ad sets problematicos
   → node meta-ads.mjs update-adset ADSET_ID --daily-budget=X ou --status=PAUSED

3. Para ads com CTR < 0.5% e impressions > 1000:
   → node meta-ads.mjs update-ad AD_ID --status=PAUSED

4. Para ad sets com Frequency > 4:
   → Sinal de creative fatigue
   → Preparar novos criativos
```

### Scaling Semanal
```
1. node meta-ads.mjs insights act_ID --date-preset=last_7d --level=adset --format=table
2. Identificar top performers (ROAS > target)
3. node meta-ads.mjs update-adset ADSET_ID --daily-budget=X → aumentar budget 15-20%
4. Duplicar ad set vencedor com novo publico (horizontal scaling)
5. node meta-ads.mjs create-adset --account=act_ID --campaign=ID → novo ad set com LAL
```

---

## Nomenclatura Padrao

```
Campanha:  [OBJETIVO]-[Produto/Oferta]-[MMDD]
Ad Set:    [Tipo]-[Publico]-[Geo]
Ad:        [Formato]-[Variante]-[v1/v2]
Criativo:  [Produto]-[Formato]-[Hook]-[v1]
```

Exemplos:
- `SALES-CursoX-0219`
- `PROSP-InteressesMarketing-BR`
- `IMG-Depoimento-v1`
- `CursoX-Video-PainPoint-v2`
