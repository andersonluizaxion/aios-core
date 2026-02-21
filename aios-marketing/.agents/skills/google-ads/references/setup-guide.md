# Google Ads API - Guia Completo de Setup

Este guia mostra passo a passo como obter todas as credenciais necessarias para usar o CLI `google-ads.mjs`.

## Credenciais Necessarias

| Credencial | Onde Obter | Para Que Serve |
|------------|-----------|----------------|
| **Developer Token** | Google Ads (ads.google.com) | Identificar sua aplicacao na API |
| **Client ID** | Google Cloud Console | Autenticacao OAuth2 |
| **Client Secret** | Google Cloud Console | Autenticacao OAuth2 |
| **Refresh Token** | Gerado via CLI (auth flow) | Renovar access tokens automaticamente |
| **Customer ID** | Google Ads (ads.google.com) | Conta que sera gerenciada |
| **Login Customer ID** | Google Ads (opcional) | Conta MCC gerenciadora (se aplicavel) |

---

## Passo 1: Developer Token (Google Ads)

O Developer Token identifica sua aplicacao e e obrigatorio para qualquer chamada a API.

### 1.1 Acessar o API Center
1. Acesse https://ads.google.com e faca login com a conta Google Ads
2. Clique no icone de **Ferramentas** (chave inglesa) no menu superior
3. Em "Configuracao", clique em **Centro de API** (API Center)

> Se voce nao ve "Centro de API", pode ser que sua conta nao tenha permissao de administrador. Peca ao dono da conta para conceder acesso.

### 1.2 Solicitar o Token
1. Na pagina do API Center, voce vera seu **Developer Token**
2. Inicialmente o token tera nivel de acesso **Test** (teste)
3. Com acesso de teste, voce so consegue acessar **a propria conta** (suficiente para comecar)

### 1.3 Niveis de Acesso

| Nivel | Limitacao | Quando Usar |
|-------|-----------|-------------|
| **Test** | Apenas a propria conta, sem limites de chamadas | Testes iniciais, validar integracao |
| **Basic** | 15.000 operacoes/dia, acesso a qualquer conta | Gestao de poucos clientes |
| **Standard** | Sem limite de operacoes | Agencias e gestores com muitos clientes |

Para **escalar para Basic/Standard**, voce precisa preencher um formulario no API Center com:
- Descricao do uso da API
- URL do site/empresa
- Conformidade com a politica do Google Ads

**Para o dia a dia como gestor de trafego, o nivel Test e suficiente para gerenciar sua(s) propria(s) conta(s).**

### 1.4 Copiar o Token
Copie o Developer Token que aparece na pagina. Formato exemplo:
```
AbCdEfGhIjKlMnOp
```

---

## Passo 2: OAuth2 Credentials (Google Cloud Console)

O Client ID e Client Secret sao usados para autenticacao OAuth2, que permite que o CLI acesse a API em nome do usuario.

### 2.1 Criar ou Selecionar Projeto
1. Acesse https://console.cloud.google.com
2. No topo, clique no seletor de projetos
3. Clique em **Novo Projeto** (ou selecione um existente)
4. Nomeie: `Google Ads Manager` (ou outro nome descritivo)
5. Clique em **Criar**

### 2.2 Ativar a Google Ads API
1. No menu lateral, va para **APIs e Servicos** > **Biblioteca**
2. Pesquise por **"Google Ads API"**
3. Clique no resultado **Google Ads API**
4. Clique em **Ativar** (Enable)

### 2.3 Configurar Tela de Consentimento OAuth
Antes de criar credenciais, voce precisa configurar a tela de consentimento:

1. Va para **APIs e Servicos** > **Tela de Consentimento OAuth** (OAuth consent screen)
2. Selecione **Externo** (External) e clique **Criar**
3. Preencha:
   - **Nome do app**: `Google Ads CLI` (ou nome da sua empresa)
   - **Email de suporte**: seu email
   - **Email do desenvolvedor**: seu email
4. Clique **Salvar e Continuar**
5. Em **Escopos**, clique **Adicionar ou remover escopos**
6. Pesquise e adicione: `https://www.googleapis.com/auth/adwords`
7. Clique **Atualizar** e depois **Salvar e Continuar**
8. Em **Usuarios de teste**, adicione o email da conta Google Ads
9. Clique **Salvar e Continuar**

> **IMPORTANTE**: Enquanto o app estiver em modo "Teste", apenas os emails adicionados como usuarios de teste conseguem autorizar. Isso e suficiente para uso interno.

### 2.4 Criar Credenciais OAuth 2.0
1. Va para **APIs e Servicos** > **Credenciais**
2. Clique em **+ Criar Credenciais** > **ID do cliente OAuth** (OAuth client ID)
3. Tipo de aplicativo: **App para computador** (Desktop app)
4. Nome: `Google Ads CLI`
5. Clique em **Criar**

### 2.5 Copiar as Credenciais
Apos criar, uma janela mostra:
- **Client ID**: algo como `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-AbCdEfGhIjKlMnOp`

Copie ambos. Voce tambem pode baixar o JSON clicando no icone de download.

---

## Passo 3: Salvar Credenciais no CLI

Com o Developer Token, Client ID e Client Secret em maos:

```bash
node aios-marketing/bin/google-ads.mjs setup \
  --developer-token=AbCdEfGhIjKlMnOp \
  --client-id=123456789-abcdef.apps.googleusercontent.com \
  --client-secret=GOCSPX-AbCdEfGhIjKlMnOp
```

Isso salva em `~/.config/google-ads/.env` (funciona de qualquer projeto).

---

## Passo 4: Obter o Refresh Token (Auth Flow)

O Refresh Token permite que o CLI renove automaticamente o access token sem pedir login novamente.

### 4.1 Gerar URL de Autorizacao
```bash
node aios-marketing/bin/google-ads.mjs auth
```

O comando retorna uma URL como:
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=123456789-abcdef.apps.googleusercontent.com&redirect_uri=...&scope=https://www.googleapis.com/auth/adwords&response_type=code&access_type=offline&prompt=consent
```

### 4.2 Autorizar no Navegador
1. Copie a URL e abra no navegador
2. Faca login com a **mesma conta Google que tem acesso ao Google Ads**
3. Clique em **Continuar** na tela de consentimento
4. Voce vera uma tela com um **codigo de autorizacao** (authorization code)
5. Copie esse codigo

O codigo tem formato parecido com:
```
4/0AbCdEfGhIjKlMnOp_qRsTuVwXyZ1234567890
```

### 4.3 Trocar Codigo por Refresh Token
```bash
node aios-marketing/bin/google-ads.mjs exchange-token "4/0AbCdEfGhIjKlMnOp_qRsTuVwXyZ1234567890"
```

O comando:
1. Troca o codigo por um **refresh token** permanente
2. Salva automaticamente em `~/.config/google-ads/.env`
3. Mostra confirmacao com o token salvo

---

## Passo 5: Customer ID

### 5.1 Encontrar seu Customer ID
1. Acesse https://ads.google.com
2. No canto superior direito, voce ve o **numero da conta** no formato: `123-456-7890`
3. Remova os hifens: `1234567890`

### 5.2 Salvar no CLI
```bash
node aios-marketing/bin/google-ads.mjs setup --customer-id=1234567890
```

### 5.3 Conta MCC (Manager - Opcional)
Se voce usa uma conta MCC (My Client Center) que gerencia varias contas:
1. O **Login Customer ID** e o ID da conta MCC (gerenciadora)
2. O **Customer ID** e o ID da conta que voce quer acessar

```bash
node aios-marketing/bin/google-ads.mjs setup \
  --customer-id=1111111111 \
  --login-customer-id=2222222222
```

Onde:
- `1111111111` = conta do cliente (a que sera gerenciada)
- `2222222222` = conta MCC (a sua conta gerenciadora)

---

## Passo 6: Testar Conexao

```bash
# Listar contas acessiveis
node aios-marketing/bin/google-ads.mjs accounts

# Ver detalhes da conta
node aios-marketing/bin/google-ads.mjs account-info

# Listar campanhas
node aios-marketing/bin/google-ads.mjs campaigns 1234567890 --format=table
```

Se tudo estiver correto, voce vera os dados da sua conta.

---

## Resumo Final

Apos completar todos os passos, seu arquivo `~/.config/google-ads/.env` tera:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=AbCdEfGhIjKlMnOp
GOOGLE_ADS_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOp
GOOGLE_ADS_REFRESH_TOKEN=1//0AbCdEfGhIjKlMnOp...
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=2222222222
```

Voce tambem pode copiar essas variaveis para o `.env` do projeto:
```bash
cp ~/.config/google-ads/.env aios-marketing/.env
```

Ou definir diretamente no shell:
```bash
export GOOGLE_ADS_DEVELOPER_TOKEN=AbCdEfGhIjKlMnOp
export GOOGLE_ADS_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
# ... etc
```

---

## Troubleshooting

### "Developer token is not approved"
- Seu Developer Token esta no nivel "Test" e voce esta tentando acessar uma conta que nao e sua
- Solucao: use apenas com a propria conta, ou solicite upgrade para Basic/Standard no API Center

### "The caller does not have permission"
- O email usado no OAuth nao tem acesso a conta Google Ads
- Solucao: adicione o email como usuario na conta Google Ads (Admin > Access and Security)

### "OAuth2 token refresh failed"
- Refresh token pode ter sido revogado ou expirado
- Solucao: rode `node aios-marketing/bin/google-ads.mjs auth` novamente e gere um novo refresh token

### "Request had invalid authentication credentials"
- Client ID ou Client Secret incorretos
- Solucao: verifique as credenciais no Google Cloud Console e atualize com `setup`

### "CUSTOMER_NOT_FOUND"
- Customer ID incorreto ou sem hifen removido
- Solucao: use formato sem hifens (1234567890, nao 123-456-7890)

### "PERMISSION_DENIED" ao acessar conta de cliente via MCC
- Falta o Login Customer ID
- Solucao: adicione `--login-customer-id=SUA_CONTA_MCC` no setup

---

## Dar Acesso a Outra Pessoa (Gestor de Trafego)

Se voce quer dar acesso ao seu gestor de trafego para gerenciar suas campanhas via API:

### Opcao 1: Compartilhar Credenciais OAuth (Mais Simples)
1. Crie as credenciais OAuth conforme os passos acima
2. Envie ao gestor de trafego:
   - Developer Token
   - Client ID e Client Secret
   - Instrucoes para rodar `auth` e `exchange-token` (ele gera o proprio refresh token)
3. Ele configura no `.env` dele

### Opcao 2: Criar Credenciais Separadas (Mais Seguro)
1. No Google Cloud Console, crie um **novo** OAuth Client ID para o gestor
2. No Google Ads, adicione o email do gestor como usuario:
   - Va em **Ferramentas** > **Acesso e seguranca**
   - Clique em **+** para adicionar usuario
   - Email do gestor + nivel de acesso (Standard ou Admin)
3. Envie ao gestor: Developer Token + Client ID/Secret separados
4. Ele roda `auth` com o proprio email Google e gera o refresh token

### Opcao 3: Conta MCC (Agencias)
1. O gestor cria uma conta MCC em https://ads.google.com/home/tools/manager-accounts/
2. Voce vincula sua conta a MCC do gestor:
   - No Google Ads, va em **Ferramentas** > **Acesso e seguranca** > **Gerenciadores**
   - Aceite o convite de vinculacao da MCC do gestor
3. O gestor usa o proprio Developer Token + Login Customer ID da MCC dele

---

## Links Uteis

- Google Cloud Console: https://console.cloud.google.com
- Google Ads API Center: https://ads.google.com (Ferramentas > Centro de API)
- Google Ads API Docs: https://developers.google.com/google-ads/api/docs/start
- OAuth2 Playground (testar tokens): https://developers.google.com/oauthplayground
- GAQL Reference: https://developers.google.com/google-ads/api/docs/query/overview
