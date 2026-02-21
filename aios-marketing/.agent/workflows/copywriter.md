# Copywriter Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File | Description |
|---------|-----------|-------------|
| `*ad-copy` | `squads/creative-squad/tasks/ad-copy.md` | Criar copy de anuncio |
| `*lp-copy` | `squads/creative-squad/tasks/landing-page-copy.md` | Copy de landing page |
| `*video-script` | `squads/creative-squad/tasks/video-script.md` | Script de video para ads |
| `*ab-test` | `squads/creative-squad/tasks/ab-test-plan.md` | Planejar teste A/B |
| `*headline-test` | Inline workflow | Gerar variantes de headline |
| `*rewrite` | Inline workflow | Reescrever copy existente |
| `*angles` | Inline workflow | Mapear angulos de persuasao |
| `*swipe-file` | Inline workflow | Analisar copies de referencia |
| `*email-copy` | Inline workflow | Copy de email marketing |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *headline-test
1. Perguntar: produto, publico, plataforma, tom de voz
2. Gerar 5-10 variantes de headline testando angulos diferentes
3. Classificar por angulo (dor, desejo, prova social, urgencia, curiosidade)
4. Indicar limites de caracteres por plataforma
5. Sugerir pares de headline para teste A/B

### *rewrite
1. Perguntar: copy atual, o que nao esta funcionando, novo angulo desejado
2. Analisar copy existente (identificar pontos fracos)
3. Reescrever usando framework diferente (PAS, AIDA, BAB)
4. Entregar 3 variantes da reescrita
5. Explicar o que mudou e por que

### *angles
1. Perguntar: produto, publico-alvo, objecoes conhecidas
2. Mapear minimo 5 angulos de persuasao
3. Para cada angulo: headline exemplo + body exemplo
4. Priorizar angulos por potencial de conversao
5. Sugerir ordem de teste

### *swipe-file
1. Perguntar: nicho, tipo de copy (ad/LP/email), plataforma
2. Analisar copies fornecidas pelo usuario
3. Identificar frameworks usados (AIDA, PAS, etc)
4. Extrair padroes de headline, CTA, estrutura
5. Adaptar aprendizados para o contexto do usuario

### *email-copy
1. Perguntar: objetivo (vendas/nurture/lancamento), publico, oferta, tom
2. Criar 3 opcoes de subject line (max 50 chars)
3. Escrever body do email (hook, argumento, CTA)
4. Incluir pre-header text
5. Adaptar para mobile (frases curtas, CTA claro)
6. Executar checklist copy-review.md
