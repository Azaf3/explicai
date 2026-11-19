import type { Review } from '../ai/review'

export interface DemoExample {
  conceptId: string
  explanation: string
  review: Review
}

/**
 * Exemplos prontos para quem abre o projeto sem chave de API (por exemplo, recrutadores).
 * Escritos à mão no mesmo formato que a IA devolve, para mostrar o fluxo sem gastar nada.
 */
export const demoExamples: DemoExample[] = [
  {
    conceptId: 'react',
    explanation:
      'React é tipo um framework que recarrega a página toda vez que algo muda. Eu vejo como peças de Lego: cada componente é uma peça e eu monto a tela juntando elas. Quando muda um dado, ele atualiza a tela sozinho.',
    review: {
      verdict: 'quase',
      summary:
        'A ideia de montar a tela com peças está ótima. Falta ajustar o que o React é e como ele atualiza a tela.',
      correct: [
        'A analogia do Lego funciona: componentes são peças reutilizáveis que você junta para montar a interface.',
        'Você percebeu que, quando um dado muda, a tela acompanha sem você mexer no HTML na mão. Essa é a ideia declarativa do React.',
      ],
      adjustments: [
        {
          excerpt: 'React é tipo um framework',
          issue:
            'React é uma biblioteca: cuida da interface, mas não traz roteamento, busca de dados ou build. Essas peças vêm de outras ferramentas.',
          suggestion: 'React é uma biblioteca para montar a interface',
        },
        {
          excerpt: 'recarrega a página toda vez que algo muda',
          issue:
            'A página não recarrega. O componente renderiza de novo e o React compara com o que já estava na tela, aplicando no DOM só o que mudou.',
          suggestion: 'atualiza só a parte da tela que mudou, sem recarregar a página',
        },
      ],
      questions: [
        'Que tipo de dado, quando muda, faz um componente renderizar de novo? Existe mais de um?',
        'Se uma peça de Lego (componente filho) precisa de uma informação que está na peça de cima (pai), como ela recebe isso?',
      ],
      revised:
        'React é uma biblioteca para montar a interface que atualiza só a parte da tela que mudou, sem recarregar a página. Eu vejo como peças de Lego: cada componente é uma peça e eu monto a tela juntando elas. Quando muda um dado, ele atualiza a tela sozinho.',
    },
  },
  {
    conceptId: 'api-rest',
    explanation:
      'API é o banco de dados do back-end. O front manda um GET pra pegar as coisas e um POST pra salvar. É tipo um garçom: eu faço o pedido, ele leva pra cozinha e volta com o prato.',
    review: {
      verdict: 'quase',
      summary:
        'O garçom é uma boa analogia e os métodos estão certos. O ponto principal é separar a API do banco de dados.',
      correct: [
        'GET para buscar e POST para criar estão certos.',
        'A analogia do garçom funciona bem: a API leva o pedido do cliente (front) para a cozinha (servidor e banco) e traz a resposta.',
      ],
      adjustments: [
        {
          excerpt: 'API é o banco de dados do back-end',
          issue:
            'A API não é o banco. Ela é o contrato de como pedir e receber dados. O banco fica atrás dela, e o front nunca fala com ele direto. Na sua analogia, você mesmo separou: o garçom não é a cozinha.',
          suggestion: 'API é o jeito combinado de o front pedir e receber dados do back-end',
        },
      ],
      questions: [
        'Quando o garçom volta sem o prato, como você sabe se foi porque o pedido estava errado ou porque a cozinha deu problema?',
        'Se o garçom não lembra de você entre um pedido e outro, como ele sabe que você já está logado?',
      ],
      revised:
        'API é o jeito combinado de o front pedir e receber dados do back-end. O front manda um GET pra pegar as coisas e um POST pra salvar. É tipo um garçom: eu faço o pedido, ele leva pra cozinha e volta com o prato.',
    },
  },
  {
    conceptId: 'useeffect',
    explanation:
      'O useEffect serve pra rodar coisas que são de fora do React, tipo buscar dados de uma API ou ligar um timer. Ele roda depois que a tela aparece. O array no final diz quando ele roda de novo: vazio é só quando o componente aparece. Se eu ligo um timer, retorno uma função que desliga ele quando o componente sai da tela.',
    review: {
      verdict: 'firme',
      summary: 'Explicação correta e com exemplos concretos. Você já domina o uso principal.',
      correct: [
        'Sincronizar com coisas de fora do React (API, timer) é exatamente o papel do useEffect.',
        'Roda depois que a tela aparece: certo, ele não roda durante a renderização.',
        'Array vazio roda só ao montar, e a função de retorno faz a limpeza. Tudo certo.',
      ],
      adjustments: [],
      questions: [
        'O que acontece se você usa uma variável dentro do efeito e não coloca ela no array?',
        'Você usaria useEffect para calcular o total de um carrinho a partir de uma lista que já está no estado? Por quê?',
      ],
      revised:
        'O useEffect serve pra rodar coisas que são de fora do React, tipo buscar dados de uma API ou ligar um timer. Ele roda depois que a tela aparece. O array no final diz quando ele roda de novo: vazio é só quando o componente aparece. Se eu ligo um timer, retorno uma função que desliga ele quando o componente sai da tela.',
    },
  },
]

export function findDemo(conceptId: string): DemoExample | undefined {
  return demoExamples.find((d) => d.conceptId === conceptId)
}
