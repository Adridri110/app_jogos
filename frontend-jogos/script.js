// 7.1 Configuração inicial e listagem (GET)
const API_URL = 'http://localhost:3000/jogos';

const formJogo = document.getElementById('form-jogo');
const tituloForm = document.getElementById('titulo-form');
const listaJogos = document.getElementById('lista-jogos');
const inputId = document.getElementById('jogo-id');
const btnCancelar = document.getElementById('btn-cancelar');
const btnSalvar = document.getElementById('btn-salvar');
const areaMensagem = document.getElementById('mensagem');

let temporizadorMensagem;

function mostrarMensagem(texto, tipo='sucesso'){
  areaMensagem.textContent = texto;
  areaMensagem.className = `mensagem ${tipo}`;

  clearTimeout(temporizadorMensagem);
  const duracao = tipo === 'erro' ? 8000 : 4000;
  temporizadorMensagem = setTimeout (()=> {
    areaMensagem.className = 'mensagem oculta';
  }, duracao)
}
async function carregarJogos(query = '') {
  const resposta = await fetch(`${API_URL}${query}`);
  const jogos = await resposta.json();
  renderizarJogos(jogos);
}

function renderizarJogos(jogos) {
  listaJogos.innerHTML = '';

  jogos.forEach((jogo) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${jogo.titulo}</td>
      <td>${jogo.genero}</td>
      <td>${jogo.plataforma}</td>
      <td>${jogo.ano}</td>
      <td>${jogo.nota ?? '-'}</td>
      <td>
        <button class="btn-editar" data-id="${jogo.id}">Editar</button>
        <button class="btn-excluir" data-id="${jogo.id}">Excluir</button>
      </td>
    `;
    listaJogos.appendChild(linha);
  });
}

// Carrega a lista assim que a página abre
carregarJogos();

// 7.2 Filtrando jogos (query string)
const filtroGenero = document.getElementById('filtro-genero');
const filtroPlataforma = document.getElementById('filtro-plataforma');
const filtroNotaMin = document.getElementById('filtro-notaMin');
const btnFiltrar = document.getElementById('btn-filtrar');
const btnLimparFiltro = document.getElementById('btn-limpar-filtro');

btnFiltrar.addEventListener('click', () => {
  const parametros = new URLSearchParams();

  if (filtroGenero.value) parametros.append('genero', filtroGenero.value);
  if (filtroPlataforma.value) parametros.append('plataforma', filtroPlataforma.value);
  if (filtroNotaMin.value) parametros.append('notaMin', filtroNotaMin.value);

  const query = parametros.toString();
  carregarJogos(query ? `?${query}` : '');
});

btnLimparFiltro.addEventListener('click', () => {
  filtroGenero.value = '';
  filtroPlataforma.value = '';
  filtroNotaMin.value = '';
  carregarJogos();
});

// 7.3 Cadastrando e editando um jogo (POST / PUT)
formJogo.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const jogo = {
    titulo: document.getElementById('titulo').value,
    genero: document.getElementById('genero').value,
    plataforma: document.getElementById('plataforma').value,
    ano: parseInt(document.getElementById('ano').value),
    nota: document.getElementById('nota').value
      ? parseFloat(document.getElementById('nota').value)
      : null
  };

  const id = inputId.value;

  if (id) {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jogo)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jogo)
    });
  }

  formJogo.reset();
  inputId.value = '';
  tituloForm.textContent = 'Cadastrar jogo';
  carregarJogos();
});

btnCancelar.addEventListener('click', () => {
  formJogo.reset();
  inputId.value = '';
  tituloForm.textContent = 'Cadastrar jogo';
});

// 7.4 Preenchendo o formulário para editar e excluindo (DELETE)
listaJogos.addEventListener('click', async (evento) => {
  const id = evento.target.dataset.id;
  if (!id) return;

  if (evento.target.classList.contains('btn-excluir')) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarJogos();
    return;
  }

  if (evento.target.classList.contains('btn-editar')) {
    const resposta = await fetch(`${API_URL}/${id}`);
    const jogo = await resposta.json();

    inputId.value = jogo.id;
    document.getElementById('titulo').value = jogo.titulo;
    document.getElementById('genero').value = jogo.genero;
    document.getElementById('plataforma').value = jogo.plataforma;
    document.getElementById('ano').value = jogo.ano;
    document.getElementById('nota').value = jogo.nota ?? '';
    tituloForm.textContent = `Editando: ${jogo.titulo}`;
  }
});
