(function () {
  'use strict';

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  let SIZE = canvas.width; // logical drawing size; kept square

  const els = {
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    current: document.getElementById('current-word'),
    words: document.getElementById('words-list'),
    toast: document.getElementById('toast'),
    shuffle: document.getElementById('shuffle'),
    hint: document.getElementById('hint'),
    clear: document.getElementById('clear'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayText: document.getElementById('overlay-text'),
    overlayBtn: document.getElementById('overlay-btn')
  };

  const state = {
    levelIndex: Number(localStorage.getItem('wb_level') || 0),
    score: 0,
    best: Number(localStorage.getItem('wb_best') || 0),
    letters: [],
    tiles: [],
    selection: [],
    foundGoals: new Set(),
    foundBonus: new Set(),
    revealed: new Set(),
    dragging: false,
    pointer: null
  };

  if (state.levelIndex >= LEVELS.length) state.levelIndex = 0;

  function currentLevel() { return LEVELS[state.levelIndex]; }

  // --- High-DPI sizing -----------------------------------------------------
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    SIZE = Math.round(rect.width);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutTiles();
    draw();
  }

  // --- Layout --------------------------------------------------------------
  function layoutTiles() {
    const letters = state.letters;
    const n = letters.length;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = SIZE * 0.32;
    const tileR = Math.max(26, Math.min(42, (SIZE * 0.78) / (n + 1)));
    state.tiles = letters.map(function (ch, i) {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      return {
        ch: ch,
        x: cx + radius * Math.cos(ang),
        y: cy + radius * Math.sin(ang),
        r: tileR
      };
    });
  }

  function shuffleTiles() {
    for (let i = state.letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = state.letters[i]; state.letters[i] = state.letters[j]; state.letters[j] = tmp;
    }
    layoutTiles();
    draw();
  }

  // --- Input ---------------------------------------------------------------
  function tileAt(x, y) {
    return state.tiles.find(function (t) { return Math.hypot(t.x - x, t.y - y) <= t.r; });
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return {
      x: (p.clientX - rect.left) * (SIZE / rect.width),
      y: (p.clientY - rect.top) * (SIZE / rect.height)
    };
  }

  function startSelect(e) {
    e.preventDefault();
    state.dragging = true;
    state.selection = [];
    state.pointer = pointerPos(e);
    addToSelection(state.pointer);
  }

  function moveSelect(e) {
    if (!state.dragging) return;
    e.preventDefault();
    state.pointer = pointerPos(e);
    addToSelection(state.pointer);
    draw();
  }

  function addToSelection(pos) {
    const t = tileAt(pos.x, pos.y);
    if (!t || state.selection.indexOf(t) !== -1) return;
    state.selection.push(t);
    renderCurrent();
    draw();
  }

  function endSelect(e) {
    if (!state.dragging) return;
    e.preventDefault();
    state.dragging = false;
    state.pointer = null;
    submitWord();
    state.selection = [];
    renderCurrent();
    draw();
  }

  function currentString() {
    return state.selection.map(function (t) { return t.ch; }).join('');
  }

  // --- Scoring -------------------------------------------------------------
  function submitWord() {
    const word = currentString();
    if (word.length < 3) return;

    const alreadyFound = state.foundGoals.has(word) || state.foundBonus.has(word);
    if (alreadyFound) { flash('bad'); toast('Already found', true); return; }

    if (!Dictionary.isValid(word, currentLevel(), state.letters)) {
      flash('bad'); toast('Not a word', true); return;
    }

    const isGoal = currentLevel().goals.indexOf(word) !== -1;
    if (isGoal) {
      state.foundGoals.add(word);
    } else {
      state.foundBonus.add(word);
    }
    const gain = word.length * 10 + (isGoal ? 0 : 5);
    addScore(gain);
    flash('good');
    toast('+' + gain + '  ' + word + (isGoal ? '' : '  (bonus)'));
    renderWordList();
    updateProgress();
    checkLevelComplete();
  }

  function addScore(n) {
    state.score += n;
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('wb_best', state.best);
    }
    updateHud();
  }

  function checkLevelComplete() {
    if (state.foundGoals.size >= currentLevel().goals.length) {
      const last = state.levelIndex >= LEVELS.length - 1;
      showOverlay(
        last ? 'You Win! 🎉' : 'Level Complete!',
        'Score: ' + state.score + (state.foundBonus.size ? '  •  ' + state.foundBonus.size + ' bonus words' : ''),
        last ? 'Play Again' : 'Next Level',
        function () {
          if (last) { state.levelIndex = 0; state.score = 0; }
          else { state.levelIndex++; }
          localStorage.setItem('wb_level', state.levelIndex);
          loadLevel();
        }
      );
    }
  }

  // --- Hint ----------------------------------------------------------------
  function useHint() {
    const remaining = currentLevel().goals.filter(function (w) { return !state.foundGoals.has(w); });
    if (!remaining.length) { toast('All words found!'); return; }
    // Reveal the first letter of the shortest unfound goal word.
    remaining.sort(function (a, b) { return a.length - b.length; });
    const word = remaining[0];
    state.revealed.add(word);
    addScore(-15);
    toast('Hint: ' + word[0] + '… (' + word.length + ' letters)');
    renderWordList();
  }

  // --- Rendering -----------------------------------------------------------
  function loadLevel() {
    hideOverlay();
    state.letters = currentLevel().base.split('');
    shuffleArray(state.letters);
    state.selection = [];
    state.foundGoals = new Set();
    state.foundBonus = new Set();
    state.revealed = new Set();
    state.score = state.score || 0;
    layoutTiles();
    updateHud();
    renderWordList();
    renderCurrent();
    updateProgress();
    draw();
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
  }

  function updateHud() {
    els.level.textContent = state.levelIndex + 1;
    els.score.textContent = state.score;
    els.best.textContent = state.best;
  }

  function updateProgress() {
    const total = currentLevel().goals.length;
    const found = state.foundGoals.size;
    els.progressBar.style.width = (total ? (found / total) * 100 : 0) + '%';
    els.progressText.textContent = found + ' / ' + total + ' words';
  }

  function renderCurrent() {
    els.current.textContent = currentString();
  }

  function renderWordList() {
    const goals = currentLevel().goals.slice().sort(function (a, b) {
      return a.length - b.length || a.localeCompare(b);
    });
    els.words.innerHTML = '';
    goals.forEach(function (w) {
      const chip = document.createElement('span');
      const found = state.foundGoals.has(w);
      chip.className = 'word-chip' + (found ? ' found' : '');
      if (found) {
        chip.textContent = w;
      } else if (state.revealed.has(w)) {
        chip.textContent = w[0] + '·'.repeat(w.length - 1);
      } else {
        chip.textContent = '·'.repeat(w.length);
      }
      els.words.appendChild(chip);
    });
    // bonus counter chip
    if (state.foundBonus.size) {
      const chip = document.createElement('span');
      chip.className = 'word-chip bonus';
      chip.textContent = '+' + state.foundBonus.size + ' bonus';
      els.words.appendChild(chip);
    }
  }

  function flash(kind) {
    els.current.classList.remove('good', 'bad');
    void els.current.offsetWidth; // restart animation
    els.current.classList.add(kind);
  }

  let toastTimer;
  function toast(msg, isErr) {
    els.toast.textContent = msg;
    els.toast.classList.toggle('err', !!isErr);
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove('show'); }, 1300);
  }

  function showOverlay(title, text, btn, onClick) {
    els.overlayTitle.textContent = title;
    els.overlayText.textContent = text;
    els.overlayBtn.textContent = btn;
    els.overlay.classList.remove('hidden');
    els.overlayBtn.onclick = onClick;
  }
  function hideOverlay() { els.overlay.classList.add('hidden'); }

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // selection path
    if (state.selection.length) {
      ctx.strokeStyle = 'rgba(91,108,255,0.85)';
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      state.selection.forEach(function (t, i) {
        if (i === 0) ctx.moveTo(t.x, t.y); else ctx.lineTo(t.x, t.y);
      });
      if (state.pointer && state.dragging) ctx.lineTo(state.pointer.x, state.pointer.y);
      ctx.stroke();
    }

    // tiles
    state.tiles.forEach(function (t) {
      const active = state.selection.indexOf(t) !== -1;
      // shadow
      ctx.beginPath();
      ctx.arc(t.x, t.y + 2, t.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fill();
      // body
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#5b6cff' : '#2a3160';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = active ? '#aab4ff' : 'rgba(255,255,255,0.12)';
      ctx.stroke();
      // letter
      ctx.fillStyle = '#eef1ff';
      ctx.font = '800 ' + Math.round(t.r * 0.95) + 'px -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.ch, t.x, t.y);
    });
  }

  // --- Events --------------------------------------------------------------
  canvas.addEventListener('mousedown', startSelect);
  canvas.addEventListener('mousemove', moveSelect);
  window.addEventListener('mouseup', endSelect);
  canvas.addEventListener('touchstart', startSelect, { passive: false });
  canvas.addEventListener('touchmove', moveSelect, { passive: false });
  window.addEventListener('touchend', endSelect, { passive: false });

  els.shuffle.addEventListener('click', shuffleTiles);
  els.hint.addEventListener('click', useHint);
  els.clear.addEventListener('click', function () { state.selection = []; renderCurrent(); draw(); });
  window.addEventListener('resize', resizeCanvas);

  // --- Boot ----------------------------------------------------------------
  Dictionary.load().then(function () {
    resizeCanvas();
    loadLevel();
  });
  // Draw immediately so the board is visible even before the dictionary loads.
  resizeCanvas();
  loadLevel();
})();
