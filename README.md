# CT Black Dragon — site institucional

Experiência one-page para apresentar a CT Black Dragon como um ambiente de boxe íntimo, técnico e imersivo. O projeto evita a estrutura genérica de landing page e usa fotografia, vídeo, tipografia editorial e scroll narrativo para levar o visitante da entrada no CT até o agendamento.

## Stack

- Vite 8
- TypeScript
- GSAP + ScrollTrigger
- HTML/CSS sem framework de componentes

A escolha foi intencional: o site não precisa de backend nem SPA complexa. O bundle fica pequeno e a camada de motion permanece controlável.

## Rodar localmente

Requer Node.js compatível com o Vite 8: Node 20.19+ ou 22.12+.

PowerShell / Windows:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

macOS / Linux:

```bash
npm ci
cp .env.example .env
npm run dev
```

Validação e build de produção:

```bash
npm run check
npm run preview
```

O repositório inclui `package-lock.json`, portanto CI e instalações limpas usam `npm ci` para reproduzir exatamente a mesma árvore de dependências.

## WhatsApp — falta apenas o número real

O briefing não trouxe o telefone da academia, então nenhum número foi inventado. Coloque o WhatsApp real no `.env`:

```env
VITE_WHATSAPP_NUMBER=55DDDNUMERO
```

Use somente números, com DDI e DDD. Exemplo de formato: `5555999999999`.

Esse valor é configuração pública do frontend, não um segredo. Variáveis `VITE_*` são incorporadas ao bundle do navegador e nunca devem conter senhas, tokens privados ou chaves secretas.

Sem essa variável, o site continua navegável e mostra uma mensagem discreta no CTA final avisando que o WhatsApp precisa ser configurado.

## Assets usados

- `public/media/hero.webp` — imagem principal do projeto
- `public/media/hero-mobile.webp` — crop dedicado para mobile
- `public/media/wraps.webp` — ritual / bandagens
- `public/media/gloves.webp` — luvas / técnica
- `public/media/training.mp4` — filme de treino otimizado, sem áudio
- `public/brand/ct-black-dragon-mark.svg` — marca vetorial criada para o conceito

Os arquivos foram otimizados para web. A imagem principal fica em ~143 KB e o vídeo em ~1.3 MB.

## Direção de arte

Conceito: **“Entre no treino.”**

A interface não tenta parecer futurista. Roxo e âmbar aparecem como luz do ambiente, não como decoração de UI. A estrutura segue uma sequência de rounds: entrada, ritual, método, ferramenta, experiência, prova e conversão.

## Performance e acessibilidade

- hero pré-carregado com versão desktop/mobile
- imagens secundárias com `loading="lazy"`
- vídeo `preload="metadata"`, muted e sem áudio no arquivo
- animações restritas a `transform`, `opacity` e `clip-path`
- `prefers-reduced-motion` possui fallback sem scroll-driven motion
- HTML semântico, link de pulo, foco por teclado e alt text
- menu mobile controlável por teclado e `Escape`

## Informações que ainda podem elevar a versão final

Não bloqueiam o site, mas permitem substituir qualquer conteúdo genérico por prova real:

- número real do WhatsApp
- cidade/endereço da CT
- nome e foto do treinador ou treinadores
- horários das turmas
- tamanho médio/máximo das turmas, caso queira comunicar um número
- fotos/vídeos reais adicionais da CT e dos alunos
- Instagram oficial

Nenhum depoimento, prêmio, número de alunos ou credencial foi inventado.
