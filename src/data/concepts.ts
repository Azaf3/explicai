export type Area = 'Fundamentos' | 'Front-end' | 'Back-end' | 'Ferramentas'

export interface Concept {
  id: string
  title: string
  area: Area
  /** Pergunta que o dev responde com as próprias palavras. */
  prompt: string
  /** Uma linha pra lista de conceitos. */
  summary: string
  /** Ideias que uma boa explicação precisa cobrir. É a referência que a IA usa pra corrigir. */
  keyPoints: string[]
  /** Confusões frequentes, pra IA reconhecer quando aparecerem. */
  commonMistakes: string[]
}

export const AREAS: Area[] = ['Fundamentos', 'Front-end', 'Back-end', 'Ferramentas']

export const concepts: Concept[] = [
  {
    id: 'javascript',
    title: 'JavaScript',
    area: 'Fundamentos',
    prompt: 'O que é JavaScript e qual o papel dele numa aplicação web?',
    summary: 'A linguagem que dá comportamento à página e também roda no servidor.',
    keyPoints: [
      'É uma linguagem de programação interpretada/compilada em tempo de execução (JIT) pelo motor do ambiente, como o V8.',
      'No navegador, manipula a página (DOM), reage a eventos do usuário e faz requisições de rede.',
      'HTML estrutura, CSS estiliza e JavaScript dá comportamento.',
      'Roda em uma única thread com event loop: tarefas demoradas de I/O não travam a execução porque são assíncronas.',
      'Também roda fora do navegador, por exemplo no Node.js.',
    ],
    commonMistakes: [
      'Confundir JavaScript com Java.',
      'Achar que JavaScript só existe no navegador.',
      'Dizer que JavaScript roda várias coisas ao mesmo tempo em várias threads por padrão.',
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    area: 'Fundamentos',
    prompt: 'O que o TypeScript adiciona ao JavaScript e por que usar?',
    summary: 'JavaScript com tipos, checados antes de o código rodar.',
    keyPoints: [
      'É um superconjunto do JavaScript: todo JS válido é praticamente TS válido.',
      'Adiciona tipos estáticos, checados em tempo de desenvolvimento/compilação.',
      'Os tipos somem no build: o navegador recebe JavaScript comum.',
      'Pega erros antes de rodar (propriedade que não existe, argumento errado) e melhora o autocomplete.',
      'Não valida dados em tempo de execução: o que vem de uma API pode não bater com o tipo declarado.',
    ],
    commonMistakes: [
      'Achar que o navegador executa TypeScript diretamente.',
      'Achar que os tipos protegem contra dados errados vindos da API em tempo de execução.',
      'Confundir tipagem estática com tipagem forte.',
    ],
  },
  {
    id: 'async-await',
    title: 'Promise e async/await',
    area: 'Fundamentos',
    prompt: 'Como funcionam Promise e async/await no JavaScript?',
    summary: 'O jeito de lidar com coisas que demoram sem travar o resto.',
    keyPoints: [
      'Uma Promise representa um valor que vai existir no futuro: pendente, resolvida ou rejeitada.',
      'async faz a função sempre retornar uma Promise.',
      'await pausa só aquela função async até a Promise resolver; o resto do programa continua rodando.',
      'Erros de uma Promise rejeitada são tratados com try/catch (com await) ou .catch().',
      'Várias tarefas independentes podem rodar juntas com Promise.all em vez de await uma por uma.',
    ],
    commonMistakes: [
      'Achar que await trava o programa inteiro ou a página.',
      'Esquecer que uma função async retorna Promise, e não o valor direto.',
      'Esquecer de tratar o erro da Promise.',
    ],
  },
  {
    id: 'react',
    title: 'React',
    area: 'Front-end',
    prompt: 'O que é React e como ele atualiza a tela?',
    summary: 'Biblioteca pra montar interfaces com componentes e estado.',
    keyPoints: [
      'É uma biblioteca de JavaScript para construir interfaces, não um framework completo.',
      'A interface é dividida em componentes reutilizáveis, que são funções que retornam JSX.',
      'É declarativo: você descreve como a tela deve ficar para um certo estado, e o React cuida de atualizar o DOM.',
      'Quando o estado ou as props mudam, o componente renderiza de novo e o React aplica no DOM só o que mudou (reconciliação).',
      'Os dados descem de pai para filho via props.',
    ],
    commonMistakes: [
      'Dizer que React recarrega a página inteira a cada mudança.',
      'Confundir props com estado.',
      'Achar que JSX é HTML de verdade.',
    ],
  },
  {
    id: 'estado',
    title: 'Estado (useState)',
    area: 'Front-end',
    prompt: 'O que é estado em um componente React e para que serve o useState?',
    summary: 'A memória do componente que, quando muda, atualiza a tela.',
    keyPoints: [
      'Estado é um dado que o componente guarda entre renderizações e que pode mudar com o tempo.',
      'useState devolve o valor atual e uma função para atualizá-lo.',
      'Chamar a função de atualizar agenda uma nova renderização; mudar a variável direto não atualiza a tela.',
      'A atualização não é imediata dentro da mesma execução: o valor novo aparece na próxima renderização.',
      'Quando o novo valor depende do anterior, usa-se a forma com função: setX(anterior => anterior + 1).',
    ],
    commonMistakes: [
      'Mudar o objeto ou array do estado diretamente em vez de criar um novo.',
      'Ler o estado logo depois do set esperando o valor novo.',
      'Guardar no estado algo que dá pra calcular a partir de outro estado ou das props.',
    ],
  },
  {
    id: 'useeffect',
    title: 'useEffect',
    area: 'Front-end',
    prompt: 'Para que serve o useEffect e quando ele roda?',
    summary: 'Sincroniza o componente com algo de fora do React.',
    keyPoints: [
      'Serve para sincronizar o componente com sistemas externos: requisições, timers, assinaturas, APIs do navegador.',
      'Roda depois que o React pinta a tela, não durante a renderização.',
      'O array de dependências define quando roda de novo: sem array roda a cada renderização, [] roda ao montar, [x] quando x muda.',
      'A função de limpeza (o retorno) roda antes do próximo efeito e quando o componente sai da tela.',
      'Não é o lugar para calcular dados derivados: isso pode ser feito direto na renderização.',
    ],
    commonMistakes: [
      'Esquecer dependências e usar valores desatualizados.',
      'Usar useEffect para transformar dados que já poderiam ser calculados na renderização.',
      'Esquecer a limpeza de timers e assinaturas.',
    ],
  },
  {
    id: 'vite',
    title: 'Vite',
    area: 'Ferramentas',
    prompt: 'O que o Vite faz num projeto React?',
    summary: 'Servidor de desenvolvimento rápido e empacotador para produção.',
    keyPoints: [
      'É uma ferramenta de build e servidor de desenvolvimento, não uma biblioteca de interface.',
      'Em desenvolvimento, serve os arquivos como módulos ES e atualiza a tela na hora com HMR.',
      'Transforma TypeScript e JSX em JavaScript que o navegador entende.',
      'Para produção, gera arquivos otimizados (minificados e agrupados) na pasta dist.',
      'Variáveis de ambiente expostas ao front precisam do prefixo VITE_ e ficam visíveis no código final.',
    ],
    commonMistakes: [
      'Achar que o Vite é parte do React.',
      'Achar que variáveis VITE_ são secretas.',
      'Confundir o servidor de desenvolvimento com um servidor de produção.',
    ],
  },
  {
    id: 'node',
    title: 'Node.js',
    area: 'Back-end',
    prompt: 'O que é Node.js e por que ele é usado no back-end?',
    summary: 'O ambiente que roda JavaScript fora do navegador.',
    keyPoints: [
      'É um ambiente de execução de JavaScript fora do navegador, construído sobre o motor V8.',
      'Não é linguagem nem framework: frameworks como o Express rodam em cima dele.',
      'Dá acesso a coisas que o navegador não dá: arquivos, rede no nível do servidor, processos.',
      'Usa I/O não bloqueante com event loop, bom para servidores que atendem muitas requisições que esperam banco ou rede.',
      'Tem o npm para instalar pacotes.',
    ],
    commonMistakes: [
      'Chamar Node.js de linguagem ou de framework.',
      'Achar que Node tem DOM e window como o navegador.',
      'Achar que Node é bom para tarefas pesadas de CPU sem cuidado extra.',
    ],
  },
  {
    id: 'api-rest',
    title: 'API REST',
    area: 'Back-end',
    prompt: 'O que é uma API REST e como o front conversa com ela?',
    summary: 'Um contrato de URLs e métodos HTTP para trocar dados.',
    keyPoints: [
      'API é um contrato que define como um sistema pede e recebe dados de outro.',
      'Em REST, recursos são identificados por URLs (por exemplo /sessions) e as ações por métodos HTTP: GET, POST, PUT/PATCH, DELETE.',
      'Os dados costumam ir e voltar em JSON.',
      'O status HTTP diz o resultado: 2xx sucesso, 4xx erro do cliente (como 401, 404), 5xx erro do servidor.',
      'É sem estado (stateless): cada requisição leva o que precisa, como o token de autenticação.',
    ],
    commonMistakes: [
      'Achar que API é sinônimo de banco de dados.',
      'Usar GET para ações que alteram dados.',
      'Ignorar o status HTTP e olhar só o corpo da resposta.',
    ],
  },
  {
    id: 'jwt',
    title: 'JWT',
    area: 'Back-end',
    prompt: 'O que é um JWT e como ele é usado no login?',
    summary: 'Um token assinado que prova quem está fazendo a requisição.',
    keyPoints: [
      'JWT é um token com três partes: cabeçalho, payload (dados) e assinatura.',
      'O servidor assina o token com uma chave secreta; se alguém alterar o conteúdo, a assinatura deixa de bater.',
      'O payload é só codificado em Base64, não criptografado: qualquer um consegue ler, então não se coloca senha nele.',
      'Depois do login, o cliente manda o token em cada requisição, geralmente no cabeçalho Authorization: Bearer.',
      'Costuma ter validade (exp), e o servidor verifica assinatura e validade antes de liberar a rota.',
    ],
    commonMistakes: [
      'Achar que o JWT é criptografado e esconde os dados.',
      'Colocar dados sensíveis no payload.',
      'Confundir autenticação (quem você é) com autorização (o que pode fazer).',
    ],
  },
  {
    id: 'cors',
    title: 'CORS',
    area: 'Back-end',
    prompt: 'O que é CORS e por que o navegador bloqueia algumas requisições?',
    summary: 'A regra do navegador sobre qual site pode ler resposta de qual servidor.',
    keyPoints: [
      'Por padrão, o navegador aplica a política de mesma origem: um site não lê respostas de outra origem (protocolo, domínio e porta).',
      'CORS é o mecanismo em que o servidor diz, por cabeçalhos como Access-Control-Allow-Origin, quais origens podem ler suas respostas.',
      'Quem bloqueia é o navegador, não o servidor; ferramentas como curl ou Postman não aplicam CORS.',
      'Algumas requisições disparam antes um preflight (OPTIONS) para perguntar ao servidor se aquilo é permitido.',
      'Resolve-se configurando o servidor, não o front.',
    ],
    commonMistakes: [
      'Achar que CORS é uma proteção do servidor contra ataques.',
      'Tentar resolver CORS mudando só o código do front.',
      'Liberar qualquer origem (*) sem pensar em credenciais.',
    ],
  },
  {
    id: 'git',
    title: 'Git',
    area: 'Ferramentas',
    prompt: 'O que é Git e qual a diferença entre commit, branch e push?',
    summary: 'Controle de versão: o histórico do projeto.',
    keyPoints: [
      'Git é um sistema de controle de versão distribuído: cada clone tem o histórico completo.',
      'Commit é uma foto do projeto num momento, com mensagem e autor.',
      'Branch é uma linha de trabalho separada, um ponteiro para um commit, que permite mexer sem afetar a principal.',
      'Push envia commits locais para um repositório remoto, como o GitHub; pull traz e junta as mudanças de lá.',
      'Git é a ferramenta; GitHub é um serviço que hospeda repositórios Git.',
    ],
    commonMistakes: [
      'Confundir Git com GitHub.',
      'Achar que commit já envia para o GitHub.',
      'Achar que branch é uma cópia completa dos arquivos.',
    ],
  },
]

export function findConcept(id: string | undefined): Concept | undefined {
  return concepts.find((c) => c.id === id)
}
