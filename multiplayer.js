(function () {
  'use strict';

  // Redirect if not registered/logged in
  if (!localStorage.getItem('wb_registered') || !localStorage.getItem('wb_token')) {
    window.location.href = 'index.html';
    return;
  }

  const API_URL = 'http://localhost:3000';
  
  // ============================================================
  // DOM Elements
  // ============================================================
  const lobbyOverlay = document.getElementById('lobby-overlay');
  const queueStatusEl = document.getElementById('queue-status');
  const btnLeaveQueue = document.getElementById('btn-leave-queue');
  
  const gameContainer = document.getElementById('game-container');
  const boardArea = document.getElementById('board-area');
  const letterWheel = document.getElementById('letter-wheel');
  const svgPath = document.getElementById('connection-path');
  const previewEl = document.getElementById('word-preview');
  
  const els = {
    p1Name: document.getElementById('p1-name'),
    p1Score: document.getElementById('p1-score'),
    p1ProgressBar: document.getElementById('p1-progress-bar'),
    
    p2Name: document.getElementById('p2-name'),
    p2Score: document.getElementById('p2-score'),
    p2ProgressBar: document.getElementById('p2-progress-bar'),
    
    timer: document.getElementById('hud-timer'),
    words: document.getElementById('words-list'),
    toast: document.getElementById('toast'),
    shuffle: document.getElementById('shuffle'),
    clear: document.getElementById('clear'),
    opponentStatusContainer: document.getElementById('opponent-status-container'),
    opponentStatusText: document.getElementById('opponent-status-text'),
    
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title-text'),
    modalWinner: document.getElementById('modal-winner-announcement'),
    modalScoresList: document.getElementById('modal-scores-list'),
    btnReturnMenu: document.getElementById('btn-return-menu')
  };

  // ============================================================
  // State
  // ============================================================
  const state = {
    matchId: null,
    opponentUsername: 'Opponent',
    role: null, // 'player1' or 'player2'
    levelIndex: 0,
    score: 0,
    opponentScore: 0,
    letters: [],
    letterNodes: [],
    selection: [],
    foundGoals: new Set(),
    foundBonus: new Set(),
    dragging: false,
    mousePos: { x: 0, y: 0 },
    timerLeft: 90,
    timerInterval: null,
    gameActive: false,
    opponentFinished: false,
    opponentWordsFound: 0
  };

  function currentLevel() { 
    return LEVELS[state.levelIndex]; 
  }

  // ============================================================
  // Socket.io Connection & Matchmaking
  // ============================================================
  console.log('Connecting to real-time multiplayer server...');
  const socket = io(API_URL);

  socket.on('connect', () => {
    console.log('Connected to server! ID:', socket.id);
    // Authenticate socket with JWT
    const token = localStorage.getItem('wb_token');
    socket.emit('authenticate', token);
  });

  socket.on('authenticated', ({ username }) => {
    console.log('Socket authenticated as:', username);
    // Auto-join the queue on authentication
    socket.emit('joinQueue');
  });

  socket.on('authError', ({ error }) => {
    toast(error, true);
    setTimeout(() => {
      localStorage.removeItem('wb_registered');
      localStorage.removeItem('wb_token');
      localStorage.removeItem('wb_player');
      window.location.href = 'index.html';
    }, 2000);
  });

  socket.on('queueStatus', ({ message }) => {
    queueStatusEl.textContent = message;
  });

  socket.on('matchFound', ({ matchId, opponent, role, levelIndex }) => {
    console.log(`Match found! ID: ${matchId}, Opponent: ${opponent}, Role: ${role}, Level: ${levelIndex}`);
    state.matchId = matchId;
    state.opponentUsername = opponent;
    state.role = role;
    state.levelIndex = levelIndex;
    
    // Set Names in HUD
    els.p1Name.textContent = localStorage.getItem('wb_player') || 'You';
    els.p2Name.textContent = opponent;

    // Transition UIs
    lobbyOverlay.style.opacity = '0';
    setTimeout(() => {
      lobbyOverlay.style.display = 'none';
      gameContainer.style.display = 'block';
      // Load game level
      bootGame();
    }, 500);
  });

  btnLeaveQueue.addEventListener('click', () => {
    socket.emit('leaveQueue');
    window.location.href = 'menu.html';
  });

  // Handle updates from opponent
  socket.on('opponentUpdate', ({ score, wordsTyped }) => {
    state.opponentScore = score;
    state.opponentWordsFound = wordsTyped;
    
    // Update HUD
    els.p2Score.textContent = score;
    
    const totalGoals = currentLevel().goals.length;
    const pct = totalGoals ? (wordsTyped / totalGoals) * 100 : 0;
    els.p2ProgressBar.style.width = Math.min(pct, 100) + '%';

    // Flash opponent status
    showOpponentStatus(`${state.opponentUsername} found a word! (+${score})`);
  });

  socket.on('opponentFinished', ({ finalScore }) => {
    state.opponentFinished = true;
    showOpponentStatus(`${state.opponentUsername} finished! Score: ${finalScore}`);
  });

  socket.on('opponentForfeit', ({ message }) => {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    toast(message);
    
    // Show End Modal with Victory by forfeit
    showEndModal(localStorage.getItem('wb_player'), [
      { username: localStorage.getItem('wb_player'), score: state.score },
      { username: state.opponentUsername, score: 'DISCONNECTED' }
    ]);
  });

  socket.on('matchOver', ({ winner, scores }) => {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    showEndModal(winner, scores);
  });

  // ============================================================
  // Game Setup & Boot
  // ============================================================
  function bootGame() {
    state.letters = currentLevel().base.split('');
    // Shuffle letter order so it matches game.js style
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i];
      state.letters[i] = state.letters[j];
      state.letters[j] = tmp;
    }
    
    createLetterNodes();
    renderWordList();
    updatePreview();
    updateProgress();
    
    state.gameActive = true;
    
    // Start countdown timer
    startCountdown();
  }

  function startCountdown() {
    state.timerLeft = 90;
    els.timer.textContent = state.timerLeft;
    
    state.timerInterval = setInterval(() => {
      state.timerLeft--;
      els.timer.textContent = state.timerLeft;

      if (state.timerLeft <= 10) {
        els.timer.style.color = '#ff5d73';
        els.timer.parentElement.style.boxShadow = '0 0 20px rgba(255, 93, 115, 0.4)';
      }

      if (state.timerLeft <= 0) {
        clearInterval(state.timerInterval);
        finishGame();
      }
    }, 1000);
  }

  function finishGame() {
    state.gameActive = false;
    socket.emit('playerFinished', {
      matchId: state.matchId,
      finalScore: state.score
    });
    toast('Time Up! Submitting score...');
  }

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

      // Entrance animation
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
    if (!state.gameActive) return;
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
  // Game Logic / Word Submission
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

    // Notify backend/opponent about score update
    socket.emit('gameUpdate', {
      matchId: state.matchId,
      score: state.score,
      wordsTyped: state.foundGoals.size
    });

    // Check if player found all goal words on the board
    if (state.foundGoals.size >= currentLevel().goals.length) {
      state.gameActive = false;
      clearInterval(state.timerInterval);
      toast('Clear! Submitting final score...');
      
      socket.emit('playerFinished', {
        matchId: state.matchId,
        finalScore: state.score
      });
    }
  }

  function addScore(n) {
    state.score += n;
    els.p1Score.textContent = state.score;

    // Score pop animation
    els.p1Score.style.transform = 'scale(1.25)';
    setTimeout(function () { els.p1Score.style.transform = 'scale(1)'; }, 200);
  }

  function updateProgress() {
    var total = currentLevel().goals.length;
    var found = state.foundGoals.size;
    var pct = total ? (found / total) * 100 : 0;
    els.p1ProgressBar.style.width = pct + '%';
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
      } else {
        pill.classList.add('unfound');
        pill.textContent = '···';
      }

      els.words.appendChild(pill);
    });

    // Bonus words counter
    if (state.foundBonus.size) {
      var bonusPill = document.createElement('div');
      bonusPill.className = 'word-pill bonus liquid-glass glass-border';
      bonusPill.textContent = '+' + state.foundBonus.size + ' bonus';
      els.words.appendChild(bonusPill);
    }
  }

  // ============================================================
  // Modal & Final Screens
  // ============================================================
  function showEndModal(winner, scores) {
    const isSelfWinner = winner === localStorage.getItem('wb_player');
    const isTie = winner === 'Tie';
    
    // Update header/styles based on outcome
    if (isTie) {
      els.modalWinner.textContent = "It's a Tie!";
      els.modalWinner.className = "modal-winner";
    } else if (isSelfWinner) {
      els.modalWinner.textContent = "VICTORY!";
      els.modalWinner.className = "modal-winner victory";
      // Update highscore locally if we beat it
      const currentBest = Number(localStorage.getItem('wb_best') || 0);
      if (state.score > currentBest) {
        localStorage.setItem('wb_best', state.score);
      }
    } else {
      els.modalWinner.textContent = "DEFEAT";
      els.modalWinner.className = "modal-winner defeat";
    }

    // Populate Score list
    els.modalScoresList.innerHTML = '';
    
    scores.forEach(p => {
      const row = document.createElement('div');
      row.className = `modal-score-row ${p.username === winner ? 'winner-row' : ''}`;
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = p.username === localStorage.getItem('wb_player') ? `${p.username} (You)` : p.username;
      
      const scoreSpan = document.createElement('span');
      scoreSpan.textContent = p.score;
      
      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      els.modalScoresList.appendChild(row);
    });

    els.modalOverlay.classList.add('visible');
  }

  els.btnReturnMenu.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });

  // ============================================================
  // Helpers: Toast, Flash, Status
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
    }, 1500);
  }

  var oppStatusTimer;
  function showOpponentStatus(text) {
    els.opponentStatusText.textContent = text;
    els.opponentStatusContainer.style.display = 'block';
    
    clearTimeout(oppStatusTimer);
    oppStatusTimer = setTimeout(() => {
      els.opponentStatusContainer.style.display = 'none';
    }, 3000);
  }

  // ============================================================
  // Action events
  // ============================================================
  els.shuffle.addEventListener('click', () => {
    // Fisher-Yates shuffle
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i];
      state.letters[i] = state.letters[j];
      state.letters[j] = tmp;
    }
    createLetterNodes();
    resetSelection();
  });

  els.clear.addEventListener('click', resetSelection);

  // Initialize dictionary then boot
  Dictionary.load();

})();
