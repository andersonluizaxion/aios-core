# Especificacoes de Plataforma para Anuncios Digitais

Referencia completa com todas as especificacoes tecnicas por plataforma, formatos, limites de caracteres e requisitos de midia.

> **Ultima atualizacao:** Fevereiro 2026. Plataformas alteram specs periodicamente. Sempre confirme na documentacao oficial antes de producao final.

---

## Meta Ads (Facebook + Instagram)

### Feed (Facebook e Instagram)

| Especificacao | Detalhe |
|---------------|---------|
| **Formatos de imagem** | JPG ou PNG |
| **Resolucao recomendada** | 1080x1080 (1:1) ou 1080x1350 (4:5) |
| **Resolucao minima** | 600x600 |
| **Tamanho maximo arquivo** | 30 MB |
| **Aspect ratios aceitos** | 1.91:1 a 4:5 (Feed), 1:1 recomendado para ambos |
| **Texto na imagem** | Max 20% recomendado (nao mais regra dura, mas afeta entrega) |

#### Limites de Texto - Feed

| Campo | Limite Visivel | Limite Maximo | Recomendacao |
|-------|---------------|---------------|--------------|
| **Primary Text** | 125 caracteres (antes do "ver mais") | 2.200 caracteres | Colocar hook e CTA nos primeiros 125 chars |
| **Headline** | 40 caracteres | 255 caracteres | Manter abaixo de 40 para nao truncar |
| **Description** | 30 caracteres | 255 caracteres | Complementa headline, aparece abaixo |
| **Link Display** | automatico | N/A | URL limpa, sem parametros visiveis |

#### CTA Buttons Disponiveis (Meta)

- Shop Now / Compre Agora
- Learn More / Saiba Mais
- Sign Up / Cadastre-se
- Download / Baixar
- Book Now / Reserve Agora
- Contact Us / Fale Conosco
- Get Offer / Obter Oferta
- Get Quote / Solicitar Orcamento
- Subscribe / Assine
- Watch More / Assista Mais
- Apply Now / Candidate-se
- Send Message / Enviar Mensagem

#### Video - Feed

| Especificacao | Detalhe |
|---------------|---------|
| **Formato** | MP4, MOV ou GIF |
| **Codec de video** | H.264 |
| **Codec de audio** | AAC |
| **Resolucao recomendada** | 1080x1080 (1:1) ou 1080x1350 (4:5) |
| **Resolucao minima** | 120x120 |
| **Duracao maxima** | 240 minutos |
| **Duracao recomendada** | 15-60 segundos |
| **Tamanho maximo arquivo** | 4 GB |
| **Frame rate** | 30fps recomendado |
| **Legendas** | Altamente recomendadas (85%+ assiste sem som) |
| **Thumbnail** | Automatica ou custom (mesma resolucao do video) |

---

### Stories e Reels (Facebook e Instagram)

| Especificacao | Stories | Reels |
|---------------|---------|-------|
| **Aspect ratio** | 9:16 | 9:16 |
| **Resolucao recomendada** | 1080x1920 | 1080x1920 |
| **Resolucao minima** | 500x888 | 500x888 |
| **Duracao maxima** | 15 segundos (por card) | 90 segundos |
| **Duracao recomendada** | 5-15 segundos | 15-30 segundos |
| **Formato** | MP4, MOV, JPG, PNG | MP4, MOV |
| **Tamanho maximo** | 4 GB (video), 30 MB (imagem) | 4 GB |
| **Audio** | Opcional | Altamente recomendado |

#### Zonas Seguras - Stories/Reels

```
┌────────────────────┐
│   ZONA SEGURA TOP  │ ← 14% superior reservado (nome da conta, icones)
│    (evitar texto)   │
│                    │
│                    │
│   AREA DE CONTEUDO │ ← Zona segura para texto e elementos criticos
│      PRINCIPAL     │
│                    │
│                    │
│  ZONA SEGURA BASE  │ ← 20% inferior reservado (CTA, swipe up, UI)
│   (evitar texto)   │
└────────────────────┘

Margem lateral segura: 6% em cada lado (aprox 65px em 1080px de largura)
```

> **Dica:** Centralizar a mensagem principal no terco medio da tela. Nunca colocar informacao critica nos 14% superiores ou 20% inferiores.

---

### Carousel (Facebook e Instagram)

| Especificacao | Detalhe |
|---------------|---------|
| **Numero de cards** | 2 a 10 |
| **Formato por card** | Imagem (JPG/PNG) ou Video (MP4/MOV) |
| **Resolucao imagem** | 1080x1080 (1:1) recomendado |
| **Resolucao video** | 1080x1080 (1:1) recomendado |
| **Duracao video por card** | 1 segundo a 240 minutos |
| **Tamanho maximo por card** | 30 MB (imagem), 4 GB (video) |
| **Headline por card** | 40 caracteres recomendado |
| **Description por card** | 20 caracteres recomendado |
| **Primary Text** | Compartilhado entre todos os cards, 125 chars visiveis |
| **Link** | Pode ser diferente por card ou unico para todos |

> **Estrategia:** Use o primeiro card como hook forte. Os cards subsequentes podem contar uma historia sequencial, listar beneficios ou mostrar variacoes do produto.

---

### Collection Ads (Facebook e Instagram)

| Especificacao | Detalhe |
|---------------|---------|
| **Cover** | Imagem ou video (mesmas specs de Feed) |
| **Product cards** | 4 produtos exibidos abaixo do cover |
| **Catalogo** | Necessario ter catalogo de produtos configurado |
| **Instant Experience** | Abre em tela cheia ao clicar |
| **Headline** | 40 caracteres |
| **Body text** | 125 caracteres |

---

## Google Ads

### Search (Responsive Search Ads)

| Especificacao | Detalhe |
|---------------|---------|
| **Headlines** | Ate 15 headlines (minimo 3) |
| **Caracteres por headline** | 30 caracteres cada |
| **Descriptions** | Ate 4 descriptions (minimo 2) |
| **Caracteres por description** | 90 caracteres cada |
| **Display URL** | Dominio automatico + 2 paths de 15 chars cada |
| **URL final** | Sem limite, mas deve ser pagina funcional |

#### Google Combina Automaticamente

O Google testa combinacoes dos seus headlines e descriptions. Recomendacoes:

- Escrever headlines que funcionam em qualquer combinacao
- Pelo menos 1 headline com keyword principal
- Pelo menos 1 headline com CTA
- Pelo menos 1 headline com beneficio/diferencial
- Nao repetir informacao entre headlines
- Pinnar headlines apenas quando necessario (reduz otimizacao)

#### Extensoes (Assets)

| Extensao | Detalhe |
|----------|---------|
| **Sitelinks** | 2-8 links, titulo 25 chars, descricao 2x35 chars |
| **Callouts** | 2-10 textos, 25 chars cada ("Frete Gratis", "24h Online") |
| **Structured Snippets** | Header + lista de valores (Marcas, Servicos, Tipos, etc.) |
| **Call** | Numero de telefone clicavel |
| **Location** | Endereco do Google Business |
| **Price** | Tabela de precos com ate 8 itens |
| **Promotion** | Desconto ou oferta em destaque |
| **Image** | 1 imagem quadrada (1:1) e 1 landscape (1.91:1), min 300x300 |
| **Lead Form** | Formulario nativo do Google |

---

### Display (Responsive Display Ads)

| Especificacao | Quantidade | Detalhe |
|---------------|-----------|---------|
| **Images (landscape)** | Ate 15 | 1.91:1 ratio, min 600x314, recomendado 1200x628 |
| **Images (square)** | Ate 15 | 1:1 ratio, min 300x300, recomendado 1200x1200 |
| **Logos (landscape)** | Ate 5 | 4:1 ratio, min 512x128 |
| **Logos (square)** | Ate 5 | 1:1 ratio, min 128x128, recomendado 1200x1200 |
| **Short headlines** | Ate 5 | 30 caracteres cada |
| **Long headline** | 1 | 90 caracteres |
| **Descriptions** | Ate 5 | 90 caracteres cada |
| **Business name** | 1 | 25 caracteres |
| **Tamanho max imagem** | N/A | 5120 KB |
| **Videos** | Ate 5 | YouTube URLs, opcional |

#### Tamanhos de Display Padrao (para banners estaticos)

| Tamanho | Nome | Onde Aparece |
|---------|------|--------------|
| **300x250** | Medium Rectangle | Inline em conteudo, mais comum |
| **728x90** | Leaderboard | Topo de paginas desktop |
| **160x600** | Wide Skyscraper | Sidebar de sites desktop |
| **320x50** | Mobile Banner | Topo/base de apps e mobile web |
| **336x280** | Large Rectangle | Inline em conteudo |
| **300x600** | Half Page | Sidebar premium |
| **970x90** | Large Leaderboard | Topo de paginas premium |
| **970x250** | Billboard | Topo de paginas premium |
| **320x100** | Large Mobile Banner | Mobile web e apps |
| **250x250** | Square | Varias posicoes |
| **200x200** | Small Square | Varias posicoes |

> **Recomendacao:** Para Display responsivo, priorize qualidade das imagens 1200x628 (landscape) e 1200x1200 (square). O Google redimensiona automaticamente para os tamanhos necessarios.

---

### Shopping Ads

| Especificacao | Detalhe |
|---------------|---------|
| **Titulo do produto** | 150 caracteres (primeiros 70 chars mais relevantes) |
| **Descricao do produto** | 5.000 caracteres |
| **Imagem principal** | Min 100x100 (non-apparel), 250x250 (apparel) |
| **Imagem recomendada** | 800x800 ou maior, fundo branco |
| **Formato imagem** | JPEG, PNG, GIF (sem animacao), BMP, TIFF |
| **Tamanho max imagem** | 16 MB |
| **Preco** | Obrigatorio, deve bater com landing page |
| **Disponibilidade** | in_stock, out_of_stock, preorder |
| **GTIN/MPN** | Recomendado para melhor performance |

> **Dica:** Titulos de Shopping devem seguir o formato: Marca + Produto + Atributos-chave (cor, tamanho, material). Ex: "Nike Air Max 90 Masculino Preto Tamanho 42".

---

## YouTube Ads

### In-Stream Skippable

| Especificacao | Detalhe |
|---------------|---------|
| **Duracao** | Sem limite (recomendado 15-180 segundos) |
| **Skip** | Apos 5 segundos |
| **Aspect ratio** | 16:9 (landscape) ou 9:16 (vertical/Shorts feed) |
| **Resolucao recomendada** | 1920x1080 (1080p) |
| **Resolucao minima** | 640x360 |
| **Formato** | MP4 |
| **Codec video** | H.264 |
| **Codec audio** | AAC-LC |
| **Frame rate** | 30fps recomendado |
| **Bitrate recomendado** | 8 Mbps (1080p) |
| **Tamanho maximo** | 256 GB |
| **Companion banner** | 300x60 (desktop), auto-gerado ou custom |

#### Estrutura Recomendada para In-Stream

```
0-5s:   HOOK IMPERDIVEL (antes do botao Skip aparecer)
5-15s:  Desenvolver problema/promessa
15-30s: Solucao e prova
30-45s: CTA e reforco final
45s+:   Conteudo adicional (para quem continua assistindo)
```

> **Regra de ouro:** Se sua mensagem nao funciona nos primeiros 5 segundos, o anuncio falhou. O hook e TUDO em In-Stream skippable.

---

### In-Stream Non-Skippable

| Especificacao | Detalhe |
|---------------|---------|
| **Duracao maxima** | 15 segundos (20 segundos em algumas regioes) |
| **Aspect ratio** | 16:9 |
| **Resolucao** | Mesmas specs do skippable |
| **Formato** | MP4, H.264 |
| **Quando usar** | Branding e awareness, mensagens curtas e diretas |

---

### Bumper Ads

| Especificacao | Detalhe |
|---------------|---------|
| **Duracao maxima** | 6 segundos |
| **Skip** | Nao skipavel |
| **Aspect ratio** | 16:9 |
| **Resolucao** | Mesmas specs do In-Stream |
| **Formato** | MP4, H.264 |
| **Quando usar** | Reforco de marca, retargeting, complemento de campanha |

#### Dicas para Bumper de 6 Segundos

- Uma unica mensagem (nao tente encaixar multiplos pontos)
- Visual impactante desde o frame 1
- Logo/marca presente durante todo o video
- CTA simples e direto
- Funciona melhor em sequencia (3-5 bumpers contando uma historia)

---

### Discovery / In-Feed

| Especificacao | Detalhe |
|---------------|---------|
| **Thumbnail** | 1280x720 (16:9), JPG/PNG/GIF |
| **Titulo** | 100 caracteres (primeiros 50-60 visiveis) |
| **Descricao** | 2 linhas, 35 caracteres cada |
| **Video** | Qualquer duracao, mesmas specs do In-Stream |
| **Onde aparece** | Resultados de busca YouTube, pagina inicial, relacionados |

> **Dica:** A thumbnail e o elemento mais importante de Discovery ads. Invista em thumbnails de alta qualidade com texto overlay claro e face humana quando possivel.

---

### YouTube Shorts Ads

| Especificacao | Detalhe |
|---------------|---------|
| **Aspect ratio** | 9:16 (vertical) |
| **Resolucao recomendada** | 1080x1920 |
| **Duracao maxima** | 60 segundos |
| **Duracao recomendada** | 15-30 segundos |
| **Formato** | MP4 |
| **Onde aparece** | Feed de Shorts entre conteudos organicos |
| **Audio** | Altamente recomendado (experiencia nativa e com som) |

---

## TikTok Ads

### In-Feed Ads

| Especificacao | Detalhe |
|---------------|---------|
| **Aspect ratio** | 9:16, 1:1 ou 16:9 (9:16 fortemente recomendado) |
| **Resolucao recomendada** | 1080x1920 (9:16) |
| **Resolucao minima** | 720x1280 |
| **Duracao** | 5-60 segundos |
| **Duracao recomendada** | 21-34 segundos |
| **Formato video** | MP4, MOV, MPEG, AVI |
| **Codec video** | H.264 |
| **Bitrate** | Min 516 kbps |
| **Tamanho maximo** | 500 MB |
| **Frame rate** | Min 24fps, recomendado 30fps |
| **Ad description** | 1-100 caracteres (Latin), 1-50 (Asian) |
| **Brand/App name** | 2-40 caracteres (Latin) |

#### Zonas Seguras - TikTok

```
┌────────────────────┐
│                    │
│  ZONA SEGURA TOP   │ ← Evitar nos 15% superiores
│                    │
│                    │
│   AREA PRINCIPAL   │ ← Mensagem-chave no centro
│     DO CONTEUDO    │
│                    │
│                    │
│ ZONA DE INTERACAO  │ ← 25% inferior direito reservado
│  (botoes, caption) │    (likes, share, perfil, CTA)
└────────────────────┘

Margem segura direita: 20% (icones de interacao)
Margem segura inferior: 25% (caption + CTA + musica)
```

---

### Brand Takeover

| Especificacao | Detalhe |
|---------------|---------|
| **Formato** | Imagem (3 segundos) ou Video (3-5 segundos) |
| **Resolucao imagem** | 1080x1920 |
| **Resolucao video** | 1080x1920 |
| **Tamanho max imagem** | 2 MB |
| **Tamanho max video** | 500 MB |
| **Aparicao** | Primeira coisa que usuario ve ao abrir TikTok |
| **Frequencia** | 1 brand takeover por usuario por dia |

---

### TopView

| Especificacao | Detalhe |
|---------------|---------|
| **Aspect ratio** | 9:16 |
| **Resolucao** | 1080x1920 |
| **Duracao** | Ate 60 segundos |
| **Formato** | MP4, MOV |
| **Tamanho maximo** | 500 MB |
| **Quando aparece** | 3 segundos apos abrir o app (primeiro In-Feed) |
| **Audio** | Obrigatorio |
| **Diferenca do Brand Takeover** | Mais longo, aparece como primeiro video no feed |

---

## Especificacoes Tecnicas de Arquivo

### Formatos de Imagem

| Formato | Uso Recomendado | Limite de Tamanho Tipico |
|---------|-----------------|--------------------------|
| **JPG/JPEG** | Fotos, imagens com muitas cores | 30 MB (Meta), 5 MB (Google) |
| **PNG** | Graficos, logos, texto overlay, transparencia | 30 MB (Meta), 5 MB (Google) |
| **GIF** | Animacoes curtas (Google Shopping) | 150 KB recomendado |
| **WebP** | Alternativa moderna, menor tamanho | Aceito em Google, limitado em Meta |

### Formatos de Video

| Especificacao | Recomendacao Universal |
|---------------|----------------------|
| **Container** | MP4 (mais compativel em todas as plataformas) |
| **Codec de video** | H.264 (AVC) - aceito em 100% das plataformas |
| **Codec de audio** | AAC-LC, 128kbps+ stereo |
| **Frame rate** | 30fps (padrao), aceita ate 60fps |
| **Bitrate video** | 8-12 Mbps para 1080p, 4-6 Mbps para 720p |
| **Bitrate audio** | 128-256 kbps |
| **Resolucao maxima** | 4K (3840x2160) aceito na maioria |
| **Pixel aspect ratio** | 1:1 (quadrado, padrao) |

### Tabela de Resolucoes Rapida

| Aspect Ratio | Resolucao | Uso Principal |
|--------------|-----------|---------------|
| 1:1 | 1080x1080 | Meta Feed, Google Display |
| 4:5 | 1080x1350 | Meta Feed (vertical) |
| 9:16 | 1080x1920 | Stories, Reels, TikTok, Shorts |
| 16:9 | 1920x1080 | YouTube, Google Display landscape |
| 1.91:1 | 1200x628 | Google Display, Meta link ads |

---

## Checklist de Producao

Antes de subir qualquer criativo, verificar:

### Imagens
- [ ] Resolucao correta para a plataforma
- [ ] Aspect ratio correto (sem distorcao)
- [ ] Texto dentro dos limites de caracteres
- [ ] Texto em imagem abaixo de 20% (Meta)
- [ ] Logo visivel e legivel em tamanho pequeno
- [ ] CTA legivel em mobile (testar em tela de 5")
- [ ] Cores contrastantes para legibilidade
- [ ] Sem elementos cortados nas zonas de perigo

### Videos
- [ ] Codec H.264 / AAC
- [ ] Resolucao minima atendida
- [ ] Legendas embutidas ou arquivo SRT
- [ ] Hook nos primeiros 3-5 segundos
- [ ] Audio mixado corretamente (voz audivel)
- [ ] Logo/branding presente
- [ ] CTA visual no final
- [ ] Thumbnail atrativa (se aplicavel)
- [ ] Testado com e sem som

### Copy
- [ ] Headline dentro do limite de caracteres
- [ ] Primary text com hook nos primeiros 125 chars
- [ ] CTA especifico (nao generico)
- [ ] Sem superlatives sem comprovacao (Google)
- [ ] Sem simulacao de interface (Meta)
- [ ] Link de destino funcional e relevante
- [ ] UTMs configurados para tracking
- [ ] Compliance da plataforma verificado
