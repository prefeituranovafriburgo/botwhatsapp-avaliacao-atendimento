import { salvarAvalicao } from "./functions.js";
import venom from "venom-bot";

venom
    .create({
        session: "avaliacao-atendimento", // Nome da sessão
        browserArgs: [
            "--headless=new", // <-- aqui você passa a flag que força o novo modo headless
        ],
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

// Objeto para armazenar o estado de cada cliente
const clientes = {};

function start(client) {
    let ultimaMensagemId = null;

    try {
        client.onAnyMessage(async (message) => {
            // Identifica o número do cliente (pode ser message.to ou message.from dependendo do contexto)
            const numero = message.to;
            if (
                message.fromMe &&
                (message.body.toLowerCase().trim() === "atendimento encerrado!" ||
                message.body.toLowerCase().trim() === "atendimento finalizado!" ||
                message.body.toLowerCase().trim() === "fim do atendimento!" ||
                message.body.toLowerCase().trim() === "finalizando atendimento!") &&
                message.id !== ultimaMensagemId
            ){
                // Inicializa ou reseta o estado do cliente
                clientes[numero] = {
                    is_avaliado: false,
                    is_avisado: false,
                    nota_avaliacao: null,
                    nome: null
                };
                ultimaMensagemId = message.id;

                await client.sendText(
                    numero,
                    "🏛️ *Prefeitura de Nova Friburgo* 🏛️\n\nAgradecemos o seu contato.\nPara aperfeiçoarmos continuamente a qualidade dos nossos serviços, nos ajude com sua opinião sobre o atendimento recebido.\n\n📋 *Pesquisa de Satisfação - Atendimento* 📋\n\nPor gentileza, informe o número correspondente à sua percepção:\n\n1️⃣ *Satisfeito*\n2️⃣ *Neutro*\n3️⃣ *Insatisfeito*\n\nA sua avaliação é fundamental para o nosso processo de melhoria contínua.\nDesde já, agradecemos!"
                );

                clientes[numero].is_avisado = true;
            }
        });

    } catch (error) {
        console.error("Erro ao processar a mensagem:", error);
    }

    client.onMessage(async (message) => {
        try {
            const numero = message.from;
            // Garante que o estado do cliente existe
            if (!clientes[numero]) return;
            const estado = clientes[numero];

            if (
                estado.is_avaliado === false &&
                estado.is_avisado === true &&
                !message.fromMe
            ) {
                const respostaCliente = message.body.trim();
                let resposta;
                switch (respostaCliente) {
                    case "1":
                        resposta =
                            "❇️ *Avaliação positiva!*\nFicamos felizes em saber que sua experiência foi satisfatória.\nPor favor, para finalizar o registro da sua avaliação, nos conte o que mais gostou no nosso atendimento! Isso nos ajuda a continuar oferecendo um serviço de qualidade.";
                        estado.is_avaliado = true;
                        estado.nota_avaliacao = 1;
                        break;

                    case "2":
                        resposta =
                            "⚠️ *Avaliação neutra!*\nEstamos sempre em busca de melhorias.\nPor favor, para finalizar o registro da sua avaliação, nos conte o que podemos aperfeiçoar no atendimento! Seu feedback nos ajuda a melhorar nossos serviços.";
                        estado.is_avaliado = true;
                        estado.nota_avaliacao = 2;
                        break;

                    case "3":
                        resposta =
                            "‼️ *Avaliação negativa. Lamentamos que sua experiência não tenha sido positiva.*\nPor favor, para finalizar o registro da sua avaliação e entender melhor o ocorrido, poderia nos explicar o que aconteceu? Seu relato é fundamental para melhorarmos nosso atendimento.";
                        estado.is_avaliado = true;
                        estado.nota_avaliacao = 3;
                        break;

                    default:
                        resposta =
                            "⚠️ *Opção inválida.*\nPor gentileza, responda com um dos números a seguir:\n\n1️⃣ Satisfeito\n2️⃣ Neutro\n3️⃣ Insatisfeito\n Assim, podemos proceder com o registro da sua avaliação.";
                }

                await client.sendText(numero, resposta);
                
            } else if (
                estado.is_avaliado === true &&
                estado.is_avisado === true &&
                !message.fromMe
            ) {
                estado.nome = message.sender.pushname || "Usuário";
                const respostaCliente = message.body.trim();
                let resposta;
                resposta = "✅ *Sua avaliação foi armazenada com sucesso!.*\nEstamos sempre à disposição para atendê-lo da melhor forma possível.\n\nAgradecemos pela sua participação! 🙏\n\nCaso tenha mais alguma dúvida ou precise de ajuda, não hesite em nos contatar novamente.\n\n🏛️ *Prefeitura de Nova Friburgo* 🏛️";
                salvarAvalicao(estado.nome, numero, estado.nota_avaliacao, respostaCliente);

                await client.sendText(numero, resposta);

                // Reseta o estado do cliente após finalizar
                clientes[numero] = {
                    is_avaliado: false,
                    is_avisado: false,
                    nota_avaliacao: null,
                    nome: null
                };
            }

        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
}
