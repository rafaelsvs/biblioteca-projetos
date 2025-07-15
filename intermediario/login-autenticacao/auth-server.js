const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3001;
const SECRET = 'sua_chave_secreta_segura';

app.use(cors());
app.use(bodyParser.json());

const users = []; // [{ username, passwordHash }]

// Cadastro
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Usuário já existe.' });
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  res.json({ message: 'Usuário cadastrado com sucesso!' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// Rota privada
app.get('/api/private', authMiddleware, (req, res) => {
  res.json({ message: `Bem-vindo, ${req.user.username}! Esta é uma página privada.` });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});