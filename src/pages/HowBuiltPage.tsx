interface Item {
  title: string
  body: string
}

const roles = [
  {
    who: 'Eu (Azaf3): produto, direção e testes',
    items: [
      'Tive a ideia: um lugar pra estudar explicando com as próprias palavras, onde a IA corrige em cima do que a pessoa escreveu em vez de entregar uma aula pronta.',
      'Defini o público e o objetivo: mostrar a recrutadores um uso consciente de IA, com o próprio projeto servindo de exemplo.',
      'Tomei as decisões de produto: cada pessoa usa a própria chave, modo de demonstração pra quem não tem chave e uma opção gratuita pra qualquer um conseguir usar.',
      'Testei com uma chave de verdade e transformei o que vi em ajustes: correção lenta, resposta longa demais, dependência de um serviço pago.',
      'Decidi deixar a coautoria da IA visível nos commits, porque esconder iria contra a proposta.',
    ],
  },
  {
    who: 'Claude (IA): implementação e pesquisa',
    items: [
      'Escreveu a maior parte do código, dos testes e dos estilos, seguindo as decisões acima.',
      'Pesquisou nas documentações oficiais da Anthropic e do Google como chamar cada API direto do navegador e como garantir o formato da resposta.',
      'Propôs a estrutura das telas, o formato da correção e o nome, que eu aprovei.',
      'Fez o primeiro rascunho do conteúdo dos conceitos e dos exemplos de demonstração.',
    ],
  },
]

const decisions: (Item & { who: string })[] = [
  {
    who: 'Minha decisão',
    title: 'Sem servidor, com a chave de cada pessoa',
    body: 'Um back-end com uma chave minha seria mais simples pra quem usa, mas qualquer visitante gastaria meu crédito. Com a chave de cada um, o projeto roda inteiro no GitHub Pages. O custo é que a chave fica visível no navegador de quem usa, e a tela de configurações avisa isso com todas as letras.',
  },
  {
    who: 'Minha decisão',
    title: 'Modo de demonstração',
    body: 'Recrutador não vai criar chave de API pra olhar um portfólio. Por isso três conceitos têm exemplos prontos, no mesmo formato da correção real, que funcionam sem chave nenhuma.',
  },
  {
    who: 'Minha decisão',
    title: 'Grátis por padrão, sem depender de um provedor só',
    body: 'A primeira versão só tinha o Claude, que é pago. Eu quis que qualquer pessoa conseguisse testar de graça, então o padrão virou o Gemini, que tem nível gratuito. O prompt, o formato da correção e a leitura do JSON são compartilhados; cada provedor só tem o próprio jeito de montar a requisição e ler a resposta.',
  },
  {
    who: 'Minha ideia',
    title: 'Mapa do conceito depois da correção',
    body: 'Texto corrigido ajuda, mas ver o caminho ajuda mais. Depois de cada correção, a IA monta de 3 a 5 passos de como o conceito funciona, usando as palavras da própria explicação ajustada, e a tela desenha isso como um fluxo.',
  },
  {
    who: 'Proposta da IA, aprovada por mim',
    title: 'Resposta com formato garantido',
    body: 'A correção precisa voltar sempre com os mesmos campos pra tela conseguir montar. Os dois provedores recebem um JSON Schema e são obrigados a seguir. Mesmo assim, o código trata os casos em que pode falhar: recusa, resposta cortada e JSON inválido.',
  },
  {
    who: 'Ideia minha, prompt escrito pela IA',
    title: 'A IA corrige, não substitui',
    body: 'O prompt manda partir das palavras e analogias de quem escreveu, mexer o mínimo no texto e fazer perguntas em vez de entregar o que faltou. A referência do conceito fica escondida até você abrir, pra não virar cola.',
  },
]

const myCatches: Item[] = [
  {
    title: 'Só funcionava pagando',
    body: 'Fui testar e descobri que a API da Anthropic exige crédito pré-pago. Um projeto de estudo que só funciona pagando perde metade do sentido. Pedi uma opção gratuita, e isso virou a integração com o Gemini.',
  },
  {
    title: 'A correção demorava demais',
    body: 'No primeiro teste real a resposta levou muito tempo. A causa: os modelos Flash atuais raciocinam antes de responder, e isso vem ligado por padrão. Agora a requisição pede raciocínio baixo, o modelo padrão é o mais rápido, e a tela mostra o tempo passando com um botão de cancelar.',
  },
  {
    title: 'Resposta longa demais',
    body: 'Percebi que resposta grande demora mais e cansa de ler. Pedi correções resumidas: agora são uma frase de resumo, até três acertos, até três ajustes e até duas perguntas.',
  },
]

const aiCatches: Item[] = [
  {
    title: 'Recurso que não funciona mais no modelo atual',
    body: 'O plano inicial era forçar a IA a responder por uma ferramenta (tool use forçado) pra garantir o JSON. Conferindo a documentação do Claude Sonnet 5.5, a própria IA viu que isso retorna erro nesse modelo e trocou por structured outputs.',
  },
  {
    title: 'Versão da API desatualizada',
    body: 'O que a IA sabia era o cabeçalho anthropic-version: 2023-06-01. Na documentação ela encontrou a versão 2026-10-21, que também não aceita mais temperature. O projeto usa a versão nova.',
  },
  {
    title: 'Formato de rota inventado (projeto acolhe-web)',
    body: 'A IA supôs que a rota /auth/me devolvia o usuário direto. Ao ler as rotas do meu back-end, viu que devolvia { user, profile } e corrigiu antes de subir.',
  },
]

const rules = [
  'Não subo código que eu não consiga explicar numa entrevista.',
  'O que muda rápido (versão de API, nome de modelo, parâmetros) é conferido na documentação oficial, não na memória da IA.',
  'Teste de verdade, com uso real, antes de considerar pronto.',
  'Testes automatizados, lint e build passando antes de cada push.',
  'Nada de chave ou segredo no repositório.',
]

function CatchList({ items }: { items: Item[] }) {
  return (
    <ol className="catches">
      {items.map((c) => (
        <li key={c.title}>
          <h3>{c.title}</h3>
          <p>{c.body}</p>
        </li>
      ))}
    </ol>
  )
}

export default function HowBuiltPage() {
  return (
    <article className="prose">
      <p className="eyebrow">Transparência</p>
      <h1>Como este projeto foi feito com IA</h1>
      <p className="lead">
        Este projeto existe pra mostrar um jeito de usar IA sabendo o que ela está fazendo. Então ele mesmo é
        o exemplo: aqui está quem decidiu o quê, o que eu peguei testando e o que a IA pegou conferindo a
        documentação.
      </p>

      <h2>Quem fez o quê</h2>
      <div className="roles">
        {roles.map((r) => (
          <section key={r.who} className="panel">
            <h3>{r.who}</h3>
            <ul>
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2>Decisões e o porquê</h2>
      {decisions.map((d) => (
        <section key={d.title}>
          <p className="eyebrow">{d.who}</p>
          <h3>{d.title}</h3>
          <p>{d.body}</p>
        </section>
      ))}

      <h2>O que eu peguei testando</h2>
      <p>Problemas que não apareciam no código nem nos testes automatizados, só usando de verdade.</p>
      <CatchList items={myCatches} />

      <h2>O que a IA pegou conferindo a documentação</h2>
      <p>Erros da própria IA, corrigidos antes de subir porque a regra é conferir na fonte oficial.</p>
      <CatchList items={aiCatches} />

      <h2>Regras do projeto</h2>
      <ul>
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <h2>Por que a coautoria aparece nos commits</h2>
      <p>
        O objetivo aqui é justamente mostrar o trabalho junto com a IA, então os commits trazem a linha{' '}
        <code>Co-Authored-By: Claude</code>. Qualquer pessoa consegue ver no histórico o que foi feito em
        dupla.
      </p>
      <p>
        O registro detalhado está em{' '}
        <a href="https://github.com/Azaf3/explicai/blob/main/docs/AI_LOG.md">docs/AI_LOG.md</a> no
        repositório.
      </p>
    </article>
  )
}
