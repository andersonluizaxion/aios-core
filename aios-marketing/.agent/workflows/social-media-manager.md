# Social Media Manager Workflow

## Activation Flow

1. Load persona from agent definition
2. Display greeting (based on context level)
3. Show Quick Commands
4. Await user input

## Command Routing

| Command | Task File / Type | Description |
|---------|-----------------|-------------|
| `*calendar` | `squads/social-squad/tasks/content-calendar-execution.md` | Calendario editorial |
| `*publish-plan` | Inline workflow | Plano de publicacao com datas e horarios |
| `*caption` | Inline workflow | Criar captions otimizadas por plataforma |
| `*community` | `squads/social-squad/tasks/community-response.md` | Gestao de comunidade |
| `*adapt-content` | `squads/social-squad/tasks/cross-platform-adaptation.md` | Adaptar conteudo cross-platform |
| `*brand-voice` | `squads/social-squad/tasks/brand-voice-guide.md` | Guia de tom de voz |
| `*stories-plan` | Inline workflow | Planejar sequencia de stories |
| `*ugc-strategy` | Inline workflow | Estrategia de UGC |
| `*trend-check` | Inline workflow | Avaliar trends e fit com marca |
| `*help` | Show commands | Lista de comandos |
| `*exit` | Deactivate agent | Sair do modo agente |

## Inline Workflows

### *publish-plan
1. Perguntar: plataformas ativas, frequencia por plataforma, objetivo principal
2. Definir grade de publicacao (dia + horario + plataforma)
3. Cruzar com melhores horarios por plataforma (ver frameworks)
4. Distribuir pilares de conteudo seguindo 30/25/20/15/10 (edu/entret/inspir/promo/comun)
5. Gerar tabela de publicacao para as proximas 2 semanas
6. Incluir lembretes de preparacao (criativo D-2, copy D-1, revisao D-0)

### *caption
1. Perguntar: plataforma destino, tema do post, formato (Reel/Carrossel/Imagem/Texto), CTA desejado
2. Consultar guia de brand voice (se existir em docs/)
3. Gerar 3 variantes de caption adaptadas para a plataforma:
   - Variante A: Hook forte + storytelling
   - Variante B: Pergunta + dados + CTA
   - Variante C: Curta e direta com emoji estrategico
4. Incluir sugestao de hashtags (mix: 3 nicho + 3 medium + 2 broad)
5. Adaptar limite de caracteres e formato para a plataforma target
6. Verificar checklist post-publish antes de entregar

### *stories-plan
1. Perguntar: objetivo (engajamento, trafego, bastidores, lancamento), marca/produto
2. Definir sequencia de 5-8 stories com arco narrativo:
   - Story 1: Hook / curiosidade / pergunta
   - Stories 2-5: Conteudo / bastidores / desenvolvimento
   - Story 6-7: Interacao (enquete, quiz, slider)
   - Story 8: CTA final (link, DM, compra)
3. Para cada story: definir formato (video, foto, texto, sticker), duracao, texto overlay
4. Sugerir melhores horarios para publicar sequencia
5. Incluir metricas de acompanhamento (taps forward, exits, replies)

### *ugc-strategy
1. Perguntar: tipo de negocio, produto/servico principal, base de clientes atual
2. Definir incentivos para UGC (hashtag de marca, repost, destaque, premiacao)
3. Criar guia de participacao para clientes (como postar, qual hashtag, como marcar)
4. Definir criterios de curacao (qualidade minima, alinhamento com marca, autorizacao)
5. Planejar frequencia de compartilhamento de UGC no feed (1-2x/semana)
6. Definir template de resposta/agradecimento para UGC compartilhado
7. Metricas: volume de UGC/mes, alcance incremental, saves em posts UGC

### *trend-check
1. Perguntar: plataforma (IG, TikTok, X), nicho do cliente
2. Listar 3-5 trends atuais relevantes para o nicho
3. Para cada trend avaliar:
   - Fit com marca (alto/medio/baixo)
   - Janela de oportunidade (dias restantes estimados)
   - Esforco de producao (baixo/medio/alto)
   - Potencial de alcance (baseado no momentum da trend)
4. Recomendar: quais trends surfar, quais ignorar
5. Para trends aprovadas: sugerir adaptacao especifica para a marca
6. Alerta: trends que podem ser controversas ou off-brand
