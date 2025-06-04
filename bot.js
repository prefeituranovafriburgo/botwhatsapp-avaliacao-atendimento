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

let is_avaliado;
let is_avisado;
let numeroCliente;

function start(client) {
    let ultimaMensagemId = null;

    try {
        client.onAnyMessage(async (message) => {
            if (
                message.fromMe &&
                (message.body.toLowerCase().trim() === "atendimento encerrado!" ||
                message.body.toLowerCase().trim() === "atendimento finalizado!" ||
                message.body.toLowerCase().trim() === "fim do atendimento!" ||
                message.body.toLowerCase().trim() === "finalizando atendimento!") &&
                message.id !== ultimaMensagemId
            ){
                is_avaliado = false; // reset após encerramento
                is_avisado = false; // reset após encerramento
                numeroCliente = message.to; // pega o número do cliente a partir da mensagem recebida
                ultimaMensagemId = message.id; // salva o ID para não repetir

                await client.sendText(
                    numeroCliente,
                    "🏛️ *Prefeitura de Nova Friburgo* 🏛️\n\nAgradecemos o seu contato.\nPara aperfeiçoarmos continuamente a qualidade dos nossos serviços, nos ajude com sua opinião sobre o atendimento recebido.\n\n📋 *Pesquisa de Satisfação - Atendimento* 📋\n\nPor gentileza, informe o número correspondente à sua percepção:\n\n1️⃣ *Satisfeito*\n2️⃣ *Neutro*\n3️⃣ *Insatisfeito*\n\nA sua avaliação é fundamental para o nosso processo de melhoria contínua.\nAgradecemos pela sua participação. ✅"
                );

                is_avisado = true; // Marca que já enviou a avaliação
            }
        });

    } catch (error) {
        console.error("Erro ao processar a mensagem:", error);
    }

    client.onMessage(async (message) => {
        if (
            is_avaliado === false &&
            is_avisado === true &&
            !message.fromMe &&
            message.from === numeroCliente
        ) {
            const respostaCliente = message.body.trim(); // tira espaços de início e fim
            const nome = message.sender.pushname;
            console.log(`Mensagem recebida de ${nome} (${numeroCliente}): ${respostaCliente}`);
            let resposta;

            switch (respostaCliente) {
                case "1":
                    resposta =
                        "✅ *Agradecemos pela sua avaliação!*\n\nFicamos satisfeitos em saber que sua experiência foi positiva. Estamos sempre à disposição para atendê-lo da melhor forma possível.";
                    is_avaliado = true; // marca que já avaliou
                    is_avisado = false; // reset após avaliação
                    salvarAvalicao(numeroCliente, 1);
                    break;

                case "2":
                    resposta =
                        "✅ *Agradecemos pela sua avaliação!*\n\nEstamos continuamente empenhados em aprimorar nossos serviços para melhor atendê-lo.";
                    is_avaliado = true;
                    is_avisado = false;
                    salvarAvalicao(numeroCliente, 2);
                    break;

                case "3":
                    resposta =
                        "⚠️ *Lamentamos que sua experiência não tenha sido satisfatória.*\n\nValorizamos o seu feedback e estamos à disposição para entender melhor o ocorrido e buscar melhorias.";
                    is_avaliado = true;
                    is_avisado = false;
                    salvarAvalicao(numeroCliente, 3);
                    break;

                default:
                    resposta =
                        "⚠️ *Opção inválida.*\nPor gentileza, responda com um dos números a seguir:\n\n1️⃣ Satisfeito\n2️⃣ Neutro\n3️⃣ Insatisfeito";
            }

            await client.sendText(numeroCliente, resposta);
        }
    });
}
