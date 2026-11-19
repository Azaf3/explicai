# Registro de uso de IA

Como o Explicaí foi construído junto com o Claude (Anthropic): quem decidiu o quê, o que eu peguei testando e o que a IA pegou conferindo a documentação.

## Divisão de trabalho

**Eu (Azaf3): produto, direção e testes**
- Ideia: estudar explicando com as próprias palavras, com a IA corrigindo em cima do texto da pessoa, sem entregar aula pronta.
- Objetivo e público: mostrar a recrutadores um uso consciente de IA, com o próprio projeto como exemplo.
- Decisões de produto: chave de cada pessoa, modo de demonstração para quem não tem chave, opção gratuita.
- Testes com chave real e os ajustes que saíram deles (custo, velocidade, tamanho da resposta).
- Decisão de deixar a coautoria da IA visível nos commits.

**Claude: implementação e pesquisa**
- Código das telas, cliente das APIs, testes e estilos.
- Pesquisa na documentação oficial: CORS pelo navegador, structured outputs, versão da API, modelos atuais, parâmetros de raciocínio do Gemini.
- Proposta da estrutura das telas, do formato da correção e do nome (aprovados por mim).
- Primeiro rascunho dos conceitos e dos exemplos de demonstração.

## Linha do tempo

1. **Ideia e escopo** (eu). A IA não pode dar a resposta pronta: tem que partir do que a pessoa escreveu.
2. **Chave da API** (eu). Opções: back-end com uma chave minha (qualquer visitante gastaria meu crédito) ou chave de cada pessoa no navegador. Escolhi a chave de cada pessoa + modo demo para recrutadores.
3. **Pesquisa na documentação** (IA), antes de escrever o cliente:
   - CORS: a API da Anthropic aceita chamadas do navegador com o cabeçalho `anthropic-dangerous-direct-browser-access: true`.
   - Formato da resposta: structured outputs com `output_config.format` e JSON Schema.
   - Versão: `anthropic-version: 2026-10-21`.
4. **Implementação** (IA): telas, cliente, tratamento de recusa, resposta cortada, JSON inválido e erros HTTP.
5. **Primeiro teste real** (eu): só funcionava pagando. Pedi uma opção gratuita.
6. **Gemini como padrão** (decisão minha, implementação da IA). Lógica comum (prompt, schema, leitura do JSON) separada do código de cada provedor. Chave no cabeçalho `x-goog-api-key`, JSON Schema em `generationConfig.responseFormat`.
7. **Correção lenta** (eu notei testando). Causa: os Flash atuais raciocinam por padrão. Solução: `thinkingLevel: "low"`, Flash-Lite como modelo padrão e tela de espera com tempo e botão de cancelar.
8. **Resposta longa demais** (eu notei testando). Prompt e schema agora limitam a 1 frase de resumo, até 3 acertos, até 3 ajustes e até 2 perguntas.
9. **Mapa do conceito** (ideia minha, implementação da IA). Depois da correção, a IA devolve de 3 a 5 passos curtos de como o conceito funciona, montados a partir da explicação ajustada, e a tela desenha como um fluxo.

## O que eu peguei testando

| Problema | Ajuste |
| --- | --- |
| A API da Anthropic exige crédito pré-pago; um projeto de estudo que só funciona pagando perde o sentido. | Gemini (nível gratuito) como padrão, Claude como opção. |
| A correção demorava muito. | Raciocínio baixo, modelo mais rápido como padrão, contador e botão de cancelar. |
| Resposta longa demais, lenta e cansativa de ler. | Limite de itens no prompt e no schema. |

## O que a IA pegou conferindo a documentação

| Erro da IA | Como foi pego |
| --- | --- |
| Planejou forçar tool use para garantir o JSON, mas a doc do Claude Sonnet 5.5 diz que isso retorna erro nesse modelo. | Lendo a página do modelo. Trocado por structured outputs. |
| Conhecia só a versão `2023-06-01` da API; existe a `2026-10-21`, que remove `temperature`. | Exemplo da doc de structured outputs, confirmado na página de versionamento. |
| No acolhe-web, supôs que `/auth/me` devolvia o usuário direto; devolvia `{ user, profile }`. | Lendo as rotas do back-end antes de subir. |

Além disso, antes de publicar as mudanças do Gemini, a IA testou no navegador, com uma chave falsa, se a API do Google aceitava a chamada vinda do site e se reconhecia os campos enviados.

## Regras

- Não subo código que eu não consiga explicar.
- O que muda rápido (versão de API, nomes de modelo, parâmetros) é conferido na documentação oficial.
- Teste de verdade, com uso real, antes de considerar pronto.
- Testes, lint e build passando antes do push.
- Nenhuma chave ou segredo no repositório.
- Neste repositório, os commits mostram a coautoria do Claude.

## Limitações conhecidas

- A correção real depende de quem usa ter uma chave. A do Gemini é grátis, mas tem limite de uso e, no nível gratuito, o Google pode usar o conteúdo enviado.
- A chave fica no `localStorage`; qualquer pessoa com acesso ao navegador consegue vê-la.
- A IA pode errar. A referência de cada conceito fica disponível para conferir.
