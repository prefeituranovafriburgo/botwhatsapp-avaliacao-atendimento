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

function formataNome(nome) {
    // Remove caracteres não alfanuméricos e formata o nome
    return nome.replace(/[^a-zA-ZÀ-ÿ\s]/g, "").trim();
}

export async function salvarAvalicao(nome, telefone, avaliacao) {
    const conexao = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
    });

    try {
        const query =
            "INSERT INTO botwhatsapp_avaliacaoatendimento (nome, telefone, avaliacao) VALUES (?, ?, ?)";
        const telefone_formatado = formatarNumero(telefone);
        const nome_formatado = formataNome(nome);
        await conexao.execute(query, [nome_formatado, telefone_formatado, avaliacao]);
    } catch (erro) {
        console.error("Erro ao inserir:", erro.message);
    } finally {
        await conexao.end();
    }
}
