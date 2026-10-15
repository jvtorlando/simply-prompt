/**
 * Como a IA conduz a rotina com a pessoa: agenda, PDF e ciclos de retorno.
 * Usado nos dois modos do Personal IA (formulário e texto livre).
 * A IA nunca afirma ter acessado a agenda nem cria eventos sem confirmação.
 */
export const ROUTINE_STEPS = [
  "Na sua primeira resposta, antes do plano, me pergunte: (a) se quero que você use minha agenda do Google Calendar para encaixar os treinos; (b) se prefere revisar o plano comigo toda semana ou todo mês.",
  "Se eu der acesso ao Google Calendar, consulte meus compromissos e coloque os treinos só em horários livres. Se não houver acesso, ou se meus compromissos não estiverem lá, monte a semana com base na rotina que eu descrever. Nunca diga que consultou a agenda se não consultou.",
  "Depois que eu aprovar o plano, pergunte se quero que você adicione os treinos ao calendário semana a semana ou mês a mês. Só crie, altere ou apague eventos com a minha confirmação.",
  "Entregue o plano também em PDF, pronto para baixar, com as tabelas de treino, as orientações de alimentação e uma folha de registro. Se esta plataforma não conseguir gerar arquivos, diga isso e entregue o conteúdo formatado para eu salvar como PDF.",
  "No fim de cada semana ou mês, conforme eu escolher, peça um retorno curto: treinos feitos, cargas e repetições, energia, sono, dores e média do peso. Com base nisso, readapte o plano, explique o que mudou e por quê, gere o PDF atualizado e, se eu quiser, atualize o calendário.",
] as const
