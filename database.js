const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, 'jogos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS jogos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    genero TEXT NOT NULL,
    plataforma TEXT NOT NULL,
    ano INTEGER NOT NULL,
    nota REAL
  )
`);

// Carga inicial: insere 5 jogos apenas se a tabela estiver vazia
const { total } = db.prepare('SELECT COUNT(*) AS total FROM jogos').get();

if (total === 0) {
  const inserir = db.prepare(
    'INSERT INTO jogos (titulo, genero, plataforma, ano, nota) VALUES (?, ?, ?, ?, ?)'
  );

  inserir.run('The Legend of Zelda: Breath of the Wild', 'Aventura', 'Nintendo Switch', 2017, 9.7);
  inserir.run('The Witcher 3: Wild Hunt', 'RPG', 'PC', 2015, 9.3);
  inserir.run('Elden Ring', 'RPG', 'PlayStation 5', 2022, 9.5);
  inserir.run('Hollow Knight', 'Metroidvania', 'PC', 2017, 8.7);
  inserir.run('FIFA 23', 'Esporte', 'Xbox Series X', 2022, 7.4);
}

module.exports = db;
