---
name: whatsapp-business
description: WhatsApp Business CLI for managing WhatsApp Business API via Meta Graph API. Use when the user needs to check WhatsApp Business accounts, phone numbers, message templates, conversation analytics, template performance, or send template messages. Triggers include "whatsapp business", "whatsapp api", "templates whatsapp", "enviar template", "analytics whatsapp", "conversas whatsapp", "phone numbers whatsapp", "waba", or any task requiring direct interaction with WhatsApp Business Platform API.
allowed-tools: Bash(node *whatsapp-business.mjs:*)
---

# WhatsApp Business CLI - Gestao via Graph API

## Quando Usar Esta Skill

Use esta skill quando precisar interagir DIRETAMENTE com a plataforma WhatsApp Business API. Isso inclui:

- Verificar status de contas e telefones WhatsApp Business
- Listar e analisar templates de mensagem
- Consultar analytics de conversas (volume, custo, direcao)
- Consultar performance de templates (enviados, entregues, lidos, clicados)
- Enviar mensagens via template aprovado (com confirmacao)
- Gerenciar credenciais de acesso

## Pre-Requisitos

1. `META_ACCESS_TOKEN` configurado no ambiente (mesmo token do Meta Ads)
2. `WHATSAPP_BUSINESS_ACCOUNT_ID` configurado (WABA ID do Business Manager)
3. Node.js 18+ instalado
4. CLI: `aios-marketing/bin/whatsapp-business.mjs`

Setup rapido:
```bash
# Se ja tem meta-ads configurado, so precisa do WABA ID
# Descobrir WABA ID
node aios-marketing/bin/whatsapp-business.mjs accounts

# Salvar credenciais
node aios-marketing/bin/whatsapp-business.mjs setup --waba-id=YOUR_WABA_ID

# Ou setup completo (token + WABA ID)
node aios-marketing/bin/whatsapp-business.mjs setup --token=YOUR_TOKEN --waba-id=YOUR_WABA_ID

# Verificar acesso
node aios-marketing/bin/whatsapp-business.mjs auth
```

## CLI Syntax

```bash
node aios-marketing/bin/whatsapp-business.mjs <command> [args] [--flags]
```

Flags globais:
- `--format=table` - Output formatado em tabela (legivel)
- `--fields=f1,f2,...` - Selecionar campos especificos
- `--limit=N` - Limitar numero de resultados
- `--date-preset=last_7d|last_30d|last_90d` - Periodo para analytics
- `--since=YYYY-MM-DD --until=YYYY-MM-DD` - Periodo customizado

## Workflow Padrao

### 1. Autenticacao (primeira vez)
```bash
# Verificar token (reusa META_ACCESS_TOKEN do meta-ads)
node aios-marketing/bin/whatsapp-business.mjs auth

# Descobrir WABA ID
node aios-marketing/bin/whatsapp-business.mjs accounts --format=table

# Salvar WABA ID
node aios-marketing/bin/whatsapp-business.mjs setup --waba-id=YOUR_WABA_ID
```

### 2. Descoberta de Conta
```bash
# Listar contas WhatsApp Business
node aios-marketing/bin/whatsapp-business.mjs accounts --format=table

# Listar telefones registrados
node aios-marketing/bin/whatsapp-business.mjs phone-numbers --format=table

# Verificar status completo
node aios-marketing/bin/whatsapp-business.mjs auth
```

### 3. Gestao de Templates
```bash
# Listar todos os templates
node aios-marketing/bin/whatsapp-business.mjs templates --format=table

# Filtrar por status
node aios-marketing/bin/whatsapp-business.mjs templates --status=APPROVED --format=table

# Filtrar por categoria
node aios-marketing/bin/whatsapp-business.mjs templates --category=MARKETING --format=table

# Detalhes de um template
node aios-marketing/bin/whatsapp-business.mjs template-details --name=template_name
```

### 4. Analytics de Templates
```bash
# Performance ultimos 7 dias
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_7d --format=table

# Performance ultimos 30 dias
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_30d --format=table

# Periodo customizado
node aios-marketing/bin/whatsapp-business.mjs template-analytics --since=2026-01-01 --until=2026-01-31
```

### 5. Analytics de Conversas
```bash
# Volume de conversas ultimos 30 dias
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_30d --format=table

# Detalhado por dia
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_7d --format=table

# Periodo customizado
node aios-marketing/bin/whatsapp-business.mjs analytics --since=2026-02-01 --until=2026-02-20
```

### 6. Envio de Template (com confirmacao)
```bash
# Enviar template simples
node aios-marketing/bin/whatsapp-business.mjs send-template \
  --phone-number-id=PHONE_ID \
  --to=5511999999999 \
  --template=hello_world \
  --language=pt_BR

# Enviar template com parametros
node aios-marketing/bin/whatsapp-business.mjs send-template \
  --phone-number-id=PHONE_ID \
  --to=5511999999999 \
  --template=order_update \
  --params='[{"type":"body","parameters":[{"type":"text","text":"Pedro"},{"type":"text","text":"#12345"}]}]'
```

## Padroes de Uso Comuns

### Auditoria de Conta
```bash
node aios-marketing/bin/whatsapp-business.mjs auth
node aios-marketing/bin/whatsapp-business.mjs phone-numbers --format=table
node aios-marketing/bin/whatsapp-business.mjs templates --format=table
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_30d --format=table
```

### Revisao Semanal de Performance
```bash
# Templates: quais foram mais lidos?
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_7d --format=table

# Conversas: volume e custo
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_7d --format=table

# Qualidade dos telefones
node aios-marketing/bin/whatsapp-business.mjs phone-numbers --format=table
```

### Checklist de Qualidade
```bash
# 1. Verificar quality rating dos telefones (GREEN = bom, YELLOW = atencao, RED = critico)
node aios-marketing/bin/whatsapp-business.mjs phone-numbers --format=table

# 2. Verificar templates rejeitados
node aios-marketing/bin/whatsapp-business.mjs templates --status=REJECTED --format=table

# 3. Verificar taxa de leitura dos templates
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_7d --format=table
```

## Regras de Seguranca

- NUNCA enviar mensagens sem confirmacao explicita do usuario
- SEMPRE mostrar preview da mensagem antes de enviar
- Apenas mensagens via TEMPLATE aprovado (sem free-form messaging)
- Respeitar rate limits do WhatsApp (1000 msgs/dia tier inicial)
- Monitorar quality rating dos telefones (RED = acao imediata)
- Todas as operacoes de analytics sao READ-ONLY

## Referencia Completa

Para referencia detalhada de cada comando, consulte:
- `references/tools-reference.md` - Todos os comandos CLI com parametros
- `references/messaging-patterns.md` - Padroes de mensagem e boas praticas
