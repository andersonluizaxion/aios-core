# Designer Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File | Description |
|---------|-----------|-------------|
| `*brief` | `squads/creative-squad/tasks/creative-brief-design.md` | Briefing de criativo |
| `*specs` | `squads/creative-squad/tasks/banner-design.md` | Specs de banner |
| `*review-creative` | `squads/creative-squad/tasks/creative-review.md` | Revisar criativos |
| `*formats` | Inline workflow | Listar formatos por plataforma |
| `*thumbnail` | Inline workflow | Specs de thumbnail YouTube |
| `*carousel` | Inline workflow | Specs de carrossel |
| `*analyze-creative` | Inline workflow | Analisar criativo existente |
| `*compliance-check` | Inline workflow | Verificar compliance de criativo |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *formats
1. Perguntar: qual plataforma? (Meta / Google / YouTube / TikTok / Todas)
2. Listar todos os formatos com dimensoes, aspect ratio, max file size
3. Destacar formatos obrigatorios vs opcionais
4. Incluir safe zones quando aplicavel
5. Referenciar template design-specs.md para detalhes completos

### *thumbnail
1. Perguntar: tipo de video (ad, organico, tutorial), publico
2. Spec: 1280x720px, 16:9, max 2MB, JPG
3. Boas praticas: texto grande legivel em mobile, max 3-4 palavras
4. Rosto humano com expressao (se aplicavel)
5. Cores contrastantes (evitar vermelho puro no YouTube)
6. Gerar 3 conceitos de thumbnail com descricao visual

### *carousel
1. Perguntar: plataforma (Meta/LinkedIn), objetivo, numero de cards
2. Spec: 1080x1080px por card (Meta), 1:1 aspect ratio
3. Definir narrativa visual (cada card conta parte da historia)
4. Card 1: hook visual (o que faz parar e swipear)
5. Cards intermediarios: argumento/beneficios/prova
6. Card final: CTA claro
7. Garantir que cada card funciona isoladamente e em sequencia
8. Executar checklist creative-specs.md

### *analyze-creative
1. Perguntar: URL ou imagem do criativo
2. Avaliar: formato, dimensoes, text overlay %, CTA visibilidade, hierarquia visual
3. Comparar com specs da plataforma target
4. Score: Compliance (0-100), Impacto Visual (0-100), Mobile Readiness (0-100)
5. Recomendar: ajustes especificos

### *compliance-check
1. Perguntar: plataforma target, URL ou descricao do criativo
2. Verificar contra regras de compliance:
   - Meta: max 20% texto em imagem, sem claims de saude falsos, sem before/after proibido
   - Google: sem superlativos sem prova, sem clickbait, disclosure obrigatorio
   - YouTube: legenda obrigatoria, sem hooks chocantes, brand safety
3. Output: APROVADO / REPROVADO com detalhes
