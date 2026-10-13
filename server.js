const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Valida os campos obrigatórios e os tipos do corpo da requisição
function validarJogo(jogo) {
  const { titulo, genero, plataforma, ano, nota } = jogo ?? {};

  if (!titulo || !genero || !plataforma || ano === undefined || ano === null) {
    return 'Os campos titulo, genero, plataforma e ano são obrigatórios.';
  }
  if (!Number.isInteger(Number(ano))) {
    return 'O campo ano deve ser um número inteiro.';
  }
  if (nota !== undefined && nota !== null && (isNaN(Number(nota)) || nota < 0 || nota > 10)) {
    return 'O campo nota deve ser um número entre 0 e 10.';
  }
  return null;
}

// GET /jogos — lista todos, com filtros opcionais: ?genero=&plataforma=&notaMin=
app.get('/jogos', (req, res) => {
  const { genero, plataforma, notaMin } = req.query;
  const condicoes = [];
  const valores = [];

  if (genero) {
    condicoes.push('genero LIKE ?');
    valores.push(`%${genero}%`);
  }
  if (plataforma) {
    condicoes.push('plataforma LIKE ?');
    valores.push(`%${plataforma}%`);
  }
  if (notaMin) {
    condicoes.push('nota >= ?');
    valores.push(Number(notaMin));
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  const jogos = db.prepare(`SELECT * FROM jogos ${where} ORDER BY id`).all(...valores);
  res.json(jogos);
});

// GET /jogos/:id — busca um jogo
app.get('/jogos/:id', (req, res) => {
  const jogo = db.prepare('SELECT * FROM jogos WHERE id = ?').get(req.params.id);
  if (!jogo) return res.status(404).json({ erro: 'Jogo não encontrado.' });
  res.json(jogo);
});

// POST /jogos — cadastra um jogo
app.post('/jogos', (req, res) => {
  const erro = validarJogo(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, genero, plataforma, ano, nota } = req.body;
  const resultado = db
    .prepare('INSERT INTO jogos (titulo, genero, plataforma, ano, nota) VALUES (?, ?, ?, ?, ?)')
    .run(titulo, genero, plataforma, Number(ano), nota ?? null);

  const jogo = db.prepare('SELECT * FROM jogos WHERE id = ?').get(resultado.lastInsertRowid);
  res.status(201).json(jogo);
});

// PUT /jogos/:id — atualiza um jogo por completo
app.put('/jogos/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM jogos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Jogo não encontrado.' });

  const erro = validarJogo(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, genero, plataforma, ano, nota } = req.body;
  db.prepare(
    'UPDATE jogos SET titulo = ?, genero = ?, plataforma = ?, ano = ?, nota = ? WHERE id = ?'
  ).run(titulo, genero, plataforma, Number(ano), nota ?? null, req.params.id);

  const jogo = db.prepare('SELECT * FROM jogos WHERE id = ?').get(req.params.id);
  res.json(jogo);
});

// DELETE /jogos/:id — remove um jogo
app.delete('/jogos/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM jogos WHERE id = ?').run(req.params.id);
  if (resultado.changes === 0) return res.status(404).json({ erro: 'Jogo não encontrado.' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API de jogos rodando em http://localhost:${PORT}`);
});
