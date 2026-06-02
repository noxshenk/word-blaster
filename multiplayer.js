(function () {
  'use strict';

  // ============================================================
  // Auth Guard
  // ============================================================
  if (!localStorage.getItem('wb_registered') || !localStorage.getItem('wb_token')) {
    window.location.href = 'index.html';
    return;
  }

  var API_URL = 'https://word-blaster.onrender.com';
  var playerName = localStorage.getItem('wb_player') || 'Player';

  // ============================================================
  // DOM References: Lobby
  // ============================================================
  var lobbyOverlay  = document.getElementById('lobby-overlay');
  var tabCreate     = document.getElementById('tab-create');
  var tabJoin       = document.getElementById('tab-join');
  var viewCreate    = document.getElementById('view-create');
  var viewJoin      = document.getElementById('view-join');
  var createInitial = document.getElementById('create-initial');
  var createWaiting = document.getElementById('create-waiting');
  var roomCodeText  = document.getElementById('room-code-text');
  var btnCreateRoom = document.getElementById('btn-create-room');
  var btnCopyCode   = document.getElementById('btn-copy-code');
  var btnCancelRoom = document.getElementById('btn-cancel-room');
  var joinCodeInput = document.getElementById('join-code-input');
  var joinError     = document.getElementById('join-error');
  var btnJoinRoom   = document.getElementById('btn-join-room');
  var btnBackMenu   = document.getElementById('btn-back-menu');
  var connDot       = document.getElementById('conn-dot');
  var connText      = document.getElementById('conn-text');

  // ============================================================
  // DOM References: Game
  // ============================================================
  var gamePage    = document.getElementById('game-page');
  var boardArea   = document.getElementById('board-area');
  var letterWheel = document.getElementById('letter-wheel');
  var svgPath     = document.getElementById('connection-path');
  var previewEl   = document.getElementById('word-preview');

  var p1Label       = document.getElementById('p1-label');
  var p1Score       = document.getElementById('p1-score');
  var p2Label       = document.getElementById('p2-label');
  var p2Score       = document.getElementById('p2-score');
  var hudTimer      = document.getElementById('hud-timer');
  var wordsList     = document.getElementById('words-list');
  var toastEl       = document.getElementById('toast');
  var shuffleBtn    = document.getElementById('shuffle');
  var clearBtn      = document.getElementById('clear');
  var progressBar   = document.getElementById('progress-bar');
  var progressText  = document.getElementById('progress-text');
  var btnBack       = document.getElementById('btn-back');
  var modalOverlay  = document.getElementById('modal-overlay');
  var modalWinner   = document.getElementById('modal-winner-text');
  var modalScores   = document.getElementById('modal-scores-list');
  var btnReturnMenu = document.getElementById('btn-return-menu');

  // ============================================================
  // State
  // ============================================================
  var currentRoomCode = null;
  var socketConnected = false;

  var matchId = null;
  var opponentUsername = 'Opponent';
  var levelIndex = 0;
  var myScore = 0;
  var oppScore = 0;
  var letters = [];
  var letterNodes = [];
  var selection = [];
  var foundGoals = {};
  var foundBonus = {};
  var foundGoalCount = 0;
  var foundBonusCount = 0;
  var dragging = false;
  var mouseX = 0;
  var mouseY = 0;
  var timerLeft = 90;
  var timerInterval = null;
  var gameActive = false;

  function currentLevel() { return LEVELS[levelIndex]; }

  // ============================================================
  // Socket.io Connection
  // ============================================================
  var socket = null;

  function initSocket() {
    if (typeof io === 'undefined') {
      connText.textContent = 'Socket library failed to load';
      return;
    }

    socket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000
    });

    socket.on('connect', function () {
      socketConnected = true;
      connDot.classList.add('connected');
      connText.textContent = 'Connected';
      var token = localStorage.getItem('wb_token');
      if (token) socket.emit('authenticate', token);
    });

    socket.on('disconnect', function () {
      socketConnected = false;
      connDot.classList.remove('connected');
      connText.textContent = 'Disconnected - reconnecting...';
    });

    socket.on('connect_error', function () {
      socketConnected = false;
      connDot.classList.remove('connected');
      connText.textContent = 'Server waking up... please wait';
    });

    socket.on('authenticated', function (data) {
      console.log('Authenticated as:', data.username);
    });

    socket.on('authError', function (data) {
      toast(data.error, true);
      localStorage.removeItem('wb_registered');
      localStorage.removeItem('wb_token');
      window.location.href = 'index.html';
    });

    // --- Room Events ---
    socket.on('roomCreated', function (data) {
      currentRoomCode = data.roomCode;
      roomCodeText.textContent = data.roomCode;
      createInitial.style.display = 'none';
      createWaiting.style.display = '';
      btnCreateRoom.disabled = false;
      btnCreateRoom.textContent = 'CREATE ROOM';
    });

    socket.on('roomError', function (data) {
      joinError.textContent = data.error;
      btnJoinRoom.disabled = false;
      btnJoinRoom.textContent = 'JOIN ROOM';
    });

    // --- Match Events ---
    socket.on('matchFound', function (data) {
      matchId = data.matchId;
      opponentUsername = data.opponent;
      levelIndex = data.levelIndex;
      p1Label.textContent = playerName;
      p2Label.textContent = data.opponent;

      // Instant transition - no delay
      lobbyOverlay.style.display = 'none';
      gamePage.style.display = '';
      bootGame();
    });

    socket.on('opponentUpdate', function (data) {
      oppScore = data.score;
      p2Score.textContent = data.score;
      p2Score.style.transform = 'scale(1.25)';
      setTimeout(function () { p2Score.style.transform = ''; }, 200);
    });

    socket.on('opponentFinished', function () {
      toast(opponentUsername + ' finished!');
    });

    socket.on('opponentForfeit', function (data) {
      gameActive = false;
      clearInterval(timerInterval);
      toast(data.message);
      showEndModal(playerName, [
        { username: playerName, score: myScore },
        { username: opponentUsername, score: 'LEFT' }
      ]);
    });

    socket.on('matchOver', function (data) {
      gameActive = false;
      clearInterval(timerInterval);
      showEndModal(data.winner, data.scores);
    });
  }

  // ============================================================
  // Lobby: Tab Switching (instant, no socket needed)
  // ============================================================
  tabCreate.onclick = function () {
    tabCreate.classList.add('active');
    tabJoin.classList.remove('active');
    viewCreate.style.display = '';
    viewJoin.style.display = 'none';
  };

  tabJoin.onclick = function () {
    tabJoin.classList.add('active');
    tabCreate.classList.remove('active');
    viewJoin.style.display = '';
    viewCreate.style.display = 'none';
    joinError.textContent = '';
    joinCodeInput.focus();
  };

  // ============================================================
  // Lobby: Create Room
  // ============================================================
  btnCreateRoom.onclick = function () {
    if (!socket || !socketConnected) {
      toast('Not connected to server yet. Please wait...', true);
      return;
    }
    socket.emit('createRoom');
    btnCreateRoom.disabled = true;
    btnCreateRoom.textContent = 'CREATING...';
  };

  btnCopyCode.onclick = function () {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode).catch(function () {});
      btnCopyCode.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px;">check</span>Copied!';
      setTimeout(function () {
        btnCopyCode.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px;">content_copy</span>Copy Code';
      }, 2000);
    }
  };

  btnCancelRoom.onclick = function () {
    if (currentRoomCode && socket) {
      socket.emit('leaveRoom', { roomCode: currentRoomCode });
      currentRoomCode = null;
    }
    createWaiting.style.display = 'none';
    createInitial.style.display = '';
  };

  // ============================================================
  // Lobby: Join Room
  // ============================================================
  btnJoinRoom.onclick = function () {
    var code = joinCodeInput.value.toUpperCase().trim();
    if (!code) {
      joinError.textContent = 'Please enter a room code.';
      return;
    }
    if (!socket || !socketConnected) {
      joinError.textContent = 'Not connected to server yet. Please wait...';
      return;
    }
    joinError.textContent = '';
    btnJoinRoom.disabled = true;
    btnJoinRoom.textContent = 'JOINING...';
    socket.emit('joinRoom', { roomCode: code });
  };

  // Enter key support on the input
  joinCodeInput.onkeydown = function (e) {
    if (e.key === 'Enter') btnJoinRoom.onclick();
  };

  // ============================================================
  // Lobby: Back to Menu (instant, always works)
  // ============================================================
  btnBackMenu.onclick = function () {
    if (currentRoomCode && socket) {
      socket.emit('leaveRoom', { roomCode: currentRoomCode });
    }
    window.location.href = 'menu.html';
  };

  // ============================================================
  // Game: Back button (instant)
  // ============================================================
  btnBack.onclick = function () {
    window.location.href = 'menu.html';
  };

  btnReturnMenu.onclick = function () {
    window.location.href = 'menu.html';
  };

  // ============================================================
  // Game Boot
  // ============================================================
  function bootGame() {
    var base = currentLevel().base;
    letters = base.split('');
    shuffle_array(letters);
    selection = [];
    foundGoals = {};
    foundBonus = {};
    foundGoalCount = 0;
    foundBonusCount = 0;
    myScore = 0;
    oppScore = 0;
    p1Score.textContent = '0';
    p2Score.textContent = '0';

    createLetterNodes();
    renderWordList();
    updatePreview();
    updateProgress();
    gameActive = true;
    startCountdown();
  }

  function shuffle_array(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  function startCountdown() {
    timerLeft = 90;
    hudTimer.textContent = timerLeft;
    hudTimer.style.color = '';
    timerInterval = setInterval(function () {
      timerLeft--;
      hudTimer.textContent = timerLeft;
      if (timerLeft <= 10) hudTimer.style.color = '#ff5d73';
      if (timerLeft <= 0) {
        clearInterval(timerInterval);
        finishGame();
      }
    }, 1000);
  }

  function finishGame() {
    gameActive = false;
    if (socket) socket.emit('playerFinished', { matchId: matchId, finalScore: myScore });
    toast('Time up! Submitting score...');
  }

  // ============================================================
  // Letter Nodes
  // ============================================================
  function createLetterNodes() {
    letterWheel.innerHTML = '';
    letterNodes = [];
    var n = letters.length;
    var wheelRect = letterWheel.getBoundingClientRect();
    var wheelSize = wheelRect.width || 256;
    var nodeSize = window.innerWidth <= 480 ? 52 : 64;
    var cx = wheelSize / 2;
    var cy = wheelSize / 2;
    var radius = (wheelSize / 2) - (nodeSize / 2) - 4;

    for (var i = 0; i < n; i++) {
      (function (idx) {
        var ch = letters[idx];
        var angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        var x = cx + radius * Math.cos(angle) - nodeSize / 2;
        var y = cy + radius * Math.sin(angle) - nodeSize / 2;
        var node = document.createElement('div');
        node.className = 'letter-node glass-border';
        node.setAttribute('data-index', idx);
        node.setAttribute('data-letter', ch);
        node.textContent = ch;
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.opacity = '0';
        node.style.transform = 'scale(0.5)';
        setTimeout(function () {
          node.style.opacity = '1';
          node.style.transform = 'scale(1)';
        }, 80 + idx * 50);
        letterWheel.appendChild(node);
        letterNodes.push(node);
      })(i);
    }
    attachNodeEvents();
  }

  // ============================================================
  // Input Handling
  // ============================================================
  function attachNodeEvents() {
    for (var i = 0; i < letterNodes.length; i++) {
      (function (node) {
        node.onmousedown = function (e) { e.preventDefault(); startSelection(e, node); };
        node.onmouseenter = function () { if (dragging) selectNode(node); };
        node.ontouchstart = function (e) { e.preventDefault(); startSelection(e.touches[0], node); };
      })(letterNodes[i]);
    }
  }

  function startSelection(e, node) {
    if (!gameActive) return;
    dragging = true;
    selection = [];
    selectNode(node);
    updateMousePos(e);
    updateSVGPath();
  }

  function selectNode(node) {
    if (selection.indexOf(node) !== -1) return;
    node.classList.add('active');
    selection.push(node);
    updatePreview();
    updateSVGPath();
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function updateMousePos(e) {
    var rect = boardArea.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function getNodeCenter(node) {
    var rect = node.getBoundingClientRect();
    var boardRect = boardArea.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
  }

  function updateSVGPath() {
    if (selection.length === 0) { svgPath.setAttribute('d', ''); return; }
    var d = '';
    for (var i = 0; i < selection.length; i++) {
      var c = getNodeCenter(selection[i]);
      d += (i === 0 ? 'M ' : ' L ') + c.x + ' ' + c.y;
    }
    if (dragging) d += ' L ' + mouseX + ' ' + mouseY;
    svgPath.setAttribute('d', d);
  }

  function updatePreview() {
    var word = currentString();
    previewEl.textContent = word.split('').join(' ');
    if (word.length > 0) previewEl.classList.add('visible');
    else previewEl.classList.remove('visible');
  }

  function currentString() {
    var s = '';
    for (var i = 0; i < selection.length; i++) {
      s += selection[i].getAttribute('data-letter');
    }
    return s;
  }

  function endSelection() {
    if (!dragging) return;
    dragging = false;
    if (currentString().length > 0) submitWord();
    resetSelection();
  }

  function resetSelection() {
    for (var i = 0; i < selection.length; i++) selection[i].classList.remove('active');
    selection = [];
    updatePreview();
    updateSVGPath();
  }

  document.addEventListener('mousemove', function (e) {
    if (dragging) { updateMousePos(e); updateSVGPath(); }
  });
  document.addEventListener('touchmove', function (e) {
    if (dragging) {
      var touch = e.touches[0];
      updateMousePos(touch);
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList && el.classList.contains('letter-node')) selectNode(el);
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
    if (foundGoals[word] || foundBonus[word]) { flash('bad'); toast('Already found', true); return; }
    if (!Dictionary.isValid(word, currentLevel(), letters)) { flash('bad'); toast('Not a word', true); return; }

    var goals = currentLevel().goals;
    var isGoal = false;
    for (var i = 0; i < goals.length; i++) {
      if (goals[i] === word) { isGoal = true; break; }
    }

    if (isGoal) { foundGoals[word] = true; foundGoalCount++; }
    else { foundBonus[word] = true; foundBonusCount++; }

    var gain = word.length * 10 + (isGoal ? 0 : 5);
    addScore(gain);
    flash('good');
    toast('+' + gain + '  ' + word + (isGoal ? '' : '  (bonus)'));
    renderWordList();
    updateProgress();

    boardArea.classList.add('animate-success');
    setTimeout(function () { boardArea.classList.remove('animate-success'); }, 400);

    if (socket) socket.emit('gameUpdate', { matchId: matchId, score: myScore, wordsTyped: foundGoalCount });

    if (foundGoalCount >= currentLevel().goals.length) {
      gameActive = false;
      clearInterval(timerInterval);
      toast('All words found! Submitting...');
      if (socket) socket.emit('playerFinished', { matchId: matchId, finalScore: myScore });
    }
  }

  function addScore(n) {
    myScore += n;
    p1Score.textContent = myScore;
    p1Score.style.transform = 'scale(1.25)';
    setTimeout(function () { p1Score.style.transform = ''; }, 200);
  }

  function updateProgress() {
    var total = currentLevel().goals.length;
    var pct = total ? (foundGoalCount / total) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = foundGoalCount + ' / ' + total + ' words';
  }

  function renderWordList() {
    var goals = currentLevel().goals.slice().sort(function (a, b) { return a.length - b.length || a.localeCompare(b); });
    wordsList.innerHTML = '';
    for (var i = 0; i < goals.length; i++) {
      var w = goals[i];
      var pill = document.createElement('div');
      pill.className = 'word-pill liquid-glass glass-border';
      if (foundGoals[w]) { pill.classList.add('found'); pill.textContent = w; }
      else { pill.classList.add('unfound'); pill.textContent = '...'; }
      wordsList.appendChild(pill);
    }
    if (foundBonusCount > 0) {
      var bonusPill = document.createElement('div');
      bonusPill.className = 'word-pill bonus liquid-glass glass-border';
      bonusPill.textContent = '+' + foundBonusCount + ' bonus';
      wordsList.appendChild(bonusPill);
    }
  }

  // ============================================================
  // End Game Modal
  // ============================================================
  function showEndModal(winner, scores) {
    var isSelf = winner === playerName;
    var isTie = winner === 'Tie';
    if (isTie) { modalWinner.textContent = "It's a Tie!"; modalWinner.className = 'modal-winner'; }
    else if (isSelf) { modalWinner.textContent = 'VICTORY!'; modalWinner.className = 'modal-winner victory'; }
    else { modalWinner.textContent = 'DEFEAT'; modalWinner.className = 'modal-winner defeat'; }

    modalScores.innerHTML = '';
    for (var i = 0; i < scores.length; i++) {
      var p = scores[i];
      var row = document.createElement('div');
      row.className = 'modal-score-row' + (p.username === winner ? ' winner-row' : '');
      var nameSpan = document.createElement('span');
      nameSpan.textContent = p.username === playerName ? p.username + ' (You)' : p.username;
      var scoreSpan = document.createElement('span');
      scoreSpan.textContent = p.score;
      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      modalScores.appendChild(row);
    }
    modalOverlay.classList.add('visible');
  }

  // ============================================================
  // Helpers
  // ============================================================
  function flash(kind) {
    previewEl.style.color = kind === 'good' ? '#2fbf71' : '#ff5d73';
    setTimeout(function () { previewEl.style.color = ''; }, 300);
  }

  var toastTimer;
  function toast(msg, isErr) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('err', !!isErr);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1500);
  }

  shuffleBtn.onclick = function () {
    shuffle_array(letters);
    createLetterNodes();
    resetSelection();
  };

  clearBtn.onclick = resetSelection;

  // ============================================================
  // Init
  // ============================================================
  Dictionary.load();
  initSocket();

})();
