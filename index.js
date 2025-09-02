import express from "express";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL usando Internal Database URL do Render
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // Internal URL configurada no Render
  ssl: {
    rejectUnauthorized: false, // obrigatório no Render
  },
});

app.use(express.json());

// Rota inicial de teste
app.get("/", (req, res) => {
  res.send("API rodando no Render");
});

// Rota para inicializar banco e inserir dados de teste
app.get("/init", async (req, res) => {
  try {
    // Cria tabela se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL
      );
    `);

    // Insere dados de exemplo
    await pool.query(`
      INSERT INTO usuarios (nome) VALUES ('Alice'), ('Bob')
      ON CONFLICT DO NOTHING;
    `);

    res.send("Banco inicializado com dados de teste!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao inicializar banco");
  }
});

// Listar todos os usuários
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuários");
  }
});

// Inserir um novo usuário
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

// Atualizar nome do usuário pelo ID
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
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});