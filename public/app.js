const state = {
  user: null,
  missions: [],
  activeTag: 'All',
};

const el = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }
  if (!res.ok) {
    throw new Error((data && data.error) || 'Something went wrong.');
  }
  return data;
}

/* ---------- Auth screen ---------- */

function showAuthError(message) {
  const errEl = el('auth-error');
  errEl.textContent = message;
  errEl.classList.remove('hidden');
}

el('tab-login').addEventListener('click', () => {
  el('tab-login').classList.add('active');
  el('tab-register').classList.remove('active');
  el('login-form').classList.remove('hidden');
  el('register-form').classList.add('hidden');
  el('auth-error').classList.add('hidden');
});

el('tab-register').addEventListener('click', () => {
  el('tab-register').classList.add('active');
  el('tab-login').classList.remove('active');
  el('register-form').classList.remove('hidden');
  el('login-form').classList.add('hidden');
  el('auth-error').classList.add('hidden');
});

el('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  el('auth-error').classList.add('hidden');
  try {
    const user = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: el('login-username').value,
        password: el('login-password').value,
      }),
    });
    onLoggedIn(user);
  } catch (err) {
    showAuthError(err.message);
  }
});

el('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  el('auth-error').classList.add('hidden');
  try {
    const user = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: el('register-username').value,
        password: el('register-password').value,
      }),
    });
    onLoggedIn(user);
  } catch (err) {
    showAuthError(err.message);
  }
});

el('logout-btn').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  state.user = null;
  el('main-screen').classList.add('hidden');
  el('auth-screen').classList.remove('hidden');
});

function onLoggedIn(user) {
  state.user = user;
  el('whoami').textContent = `👋 ${user.username}`;
  el('auth-screen').classList.add('hidden');
  el('main-screen').classList.remove('hidden');
  loadMissions();
}

/* ---------- Nav ---------- */

el('nav-missions').addEventListener('click', () => switchView('missions'));
el('nav-leaderboard').addEventListener('click', () => switchView('leaderboard'));

function switchView(view) {
  el('nav-missions').classList.toggle('active', view === 'missions');
  el('nav-leaderboard').classList.toggle('active', view === 'leaderboard');
  el('missions-view').classList.toggle('hidden', view !== 'missions');
  el('leaderboard-view').classList.toggle('hidden', view !== 'leaderboard');
  if (view === 'leaderboard') loadLeaderboard();
}

/* ---------- Missions ---------- */

async function loadMissions() {
  state.missions = await api('/missions');
  renderMissions();
}

document.querySelectorAll('.filter-chip').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.activeTag = btn.dataset.tag;
    document.querySelectorAll('.filter-chip').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderMissions();
  });
});

function slug(tag) {
  return tag.replace(/\s+/g, '-');
}

function renderMissions() {
  const grid = el('missions-grid');
  grid.innerHTML = '';

  const visible = state.missions.filter((m) => state.activeTag === 'All' || m.tag === state.activeTag);

  visible.forEach((m) => {
    const card = document.createElement('div');
    card.className = `mission-card${m.completed ? ' completed' : ''}`;
    card.innerHTML = `
      <div class="mission-number">MISSION ${String(m.number).padStart(2, '0')}</div>
      <span class="tag-badge tag-${slug(m.tag)}">${m.tag}</span>
      <h3 class="mission-title">${escapeHtml(m.title)}</h3>
      <p class="mission-description">${escapeHtml(m.description)}</p>
      <div class="mission-footer">
        <span class="mission-points">${m.points} pts</span>
        <button class="mission-action-btn${m.completed ? ' done' : ''}">${m.completed ? '✔ View Proof' : 'Submit Proof'}</button>
      </div>
    `;
    card.querySelector('.mission-action-btn').addEventListener('click', () => {
      if (m.completed) openViewModal(m);
      else openSubmitModal(m);
    });
    grid.appendChild(card);
  });

  const completedCount = state.missions.filter((m) => m.completed).length;
  const totalPoints = state.missions.filter((m) => m.completed).reduce((sum, m) => sum + m.points, 0);
  el('progress-text').textContent = `${completedCount} / ${state.missions.length} missions`;
  el('progress-points').textContent = `${totalPoints} pts`;
  el('progress-fill').style.width = `${state.missions.length ? (completedCount / state.missions.length) * 100 : 0}%`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Submit proof modal ---------- */

let activeMission = null;

function openSubmitModal(mission) {
  activeMission = mission;
  el('modal-title').textContent = `${mission.title}`;
  el('modal-description').textContent = mission.description;
  el('modal-points').textContent = `Worth ${mission.points} points`;
  el('proof-file').value = '';
  el('file-preview').classList.add('hidden');
  el('file-preview').innerHTML = '';
  el('modal-error').classList.add('hidden');
  el('submit-modal').classList.remove('hidden');
}

el('modal-close').addEventListener('click', () => el('submit-modal').classList.add('hidden'));
el('submit-modal').addEventListener('click', (e) => {
  if (e.target === el('submit-modal')) el('submit-modal').classList.add('hidden');
});

el('proof-file').addEventListener('change', () => {
  const file = el('proof-file').files[0];
  const preview = el('file-preview');
  preview.innerHTML = '';
  if (!file) { preview.classList.add('hidden'); return; }

  const url = URL.createObjectURL(file);
  const node = file.type.startsWith('video') ? document.createElement('video') : document.createElement('img');
  node.src = url;
  if (node.tagName === 'VIDEO') node.controls = true;
  preview.appendChild(node);
  preview.classList.remove('hidden');
});

el('submit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = el('proof-file').files[0];
  el('modal-error').classList.add('hidden');
  if (!file) return;

  const btn = el('submit-proof-btn');
  btn.disabled = true;
  btn.textContent = 'Uploading…';

  try {
    const formData = new FormData();
    formData.append('proof', file);
    await api(`/missions/${activeMission.id}/submit`, { method: 'POST', body: formData });
    el('submit-modal').classList.add('hidden');
    await loadMissions();
  } catch (err) {
    el('modal-error').textContent = err.message;
    el('modal-error').classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Proof';
  }
});

/* ---------- View proof modal ---------- */

function openViewModal(mission) {
  el('view-modal-title').textContent = mission.title;
  const container = el('view-modal-media');
  container.innerHTML = '';
  if (mission.proof) {
    const node = mission.proof.mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    node.src = mission.proof.filePath;
    if (node.tagName === 'VIDEO') node.controls = true;
    container.appendChild(node);
  }
  el('view-modal').classList.remove('hidden');
}

el('view-modal-close').addEventListener('click', () => el('view-modal').classList.add('hidden'));
el('view-modal').addEventListener('click', (e) => {
  if (e.target === el('view-modal')) el('view-modal').classList.add('hidden');
});

/* ---------- Leaderboard ---------- */

async function loadLeaderboard() {
  const rows = await api('/leaderboard');
  const tbody = el('leaderboard-body');
  tbody.innerHTML = '';
  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>#${index + 1}</td><td>${escapeHtml(row.username)}</td><td>${row.missionsCompleted}</td><td>${row.points}</td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Boot ---------- */

(async function boot() {
  try {
    const user = await api('/auth/me');
    onLoggedIn(user);
  } catch (_) {
    // not logged in, show auth screen (default state)
  }
})();
