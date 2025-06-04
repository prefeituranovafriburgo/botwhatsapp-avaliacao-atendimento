import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

function formatarNumero(numero) {
    // Remove caracteres não numéricos e formata o número usando regex
    return numero.replace(/\D/g, "");
}

export async function salvarAvalicao(telefone, avaliacao) {
    const conexao = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
    });

    try {
        const query =
            "INSERT INTO botwhatsapp_avaliacaoatendimento (telefone, avaliacao) VALUES (?, ?)";
        const telefone_formatado = formatarNumero(telefone);
        await conexao.execute(query, [telefone_formatado, avaliacao]);
    } catch (erro) {
        console.error("Erro ao inserir:", erro.message);
    } finally {
        await conexao.end();
    }
}
