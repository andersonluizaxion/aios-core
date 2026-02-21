# WhatsApp Business - Padroes de Mensagem e Boas Praticas

## Categorias de Template

### MARKETING
Mensagens promocionais, ofertas, lancamentos de produto, newsletters.
- **Custo:** Mais caro por conversa (pricing tier mais alto)
- **Restricoes:** Sujeito a opt-in explicito do usuario
- **Limite:** Pode ser filtrado por usuarios que desativam marketing
- **Exemplos:** Promocoes, novos produtos, conteudo educativo, reengajamento

### UTILITY
Atualizacoes de pedido, alertas de conta, lembretes de agendamento.
- **Custo:** Intermediario
- **Restricoes:** Deve ser relacionado a uma transacao/interacao existente
- **Limite:** Menos restritivo que marketing
- **Exemplos:** Confirmacao de pedido, status de entrega, lembrete de consulta, alerta de pagamento

### AUTHENTICATION
Codigos OTP, verificacao de conta, confirmacao de identidade.
- **Custo:** Mais barato por conversa
- **Restricoes:** Deve conter codigo de verificacao
- **Limite:** Altamente regulado pela Meta
- **Exemplos:** Codigo de verificacao, reset de senha, confirmacao de login

---

## Regra das 24 Horas (Customer Service Window)

### Como Funciona
- Quando um **usuario envia mensagem** para o negocio, abre-se uma janela de 24 horas
- Dentro dessa janela, o negocio pode responder com **qualquer tipo de mensagem** (free-form)
- Apos 24 horas sem interacao do usuario, APENAS **templates aprovados** podem ser enviados
- Cada nova mensagem do usuario renova a janela de 24 horas

### Implicacoes Praticas
- Responder rapidamente (dentro de 24h) permite dialogo livre
- Fora da janela, so templates -- por isso ter templates bem planejados e crucial
- Templates de UTILITY (ex: follow-up de atendimento) reabrem a conversa
- Templates de MARKETING funcionam como "cold outreach" regulado

### Tipos de Conversa e Cobranca
| Tipo | Quem Inicia | Custo |
|------|-------------|-------|
| Service | Usuario | Mais barato (free em alguns tiers) |
| Utility | Negocio (template) | Intermediario |
| Authentication | Negocio (template) | Barato |
| Marketing | Negocio (template) | Mais caro |

---

## Requisitos de Opt-In

### Obrigatorio por Politica Meta
- O usuario DEVE dar consentimento explicito para receber mensagens via WhatsApp
- O consentimento deve ser ativo (nao pode ser pre-marcado)
- O usuario deve saber claramente o tipo de mensagem que vai receber
- Deve haver opcao facil de opt-out

### Metodos Validos de Opt-In
1. **Formulario no site** com checkbox explicito para WhatsApp
2. **Click-to-WhatsApp ads** (o usuario inicia a conversa)
3. **QR code** em material fisico que leva ao WhatsApp
4. **Mensagem IVR** (URA) com opcao de WhatsApp
5. **Presencial** com consentimento documentado

### Metodos INVALIDOS
- Pre-preencher checkbox de opt-in
- Comprar listas de telefones
- Assumir opt-in por ter numero de WhatsApp
- Enviar sem consentimento previo

---

## Quality Rating e Manutencao

### Escala de Qualidade
| Rating | Significado | Acao |
|--------|-------------|------|
| GREEN | Qualidade alta, bom historico | Manter praticas atuais |
| YELLOW | Qualidade declinando | Investigar e corrigir |
| RED | Qualidade critica | Acao IMEDIATA ou conta pode ser restrita |

### Fatores que Impactam Quality Rating
- **Positivos:** Alta taxa de leitura, respostas dos usuarios, baixo indice de bloqueio
- **Negativos:** Usuarios bloqueando/denunciando, baixa taxa de leitura, envio excessivo
- Feedback dos ultimos 7 dias tem peso maior

### Acoes para Manter Qualidade
1. **Segmentar publico** -- enviar apenas para quem tem interesse
2. **Respeitar frequencia** -- nao bombardear com mensagens
3. **Conteudo relevante** -- mensagem deve agregar valor ao destinatario
4. **Opt-out facil** -- incluir opcao de parar de receber
5. **Monitorar metricas** -- acompanhar delivered rate, read rate, block rate

### Limites de Envio (Tiers)
| Tier | Mensagens/Dia | Como Subir |
|------|---------------|------------|
| Tier 1 | 1.000 | Conta nova, verificar numero |
| Tier 2 | 10.000 | Manter quality GREEN por 7+ dias |
| Tier 3 | 100.000 | Manter quality GREEN + volume consistente |
| Tier 4 | Ilimitado | Manter quality GREEN + alto volume |

Downgrade: Quality RED por 7+ dias volta 1 tier.

---

## Mercado Brasileiro - Especificidades WhatsApp

### Por Que WhatsApp e Dominante no Brasil
- 99% dos smartphones brasileiros tem WhatsApp instalado
- 80%+ dos brasileiros usam WhatsApp diariamente
- Canal preferido para comunicacao com empresas
- Penetracao superior a email, SMS e qualquer outra plataforma

### Padroes de Uso no Brasil
- **Horarios de pico:** 9h-12h e 18h-21h (horario de Brasilia)
- **Dias de maior engajamento:** Terca a quinta-feira
- **Formato preferido:** Mensagens curtas e diretas
- **Expectativa de resposta:** Menos de 1 hora durante horario comercial
- **Audio:** Brasileiros enviam muitos audios -- considerar para atendimento

### Templates Efetivos para o Mercado BR
1. **Confirmacao de pedido** (UTILITY)
   - Numero do pedido, itens, valor, prazo estimado
   - Linguagem direta, sem formalidade excessiva

2. **Lembrete de consulta/agendamento** (UTILITY)
   - 24h antes: lembrete com detalhes
   - Incluir botao de confirmacao/cancelamento
   - Horario, endereco, nome do profissional

3. **Promocao segmentada** (MARKETING)
   - Personalizacao com nome do cliente
   - Desconto claro e prazo definido
   - CTA unico e direto
   - Respeitar opt-in

4. **Recuperacao de carrinho** (MARKETING)
   - Enviar 1-2h apos abandono
   - Mencionar produto especifico
   - Oferecer incentivo (frete gratis, desconto)

5. **Codigo de verificacao** (AUTHENTICATION)
   - Codigo numerico de 6 digitos
   - Tempo de expiracao claro
   - Botao de copiar codigo

### Compliance no Brasil (LGPD)
- Consentimento deve ser registrado e auditavel
- Usuario pode revogar consentimento a qualquer momento
- Dados devem ser tratados conforme LGPD
- Manter registro de opt-in por no minimo 5 anos
- Informar finalidade clara do uso dos dados

---

## Estrategia de Templates por Funil

### Topo de Funil (Awareness)
- **Tipo:** MARKETING
- **Objetivo:** Engajar leads novos que optaram in
- **Frequencia:** Max 1x por semana
- **Conteudo:** Conteudo educativo, dicas, novidades do setor
- **Metrica chave:** Read rate > 50%

### Meio de Funil (Consideration)
- **Tipo:** MARKETING/UTILITY
- **Objetivo:** Nutrir lead em direcao a conversao
- **Frequencia:** Baseado em interacao (event-triggered)
- **Conteudo:** Cases, depoimentos, ofertas personalizadas
- **Metrica chave:** Click rate > 5%

### Fundo de Funil (Conversion)
- **Tipo:** UTILITY
- **Objetivo:** Converter lead em cliente
- **Frequencia:** Urgencia controlada
- **Conteudo:** Oferta final, escassez real, suporte para decisao
- **Metrica chave:** Conversion rate

### Pos-Venda (Retention)
- **Tipo:** UTILITY
- **Objetivo:** Fidelizar e gerar recorrencia
- **Frequencia:** Baseado em ciclo do produto/servico
- **Conteudo:** Atualizacoes de pedido, feedback, cross-sell
- **Metrica chave:** NPS, repeat purchase rate

---

## Rotina de Monitoramento

### Diario
```bash
# Verificar quality rating dos telefones
node aios-marketing/bin/whatsapp-business.mjs phone-numbers --format=table
```
Se RED: parar envios de marketing imediatamente e investigar.

### Semanal
```bash
# Performance de templates
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_7d --format=table

# Volume de conversas e custo
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_7d --format=table

# Templates pendentes ou rejeitados
node aios-marketing/bin/whatsapp-business.mjs templates --status=PENDING --format=table
node aios-marketing/bin/whatsapp-business.mjs templates --status=REJECTED --format=table
```

### Mensal
```bash
# Tendencia de conversas
node aios-marketing/bin/whatsapp-business.mjs analytics --date-preset=last_30d --format=table

# Performance geral de templates
node aios-marketing/bin/whatsapp-business.mjs template-analytics --date-preset=last_30d --format=table

# Inventario completo de templates
node aios-marketing/bin/whatsapp-business.mjs templates --format=table
```
