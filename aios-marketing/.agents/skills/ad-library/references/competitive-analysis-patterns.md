# Competitive Analysis Patterns - Ad Library

## Padroes de Analise Competitiva

Este documento descreve frameworks e padroes para analise competitiva usando a Ad Library CLI.

## 1. Auditoria Completa de Concorrente

Workflow sequencial para entender a estrategia de ads de um concorrente:

```bash
# Passo 1: Encontrar o concorrente
node ad-library.mjs search "nome do concorrente" --format=table

# Passo 2: Overview de todos os anuncios
node ad-library.mjs advertiser PAGE_ID --format=table

# Passo 3: O que esta rodando agora?
node ad-library.mjs active PAGE_ID --format=table

# Passo 4: Qual a cadencia de novos anuncios?
node ad-library.mjs trends PAGE_ID

# Passo 5: Quais formatos criativos predominam?
node ad-library.mjs formats PAGE_ID --format=table
```

### O que observar:

- **Volume de anuncios ativos** - Indica investimento/escala
- **Tempo de vida dos anuncios** - Anuncios com muitos dias = criativos vencedores
- **Cadencia mensal** - Frequencia de renovacao de criativos
- **Mix de formatos** - Video vs Imagem vs Carrossel indica estrategia de conteudo
- **Plataformas** - Facebook vs Instagram vs Audience Network

## 2. Mapeamento de Nicho

Para entender o cenario competitivo de um nicho:

```bash
# Pesquisar por diferentes termos do nicho
node ad-library.mjs search "cirurgia plastica" --format=table
node ad-library.mjs search "harmonizacao facial" --format=table
node ad-library.mjs search "estetica avancada" --format=table
```

### Framework de Classificacao:

| Nivel | Ads Ativos | Cadencia | Formatos | Classificacao |
|-------|-----------|----------|----------|---------------|
| Alto | 20+ | 10+/mes | Variados | Investidor Pesado |
| Medio | 5-20 | 3-10/mes | 2-3 tipos | Investidor Consistente |
| Baixo | 1-5 | 1-3/mes | 1 tipo | Investidor Iniciante |
| Zero | 0 | - | - | Sem Presenca Paga |

## 3. Analise de Criativo Vencedor

Identificar criativos de alta performance (sem dados de metricas, usa proxies):

### Proxies de Performance:
- **Longevidade** - Anuncio rodando ha 30+ dias = provavelmente lucrativo
- **Variacoes** - Multiplas versoes do mesmo conceito = teste A/B ativo
- **Formato dominante** - Se 80%+ e video, video funciona melhor naquele nicho
- **Copy patterns** - Identificar hooks, CTAs e frameworks recorrentes

### O que documentar:
1. **Hook** - Primeira frase do texto (3-5 palavras iniciais)
2. **Formato** - Video/Imagem/Carrossel
3. **CTA** - Call to action usado
4. **Oferta** - Qual a proposta de valor
5. **Tempo ativo** - Quantos dias rodando
6. **Plataforma** - Onde esta distribuido

## 4. Report de Inteligencia Competitiva

Estrutura recomendada para report:

```markdown
## Analise Competitiva - [NOME DO CONCORRENTE]

### Resumo
- Total de anuncios: X
- Ativos agora: Y
- Cadencia: Z anuncios/mes

### Estrategia de Formato
- Video: X%
- Imagem: Y%
- Carrossel: Z%

### Plataformas
- Facebook: X%
- Instagram: Y%

### Criativos Vencedores (Longevidade)
1. [Ad com mais dias rodando]
2. [Segundo mais antigo]
3. [Terceiro]

### Padroes de Copy
- Hook dominante: [tipo]
- CTA mais usado: [tipo]
- Tom de voz: [formal/informal/urgente]

### Recomendacoes
1. [Acao 1]
2. [Acao 2]
3. [Acao 3]
```

## 5. Regras de Analise

- NUNCA copiar criativos - apenas identificar padroes e reinterpretar
- Longevidade e um PROXY, nao prova de performance (pode ser esquecimento)
- Ad Library nao mostra metricas reais (reach, CTR, CPA) - apenas dados publicos
- Concorrentes com zero anuncios podem usar outras plataformas (Google, TikTok)
- Considerar sazonalidade: picos de anuncios podem ser campanha sazonal
