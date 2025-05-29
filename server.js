const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://13.58.105.38', // Permite requisições APENAS do seu frontend (IP público da EC2)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
  credentials: true, // Se você usar cookies ou cabeçalhos de autorização
  optionsSuccessStatus: 204 // Código de status para requisições preflight bem-sucedidas
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db', // 'db' é o nome do serviço no Docker Compose
  database: process.env.DB_DATABASE || 'tasksdb',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Rota para obter todas as tarefas
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// Rota para adicionar uma nova tarefa
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'O título é obrigatório' });
  }
  try {
    const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ error: 'Erro ao adicionar tarefa' });
  }
});

// Rota para atualizar uma tarefa existente
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar tarefa ${id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// Rota para excluir uma tarefa
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json({ message: `Tarefa ${id} excluída com sucesso` });
  } catch (error) {
    console.error(`Erro ao excluir tarefa ${id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});