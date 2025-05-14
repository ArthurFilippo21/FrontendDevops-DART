require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Rota para obter todas as tintas
app.get('/api/tintas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM paints ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar tintas:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 