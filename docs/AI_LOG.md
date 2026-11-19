# Registro de uso de IA

Como o Explicaí foi construído junto com o Claude (Anthropic). A ideia é deixar claro o que foi decidido por mim, o que a IA fez e onde precisei corrigir a IA.

## Divisão de trabalho

**Eu (Azaf3)**
- Ideia do produto: estudar explicando, com a IA corrigindo a partir do meu texto, sem substituir.
- Decisões: cada pessoa usa a própria chave de API; uma opção gratuita; modo de demonstração para quem não tem chave; nome e slogan.
- Revisão do conteúdo dos conceitos e do código.

**Claude**
- Código das telas, cliente da API, testes e estilos.
- Pesquisa na documentação oficial (CORS pelo navegador, structured outputs, versão da API, modelos atuais).
- Primeiro rascunho dos conceitos e dos exemplos de demonstração.

## Linha do tempo

1. **Ideia e escopo.** Defini que a IA não pode dar a resposta pronta: tem que partir do que eu escrevi.
2. **Chave da API.** Opções discutidas: back-end com uma chave minha (simples para o usuário, mas qualquer visitante gastaria meu crédito) ou chave de cada pessoa no navegador. Escolhi a chave de cada pessoa + modo demo.
3. **Pesquisa na documentação** antes de escrever o cliente:
   - CORS: a API aceita chamadas do navegador com o cabeçalho `anthropic-dangerous-direct-browser-access: true`.
   - Formato da resposta: structured outputs com `output_config.format` e JSON Schema (`additionalProperties: false` obrigatório; `minLength`, `minimum` e afins não são suportados).
   - Versão: `anthropic-version: 2026-10-21`.
   - Gemini: chave no cabeçalho `x-goog-api-key`, JSON Schema em `generationConfig.responseFormat`.
4. **Implementação** do cliente com tratamento de recusa, resposta cortada, JSON inválido e erros HTTP.
5. **Telas, testes, README e deploy.**
6. **Opção gratuita.** Ao testar, percebi que a API da Anthropic exige crédito pré-pago, e eu queria que qualquer pessoa pudesse usar de graça. Adicionamos o Gemini, que tem nível gratuito, como padrão. A lógica comum (prompt, schema, leitura do JSON) foi separada do código de cada provedor.
7. **Demora na correção.** No primeiro teste real, a resposta do Gemini demorou muito. Causa: os Flash atuais raciocinam antes de responder, e isso vem ligado por padrão. Passamos `thinkingLevel: "low"` (com nova tentativa sem ele, se algum modelo recusar) e a tela agora mostra o tempo passando e um botão de cancelar.
8. **Correção mais curta.** Pedi respostas resumidas: resposta grande demora mais. O prompt e o schema agora limitam a 1 frase de resumo, até 3 acertos, até 3 ajustes e até 2 perguntas.

## Onde a IA errou ou estava desatualizada

| Caso | O que aconteceu | Como foi pego |
| --- | --- | --- |
| Tool use forçado | O plano inicial era forçar uma ferramenta para garantir o JSON. A doc do Claude Sonnet 5.5 diz que tool use forçado retorna erro nesse modelo. | Lendo a página do modelo na doc oficial. Trocado por structured outputs. |
| Versão da API | O conhecimento da IA era `2023-06-01`. Existe a `2026-10-21`, que remove `temperature`, `top_p` e `top_k`. | Exemplo da doc de structured outputs usava a versão nova; confirmado na página de versionamento. |
| Formato de rota (acolhe-web) | A IA supôs que `/auth/me` devolvia o usuário direto; devolvia `{ user, profile }`. | Lendo as rotas do meu back-end antes de subir. |
| Build quebrado (site do Instituto Evolutivo) | Template literals aninhados dentro de `url()` não compilavam no Vite. | Erro do build. |

## Regras

- Não subo código que eu não consiga explicar.
- O que muda rápido (versão de API, nomes de modelo, parâmetros) é conferido na documentação oficial.
- Testes, lint e build passando antes do push.
- Nenhuma chave ou segredo no repositório.
- Neste repositório, os commits mostram a coautoria do Claude.

## Limitações conhecidas

- A correção real depende de quem usa ter uma chave (a do Gemini é grátis, mas tem limite de uso e, no nível gratuito, o Google pode usar o conteúdo enviado).
- A chave fica no `localStorage`; qualquer pessoa com acesso ao navegador consegue vê-la.
- A IA pode errar. A referência de cada conceito fica disponível para conferir.
