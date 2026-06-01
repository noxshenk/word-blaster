(function () {
  'use strict';

  // Redirect if not registered
  if (!localStorage.getItem('wb_registered')) {
    window.location.href = 'index.html';
    return;
  }

  // ============================================================
  // DOM Elements
  // ============================================================
  const boardArea = document.getElementById('board-area');
  const letterWheel = document.getElementById('letter-wheel');
  const svgPath = document.getElementById('connection-path');
  const previewEl = document.getElementById('word-preview');

  const els = {
    level: document.getElementById('hud-level'),
    score: document.getElementById('hud-score'),
    best: document.getElementById('hud-best'),
    words: document.getElementById('words-list'),
    toast: document.getElementById('toast'),
    shuffle: document.getElementById('shuffle'),
    hint: document.getElementById('hint'),
    clear: document.getElementById('clear'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    btnBack: document.getElementById('btn-back'),
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title-text'),
    modalSummary: document.getElementById('modal-summary'),
    btnNextLevel: document.getElementById('btn-next-level'),
    btnReplay: document.getElementById('btn-replay')
  };

  // ============================================================
  // State
  // ============================================================
  const state = {
    levelIndex: Number(localStorage.getItem('wb_level') || 0),
    score: 0,
    best: Number(localStorage.getItem('wb_best') || 0),
    letters: [],
    letterNodes: [],       // DOM elements for letter nodes
    selection: [],         // Array of DOM elements
    foundGoals: new Set(),
    foundBonus: new Set(),
    revealed: new Set(),
    dragging: false,
    mousePos: { x: 0, y: 0 }
  };

  if (state.levelIndex >= LEVELS.length) state.levelIndex = 0;

  function currentLevel() { return LEVELS[state.levelIndex]; }

  // ============================================================
  // Layout — Position letter nodes in a circle
  // ============================================================
  function createLetterNodes() {
    letterWheel.innerHTML = '';
    state.letterNodes = [];

    const n = state.letters.length;
    const wheelRect = letterWheel.getBoundingClientRect();
    const wheelSize = wheelRect.width || 256;
    const nodeSize = window.innerWidth <= 480 ? 52 : 64;
    const cx = wheelSize / 2;
    const cy = wheelSize / 2;
    const radius = (wheelSize / 2) - (nodeSize / 2) - 4;

    state.letters.forEach(function (ch, i) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + radius * Math.cos(angle) - nodeSize / 2;
      const y = cy + radius * Math.sin(angle) - nodeSize / 2;

      const node = document.createElement('div');
      node.className = 'letter-node glass-border';
      node.setAttribute('data-index', i);
      node.setAttribute('data-letter', ch);
      node.textContent = ch;
      node.style.left = x + 'px';
      node.style.top = y + 'px';

      // Stagger entrance
      node.style.opacity = '0';
      node.style.transform = 'scale(0.5)';
      setTimeout(function () {
        node.style.opacity = '1';
        node.style.transform = 'scale(1)';
      }, 100 + i * 60);

      letterWheel.appendChild(node);
      state.letterNodes.push(node);
    });

    attachNodeEvents();
  }

  // ============================================================
  // Input Handling — Drag to select letters
  // ============================================================
  function attachNodeEvents() {
    state.letterNodes.forEach(function (node) {
      node.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startSelection(e, node);
      });
      node.addEventListener('mouseenter', function () {
        if (state.dragging) selectNode(node);
      });
      node.addEventListener('touchstart', function (e) {
        e.preventDefault();
        startSelection(e.touches[0], node);
      }, { passive: false });
    });
  }

  function startSelection(e, node) {
    state.dragging = true;
    state.selection = [];
    selectNode(node);
    updateMousePos(e);
    updateSVGPath();
  }

  function selectNode(node) {
    if (state.selection.indexOf(node) !== -1) return;
    node.classList.add('active');
    state.selection.push(node);
    updatePreview();
    updateSVGPath();
    if ('vibrate' in navigator) navigator.vibrate(10);
  }

  function updateMousePos(e) {
    var rect = boardArea.getBoundingClientRect();
    state.mousePos.x = e.clientX - rect.left;
    state.mousePos.y = e.clientY - rect.top;
  }

  function getNodeCenter(node) {
    var rect = node.getBoundingClientRect();
    var boardRect = boardArea.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top
    };
  }

  function updateSVGPath() {
    if (state.selection.length === 0) {
      svgPath.setAttribute('d', '');
      return;
    }

    var d = '';
    state.selection.forEach(function (node, i) {
      var center = getNodeCenter(node);
      if (i === 0) {
        d += 'M ' + center.x + ' ' + center.y;
      } else {
        d += ' L ' + center.x + ' ' + center.y;
      }
    });

    if (state.dragging) {
      d += ' L ' + state.mousePos.x + ' ' + state.mousePos.y;
    }

    svgPath.setAttribute('d', d);
  }

  function updatePreview() {
    var word = currentString();
    previewEl.textContent = word.split('').join(' ');
    if (word.length > 0) {
      previewEl.classList.add('visible');
    } else {
      previewEl.classList.remove('visible');
    }
  }

  function currentString() {
    return state.selection.map(function (node) {
      return node.getAttribute('data-letter');
    }).join('');
  }

  function endSelection() {
    if (!state.dragging) return;
    state.dragging = false;

    if (currentString().length > 0) {
      submitWord();
    }

    setTimeout(function () {
      resetSelection();
    }, 100);
  }

  function resetSelection() {
    state.selection.forEach(function (n) { n.classList.remove('active'); });
    state.selection = [];
    updatePreview();
    updateSVGPath();
  }

  // Global move events
  document.addEventListener('mousemove', function (e) {
    if (state.dragging) {
      updateMousePos(e);
      updateSVGPath();
    }
  });

  document.addEventListener('touchmove', function (e) {
    if (state.dragging) {
      var touch = e.touches[0];
      updateMousePos(touch);
      // Manual hit-test for touch
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('letter-node')) {
        selectNode(el);
      }
      updateSVGPath();
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('mouseup', endSelection);
  document.addEventListener('touchend', endSelection);

  // ============================================================
  // Scoring
  // ============================================================
  function submitWord() {
    var word = currentString();
    if (word.length < 3) return;

    var alreadyFound = state.foundGoals.has(word) || state.foundBonus.has(word);
    if (alreadyFound) { flash('bad'); toast('Already found', true); return; }

    if (!Dictionary.isValid(word, currentLevel(), state.letters)) {
      flash('bad'); toast('Not a word', true); return;
    }

    var isGoal = currentLevel().goals.indexOf(word) !== -1;
    if (isGoal) {
      state.foundGoals.add(word);
    } else {
      state.foundBonus.add(word);
    }
    var gain = word.length * 10 + (isGoal ? 0 : 5);
    addScore(gain);
    flash('good');
    toast('+' + gain + '  ' + word + (isGoal ? '' : '  (bonus)'));
    renderWordList();
    updateProgress();

    // Success animation on board
    boardArea.classList.add('animate-success');
    setTimeout(function () { boardArea.classList.remove('animate-success'); }, 400);

    checkLevelComplete();
  }

  function addScore(n) {
    state.score += n;
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('wb_best', state.best);
    }
    updateHud();

    // Score pop animation
    els.score.style.transform = 'scale(1.25)';
    setTimeout(function () { els.score.style.transform = 'scale(1)'; }, 200);
  }

  // ============================================================
  // Level Complete
  // ============================================================
  function checkLevelComplete() {
    if (state.foundGoals.size >= currentLevel().goals.length) {
      setTimeout(function () {
        showModal();
      }, 600);
    }
  }

  function showModal() {
    var last = state.levelIndex >= LEVELS.length - 1;

    // Calculate stars (1 star = completed, 2 = no hints used, 3 = bonus words found)
    var stars = 1;
    if (state.revealed.size === 0) stars = 2;
    if (state.foundBonus.size > 0) stars = 3;

    // Save progress
    var progress = JSON.parse(localStorage.getItem('wb_progress') || '{}');
    var existing = progress['level_' + state.levelIndex] || {};
    progress['level_' + state.levelIndex] = {
      completed: true,
      stars: Math.max(existing.stars || 0, stars),
      score: Math.max(existing.score || 0, state.score)
    };
    localStorage.setItem('wb_progress', JSON.stringify(progress));

    // Update modal content
    els.modalTitle.textContent = last ? 'You Win! 🎉' : 'complete!';
    els.modalSummary.textContent = 'Score: ' + state.score +
      (state.foundBonus.size ? ' • ' + state.foundBonus.size + ' bonus words' : '');

    // Show/hide star fills based on earned stars
    var starEls = document.querySelectorAll('.modal-stars .material-symbols-outlined');
    starEls.forEach(function (star, i) {
      if (i < stars) {
        star.style.fontVariationSettings = "'FILL' 1";
      } else {
        star.style.fontVariationSettings = "'FILL' 0";
      }
    });

    els.btnNextLevel.textContent = last ? 'Play Again' : 'Next Level';
    els.modalOverlay.classList.add('visible');
  }

  function hideModal() {
    els.modalOverlay.classList.remove('visible');
  }

  // Next Level button
  els.btnNextLevel.addEventListener('click', function () {
    var last = state.levelIndex >= LEVELS.length - 1;
    if (last) {
      state.levelIndex = 0;
      state.score = 0;
    } else {
      state.levelIndex++;
    }
    localStorage.setItem('wb_level', state.levelIndex);
    hideModal();
    loadLevel();
  });

  // Replay button
  els.btnReplay.addEventListener('click', function () {
    hideModal();
    state.score = 0;
    loadLevel();
  });

  // ============================================================
  // Hint
  // ============================================================
  function useHint() {
    var remaining = currentLevel().goals.filter(function (w) { return !state.foundGoals.has(w); });
    if (!remaining.length) { toast('All words found!'); return; }
    remaining.sort(function (a, b) { return a.length - b.length; });
    var word = remaining[0];
    state.revealed.add(word);
    addScore(-15);
    toast('Hint: ' + word[0] + '… (' + word.length + ' letters)');
    renderWordList();
  }

  // ============================================================
  // Shuffle
  // ============================================================
  function shuffleTiles() {
    // Fisher-Yates shuffle
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i];
      state.letters[i] = state.letters[j];
      state.letters[j] = tmp;
    }
    createLetterNodes();
    resetSelection();
  }

  // ============================================================
  // Rendering
  // ============================================================
  function loadLevel() {
    state.letters = currentLevel().base.split('');
    // Shuffle letter order
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i];
      state.letters[i] = state.letters[j];
      state.letters[j] = tmp;
    }
    state.selection = [];
    state.foundGoals = new Set();
    state.foundBonus = new Set();
    state.revealed = new Set();
    if (!state.score) state.score = 0;

    createLetterNodes();
    updateHud();
    renderWordList();
    updatePreview();
    updateProgress();
  }

  function updateHud() {
    els.level.textContent = state.levelIndex + 1;
    els.score.textContent = state.score;
    els.best.textContent = state.best;
  }

  function updateProgress() {
    var total = currentLevel().goals.length;
    var found = state.foundGoals.size;
    var pct = total ? (found / total) * 100 : 0;
    els.progressBar.style.width = pct + '%';
    els.progressText.textContent = found + ' / ' + total + ' words';
  }

  function renderWordList() {
    var goals = currentLevel().goals.slice().sort(function (a, b) {
      return a.length - b.length || a.localeCompare(b);
    });
    els.words.innerHTML = '';

    goals.forEach(function (w) {
      var pill = document.createElement('div');
      var found = state.foundGoals.has(w);
      pill.className = 'word-pill liquid-glass glass-border';

      if (found) {
        pill.classList.add('found');
        pill.textContent = w;
      } else if (state.revealed.has(w)) {
        pill.classList.add('unfound');
        pill.textContent = w[0] + '·'.repeat(w.length - 1);
      } else {
        pill.classList.add('unfound');
        pill.textContent = '···';
      }

      els.words.appendChild(pill);
    });

    // Bonus counter
    if (state.foundBonus.size) {
      var bonusPill = document.createElement('div');
      bonusPill.className = 'word-pill bonus liquid-glass glass-border';
      bonusPill.textContent = '+' + state.foundBonus.size + ' bonus';
      els.words.appendChild(bonusPill);
    }
  }

  // ============================================================
  // Flash & Toast
  // ============================================================
  function flash(kind) {
    previewEl.classList.remove('flash-good', 'flash-bad');
    if (kind === 'good') {
      previewEl.style.color = '#2fbf71';
    } else {
      previewEl.style.color = '#ff5d73';
    }
    setTimeout(function () {
      previewEl.style.color = '';
    }, 300);
  }

  var toastTimer;
  function toast(msg, isErr) {
    els.toast.textContent = msg;
    els.toast.classList.toggle('err', !!isErr);
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove('show');
    }, 1300);
  }

  // ============================================================
  // Button Events
  // ============================================================
  els.shuffle.addEventListener('click', shuffleTiles);
  els.hint.addEventListener('click', useHint);
  els.clear.addEventListener('click', function () {
    resetSelection();
  });

  // Back button
  els.btnBack.addEventListener('click', function () {
    window.location.href = 'levels.html';
  });

  // ============================================================
  // Boot
  // ============================================================
  Dictionary.load().then(function () {
    loadLevel();
  });
  // Load immediately so board is visible before dictionary
  loadLevel();
})();
