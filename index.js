const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL usando a Internal Database URL do Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // defina no Render
  ssl: {
    rejectUnauthorized: false, // necessário no Render
  },
});

app.use(cors());
app.use(express.json());

// Rota inicial de teste
app.use(express.static(path.join(__dirname, 'public')));

// Rota para inicializar banco
app.get("/init", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pokemon (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
      );
    `);
    res.send("Banco inicializado!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao inicializar banco");
  }
});

// Listar todos os pokemons
app.get("/pokemon", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pokemon");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar pokemons");
  }
});

//mecanismo de busca
app.get("/pokemon/:nome", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT p.*, p.imagem AS imagem_principal
      FROM pokemons AS p
      WHERE p.nome = $1
    `,
      [req.params.nome]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Pokemon não encontrado." });

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar instrumento:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});



// Inicia o servidor
app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
