/** Resposta de exemplo no formato do schema, usada pelos testes dos provedores. */
export const rawReview = {
  veredito: 'quase',
  resumo: 'Boa base.',
  acertos: ['Componentes como peças.'],
  ajustes: [{ trecho: 'framework', problema: 'É biblioteca.', sugestao: 'biblioteca' }],
  perguntas: ['O que faz renderizar de novo?'],
  versao_ajustada: 'React é uma biblioteca...',
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
