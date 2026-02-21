# WhatsApp Business CLI - Referencia Completa de Comandos

Todos os comandos usam: `node aios-marketing/bin/whatsapp-business.mjs <comando> [args] [--flags]`

## Autenticacao & Setup

### setup
Salva credenciais globalmente.
```bash
node aios-marketing/bin/whatsapp-business.mjs setup --token=<meta_access_token> --waba-id=<whatsapp_business_account_id>
```
- **Quando:** Primeira utilizacao ou quando credenciais mudarem
- **Token:** Mesmo META_ACCESS_TOKEN usado pelo meta-ads.mjs
- **Config file:** `~/.config/whatsapp-business/.env`

### auth
Verifica acesso a WhatsApp Business API e mostra info da conta.
```bash
node aios-marketing/bin/whatsapp-business.mjs auth
```
- **Requer:** `META_ACCESS_TOKEN` no ambiente
- **Mostra:** Status do token, info da conta WABA, namespace de templates

---

## Contas & Telefones

### accounts
Lista todas as WhatsApp Business Accounts acessiveis.
```bash
node aios-marketing/bin/whatsapp-business.mjs accounts [--format=table]
```
- **Como funciona:** Busca todos os businesses do usuario, depois os WABAs de cada business
- **Campos:** business_id, business_name, waba_id, waba_name, currency, review_status

### phone-numbers
Lista telefones registrados na conta WABA.
```bash
node aios-marketing/bin/whatsapp-business.mjs phone-numbers [waba_id] [--format=table] [--fields=...]
```
- **WABA ID:** Usa o primeiro arg posicional, ou `--waba-id`, ou `WHATSAPP_BUSINESS_ACCOUNT_ID` do ambiente
- **Campos padrao:** id, display_phone_number, verified_name, quality_rating, status, name_status, code_verification_status
- **Quality Rating:** GREEN (bom), YELLOW (atencao), RED (critico - acao imediata)

---

## Templates de Mensagem

### templates
Lista templates de mensagem com filtros opcionais.
```bash
node aios-marketing/bin/whatsapp-business.mjs templates [waba_id] \
  [--status=APPROVED|PENDING|REJECTED] \
  [--category=MARKETING|UTILITY|AUTHENTICATION] \
  [--format=table] \
  [--limit=N]
```
- **Status:** APPROVED (pode enviar), PENDING (em revisao), REJECTED (rejeitado)
- **Categorias:** MARKETING, UTILITY, AUTHENTICATION

### template-details
Detalhes completos de um template incluindo components.
```bash
node aios-marketing/bin/whatsapp-business.mjs template-details [waba_id] --name=<template_name>
# OU
node aios-marketing/bin/whatsapp-business.mjs template-details <waba_id> <template_name>
```
- **Retorna:** name, status, category, language, components (header, body, footer, buttons), quality_score

---

## Analytics

### template-analytics
Metricas de performance de templates (envio, entrega, leitura, cliques).
```bash
node aios-marketing/bin/whatsapp-business.mjs template-analytics [waba_id] \
  [--date-preset=last_7d|last_14d|last_30d|last_90d] \
  [--since=YYYY-MM-DD --until=YYYY-MM-DD] \
  [--granularity=DAILY|MONTHLY] \
  [--template-ids=id1,id2] \
  [--format=table]
```
- **Metricas:** sent (enviados), delivered (entregues), read (lidos), clicked (clicados)
- **Periodo padrao:** Ultimos 30 dias se nenhum --date-preset ou --since/--until for passado
- **Granularity:** DAILY (padrao), MONTHLY

### analytics
Analytics de conversas (volume, direcao, custo).
```bash
node aios-marketing/bin/whatsapp-business.mjs analytics [waba_id] \
  [--date-preset=last_7d|last_14d|last_30d|last_90d] \
  [--since=YYYY-MM-DD --until=YYYY-MM-DD] \
  [--granularity=DAY|MONTH] \
  [--phone-numbers=id1,id2] \
  [--conversation-types=REGULAR|MARKETING|UTILITY|AUTHENTICATION|SERVICE] \
  [--format=table]
```
- **Metricas:** conversations (total), user_initiated, business_initiated, cost
- **Conversation types:** REGULAR, MARKETING, UTILITY, AUTHENTICATION, SERVICE
- **Custo:** Mostrado em reais (R$) no formato tabela

---

## Mensagens

### send-template
Envia mensagem via template aprovado. SEMPRE requer confirmacao do usuario.
```bash
node aios-marketing/bin/whatsapp-business.mjs send-template \
  --phone-number-id=<id> \
  --to=<phone_with_country_code> \
  --template=<template_name> \
  [--language=pt_BR] \
  [--params='<json_components>']
```

**Parametros obrigatorios:**
- `--phone-number-id` - ID do telefone remetente (obtido via `phone-numbers`)
- `--to` - Numero do destinatario com codigo do pais (ex: 5511999999999)
- `--template` - Nome do template (deve estar APPROVED)

**Parametros opcionais:**
- `--language` - Codigo de idioma do template (padrao: pt_BR)
- `--params` - JSON array com parametros dos componentes do template

**Formato dos parametros:**
```json
[
  {
    "type": "body",
    "parameters": [
      {"type": "text", "text": "Nome do Cliente"},
      {"type": "text", "text": "#12345"}
    ]
  }
]
```

**Tipos de parametro suportados:**
- `text` - Texto simples
- `currency` - Valor monetario `{"code": "BRL", "amount_1000": 50000, "fallback_value": "R$ 50,00"}`
- `date_time` - Data/hora `{"fallback_value": "20/02/2026"}`
- `image` - Imagem no header `{"link": "https://example.com/image.jpg"}`
- `document` - Documento no header `{"link": "https://example.com/doc.pdf"}`
- `video` - Video no header `{"link": "https://example.com/video.mp4"}`

**Seguranca:**
- SEMPRE mostra preview antes de enviar
- SEMPRE pede confirmacao (digitar "yes")
- Apenas templates APPROVED podem ser enviados
- Nao suporta mensagens free-form (apenas templates)

---

## Flags Globais

| Flag | Descricao |
|------|-----------|
| `--format=table` | Output em tabela (legivel) em vez de JSON |
| `--fields=f1,f2,...` | Campos customizados para retornar da API |
| `--limit=N` | Limitar numero de resultados |
| `--date-preset=<preset>` | Periodo pre-definido: yesterday, last_7d, last_14d, last_30d, last_90d |
| `--since=YYYY-MM-DD` | Data inicio (usado com --until) |
| `--until=YYYY-MM-DD` | Data fim (usado com --since) |

---

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `META_ACCESS_TOKEN` | Sim | Token de acesso Meta Graph API (mesmo do meta-ads) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Sim* | ID da conta WhatsApp Business (WABA ID) |

*Pode ser passado como primeiro argumento posicional em vez de variavel de ambiente.

**Prioridade de carregamento:**
1. Variaveis de ambiente do shell (maior prioridade)
2. `.env` do diretorio atual
3. `.env` do diretorio aios-marketing/
4. `~/.config/whatsapp-business/.env` (global)
