
// Simple SPA behavior and interaction tracking (localStorage)
const state = { content: null, interactions: [] };

async function loadContent() {
  const res = await fetch('data/content.json');
  state.content = await res.json();
  renderFeed(state.content.feed);
  renderProfiles(state.content.profiles);
  renderEvents(state.content.events);
}

function renderFeed(items) {
  const container = document.getElementById('cards');
  container.innerHTML = '';
  const filter = document.getElementById('theme-filter').value;
  items.filter(it => filter === 'all' ? true : it.theme === filter)
       .forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="flex items-start gap-4">
        <div style="flex:1">
          <h3 class="text-lg font-semibold">${it.title}</h3>
          <p class="text-sm text-gray-600">${it.creator} • ${it.duration} • ${it.theme}</p>
          <p class="mt-2 text-sm text-gray-700">${it.description}</p>
          <div class="mt-3 flex gap-2">
            <button data-id="${it.id}" class="watch-btn nav-btn">Assistir</button>
            <button data-id="${it.id}" class="share-btn nav-btn">Compartilhar</button>
            <button data-jump="profile:1" class="nav-btn">Ir para perfil</button>
          </div>
        </div>
        <div style="width:220px">
          <video controls width="220" preload="none" poster="${it.poster}">
            <source src="${it.video}" type="video/mp4">
            Seu navegador não suporta vídeo.
          </video>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // attach listeners
  document.querySelectorAll('.watch-btn').forEach(b => b.onclick = onWatch);
  document.querySelectorAll('.share-btn').forEach(b => b.onclick = onShare);
}

function renderProfiles(list) {
  const container = document.getElementById('profiles-list');
  container.innerHTML = '';
  list.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card flex items-center justify-between';
    el.innerHTML = `<div>
      <div class="font-semibold">${p.name} — <span class="text-sm text-gray-600">${p.location}</span></div>
      <div class="text-sm text-gray-700">${p.bio}</div>
    </div>
    <div>
      <button data-id="${p.id}" class="open-profile nav-btn">Ver</button>
    </div>`;
    container.appendChild(el);
  });
  document.querySelectorAll('.open-profile').forEach(b=> b.onclick = (ev)=>{
    const id = +ev.target.dataset.id;
    const profile = state.content.profiles.find(x=>x.id===id);
    openProfileModal(profile);
    track('open_profile', { profile: profile.name });
  });
}

function renderEvents(list) {
  const container = document.getElementById('events-list');
  container.innerHTML = '';
  list.forEach(ev=>{
    const el = document.createElement('div');
    el.className = 'border rounded p-2';
    el.innerHTML = `<div class="font-medium">${ev.title}</div>
      <div class="text-sm text-gray-600">${ev.date} • ${ev.location}</div>
      <div class="mt-2 text-sm">${ev.description}</div>
      <div class="mt-2"><button data-id="${ev.id}" class="signup-btn nav-btn">Inscrever-se</button></div>`;
    container.appendChild(el);
  });
  document.querySelectorAll('.signup-btn').forEach(b=> b.onclick = (e)=>{
    const id = e.target.dataset.id;
    const ev = state.content.events.find(x=>x.id===id);
    openEventModal(ev);
    track('signup_click', { event: ev.title });
  });
}

function onWatch(e) {
  const id = e.target.dataset.id;
  track('watch', { id });
  const videoData = state.content.feed.find(v=>v.id===id);
  openVideoModal(videoData);
}

function onShare(e) {
  const id = e.target.dataset.id;
  track('share', { id });
  alert('Compartilhado! (simulação)');
}

function openVideoModal(video) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = `<h3 class="text-xl font-semibold">${video.title}</h3>
    <p class="text-sm text-gray-600">${video.creator} • ${video.duration}</p>
    <div class="mt-4">
      <video controls width="100%" autoplay>
        <source src="${video.video}" type="video/mp4">
        Seu navegador não suporta vídeo.
      </video>
    </div>
    <div class="mt-4 flex gap-2">
      <button id="btn-simulate" class="nav-btn">Simular escolha (e se...)</button>
      <button id="btn-close" class="nav-btn">Fechar</button>
    </div>
    <div id="sim-area" class="mt-4"></div>
  `;
  modal.classList.remove('hidden');
  document.getElementById('btn-close').onclick = ()=> closeModal();
  document.getElementById('btn-simulate').onclick = ()=> simulateChoice(video);
}

function openProfileModal(profile) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  let decisionsHtml = profile.decisions.map((d,i)=>`<button data-idx="${i}" class="decision-btn nav-btn block w-full text-left mt-2">${d.text} — <span class="text-xs text-gray-600">${d.desc}</span></button>`).join('');
  content.innerHTML = `<h3 class="text-xl font-semibold">${profile.name} — ${profile.location}</h3>
    <p class="mt-2 text-sm text-gray-700">${profile.bio}</p>
    <div class="mt-4"><strong>Decisões importantes</strong>${decisionsHtml}</div>
    <div class="mt-4"><button id="close-profile" class="nav-btn">Fechar</button></div>`;
  modal.classList.remove('hidden');
  document.getElementById('close-profile').onclick = ()=> closeModal();
  document.querySelectorAll('.decision-btn').forEach(btn=>{
    btn.onclick = (e)=>{
      const idx = +e.target.dataset.idx;
      const decision = profile.decisions[idx];
      showDecisionOutcome(profile, decision);
      track('decision_view', { profile: profile.name, decision: decision.text });
    };
  });
}

function showDecisionOutcome(profile, decision) {
  const simArea = document.getElementById('sim-area') || document.createElement('div');
  simArea.className = 'mt-3';
  simArea.innerHTML = `<div class="card"><strong>Simulação — ${decision.text}</strong>
    <p class="text-sm mt-2">${decision.desc}</p>
    <p class="text-sm text-gray-600 mt-2">Impacto provável: <em>${decision.impact}</em></p>
    <div class="mt-2">Resultado hipotético: <em>Com essa escolha, ${profile.name} poderia...</em></div>
  </div>`;
  const container = document.getElementById('modal-content');
  container.appendChild(simArea);
}

function simulateChoice(video) {
  const container = document.getElementById('sim-area');
  container.innerHTML = '';
  const scenario = document.createElement('div');
  scenario.className = 'card';
  scenario.innerHTML = `<strong>Micro-simulação</strong>
    <p class="mt-2 text-sm">Escolha uma pequena ação para ver um possível resultado:</p>
    <div class="mt-2">
      <button data-action="help" class="nav-btn">Ajudar a comunidade local</button>
      <button data-action="donate" class="nav-btn">Doar materiais</button>
      <button data-action="learn" class="nav-btn">Aprender e aplicar</button>
    </div>
    <div id="sim-result" class="mt-3"></div>
  `;
  container.appendChild(scenario);
  scenario.querySelectorAll('button').forEach(b=> b.onclick = (e)=>{
    const a = e.target.dataset.action;
    const res = { help: 'O envolvimento direto fortalece laços e pode iniciar projetos sustentáveis.',
                  donate: 'Doações ajudam no curto prazo, mas exigem governança para durar.',
                  learn: 'Aprender propicia transferência de conhecimento e independência.' }[a];
    document.getElementById('sim-result').innerHTML = `<div class="p-2 border rounded">${res}</div>`;
    track('simulate_choice', { video: video.id, action: a });
  });
}

function openEventModal(ev) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = `<h3 class="text-xl font-semibold">${ev.title}</h3>
    <p class="text-sm text-gray-600">${ev.date} • ${ev.location}</p>
    <p class="mt-2">${ev.description}</p>
    <div class="mt-4"><button id="vol-form" class="nav-btn">Inscrever-se como voluntário</button>
    <button id="close-ev" class="nav-btn">Fechar</button></div>
    <div id="vol-area" class="mt-3"></div>`;
  modal.classList.remove('hidden');
  document.getElementById('close-ev').onclick = ()=> closeModal();
  document.getElementById('vol-form').onclick = ()=> showVolunteerForm(ev);
}

function showVolunteerForm(ev) {
  const area = document.getElementById('vol-area');
  area.innerHTML = `<form id="volunteer" class="space-y-2">
    <input required placeholder="Nome" name="name" class="border rounded p-2 w-full" />
    <input required placeholder="E-mail" name="email" class="border rounded p-2 w-full" />
    <div class="flex gap-2"><button type="submit" class="nav-btn">Enviar</button><button type="button" id="cancel-vol" class="nav-btn">Cancelar</button></div>
  </form>`;
  document.getElementById('cancel-vol').onclick = ()=> area.innerHTML = '';
  document.getElementById('volunteer').onsubmit = (e)=>{
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    track('volunteer_signup', { event: ev.title, name: f.name });
    area.innerHTML = '<div class="p-2 border rounded">Inscrição recebida — obrigado!</div>';
  };
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

function track(event, payload) {
  const item = { at: new Date().toISOString(), event, payload };
  state.interactions.push(item);
  localStorage.setItem('pm_interactions', JSON.stringify(state.interactions));
}

function loadStored() {
  const raw = localStorage.getItem('pm_interactions');
  if(raw) state.interactions = JSON.parse(raw);
}

// Report modal
function openReport() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const grouped = (state.interactions || []).slice(-50).reverse();
  content.innerHTML = `<h3 class="text-xl font-semibold">Relatório — suas experiências recentes</h3>
    <div class="mt-3 text-sm"><em>Interações registradas (até 50 mais recentes):</em></div>
    <pre class="mt-3 p-2 bg-gray-50 border rounded text-xs max-h-96 overflow-auto">${JSON.stringify(grouped, null, 2)}</pre>
    <div class="mt-3"><button id="close-report" class="nav-btn">Fechar</button></div>`;
  modal.classList.remove('hidden');
  document.getElementById('close-report').onclick = ()=> closeModal();
}

// Navigation bindings
document.getElementById('theme-filter').onchange = ()=> renderFeed(state.content.feed);
document.getElementById('btn-feed').onclick = ()=> { window.scrollTo({top:0,behavior:'smooth'}); }
document.getElementById('btn-profiles').onclick = ()=> { document.querySelector('#profiles-list button')?.click(); }
document.getElementById('btn-events').onclick = ()=> document.getElementById('events-list')?.querySelector('button')?.click();
document.getElementById('btn-report').onclick = ()=> openReport();

document.querySelectorAll('.jump-btn').forEach(b=> b.onclick = (e)=>{
  const v = e.target.dataset.jump;
  if(v && v.startsWith('profile:')) {
    const id = +v.split(':')[1];
    const profile = state.content.profiles.find(x=> x.id === id);
    openProfileModal(profile);
    track('jump', { to: `profile:${id}` });
  }
});

loadStored();
loadContent();
