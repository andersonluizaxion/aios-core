# Email Marketing Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File / Type | Description |
|---------|-----------------|-------------|
| `*sequence` | `squads/email-squad/tasks/email-sequence.md` | Design de sequencia de automacao |
| `*segment` | `squads/email-squad/tasks/segmentation-plan.md` | Planejamento de segmentacao |
| `*deliverability` | `squads/email-squad/tasks/deliverability-audit.md` | Auditoria de deliverability |
| `*re-engage` | `squads/email-squad/tasks/re-engagement-flow.md` | Campanha de re-engajamento |
| `*newsletter` | `squads/email-squad/tasks/newsletter-setup.md` | Estrategia de newsletter |
| `*subject-test` | Inline workflow | A/B test de subject lines |
| `*nurture` | Inline workflow | Fluxo de lead nurturing |
| `*welcome` | Inline workflow | Sequencia de boas-vindas |
| `*winback` | Inline workflow | Campanha de win-back |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *subject-test
1. Perguntar: qual o tema do email? qual a oferta? quem e o publico?
2. Perguntar: tom desejado (urgente, curioso, educativo, pessoal, promocional)
3. Gerar 10-15 variantes de subject line seguindo frameworks:
   - Curiosity gap: "O que [resultado] e [surpresa] tem em comum?"
   - Pergunta direta: "Voce esta cometendo esse erro em [area]?"
   - Numero especifico: "7 maneiras de [beneficio] em [prazo]"
   - Urgencia real: "Ultimo dia: [oferta]"
   - Personalizacao: "[Nome], [acao especifica]"
   - FOMO: "[N] pessoas ja [acao]. Voce?"
   - How-to: "Como [resultado] sem [objecao]"
   - Negacao: "NAO faca [acao] antes de ler isso"
   - Social proof: "Por que [N] [tipo] confiam em [solucao]"
   - Preheader combo: Subject + preheader como unidade
4. Para cada variante:
   - Hipotese: por que essa variante deve funcionar
   - Tamanho: caracteres (ideal 30-50) e preview mobile
   - Preheader sugerido (40-100 chars)
   - Risco de spam trigger (palavras como GRATIS, URGENTE, etc.)
5. Recomendar top 3 para A/B test com criterio de selecao
6. Sugerir setup do teste: % da lista, duracao, metrica vencedora

### *nurture
1. Perguntar: qual o produto/servico? qual o ciclo de venda medio? quantos estagios no funil?
2. Perguntar: qual o lead magnet de entrada? quais objecoes principais?
3. Mapear estagios do funil:
   - Awareness: lead acabou de entrar (dia 0-3)
   - Consideration: educacao e autoridade (dia 3-14)
   - Decision: provas sociais e oferta (dia 14-30)
   - Post-decision: onboarding ou follow-up (dia 30+)
4. Para cada estagio, definir:
   - Quantidade de emails
   - Intervalo entre envios
   - Objetivo de cada email (educar, engajar, converter)
   - Tipo de conteudo (case, how-to, FAQ, testemunho, oferta)
   - CTA principal
   - Trigger de avanco (click, open, score, tempo)
5. Definir regras de lead scoring:
   - Abriu email: +1 ponto
   - Clicou link: +3 pontos
   - Visitou pagina de preco: +10 pontos
   - Baixou material: +5 pontos
   - Score para SQL: definir threshold
6. Definir exit conditions:
   - Converteu: mover para sequencia de onboarding
   - Inativo 30 dias: mover para re-engagement
   - Unsubscribed: remover e documentar motivo
7. Gerar output usando template drip-campaign-spec.md

### *welcome
1. Perguntar: o que o lead recebeu em troca do email? (lead magnet, desconto, trial)
2. Perguntar: qual o proximo passo desejado? (compra, agendamento, trial, conteudo)
3. Perguntar: qual o tom da marca? (profissional, casual, tecnico, inspirador)
4. Design da sequencia (5-7 emails):
   - **Email 1 - Welcome (imediato):**
     - Entrega do lead magnet / confirmacao
     - Apresentacao rapida da marca (1 paragrafo)
     - Expectativa: o que vai receber nos proximos dias
     - CTA: consumir o lead magnet
   - **Email 2 - Quick Win (+1 dia):**
     - Uma dica pratica e rapida de implementar
     - Mostra valor imediato
     - CTA: aplicar a dica
   - **Email 3 - Story (+3 dias):**
     - Case de sucesso ou historia de transformacao
     - Conecta emocao ao resultado
     - CTA: ver mais detalhes / conhecer solucao
   - **Email 4 - Value (+5 dias):**
     - Conteudo educativo profundo
     - Posiciona como autoridade
     - CTA: material complementar
   - **Email 5 - Soft CTA (+7 dias):**
     - Oferta suave / convite para proximo passo
     - Remove objecao principal
     - CTA: agendar / experimentar / comprar
   - **Email 6 - FAQ (+10 dias):**
     - Responde duvidas frequentes
     - Elimina barreiras
     - CTA: tirar duvidas via WhatsApp/chat
   - **Email 7 - Last Chance (+14 dias):**
     - Resumo do valor entregue ate aqui
     - Oferta com prazo (se aplicavel)
     - CTA final direto
5. Para cada email: subject line + preheader + estrutura do body
6. Definir metricas de sucesso por email (open rate, CTR esperados)
7. Executar checklist email-launch.md antes de publicar

### *winback
1. Perguntar: ha quanto tempo o cliente esta inativo? (30-60 / 60-90 / 90+ dias)
2. Perguntar: qual foi a ultima interacao? (compra, email aberto, visita site)
3. Perguntar: tem oferta especial disponivel para win-back? (desconto, bonus, trial)
4. Segmentar inativos:
   - Tier 1 (30-60 dias): mais facil de recuperar, conteudo de valor
   - Tier 2 (60-90 dias): oferta moderada + urgencia
   - Tier 3 (90+ dias): oferta agressiva ou sunset
5. Design da sequencia win-back (3-4 emails):
   - **Email 1 - We Miss You (+0 dia):**
     - Tom pessoal, reconhece a ausencia
     - Destaque o que mudou/melhorou desde a ultima vez
     - CTA: voltar a explorar
   - **Email 2 - Value Reminder (+3 dias):**
     - Resumo do valor que estao perdendo
     - Case de sucesso recente / novidades
     - CTA: ver novidades
   - **Email 3 - Incentive (+7 dias):**
     - Oferta exclusiva de win-back (desconto, bonus, frete gratis)
     - Prazo limitado (real, nao falso)
     - CTA: aproveitar oferta
   - **Email 4 - Sunset Warning (+14 dias):**
     - Ultimo email antes de limpar da lista
     - Opcao de manter-se inscrito (1-click)
     - Se nao interagir: mover para lista de sunset
6. Definir regras de sunset:
   - Nenhuma abertura em 4 emails: remover da lista ativa
   - Manter em lista separada por 90 dias (caso volte organicamente)
   - NUNCA enviar para sunsetted sem re-opt-in
7. Metricas: win-back rate esperado (5-15% tier 1, 2-8% tier 2, 1-3% tier 3)
