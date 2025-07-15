// url-shortener.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());

const urls = {}; // { short: { original, count } }

function generateShort() {
  return crypto.randomBytes(3).toString('hex');
}

// API para encurtar URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'URL inválida' });
  }
  let short;
  do {
    short = generateShort();
  } while (urls[short]);
  urls[short] = { original: url, count: 0 };
  res.json({ short });
});

// Redirecionamento e contagem de acessos
app.get('/:short', (req, res) => {
  const { short } = req.params;
  if (urls[short]) {
    urls[short].count++;
    res.redirect(urls[short].original);
  } else {
    res.status(404).send('URL não encontrada');
  }
});

// Consulta de estatísticas
app.get('/api/stats/:short', (req, res) => {
  const { short } = req.params;
  if (urls[short]) {
    res.json({ original: urls[short].original, count: urls[short].count });
  } else {
    res.status(404).json({ error: 'URL não encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});