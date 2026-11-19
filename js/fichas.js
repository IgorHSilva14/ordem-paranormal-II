/* ---------- Dados (placeholder; troque pelo back-end depois) ---------- */
const usuario = 'Usuário';

const fichas = [
  { id: 1, nome: 'Ficha 1', nivel: 1, nex: 0, portrait: null } // portrait: URL da imagem, ou null para o placeholder
];

/* ---------- Elementos ---------- */
document.getElementById('userName').textContent = usuario;
const roster = document.getElementById('roster');
const empty  = document.getElementById('empty');
const count  = document.getElementById('count');
const search = document.getElementById('search');

/* ---------- Fragmentos flutuantes (mesmo fundo do login) ---------- */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const fog = document.getElementById('fog');
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    const size = 4 + Math.random() * 9;
    s.className = 'shard';
    s.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
      `animation-duration:${14 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s`;
    fog.appendChild(s);
  }
}

/* ---------- Montagem dos cartões ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function stat(label, value) {
  const box = el('div');
  box.append(el('dt', '', label), el('dd', '', value));
  return box;
}

function buildCard(f) {
  const card = el('button', 'sheet');
  card.type = 'button';
  card.dataset.id = f.id;
  card.setAttribute('aria-label', `Abrir ${f.nome}, nível ${f.nivel}, NEX ${f.nex}%`);

  const portrait = el('div', 'sheet__portrait');
  if (f.portrait) {
    const img = el('img');
    img.src = f.portrait;
    img.alt = '';
    portrait.append(img);
  } else {
    portrait.innerHTML = '<svg aria-hidden="true"><use href="#i-agent"/></svg>';
  }

  const stats = el('dl', 'sheet__stats');
  stats.append(stat('Nível', f.nivel), stat('NEX', `${f.nex}%`));

  card.append(portrait, el('h2', 'sheet__name', f.nome), stats);

  card.addEventListener('click', () => {
    location.href = `personagem.html?id=${f.id}`;
  });
  return card;
}

/* ---------- Pesquisa ---------- */
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function render() {
  const q = normalize(search.value);
  const list = fichas.filter(f => normalize(f.nome).includes(q));

  roster.replaceChildren(...list.map(buildCard));
  empty.hidden = list.length > 0;
  count.textContent = list.length === 0 ? '' :
    q ? `${list.length} de ${fichas.length} ${fichas.length === 1 ? 'ficha' : 'fichas'}`
      : `${fichas.length} ${fichas.length === 1 ? 'ficha' : 'fichas'}`;
}

search.addEventListener('input', render);
render();
