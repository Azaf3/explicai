const roles = [
  {
    who: 'Eu (Azaf3)',
    items: [
      'A ideia: um lugar pra estudar explicando, onde a IA corrige em cima do que eu escrevi.',
      'As decisões de produto: cada pessoa usa a própria chave, uma opção de IA gratuita, modo de demonstração pra quem não tem chave, o nome.',
      'A revisão do conteúdo dos conceitos e do código antes de subir.',
    ],
  },
  {
    who: 'Claude (IA)',
    items: [
      'Escreveu a maior parte do código, dos testes e o primeiro rascunho dos conceitos.',
      'Pesquisou nas documentações oficiais da Anthropic e do Google como chamar cada API direto do navegador.',
      'Propôs a estrutura das telas e o formato da correção.',
    ],
  },
]

const decisions = [
  {
    title: 'Sem servidor, com a chave de cada pessoa',
    body: 'Um back-end com uma chave minha seria mais simples pra quem usa, mas qualquer visitante gastaria meu crédito. Com a chave de cada um, o projeto roda inteiro no GitHub Pages. O custo: a chave fica visível no navegador de quem usa, por isso a tela de configurações avisa isso com todas as letras.',
  },
  {
    title: 'Resposta com formato garantido',
    body: 'A correção precisa voltar sempre com os mesmos campos (acertos, ajustes, perguntas, texto ajustado) pra tela conseguir montar. Uso structured outputs: mando um JSON Schema e a API garante que a resposta segue esse formato. Mesmo assim, o código trata os casos em que a doc diz que pode falhar: recusa e resposta cortada.',
  },
  {
    title: 'A IA corrige, não substitui',
    body: 'O prompt manda partir das palavras e analogias de quem escreveu, mexer o mínimo no texto e fazer perguntas em vez de entregar o que faltou. A referência do conceito fica escondida até você abrir, pra não virar cola.',
  },
  {
    title: 'Grátis por padrão, sem prender a um provedor',
    body: 'A primeira versão só tinha o Claude, que é pago. Pra qualquer pessoa conseguir testar, o padrão virou o Gemini, que tem nível gratuito. O prompt, o formato da correção e a leitura do JSON são os mesmos; cada provedor só tem o próprio jeito de montar a requisição e ler a resposta. Adicionar outro é escrever um arquivo novo.',
  },
]

const catches = [
  {
    title: 'Formato da API inventado (projeto acolhe-web)',
    body: 'A IA supôs que a rota /auth/me devolvia o usuário direto. Lendo as rotas do meu back-end, vi que devolvia { user, profile }. Foi corrigido antes de subir. Lição: a IA não conhece o meu código, então eu confiro o contrato na fonte.',
  },
  {
    title: 'Recurso que não funciona mais no modelo atual',
    body: 'O plano inicial era forçar a IA a responder por uma ferramenta (tool use forçado) pra garantir o JSON. A documentação atual do Claude Sonnet 5.5 diz que tool use forçado retorna erro nesse modelo. Troquei por structured outputs, que é o caminho que a doc indica.',
  },
  {
    title: 'Versão da API desatualizada',
    body: 'O que a IA sabia era o cabeçalho anthropic-version: 2023-06-01. A doc mostrou que existe a versão 2026-10-21, que também não aceita mais temperature. O projeto usa a versão nova e não manda temperature.',
  },
  {
    title: 'Build quebrado por um detalhe de sintaxe (site do Instituto Evolutivo)',
    body: 'Num ajuste de caminhos de imagem, a IA gerou template literals aninhados dentro de url() que o Vite não conseguiu compilar. O erro do build apontou, e a correção foi simplificar a expressão.',
  },
]

const rules = [
  'Não subo código que eu não consiga explicar numa entrevista.',
  'O que muda rápido (versão de API, nome de modelo, parâmetros) eu confiro na documentação oficial, não na memória da IA.',
  'Testes e build passando antes de cada push.',
  'Nada de chave ou segredo no repositório.',
  'Neste repositório os commits mostram a coautoria do Claude, de propósito. Ver abaixo.',
]

export default function HowBuiltPage() {
  return (
    <article className="prose">
      <p className="eyebrow">Transparência</p>
      <h1>Como este projeto foi feito com IA</h1>
      <p className="lead">
        Este projeto existe pra mostrar um jeito de usar IA sabendo o que ela está fazendo. Então faz sentido
        contar como ele mesmo foi feito: quem decidiu o quê, onde a IA errou e como eu peguei.
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
          <h3>{d.title}</h3>
          <p>{d.body}</p>
        </section>
      ))}

      <h2>Onde a IA errou ou estava desatualizada</h2>
      <p>Casos reais, deste projeto e dos anteriores do meu portfólio.</p>
      <ol className="catches">
        {catches.map((c) => (
          <li key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </li>
        ))}
      </ol>

      <h2>Regras que eu sigo</h2>
      <ul>
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <h2>Por que a coautoria aparece nos commits</h2>
      <p>
        Aqui o objetivo é justamente mostrar o trabalho junto com a IA, então os commits trazem a linha{' '}
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
