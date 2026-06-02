(function () {
  'use strict';

  if (!localStorage.getItem('wb_registered') || !localStorage.getItem('wb_token')) {
    window.location.href = 'index.html';
    return;
  }

  const API_URL = 'https://word-blaster.onrender.com';
  const playerName = localStorage.getItem('wb_player') || 'Player';

  // ============================================================
  // DOM: Lobby
  // ============================================================
  const lobbyOverlay = document.getElementById('lobby-overlay');
  const tabCreate = document.getElementById('tab-create');
  const tabJoin = document.getElementById('tab-join');
  const viewCreate = document.getElementById('view-create');
  const viewJoin = document.getElementById('view-join');
  const createInitial = document.getElementById('create-initial');
  const createWaiting = document.getElementById('create-waiting');
  const roomCodeText = document.getElementById('room-code-text');
  const btnCreateRoom = document.getElementById('btn-create-room');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnCancelRoom = document.getElementById('btn-cancel-room');
  const joinCodeInput = document.getElementById('join-code-input');
  const joinError = document.getElementById('join-error');
  const btnJoinRoom = document.getElementById('btn-join-room');
  const btnBackMenu = document.getElementById('btn-back-menu');

  // ============================================================
  // DOM: Game
  // ============================================================
  const gamePage = document.getElementById('game-page');
  const boardArea = document.getElementById('board-area');
  const letterWheel = document.getElementById('letter-wheel');
  const svgPath = document.getElementById('connection-path');
  const previewEl = document.getElementById('word-preview');

  const els = {
    p1Label: document.getElementById('p1-label'),
    p1Score: document.getElementById('p1-score'),
    p2Label: document.getElementById('p2-label'),
    p2Score: document.getElementById('p2-score'),
    timer: document.getElementById('hud-timer'),
    words: document.getElementById('words-list'),
    toast: document.getElementById('toast'),
    shuffle: document.getElementById('shuffle'),
    clear: document.getElementById('clear'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    btnBack: document.getElementById('btn-back'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title-text'),
    modalWinner: document.getElementById('modal-winner-text'),
    modalScoresList: document.getElementById('modal-scores-list'),
    btnReturnMenu: document.getElementById('btn-return-menu')
  };

  // ============================================================
  // State
  // ============================================================
  let currentRoomCode = null;
  const state = {
    matchId: null,
    opponentUsername: 'Opponent',
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
    gameActive: false
  };

  function currentLevel() { return LEVELS[state.levelIndex]; }

  // ============================================================
  // Socket.io Connection
  // ============================================================
  var socket = io(API_URL);

  socket.on('connect', function () {
    var token = localStorage.getItem('wb_token');
    socket.emit('authenticate', token);
  });

  socket.on('authenticated', function (data) {
    console.log('Authenticated as:', data.username);
  });

  socket.on('authError', function (data) {
    toast(data.error, true);
    setTimeout(function () {
      localStorage.removeItem('wb_registered');
      localStorage.removeItem('wb_token');
      window.location.href = 'index.html';
    }, 2000);
  });

  // ============================================================
  // Lobby: Tab Switching
  // ============================================================
  tabCreate.addEventListener('click', function () {
    tabCreate.classList.add('active');
    tabJoin.classList.remove('active');
    viewCreate.style.display = '';
    viewJoin.style.display = 'none';
  });

  tabJoin.addEventListener('click', function () {
    tabJoin.classList.add('active');
    tabCreate.classList.remove('active');
    viewJoin.style.display = '';
    viewCreate.style.display = 'none';
    joinError.textContent = '';
  });

  // ============================================================
  // Lobby: Create Room
  // ============================================================
  btnCreateRoom.addEventListener('click', function () {
    socket.emit('createRoom');
    btnCreateRoom.disabled = true;
    btnCreateRoom.textContent = 'Creating...';
  });

  socket.on('roomCreated', function (data) {
    currentRoomCode = data.roomCode;
    roomCodeText.textContent = data.roomCode;
    createInitial.style.display = 'none';
    createWaiting.style.display = '';
    btnCreateRoom.disabled = false;
    btnCreateRoom.textContent = 'Create Room';
  });

  btnCopyCode.addEventListener('click', function () {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      btnCopyCode.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px;">check</span>Copied!';
      setTimeout(function () {
        btnCopyCode.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px;">content_copy</span>Copy Code';
      }, 2000);
    }
  });

  btnCancelRoom.addEventListener('click', function () {
    if (currentRoomCode) {
      socket.emit('leaveRoom', { roomCode: currentRoomCode });
      currentRoomCode = null;
    }
    createWaiting.style.display = 'none';
    createInitial.style.display = '';
  });

  // ============================================================
  // Lobby: Join Room
  // ============================================================
  btnJoinRoom.addEventListener('click', function () {
    var code = joinCodeInput.value.toUpperCase().trim();
    if (!code) {
      joinError.textContent = 'Please enter a room code.';
      return;
    }
    joinError.textContent = '';
    btnJoinRoom.disabled = true;
    btnJoinRoom.textContent = 'Joining...';
    socket.emit('joinRoom', { roomCode: code });
  });

  socket.on('roomError', function (data) {
    joinError.textContent = data.error;
    btnJoinRoom.disabled = false;
    btnJoinRoom.textContent = 'Join Room';
  });

  // ============================================================
  // Lobby: Back to Menu
  // ============================================================
  btnBackMenu.addEventListener('click', function () {
    if (currentRoomCode) {
      socket.emit('leaveRoom', { roomCode: currentRoomCode });
      currentRoomCode = null;
    }
    window.location.href = 'menu.html';
  });

  // ============================================================
  // Match Found -> Transition to Game
  // ============================================================
  socket.on('matchFound', function (data) {
    state.matchId = data.matchId;
    state.opponentUsername = data.opponent;
    state.levelIndex = data.levelIndex;

    els.p1Label.textContent = playerName;
    els.p2Label.textContent = data.opponent;

    lobbyOverlay.style.opacity = '0';
    lobbyOverlay.style.transition = 'opacity 0.4s ease';
    setTimeout(function () {
      lobbyOverlay.style.display = 'none';
      gamePage.style.display = '';
      bootGame();
    }, 400);
  });

  // ============================================================
  // Opponent Events
  // ============================================================
  socket.on('opponentUpdate', function (data) {
    state.opponentScore = data.score;
    els.p2Score.textContent = data.score;
    els.p2Score.style.transform = 'scale(1.25)';
    setTimeout(function () { els.p2Score.style.transform = 'scale(1)'; }, 200);
  });

  socket.on('opponentFinished', function () {
    toast(state.opponentUsername + ' finished!');
  });

  socket.on('opponentForfeit', function (data) {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    toast(data.message);
    showEndModal(playerName, [
      { username: playerName, score: state.score },
      { username: state.opponentUsername, score: 'LEFT' }
    ]);
  });

  socket.on('matchOver', function (data) {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    showEndModal(data.winner, data.scores);
  });

  // ============================================================
  // Game Boot
  // ============================================================
  function bootGame() {
    state.letters = currentLevel().base.split('');
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i];
      state.letters[i] = state.letters[j];
      state.letters[j] = tmp;
    }
    state.selection = [];
    state.foundGoals = new Set();
    state.foundBonus = new Set();
    state.score = 0;
    state.opponentScore = 0;
    els.p1Score.textContent = '0';
    els.p2Score.textContent = '0';

    createLetterNodes();
    renderWordList();
    updatePreview();
    updateProgress();
    state.gameActive = true;
    startCountdown();
  }

  function startCountdown() {
    state.timerLeft = 90;
    els.timer.textContent = state.timerLeft;
    els.timer.style.color = '';
    state.timerInterval = setInterval(function () {
      state.timerLeft--;
      els.timer.textContent = state.timerLeft;
      if (state.timerLeft <= 10) {
        els.timer.style.color = '#ff5d73';
      }
      if (state.timerLeft <= 0) {
        clearInterval(state.timerInterval);
        finishGame();
      }
    }, 1000);
  }

  function finishGame() {
    state.gameActive = false;
    socket.emit('playerFinished', { matchId: state.matchId, finalScore: state.score });
    toast('Time up! Submitting score...');
  }

  // ============================================================
  // Letter Nodes (same as single-player game.js)
  // ============================================================
  function createLetterNodes() {
    letterWheel.innerHTML = '';
    state.letterNodes = [];
    var n = state.letters.length;
    var wheelRect = letterWheel.getBoundingClientRect();
    var wheelSize = wheelRect.width || 256;
    var nodeSize = window.innerWidth <= 480 ? 52 : 64;
    var cx = wheelSize / 2;
    var cy = wheelSize / 2;
    var radius = (wheelSize / 2) - (nodeSize / 2) - 4;

    state.letters.forEach(function (ch, i) {
      var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      var x = cx + radius * Math.cos(angle) - nodeSize / 2;
      var y = cy + radius * Math.sin(angle) - nodeSize / 2;
      var node = document.createElement('div');
      node.className = 'letter-node glass-border';
      node.setAttribute('data-index', i);
      node.setAttribute('data-letter', ch);
      node.textContent = ch;
      node.style.left = x + 'px';
      node.style.top = y + 'px';
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
  // Input Handling (same as single-player)
  // ============================================================
  function attachNodeEvents() {
    state.letterNodes.forEach(function (node) {
      node.addEventListener('mousedown', function (e) { e.preventDefault(); startSelection(e, node); });
      node.addEventListener('mouseenter', function () { if (state.dragging) selectNode(node); });
      node.addEventListener('touchstart', function (e) { e.preventDefault(); startSelection(e.touches[0], node); }, { passive: false });
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
    return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
  }

  function updateSVGPath() {
    if (state.selection.length === 0) { svgPath.setAttribute('d', ''); return; }
    var d = '';
    state.selection.forEach(function (node, i) {
      var center = getNodeCenter(node);
      d += (i === 0 ? 'M ' : ' L ') + center.x + ' ' + center.y;
    });
    if (state.dragging) d += ' L ' + state.mousePos.x + ' ' + state.mousePos.y;
    svgPath.setAttribute('d', d);
  }

  function updatePreview() {
    var word = currentString();
    previewEl.textContent = word.split('').join(' ');
    if (word.length > 0) previewEl.classList.add('visible');
    else previewEl.classList.remove('visible');
  }

  function currentString() {
    return state.selection.map(function (node) { return node.getAttribute('data-letter'); }).join('');
  }

  function endSelection() {
    if (!state.dragging) return;
    state.dragging = false;
    if (currentString().length > 0) submitWord();
    setTimeout(resetSelection, 100);
  }

  function resetSelection() {
    state.selection.forEach(function (n) { n.classList.remove('active'); });
    state.selection = [];
    updatePreview();
    updateSVGPath();
  }

  document.addEventListener('mousemove', function (e) { if (state.dragging) { updateMousePos(e); updateSVGPath(); } });
  document.addEventListener('touchmove', function (e) {
    if (state.dragging) {
      var touch = e.touches[0];
      updateMousePos(touch);
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('letter-node')) selectNode(el);
      updateSVGPath();
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('mouseup', endSelection);
  document.addEventListener('touchend', endSelection);

  // ============================================================
  // Word Submission
  // ============================================================
  function submitWord() {
    var word = currentString();
    if (word.length < 3) return;
    if (state.foundGoals.has(word) || state.foundBonus.has(word)) { flash('bad'); toast('Already found', true); return; }
    if (!Dictionary.isValid(word, currentLevel(), state.letters)) { flash('bad'); toast('Not a word', true); return; }

    var isGoal = currentLevel().goals.indexOf(word) !== -1;
    if (isGoal) state.foundGoals.add(word);
    else state.foundBonus.add(word);

    var gain = word.length * 10 + (isGoal ? 0 : 5);
    addScore(gain);
    flash('good');
    toast('+' + gain + '  ' + word + (isGoal ? '' : '  (bonus)'));
    renderWordList();
    updateProgress();

    boardArea.classList.add('animate-success');
    setTimeout(function () { boardArea.classList.remove('animate-success'); }, 400);

    socket.emit('gameUpdate', { matchId: state.matchId, score: state.score, wordsTyped: state.foundGoals.size });

    if (state.foundGoals.size >= currentLevel().goals.length) {
      state.gameActive = false;
      clearInterval(state.timerInterval);
      toast('All words found! Submitting...');
      socket.emit('playerFinished', { matchId: state.matchId, finalScore: state.score });
    }
  }

  function addScore(n) {
    state.score += n;
    els.p1Score.textContent = state.score;
    els.p1Score.style.transform = 'scale(1.25)';
    setTimeout(function () { els.p1Score.style.transform = 'scale(1)'; }, 200);
  }

  function updateProgress() {
    var total = currentLevel().goals.length;
    var found = state.foundGoals.size;
    var pct = total ? (found / total) * 100 : 0;
    els.progressBar.style.width = pct + '%';
    els.progressText.textContent = found + ' / ' + total + ' words';
  }

  function renderWordList() {
    var goals = currentLevel().goals.slice().sort(function (a, b) { return a.length - b.length || a.localeCompare(b); });
    els.words.innerHTML = '';
    goals.forEach(function (w) {
      var pill = document.createElement('div');
      var found = state.foundGoals.has(w);
      pill.className = 'word-pill liquid-glass glass-border';
      if (found) { pill.classList.add('found'); pill.textContent = w; }
      else { pill.classList.add('unfound'); pill.textContent = '...'; }
      els.words.appendChild(pill);
    });
    if (state.foundBonus.size) {
      var bonusPill = document.createElement('div');
      bonusPill.className = 'word-pill bonus liquid-glass glass-border';
      bonusPill.textContent = '+' + state.foundBonus.size + ' bonus';
      els.words.appendChild(bonusPill);
    }
  }

  // ============================================================
  // End Game Modal
  // ============================================================
  function showEndModal(winner, scores) {
    var isSelf = winner === playerName;
    var isTie = winner === 'Tie';
    if (isTie) { els.modalWinner.textContent = "It's a Tie!"; els.modalWinner.className = 'modal-winner'; }
    else if (isSelf) { els.modalWinner.textContent = 'VICTORY!'; els.modalWinner.className = 'modal-winner victory'; }
    else { els.modalWinner.textContent = 'DEFEAT'; els.modalWinner.className = 'modal-winner defeat'; }

    els.modalScoresList.innerHTML = '';
    scores.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'modal-score-row' + (p.username === winner ? ' winner-row' : '');
      var nameSpan = document.createElement('span');
      nameSpan.textContent = p.username === playerName ? p.username + ' (You)' : p.username;
      var scoreSpan = document.createElement('span');
      scoreSpan.textContent = p.score;
      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      els.modalScoresList.appendChild(row);
    });
    els.modalOverlay.classList.add('visible');
  }

  els.btnReturnMenu.addEventListener('click', function () { window.location.href = 'menu.html'; });
  els.btnBack.addEventListener('click', function () { window.location.href = 'menu.html'; });

  // ============================================================
  // Helpers
  // ============================================================
  function flash(kind) {
    if (kind === 'good') previewEl.style.color = '#2fbf71';
    else previewEl.style.color = '#ff5d73';
    setTimeout(function () { previewEl.style.color = ''; }, 300);
  }

  var toastTimer;
  function toast(msg, isErr) {
    els.toast.textContent = msg;
    els.toast.classList.toggle('err', !!isErr);
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove('show'); }, 1500);
  }

  els.shuffle.addEventListener('click', function () {
    for (var i = state.letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = state.letters[i]; state.letters[i] = state.letters[j]; state.letters[j] = tmp;
    }
    createLetterNodes();
    resetSelection();
  });

  els.clear.addEventListener('click', resetSelection);

  Dictionary.load();
})();
