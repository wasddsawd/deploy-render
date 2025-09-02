import express from "express";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necessário no Render
  },
});

app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API rodando no Render");
});

// Rota para buscar dados
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuários");
  }
});

// Rota para inserir dados
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});