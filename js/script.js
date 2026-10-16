const hero     = document.getElementById('hero');
const profiles = document.getElementById('profiles');
const auth     = document.getElementById('auth');
const shell    = document.getElementById('shell');
const msg      = document.getElementById('msg');
const dots     = [...document.querySelectorAll('#dots button')];

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Camadas: hero -> perfis -> login ---------- */
function setLayer(el, opacity) {
  el.style.opacity = opacity;
  el.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
  el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
  el.style.zIndex = opacity > 0.5 ? 3 : 1;
}

let ticking = false;

function update() {
  const p = window.scrollY / window.innerHeight;           // 0 (topo) -> 2 (fim)

  const heroO     = 1 - clamp(p / 0.7);
  const profilesO = Math.min(clamp((p - 0.3) / 0.7), 1 - clamp((p - 1) / 0.7));
  const authO     = clamp((p - 1.3) / 0.7);

  hero.style.setProperty('--p', clamp(p));
  setLayer(hero, heroO);
  setLayer(profiles, profilesO);
  setLayer(auth, authO);
  profiles.classList.toggle('in-view', profilesO > 0.35);

  const active = Math.round(clamp(p, 0, 2));
  dots.forEach((d, i) => d.classList.toggle('is-on', i === active));
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}, { passive: true });
window.addEventListener('resize', update);
update();

/* setas e bolinhas: rolam até a camada indicada */
document.querySelectorAll('[data-to]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight * Number(btn.dataset.to), behavior: 'smooth' });
  });
});

/* ---------- Parallax do mouse na primeira camada ---------- */
if (!reduceMotion) {
  window.addEventListener('pointermove', (e) => {
    hero.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
    hero.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
  }, { passive: true });
}

/* ---------- Poeira / fagulhas flutuantes (canvas) ---------- */
(function dust() {
  const canvas = document.getElementById('dust');
  if (reduceMotion || !canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles = [];

  const spawn = (initial) => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : h + 10,
    r: 0.6 + Math.random() * 1.8,
    vy: 0.15 + Math.random() * 0.45,
    vx: (Math.random() - 0.5) * 0.25,
    t: Math.random() * Math.PI * 2,
    s: 0.01 + Math.random() * 0.02
  });

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(clamp(w * h / 16000, 30, 110));
    particles = Array.from({ length: n }, () => spawn(true));
  }

  function frame() {
    if (hero.style.visibility !== 'hidden') {
      ctx.clearRect(0, 0, w, h);
      for (const q of particles) {
        q.t += q.s; q.x += q.vx + Math.sin(q.t) * 0.3; q.y -= q.vy;
        if (q.y < -10) Object.assign(q, spawn(false));
        const a = 0.25 + Math.abs(Math.sin(q.t * 1.6)) * 0.6;
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 4);
        g.addColorStop(0, `rgba(170, 215, 255, ${a})`);
        g.addColorStop(1, 'rgba(106, 166, 224, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  frame();
})();

/* ---------- Fragmentos flutuantes ---------- */
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

/* ---------- Abas ---------- */
const tabs  = { login: document.getElementById('tab-login'),  signup: document.getElementById('tab-signup') };
const forms = { login: document.getElementById('form-login'), signup: document.getElementById('form-signup') };

function showTab(name) {
  shell.dataset.tab = name;
  for (const key of Object.keys(tabs)) {
    const on = key === name;
    tabs[key].classList.toggle('is-active', on);
    tabs[key].setAttribute('aria-selected', on);
    forms[key].hidden = !on;
    forms[key].classList.toggle('is-active', on);
  }
  setMessage('');
}
tabs.login.addEventListener('click',  () => showTab('login'));
tabs.signup.addEventListener('click', () => showTab('signup'));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.go)));

function setMessage(text, isError = false) {
  msg.textContent = text;
  msg.classList.toggle('is-error', isError);
}

/* ---------- Mostrar / ocultar senha ---------- */
document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.classList.toggle('is-on', show);
    btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
  });
});

/* ---------- Força da senha ---------- */
const meter = document.getElementById('meter');
const meterText = document.getElementById('meterText');
const labels = ['Digite uma senha', 'Fraca', 'Média', 'Boa', 'Forte'];

document.getElementById('pw').addEventListener('input', (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (!v) score = 0;
  meter.dataset.score = score;
  meterText.textContent = labels[score];
});

/* ---------- Envio (ligue ao seu back-end aqui) ---------- */
forms.login.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(forms.login));
  // TODO: enviar `data` ao seu servidor (fetch/axios)
  console.log('login', data);
  setMessage('Login enviado. Conecte ao seu back-end.');
});

forms.signup.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(forms.signup));
  if (data.password !== data.confirm) {
    setMessage('As senhas não coincidem. Digite a mesma senha nos dois campos.', true);
    return;
  }
  // TODO: enviar `data` ao seu servidor (fetch/axios)
  console.log('cadastro', data);
  setMessage('Conta criada. Conecte ao seu back-end.');
});
