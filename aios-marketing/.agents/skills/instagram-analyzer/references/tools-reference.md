# Instagram Analyzer CLI - Referencia Completa de Comandos

## Convencao de Valores

- **Engagement Rate (ER%):** (likes+comments)/followers * 100 (para visao geral); usar `media-insights` para ER% real baseado em reach
- **Usernames:** Sem @ (ex: `nike` nao `@nike`)
- **Media IDs:** Numerico (ex: `17841405822304914`)
- **Fonte de dados:** Instagram Graph API via Meta Business Manager

## Auth & Setup

### setup
Salvar credenciais em `~/.config/instagram-analyzer/.env`.

```bash
# Ver instrucoes
node instagram-analyzer.mjs setup

# Salvar credenciais
node instagram-analyzer.mjs setup --token=META_TOKEN
```

Flags: `--token`

### auth
Verificar token Meta e listar contas Instagram conectadas.

```bash
node instagram-analyzer.mjs auth
```

Retorna: facebook_user, instagram_accounts (com ig_user_id, username, followers).

### accounts
Listar todas as contas IG acessiveis pelo app.

```bash
node instagram-analyzer.mjs accounts
```

Retorna: lista completa de contas com username, followers, posts.

## Account Analysis - Graph API

### account
Analise completa de conta: bio, followers, ER medio, frequencia, mix de formatos.

```bash
node instagram-analyzer.mjs account --account=username
node instagram-analyzer.mjs account --account=username --format=table
```

Env requerido: `META_ACCESS_TOKEN` (conta via `--account=username` ou auto-detectada)

### media
Listar posts com metricas basicas.

```bash
node instagram-analyzer.mjs media --account=username --limit=25 --format=table
node instagram-analyzer.mjs media --account=username --after=CURSOR_VALUE
```

Flags: `--limit` (default 25), `--after` (cursor paginacao)
Colunas: id, date, type, likes, comments, caption, url

### media-insights
Insights detalhados de um post especifico.

```bash
node instagram-analyzer.mjs media-insights 17841405822304914
```

Retorna: likes, comments, saves, impressions, reach, engagement_rate

### top-posts
Ranking de posts por ER%.

```bash
node instagram-analyzer.mjs top-posts --account=username --limit=20 --format=table
node instagram-analyzer.mjs top-posts --account=username --pages=5 --limit=50 --format=table
```

Flags: `--limit` (default 20), `--pages` (paginas de paginacao, default 3)
Colunas: rank, date, day, hour, type, likes, comments, er, url

### posting-frequency
Analise de cadencia de posts com distribuicao por dia da semana e hora.

```bash
node instagram-analyzer.mjs posting-frequency --account=username --format=table
node instagram-analyzer.mjs posting-frequency --account=username --pages=5
```

Retorna: posts_per_week, by_day (dia + posts + avg_er), by_hour, best_day, best_hour

### format-analysis
Breakdown de performance por tipo de conteudo.

```bash
node instagram-analyzer.mjs format-analysis --account=username --format=table
```

Colunas: format, posts, pct, avg_likes, avg_comments, avg_er

### hashtag-performance
Correlacao de hashtags com engajamento (apenas hashtags usadas 2+ vezes).

```bash
node instagram-analyzer.mjs hashtag-performance --account=username --format=table
```

Colunas: hashtag, uses, avg_likes, avg_comments, avg_er

## Comparative

### benchmark
Comparar contas conectadas lado a lado.

```bash
node instagram-analyzer.mjs benchmark --account=my_brand --competitors=comp1,comp2,comp3 --format=table
```

Flags: `--competitors` (obrigatorio, separados por virgula, max 3 recomendado)
Colunas: account, followers, avg_likes, avg_comments, avg_er, posts_week, reels_pct

**Nota:** Todos os competidores devem ser contas conectadas via Meta Business Manager. Use `accounts` para ver contas disponiveis.
