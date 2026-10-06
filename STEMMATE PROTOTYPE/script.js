/* ============================================================
   STEM FACILITATOR SESSION PLANNER — script.js
   Vanilla JS · localStorage · No external libraries
   ============================================================ */

// ---------- GLOBAL STATE ----------
const App = {
  currentUser: null,
  currentView: 'login',
  activities: [],
  savedActivities: [],
  sessionPlans: [],
  pendingChanges: [],
  isOffline: false,
  syncing: false,
  editingPlanId: null,
  selectedActivity: null,
  message: null,
  filter: {
    grade: '',
    topic: '',
    maxDuration: '',
    offlineOnly: false,
    searchText: ''
  }
};

// ---------- STORAGE KEYS ----------
const STORAGE_KEYS = {
  SAVED_ACTIVITIES: 'stem_savedActivities',
  SESSION_PLANS: 'stem_sessionPlans',
  PENDING_CHANGES: 'stem_pendingChanges',
  OFFLINE_MODE: 'stem_offlineMode'
};

// ---------- SAMPLE ACTIVITIES (FR-01) ----------
const SAMPLE_ACTIVITIES = [
  {
    id: 'act-001',
    title: 'Grade 8 Fractions: Pizza Slices & Equivalence',
    grade: 'Grade 8',
    topic: 'Fractions',
    duration: 25,
    offline: true,
    materials: ['Paper plates', 'Coloured markers', 'Scissors'],
    description: 'Hands-on exploration of equivalent fractions using paper pizza slices.',
    steps: '1. Distribute plates.\n2. Fold and colour slices.\n3. Compare 1/2, 2/4, 4/8.\n4. Record findings.'
  },
  {
    id: 'act-002',
    title: 'Grade 8 Fractions: Adding Unlike Denominators',
    grade: 'Grade 8',
    topic: 'Fractions',
    duration: 45,
    offline: true,
    materials: ['Fraction strips', 'Whiteboard', 'Worksheets'],
    description: 'Step-by-step method for adding fractions with different denominators.',
    steps: '1. Find LCM.\n2. Convert fractions.\n3. Add numerators.\n4. Simplify.'
  },
  {
    id: 'act-003',
    title: 'Grade 7 Algebra: Solving Simple Equations',
    grade: 'Grade 7',
    topic: 'Algebra',
    duration: 30,
    offline: true,
    materials: ['Balance scale', 'Blocks', 'Worksheet'],
    description: 'Use balance scales to introduce solving for x.',
    steps: '1. Model equations.\n2. Balance both sides.\n3. Isolate x.\n4. Practice.'
  },
  {
    id: 'act-004',
    title: 'Grade 9 Geometry: Circle Theorems',
    grade: 'Grade 9',
    topic: 'Geometry',
    duration: 50,
    offline: false,
    materials: ['Compass', 'Protractor', 'Ruler'],
    description: 'Discover inscribed angle and cyclic quadrilateral theorems.',
    steps: '1. Draw circles.\n2. Measure angles.\n3. State theorems.\n4. Solve problems.'
  },
  {
    id: 'act-005',
    title: 'Grade 8 Fractions: Multiplying Fractions',
    grade: 'Grade 8',
    topic: 'Fractions',
    duration: 20,
    offline: true,
    materials: ['Grid paper', 'Pencil', 'Coloured pens'],
    description: 'Visual area model for multiplying fractions.',
    steps: '1. Draw grids.\n2. Shade rows/columns.\n3. Count overlaps.\n4. Write product.'
  },
  {
    id: 'act-006',
    title: 'Grade 10 Trigonometry: SOH CAH TOA',
    grade: 'Grade 10',
    topic: 'Trigonometry',
    duration: 40,
    offline: true,
    materials: ['Scientific calculator', 'Ruler', 'Protractor'],
    description: 'Introduction to sine, cosine, and tangent ratios.',
    steps: '1. Label triangle sides.\n2. Define ratios.\n3. Calculate unknowns.\n4. Real-world problems.'
  },
  {
    id: 'act-007',
    title: 'Grade 7 Fractions: Comparing Fractions',
    grade: 'Grade 7',
    topic: 'Fractions',
    duration: 15,
    offline: true,
    materials: ['Fraction cards', 'Number line'],
    description: 'Quick comparison of fractions using benchmarks.',
    steps: '1. Sort cards.\n2. Use 1/2 benchmark.\n3. Order fractions.\n4. Discuss.'
  },
  {
    id: 'act-008',
    title: 'Grade 9 Algebra: Factorising Quadratics',
    grade: 'Grade 9',
    topic: 'Algebra',
    duration: 55,
    offline: false,
    materials: ['Algebra tiles', 'Whiteboard'],
    description: 'Visual and algebraic methods for factorising.',
    steps: '1. Model with tiles.\n2. Find factors.\n3. Check by expanding.\n4. Practice set.'
  }
];

// ---------- INITIALISATION ----------
function init() {
  loadFromStorage();
  render();
  setupEvalPanel();
}

// ---------- LOCAL STORAGE ----------
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ACTIVITIES);
    if (saved) App.savedActivities = JSON.parse(saved) || [];
  } catch (e) { App.savedActivities = []; }

  try {
    const plans = localStorage.getItem(STORAGE_KEYS.SESSION_PLANS);
    if (plans) App.sessionPlans = JSON.parse(plans) || [];
  } catch (e) { App.sessionPlans = []; }

  try {
    const pending = localStorage.getItem(STORAGE_KEYS.PENDING_CHANGES);
    if (pending) App.pendingChanges = JSON.parse(pending) || [];
  } catch (e) { App.pendingChanges = []; }

  const offline = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
  if (offline === 'true') App.isOffline = true;

  App.activities = SAMPLE_ACTIVITIES;
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify(App.savedActivities));
    localStorage.setItem(STORAGE_KEYS.SESSION_PLANS, JSON.stringify(App.sessionPlans));
    localStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(App.pendingChanges));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(App.isOffline));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

// ---------- MESSAGES ----------
function setMessage(type, text) {
  App.message = { type, text };
  setTimeout(() => {
    if (App.message && App.message.text === text) {
      App.message = null;
      render();
    }
  }, 5000);
}

function clearMessage() {
  App.message = null;
}

function renderMessage() {
  if (!App.message) return '';
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return `<div class="message message-${App.message.type}" role="alert">${icons[App.message.type] || ''} ${App.message.text}</div>`;
}

// ---------- AUTHENTICATION (SR-01) ----------
function login(username, password) {
  if (username === 'teacher' && password === 'teacher123') {
    App.currentUser = { username: 'teacher' };
    App.currentView = 'dashboard';
    clearMessage();
    render();
    return true;
  }
  return false;
}

function logout() {
  App.currentUser = null;
  App.currentView = 'login';
  clearMessage();
  render();
}

// ---------- NAVIGATION ----------
function navigateTo(view, data) {
  App.currentView = view;
  if (view === 'activityDetail' && data) App.selectedActivity = data;
  if (view === 'planEditor' && data) App.editingPlanId = data;
  clearMessage();
  render();
}

// ---------- FILTERING (FR-01) ----------
function getFilteredActivities() {
  return App.activities.filter(act => {
    if (App.filter.grade && act.grade !== App.filter.grade) return false;
    if (App.filter.topic && act.topic !== App.filter.topic) return false;
    if (App.filter.maxDuration) {
      const max = parseInt(App.filter.maxDuration, 10);
      if (act.duration > max) return false;
    }
    if (App.filter.offlineOnly && !act.offline) return false;
    if (App.filter.searchText) {
      const q = App.filter.searchText.toLowerCase();
      const match = act.title.toLowerCase().includes(q) ||
                    act.topic.toLowerCase().includes(q) ||
                    act.grade.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

function resetFilters() {
  App.filter = {
    grade: '',
    topic: '',
    maxDuration: '',
    offlineOnly: false,
    searchText: ''
  };
  render();
}

// ---------- SAVE ACTIVITY FOR OFFLINE (FR-02) ----------
function toggleSaveActivity(activityId) {
  const idx = App.savedActivities.indexOf(activityId);
  if (idx === -1) {
    App.savedActivities.push(activityId);
    setMessage('success', 'Activity saved for offline use.');
  } else {
    App.savedActivities.splice(idx, 1);
    setMessage('info', 'Activity removed from offline library.');
  }
  saveToStorage();
  render();
}

function isActivitySaved(id) {
  return App.savedActivities.includes(id);
}

// ---------- SESSION PLANS (FR-03) ----------
function createPlan() {
  const newPlan = {
    id: 'plan-' + Date.now(),
    title: 'Untitled Session Plan',
    grade: 'Grade 8',
    topic: '',
    duration: 30,
    objectives: '',
    materials: '',
    activity: '',
    steps: '',
    notes: '',
    lastModified: new Date().toISOString()
  };
  App.sessionPlans.push(newPlan);
  saveToStorage();
  App.editingPlanId = newPlan.id;
  App.currentView = 'planEditor';
  setMessage('success', 'New session plan created. Fill in the details and save.');
  render();
}

function savePlan(planId, data) {
  const idx = App.sessionPlans.findIndex(p => p.id === planId);
  if (idx !== -1) {
    App.sessionPlans[idx] = { ...App.sessionPlans[idx], ...data, lastModified: new Date().toISOString() };
    saveToStorage();

    // FR-04: If offline, queue the change
    if (App.isOffline) {
      addPendingChange(planId, 'Updated plan: ' + (data.title || 'untitled'));
      setMessage('warning', 'Offline — changes saved locally. Sync will occur when connection is restored.');
    } else {
      setMessage('success', 'Session plan saved.');
    }
    render();
  }
}

function deletePlan(planId) {
  if (confirm('Delete this session plan? This cannot be undone.')) {
    App.sessionPlans = App.sessionPlans.filter(p => p.id !== planId);
    saveToStorage();
    setMessage('info', 'Session plan deleted.');
    App.currentView = 'plans';
    render();
  }
}

function getPlanById(id) {
  return App.sessionPlans.find(p => p.id === id);
}

// ---------- PENDING CHANGES / SYNC (FR-04) ----------
function addPendingChange(planId, changeDescription) {
  App.pendingChanges.push({
    id: 'change-' + Date.now(),
    planId: planId,
    description: changeDescription,
    timestamp: new Date().toISOString(),
    synced: false
  });
  saveToStorage();
}

function attemptSync() {
  if (App.isOffline) {
    setMessage('warning', 'Offline — changes saved locally. Sync will occur when connection is restored.');
    render();
    return;
  }

  if (App.pendingChanges.length === 0) {
    setMessage('success', '✓ SYNC COMPLETE — No pending changes.');
    render();
    return;
  }

  // Simulate syncing
  App.syncing = true;
  render();

  setTimeout(() => {
    App.pendingChanges = [];
    App.syncing = false;
    saveToStorage();
    setMessage('success', '✓ SYNC COMPLETE — All changes synced successfully.');
    render();
  }, 800);
}

function toggleOfflineMode() {
  App.isOffline = !App.isOffline;
  saveToStorage();
  if (App.isOffline) {
    setMessage('warning', 'Simulated OFFLINE mode activated. Changes will be stored locally.');
  } else {
    setMessage('success', 'Simulated ONLINE mode activated. You can now sync.');
  }
  render();
}

// ---------- RENDER ENGINE ----------
function render() {
  const app = document.getElementById('app');
  if (!App.currentUser) {
    app.innerHTML = renderLogin();
    attachLoginEvents();
    return;
  }

  let content = '';
  switch (App.currentView) {
    case 'dashboard': content = renderDashboard(); break;
    case 'activities': content = renderActivities(); break;
    case 'activityDetail': content = renderActivityDetail(); break;
    case 'plans': content = renderPlans(); break;
    case 'planEditor': content = renderPlanEditor(); break;
    case 'offlineLibrary': content = renderOfflineLibrary(); break;
    default: content = renderDashboard();
  }

  app.innerHTML = renderHeader() + `<div class="scroll-area">${renderMessage()}${content}</div>` + renderBottomNav();
  attachGlobalEvents();
  attachViewEvents();
}

// ---------- LOGIN VIEW ----------
function renderLogin() {
  return `
    <div class="login-container">
      <div class="login-logo" aria-hidden="true">🔬</div>
      <h1 class="text-center">STEM Facilitator</h1>
      <p class="login-subtitle">Session Planner &amp; Activity Manager</p>
      <div id="loginMessage" role="alert"></div>
      <form id="loginForm" novalidate>
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" autocomplete="username"
                 required placeholder="Enter username" aria-required="true">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" autocomplete="current-password"
                 required placeholder="Enter password" aria-required="true">
        </div>
        <button type="submit" class="btn btn-primary btn-block">Sign In</button>
      </form>
      <p class="text-muted text-center mt-3">Demo credentials: teacher / teacher123</p>
    </div>
  `;
}

function attachLoginEvents() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const msgDiv = document.getElementById('loginMessage');

    if (!username || !password) {
      msgDiv.innerHTML = '<div class="message message-error">✕ Please enter both username and password.</div>';
      return;
    }

    const success = login(username, password);
    if (!success) {
      msgDiv.innerHTML = '<div class="message message-error">✕ Invalid credentials. Please try again.</div>';
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  });
}

// ---------- HEADER ----------
function renderHeader() {
  const offlineClass = App.isOffline ? 'status-offline' : 'status-online';
  const offlineText = App.isOffline ? '✕ OFFLINE' : '✓ ONLINE';

  let syncBadge;
  if (App.syncing) {
    syncBadge = `<span class="status-badge status-syncing">↻ SYNCING</span>`;
  } else if (App.pendingChanges.length > 0) {
    syncBadge = `<span class="status-badge status-pending">⚠ ${App.pendingChanges.length} PENDING</span>`;
  } else {
    syncBadge = `<span class="status-badge status-synced">✓ SYNCED</span>`;
  }

  return `
    <header class="app-header">
      <div class="header-title">🔬 STEM Facilitator</div>
      <div class="header-right">
        <span class="status-badge ${offlineClass}" aria-live="polite">${offlineText}</span>
        ${syncBadge}
        <button class="btn btn-sm btn-outline" id="syncBtn" aria-label="Synchronise pending changes" ${App.syncing ? 'disabled' : ''}>↻ Sync</button>
        <button class="btn btn-sm btn-outline" id="logoutBtn" aria-label="Sign out">Sign Out</button>
      </div>
    </header>
  `;
}

// ---------- BOTTOM NAV ----------
function renderBottomNav() {
  const items = [
    { view: 'dashboard', icon: '🏠', label: 'Home' },
    { view: 'activities', icon: '📚', label: 'Activities' },
    { view: 'plans', icon: '📋', label: 'Plans' },
    { view: 'offlineLibrary', icon: '📥', label: 'Offline' }
  ];

  return `
    <nav class="bottom-nav" aria-label="Main navigation">
      ${items.map(item => `
        <button class="nav-item ${App.currentView === item.view ? 'active' : ''}"
                data-nav="${item.view}"
                aria-label="${item.label}"
                ${App.currentView === item.view ? 'aria-current="page"' : ''}>
          <span class="nav-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// ---------- DASHBOARD ----------
function renderDashboard() {
  const pendingCount = App.pendingChanges.length;
  const statusText = App.isOffline
    ? '⚠ OFFLINE — Changes saved locally'
    : (pendingCount > 0 ? '⚠ Changes pending sync' : '✓ ONLINE — All changes synced');

  return `
    <h1>Dashboard</h1>
    <p class="text-muted mb-3">Welcome, ${App.currentUser.username}.</p>

    <div class="card">
      <h3>System Status</h3>
      <p class="mb-2"><strong>${statusText}</strong></p>
      ${pendingCount > 0 ? `<p class="text-muted">${pendingCount} change${pendingCount > 1 ? 's' : ''} waiting to sync.</p>` : ''}
    </div>

    <div class="card">
      <h3>Quick Actions</h3>
      <div class="card-actions">
        <button class="btn btn-primary" data-action="go-activities">📚 Browse Activities</button>
        <button class="btn btn-secondary" data-action="go-plans">📋 Session Plans</button>
        <button class="btn btn-secondary" data-action="go-offline">📥 Offline Library</button>
      </div>
    </div>

    <div class="card">
      <h3>Status Summary</h3>
      <p class="text-muted">Saved activities: <strong>${App.savedActivities.length}</strong></p>
      <p class="text-muted">Session plans: <strong>${App.sessionPlans.length}</strong></p>
      <p class="text-muted">Pending changes: <strong>${App.pendingChanges.length}</strong></p>
    </div>

    <div class="card">
      <h3>Offline Mode (Test Control)</h3>
      <p class="text-muted mb-2">Simulate connectivity for FR-04 testing.</p>
      <button class="btn ${App.isOffline ? 'btn-success' : 'btn-warning'} btn-block" id="toggleOfflineBtn">
        ${App.isOffline ? '✓ Simulate Online' : '⚠ Simulate Offline'}
      </button>
    </div>
  `;
}

// ---------- ACTIVITY BROWSER (FR-01) ----------
function renderActivities() {
  const filtered = getFilteredActivities();
  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const topics = ['Fractions', 'Algebra', 'Geometry', 'Trigonometry'];

  let listHtml;
  if (filtered.length === 0) {
    listHtml = `
      <div class="message message-warning" role="status">
        ⚠ No activities found matching your filters.
        <br><button class="btn btn-sm btn-outline mt-2" data-action="reset-filters">Clear all filters</button>
      </div>
    `;
  } else {
    listHtml = '<div class="activity-list">' + filtered.map(act => {
      const saved = isActivitySaved(act.id);
      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${act.title}</span>
            ${saved ? '<span class="tag tag-green">✓ Saved offline</span>' : ''}
          </div>
          <div class="card-meta">
            <span class="tag tag-blue">${act.grade}</span>
            <span class="tag">${act.topic}</span>
            <span class="tag">${act.duration} min</span>
            <span class="tag ${act.offline ? 'tag-green' : 'tag-amber'}">${act.offline ? '✓ Offline' : '⚠ Online only'}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary" data-action="view-activity" data-id="${act.id}">View Details</button>
            <button class="btn btn-sm ${saved ? 'btn-warning' : 'btn-success'}" data-action="toggle-save" data-id="${act.id}">
              ${saved ? 'Remove Offline' : 'Save for Offline'}
            </button>
          </div>
        </div>
      `;
    }).join('') + '</div>';
  }

  return `
    <h1>Activity Browser</h1>
    <div class="filter-section">
      <h4>Filters</h4>
      <div class="filter-grid">
        <div class="form-group">
          <label for="filterGrade">Grade</label>
          <select id="filterGrade">
            <option value="">All grades</option>
            ${grades.map(g => `<option value="${g}" ${App.filter.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="filterTopic">Topic</label>
          <select id="filterTopic">
            <option value="">All topics</option>
            ${topics.map(t => `<option value="${t}" ${App.filter.topic === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="filterDuration">Max Duration</label>
          <select id="filterDuration">
            <option value="">Any duration</option>
            <option value="20" ${App.filter.maxDuration === '20' ? 'selected' : ''}>≤ 20 min</option>
            <option value="30" ${App.filter.maxDuration === '30' ? 'selected' : ''}>≤ 30 min</option>
            <option value="45" ${App.filter.maxDuration === '45' ? 'selected' : ''}>≤ 45 min</option>
            <option value="60" ${App.filter.maxDuration === '60' ? 'selected' : ''}>≤ 60 min</option>
          </select>
        </div>
        <div class="form-group">
          <label for="filterSearch">Search</label>
          <input type="search" id="filterSearch" placeholder="Title or topic…" value="${App.filter.searchText}">
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="filterOffline" ${App.filter.offlineOnly ? 'checked' : ''}>
        <label for="filterOffline">Works offline only</label>
      </div>
      <button class="btn btn-sm btn-outline" data-action="reset-filters">Clear filters</button>
    </div>
    <p class="text-muted mb-2">${filtered.length} activity${filtered.length !== 1 ? 'ies' : ''} found</p>
    ${listHtml}
  `;
}

// ---------- ACTIVITY DETAIL ----------
function renderActivityDetail() {
  const act = App.selectedActivity;
  if (!act) {
    return '<div class="message message-error">Activity not found.</div>';
  }
  const saved = isActivitySaved(act.id);

  return `
    <button class="btn btn-sm btn-outline mb-3" data-action="go-activities">← Back to Activities</button>
    <h1>${act.title}</h1>
    <div class="card-meta mb-3">
      <span class="tag tag-blue">${act.grade}</span>
      <span class="tag">${act.topic}</span>
      <span class="tag">${act.duration} min</span>
      <span class="tag ${act.offline ? 'tag-green' : 'tag-amber'}">${act.offline ? '✓ Works Offline' : '⚠ Online Only'}</span>
    </div>

    <div class="card">
      <h3>Description</h3>
      <p>${act.description}</p>
    </div>

    <div class="card">
      <h3>Materials Needed</h3>
      <ul style="padding-left: 20px;">
        ${act.materials.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>

    <div class="card">
      <h3>Teaching Steps</h3>
      <p style="white-space: pre-line;">${act.steps}</p>
    </div>

    <button class="btn ${saved ? 'btn-warning' : 'btn-success'} btn-block mb-3" data-action="toggle-save" data-id="${act.id}">
      ${saved ? '⚠ Remove from Offline Library' : '✓ Save for Offline Use'}
    </button>
  `;
}

// ---------- SESSION PLANS LIST (FR-03) ----------
function renderPlans() {
  let listHtml;
  if (App.sessionPlans.length === 0) {
    listHtml = `
      <div class="message message-info">
        ℹ No session plans yet. Create your first one below.
      </div>
    `;
  } else {
    listHtml = '<div class="plan-list">' + App.sessionPlans.map(plan => `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${plan.title || 'Untitled Plan'}</span>
          ${App.pendingChanges.some(c => c.planId === plan.id) ? '<span class="tag tag-amber">⚠ Pending sync</span>' : ''}
        </div>
        <div class="card-meta">
          <span class="tag tag-blue">${plan.grade}</span>
          <span class="tag">${plan.duration} min</span>
          ${plan.topic ? `<span class="tag">${plan.topic}</span>` : ''}
        </div>
        <p class="text-muted mb-2">Last modified: ${new Date(plan.lastModified).toLocaleString()}</p>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" data-action="edit-plan" data-id="${plan.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-action="delete-plan" data-id="${plan.id}">Delete</button>
        </div>
      </div>
    `).join('') + '</div>';
  }

  return `
    <div class="flex-between mb-3">
      <h1 style="margin:0;">Session Plans</h1>
      <button class="btn btn-primary" data-action="new-plan">+ New Plan</button>
    </div>
    ${listHtml}
  `;
}

// ---------- SESSION PLAN EDITOR (FR-03) ----------
function renderPlanEditor() {
  const plan = getPlanById(App.editingPlanId);
  if (!plan) {
    return '<div class="message message-error">Plan not found. <button class="btn btn-sm btn-outline" data-action="go-plans">Back</button></div>';
  }

  return `
    <div class="flex-between mb-3">
      <button class="btn btn-sm btn-outline" data-action="go-plans">← Back</button>
      <h1 style="margin:0; font-size:1.2rem;">Edit Plan</h1>
    </div>

    <form id="planForm">
      <div class="form-group">
        <label for="planTitle">Session Title *</label>
        <input type="text" id="planTitle" required value="${escapeHtml(plan.title)}">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="planGrade">Grade / Level *</label>
          <select id="planGrade" required>
            <option value="Grade 7" ${plan.grade === 'Grade 7' ? 'selected' : ''}>Grade 7</option>
            <option value="Grade 8" ${plan.grade === 'Grade 8' ? 'selected' : ''}>Grade 8</option>
            <option value="Grade 9" ${plan.grade === 'Grade 9' ? 'selected' : ''}>Grade 9</option>
            <option value="Grade 10" ${plan.grade === 'Grade 10' ? 'selected' : ''}>Grade 10</option>
          </select>
        </div>
        <div class="form-group">
          <label for="planTopic">Topic</label>
          <input type="text" id="planTopic" value="${escapeHtml(plan.topic)}" placeholder="e.g. Fractions">
        </div>
        <div class="form-group">
          <label for="planDuration">Duration (min) *</label>
          <input type="number" id="planDuration" required min="5" max="180" value="${plan.duration}">
        </div>
      </div>

      <div class="form-group">
        <label for="planObjectives">Learning Objectives</label>
        <textarea id="planObjectives" rows="3">${escapeHtml(plan.objectives)}</textarea>
      </div>

      <div class="form-group">
        <label for="planMaterials">Materials</label>
        <textarea id="planMaterials" rows="2">${escapeHtml(plan.materials)}</textarea>
      </div>

      <div class="form-group">
        <label for="planActivity">Activity</label>
        <textarea id="planActivity" rows="2">${escapeHtml(plan.activity)}</textarea>
      </div>

      <div class="form-group">
        <label for="planSteps">Teaching Steps</label>
        <textarea id="planSteps" rows="4">${escapeHtml(plan.steps)}</textarea>
      </div>

      <div class="form-group">
        <label for="planNotes">Notes</label>
        <textarea id="planNotes" rows="2">${escapeHtml(plan.notes)}</textarea>
      </div>

      <div class="card-actions">
        <button type="submit" class="btn btn-primary">💾 Save Plan</button>
        <button type="button" class="btn btn-secondary" data-action="go-plans">Cancel</button>
      </div>
    </form>
  `;
}

// ---------- OFFLINE LIBRARY (FR-02) ----------
function renderOfflineLibrary() {
  const saved = App.activities.filter(a => App.savedActivities.includes(a.id));

  let listHtml;
  if (saved.length === 0) {
    listHtml = `
      <div class="message message-info">
        ℹ No activities saved offline yet. Browse activities and tap "Save for Offline".
      </div>
    `;
  } else {
    listHtml = '<div class="activity-list">' + saved.map(act => `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${act.title}</span>
          <span class="tag tag-green">✓ Offline</span>
        </div>
        <div class="card-meta">
          <span class="tag tag-blue">${act.grade}</span>
          <span class="tag">${act.topic}</span>
          <span class="tag">${act.duration} min</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-primary" data-action="view-activity" data-id="${act.id}">View</button>
          <button class="btn btn-sm btn-warning" data-action="toggle-save" data-id="${act.id}">Remove</button>
        </div>
      </div>
    `).join('') + '</div>';
  }

  return `
    <h1>Offline Library</h1>
    <p class="text-muted mb-3">${saved.length} activity${saved.length !== 1 ? 'ies' : ''} available offline.</p>
    <div class="card mb-3">
      <h4>Connection Status</h4>
      <p class="mb-2"><strong>${App.isOffline ? '⚠ OFFLINE — Changes saved locally' : '✓ ONLINE — All changes synced'}</strong></p>
      <button class="btn ${App.isOffline ? 'btn-success' : 'btn-warning'} btn-block" id="toggleOfflineBtn">
        ${App.isOffline ? '✓ Simulate Online' : '⚠ Simulate Offline'}
      </button>
    </div>
    ${listHtml}
  `;
}

// ---------- EVENT ATTACHMENT ----------
function attachGlobalEvents() {
  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) syncBtn.addEventListener('click', attemptSync);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Bottom navigation
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.nav));
  });
}

function attachViewEvents() {
  // Generic action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      switch (action) {
        case 'go-activities': navigateTo('activities'); break;
        case 'go-plans': navigateTo('plans'); break;
        case 'go-offline': navigateTo('offlineLibrary'); break;
        case 'view-activity': {
          const act = App.activities.find(a => a.id === id);
          if (act) navigateTo('activityDetail', act);
          break;
        }
        case 'toggle-save': toggleSaveActivity(id); break;
        case 'new-plan': createPlan(); break;
        case 'edit-plan': navigateTo('planEditor', id); break;
        case 'delete-plan': deletePlan(id); break;
        case 'reset-filters': resetFilters(); break;
      }
    });
  });

  // Dashboard offline toggle
  const toggleBtn = document.getElementById('toggleOfflineBtn');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleOfflineMode);

  // Filter events
  const filterGrade = document.getElementById('filterGrade');
  if (filterGrade) filterGrade.addEventListener('change', () => {
    App.filter.grade = filterGrade.value;
    render();
  });

  const filterTopic = document.getElementById('filterTopic');
  if (filterTopic) filterTopic.addEventListener('change', () => {
    App.filter.topic = filterTopic.value;
    render();
  });

  const filterDuration = document.getElementById('filterDuration');
  if (filterDuration) filterDuration.addEventListener('change', () => {
    App.filter.maxDuration = filterDuration.value;
    render();
  });

  const filterOffline = document.getElementById('filterOffline');
  if (filterOffline) filterOffline.addEventListener('change', () => {
    App.filter.offlineOnly = filterOffline.checked;
    render();
  });

  const filterSearch = document.getElementById('filterSearch');
  if (filterSearch) {
    // Debounced search
    let timer;
    filterSearch.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        App.filter.searchText = filterSearch.value;
        render();
        // Re-focus search input after re-render
        const newSearch = document.getElementById('filterSearch');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
        }
      }, 250);
    });
  }

  // Plan form submission
  const planForm = document.getElementById('planForm');
  if (planForm) {
    planForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('planTitle').value.trim(),
        grade: document.getElementById('planGrade').value,
        topic: document.getElementById('planTopic').value.trim(),
        duration: parseInt(document.getElementById('planDuration').value, 10) || 30,
        objectives: document.getElementById('planObjectives').value.trim(),
        materials: document.getElementById('planMaterials').value.trim(),
        activity: document.getElementById('planActivity').value.trim(),
        steps: document.getElementById('planSteps').value.trim(),
        notes: document.getElementById('planNotes').value.trim()
      };

      if (!data.title) {
        setMessage('error', 'Please enter a session title.');
        render();
        return;
      }

      savePlan(App.editingPlanId, data);
      App.currentView = 'plans';
      render();
    });
  }
}

// ---------- EVAL PANEL ----------
function setupEvalPanel() {
  const toggle = document.getElementById('evalToggle');
  const content = document.getElementById('evalContent');
  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const isHidden = content.hasAttribute('hidden');
    if (isHidden) {
      content.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      content.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------- HELPERS ----------
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// ---------- START ----------
init();