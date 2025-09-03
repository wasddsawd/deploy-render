const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
// Configuração do PostgreSQL usando a Internal Database URL do Render
const pool = new Pool({
  connectionString: process.env.pghost, // defina no Render
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
      CREATE TABLE IF NOT EXISTS usuarios (
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

// Inserir novo usuário
app.post("/usuarios", async (req, res) => {
  const { nome } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome) VALUES ($1) RETURNING *",
      [nome]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao inserir usuário");
  }
});

// Deletar usuário pelo ID
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.send(`Usuário ${id} deletado`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar usuário");
  }
});

// Atualizar usuário pelo ID
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const result = await pool.query(
      "UPDATE usuarios SET nome = $1 WHERE id = $2 RETURNING *",
      [nome, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar usuário");
  }
});

// Inicia o servidor
app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
