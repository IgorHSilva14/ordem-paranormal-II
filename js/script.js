const hero  = document.getElementById('hero');
const auth  = document.getElementById('auth');
const shell = document.getElementById('shell');
const msg   = document.getElementById('msg');

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/* ---------- Fade entre a imagem e o login ---------- */
let ticking = false;

function update() {
  const p = clamp(window.scrollY / window.innerHeight);   // 0 (topo) → 1
  const heroOpacity = 1 - clamp(p / 0.7);                  // imagem some
  const authOpacity = clamp((p - 0.3) / 0.7);              // login aparece (com sobreposição)

  hero.style.setProperty('--p', p);
  hero.style.opacity = heroOpacity;
  hero.style.visibility = heroOpacity <= 0 ? 'hidden' : 'visible';
  hero.style.pointerEvents = heroOpacity < 0.5 ? 'none' : 'auto';

  auth.style.opacity = authOpacity;
  auth.style.visibility = authOpacity <= 0 ? 'hidden' : 'visible';
  auth.style.pointerEvents = authOpacity > 0.5 ? 'auto' : 'none';
  auth.style.zIndex = authOpacity > 0.5 ? 3 : 1;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}, { passive: true });
window.addEventListener('resize', update);
update();

document.getElementById('scrollBtn').addEventListener('click', () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});

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
