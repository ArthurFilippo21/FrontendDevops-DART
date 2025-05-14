const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: "postgresql://D%27art%20Tintas_owner:npg_HcGf9DoA3hiz@ep-royal-pond-a4fpqwmo-pooler.us-east-1.aws.neon.tech/D%27art%20Tintas?sslmode=require",
    ssl: { rejectUnauthorized: false }
});

const paintsData = JSON.parse(fs.readFileSync('paints.json'));

(async () => {
    try {
        // Dropar tabela se existir para recriar com a constraint corretamente
        await pool.query('DROP TABLE IF EXISTS paints');

        // Criar tabela com constraint nomeada
        await pool.query(`
            CREATE TABLE paints (
                id SERIAL PRIMARY KEY,
                marca VARCHAR(100),
                descricao VARCHAR(255),
                acabamento VARCHAR(50),
                unidade_tamanho VARCHAR(50),
                cor_base VARCHAR(50),
                valor NUMERIC,
                image VARCHAR(255),
                CONSTRAINT paints_unique_constraint UNIQUE (marca, descricao, acabamento, unidade_tamanho, cor_base, valor, image)
            )
        `);

        // Inserir dados
        for (const paint of paintsData) {
            await pool.query(
                `INSERT INTO paints (marca, descricao, acabamento, unidade_tamanho, cor_base, valor, image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT ON CONSTRAINT paints_unique_constraint
                 DO NOTHING`,
                [
                    paint.marca,
                    paint.descricao,
                    paint.acabamento,
                    paint.unidade_tamanho,
                    paint.cor_base,
                    parseFloat(paint.valor),
                    paint.image || ''
                ]
            );
        }
        console.log('Dados importados com sucesso!');
    } catch (error) {
        console.error('Erro ao importar dados:', error);
    } finally {
        await pool.end();
    }
})();
