# Coding Standards - aios-marketing CLIs

Padrao de desenvolvimento para CLIs de marketing do AIOS.

## Principio: Zero Dependencies

Todos os CLIs usam **apenas Node.js 18+ nativo**. Nenhum `npm install` necessario.

- `fetch` nativo (Node 18+) para chamadas HTTP
- `fs` nativo para leitura de arquivos (.env, config)
- `path`, `url`, `os` nativos para caminhos e sistema
- Sem `axios`, sem `node-fetch`, sem `dotenv`

Isso garante que qualquer CLI funciona em qualquer maquina com Node 18+ instalado, sem setup de dependencias.

## Env Cascade Pattern

Todas as CLIs seguem a mesma cascata de carregamento de credenciais:

```
1. Shell environment variables     (maior prioridade)
2. .env do diretorio atual         (projeto do usuario)
3. aios-marketing/.env             (projeto marketing)
4. ~/.config/{tool-name}/.env      (global, menor prioridade)
```

Implementacao padrao:

```javascript
function loadEnv() {
  // Ja definido no shell? Usa direto.
  if (process.env.META_ACCESS_TOKEN) return;

  // Cascade: projeto atual > aios-marketing > global
  const candidates = [
    path.resolve('.env'),
    path.resolve(import.meta.dirname, '../.env'),
    path.join(os.homedir(), '.config', 'tool-name', '.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.+)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].trim();
        }
      }
    }
  }
}
```

## CLI Flags Consistentes

Todas as CLIs compartilham flags globais padrao:

| Flag | Descricao | Default |
|------|-----------|---------|
| `--format=table\|json` | Formato de output | `table` |
| `--limit=N` | Limitar resultados | varia |
| `--account=username` | Selecao de conta (multi-account) | auto-detect |

Parsing de flags sem dependencias:

```javascript
function parseArgs(args) {
  const flags = {};
  const positional = [];

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      flags[key] = rest.join('=') || true;
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}
```

## Auth Command Pattern

Todo CLI deve ter um comando `auth` que guia o usuario no primeiro setup:

```javascript
function showAuthGuide() {
  console.log(`
=== Setup Guide ===

1. Acesse https://...
2. Crie suas credenciais
3. Execute:

   node aios-marketing/bin/tool-name.mjs setup --token=YOUR_TOKEN

4. Teste:

   node aios-marketing/bin/tool-name.mjs accounts
  `);
}
```

E um comando `setup` que persiste credenciais:

```javascript
async function setupCredentials(flags) {
  const configDir = path.join(os.homedir(), '.config', 'tool-name');
  fs.mkdirSync(configDir, { recursive: true });

  const envContent = `TOKEN=$ {flags.token}\n`;
  fs.writeFileSync(path.join(configDir, '.env'), envContent);

  console.log('Credenciais salvas em ~/.config/tool-name/.env');
}
```

## Error Handling

Todas as chamadas de API devem ter tratamento de erro descritivo:

```javascript
async function apiCall(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (data.error) {
      console.error(`API Error: ${data.error.message} (code: ${data.error.code})`);
      if (data.error.code === 190) {
        console.error('Token expirado. Execute: node aios-marketing/bin/tool-name.mjs auth');
      }
      process.exit(1);
    }

    return data;
  } catch (err) {
    console.error(`Request failed: ${err.message}`);
    process.exit(1);
  }
}
```

## Rate Limit Handling

Respeitar rate limits das APIs com backoff exponencial:

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429 || res.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries: ${res.status}`);
      }
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.error(`Rate limited. Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    return res;
  }
}
```

## Read-Only by Default

Todas as operacoes de leitura funcionam sem confirmacao. Operacoes de escrita (criar, editar, pausar, deletar) exigem confirmacao explicita do usuario:

```javascript
async function confirmAction(description) {
  // Em CLIs interativos: perguntar ao usuario
  // Em contexto AIOS: o agente SEMPRE mostra preview antes de executar
  console.log(`\nAcao: ${description}`);
  console.log('Confirma? (o agente deve confirmar antes de prosseguir)');
}
```

Regras de seguranca:
- Campanhas SEMPRE criadas como `PAUSED`
- Max 20% de aumento de budget por dia
- Preview obrigatorio antes de mutacoes

## Table Output Formatting

Padrao de formatacao de tabelas para output legivel:

```javascript
function formatTable(rows, columns) {
  if (rows.length === 0) {
    console.log('No results.');
    return;
  }

  // Calcular larguras
  const widths = columns.map(col => {
    const values = rows.map(r => String(r[col.key] ?? '').length);
    return Math.max(col.label.length, ...values);
  });

  // Header
  const header = columns.map((col, i) => col.label.padEnd(widths[i])).join(' | ');
  const separator = widths.map(w => '-'.repeat(w)).join('-+-');

  console.log(header);
  console.log(separator);

  // Rows
  for (const row of rows) {
    const line = columns.map((col, i) =>
      String(row[col.key] ?? '').padEnd(widths[i])
    ).join(' | ');
    console.log(line);
  }
}
```

## File Structure for New CLIs

Ao criar um novo CLI, seguir esta estrutura:

```
bin/
  new-tool.mjs              # CLI principal (executavel, zero deps)

.agents/skills/new-tool/
  SKILL.md                  # Descricao, triggers, workflow padrao
  references/
    tools-reference.md      # Referencia completa de comandos
    campaign-patterns.md    # Padroes especificos (se aplicavel)

squads/{squad-name}/
  agents/agent-name.md      # Definicao do agente que usa o CLI
  tasks/*.md                # Tasks que usam o CLI

.agent/workflows/
  agent-name.md             # Routing de comandos *comando -> task/CLI

.claude/commands/Marketing/agents/
  agent-name.md             # Agent definition para Claude Code
```

Checklist para novo CLI:
- [ ] Arquivo `.mjs` em `bin/` com shebang e zero deps
- [ ] `loadEnv()` com cascata padrao
- [ ] `parseArgs()` com flags globais
- [ ] Comando `auth` com guia de setup
- [ ] Comando `setup` para persistir credenciais
- [ ] Output `--format=table` como default
- [ ] Error handling com mensagens descritivas
- [ ] Rate limit handling com backoff
- [ ] SKILL.md com triggers e workflow
- [ ] Referencia de comandos em `references/`
- [ ] Entrada no `.env.example`
- [ ] Entrada no `tech-stack.yaml`
