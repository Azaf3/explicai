# Explicaí

> Explica aí que a IA te ajuda a entender.

Plataforma de estudo onde **você explica um conceito de programação com as suas palavras** e a IA corrige **em cima do seu texto**: mostra o que está certo, aponta o que ajustar (citando o seu trecho), faz perguntas pra você chegar no que faltou e devolve o seu texto com o mínimo de mudanças.

A ideia é usar IA pra aprender, não pra terceirizar o entendimento.

**[Abrir o Explicaí](https://azaf3.github.io/explicai/)**: dá pra ver exemplos prontos sem chave (React, API REST e useEffect). Pra correção de verdade, use uma chave grátis do Gemini.

![Tela inicial com a lista de conceitos](docs/inicio.jpg)

## Feito com IA, de propósito

O projeto foi feito em dupla com o Claude (Anthropic), e **os commits mostram isso** com a linha `Co-Authored-By`.

- **Eu (Azaf3):** ideia, objetivo, decisões de produto (chave de cada pessoa, modo demo, opção gratuita) e testes de uso real, que viraram ajustes de custo, velocidade e tamanho da resposta.
- **Claude:** implementação, testes automatizados e pesquisa na documentação oficial das APIs.

A página [Como foi feito com IA](https://azaf3.github.io/explicai/como-foi-feito) e o arquivo [docs/AI_LOG.md](docs/AI_LOG.md) detalham cada decisão, o que eu peguei testando e o que a IA pegou conferindo a documentação.

## Como funciona

1. Escolha um conceito (JavaScript, TypeScript, async/await, React, useState, useEffect, Vite, Node.js, API REST, JWT, CORS, Git).
2. Escreva como você entende.
3. O app manda seu texto e a referência do conceito para a IA escolhida (Gemini, grátis, ou Claude, pago) e recebe uma correção estruturada.
4. A correção vem com um **mapa do conceito**: de 3 a 5 passos de como ele funciona, montados a partir da sua explicação ajustada.
5. Cada tentativa fica salva no navegador, pra você ver a evolução.

![Correção de uma explicação sobre React](docs/correcao.jpg)

## Decisões técnicas

| Decisão | Por quê |
| --- | --- |
| **Sem back-end, chave de cada pessoa** | Roda inteiro no GitHub Pages e ninguém gasta o crédito de outra pessoa. A tela de configurações avisa que a chave fica visível no navegador de quem usa. |
| **Dois provedores, um formato** | Gemini (grátis, padrão) e Claude (pago). O prompt, o JSON Schema e a leitura da resposta ficam em `ai/review.ts`; `ai/gemini.ts` e `ai/anthropic.ts` só montam a requisição e leem a resposta de cada API. |
| **Structured outputs nos dois** | A tela precisa sempre dos mesmos campos. No Claude, `output_config.format`; no Gemini, `generationConfig.responseFormat` (com plano B para `responseJsonSchema`). O código trata recusa, resposta cortada, JSON inválido e erros HTTP. |
| **Chamada direta do navegador** | Claude com o cabeçalho `anthropic-dangerous-direct-browser-access` e API version `2026-10-21` (que não aceita `temperature`). Gemini com a chave no cabeçalho `x-goog-api-key`, nunca na URL. |
| **Prompt que preserva o texto do dev** | A IA é instruída a partir das palavras e analogias de quem escreveu, não inventar erros e perguntar em vez de entregar a resposta. O texto do usuário vai dentro de uma tag e é tratado como conteúdo, não como instrução. |
| **Referência escondida** | Os pontos que a IA usa ficam num `<details>` fechado, pra pessoa explicar primeiro. |

## Stack

- React 19 + TypeScript + Vite
- React Router (busca e filtro na URL)
- Vitest + Testing Library (45 testes: os dois provedores, armazenamento e fluxo da tela)
- oxlint + Prettier
- Deploy estático no GitHub Pages

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

Para usar a correção de verdade, crie uma chave grátis no [Google AI Studio](https://aistudio.google.com/apikey) (ou uma do Claude em [platform.claude.com](https://platform.claude.com/)) e cole em **Configurações**. Ela fica só no `localStorage` do seu navegador.

## Estrutura

```
src/
  ai/review.ts        prompt, JSON Schema, leitura da correção e lista de provedores
  ai/gemini.ts        requisição e resposta do Gemini
  ai/anthropic.ts     requisição e resposta do Claude
  data/concepts.ts    conceitos, pontos de referência e confusões comuns
  data/demo.ts        exemplos prontos para quem não tem chave
  storage.ts          provedor, chaves, modelo e tentativas no localStorage
  pages/              Início, Conceito, Configurações, Como foi feito
  components/         Header e exibição da correção
```

---

Feito por [Azaf3](https://github.com/Azaf3) com o Claude.
