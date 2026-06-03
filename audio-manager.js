(function () {
  'use strict';

  // 1. Initialize Audio Element
  var audio = new Audio('song/JVKE - golden hour _instrumental_.mp3');
  audio.loop = true;

  // 2. Load Mute Preference
  var isMuted = localStorage.getItem('wb_muted') === 'true';
  audio.muted = isMuted;

  // 3. Playback Position Persistence Across Navigation
  audio.addEventListener('loadedmetadata', function () {
    var savedTime = localStorage.getItem('wb_music_time');
    var savedTimestamp = localStorage.getItem('wb_music_time_saved');
    if (savedTime && savedTimestamp) {
      var age = Date.now() - parseInt(savedTimestamp, 10);
      // Only resume position if it was saved within the last 10 seconds (i.e. page transition)
      if (age < 10000) {
        audio.currentTime = parseFloat(savedTime);
      }
    }
  });

  // Track playback time and store it before unload
  window.addEventListener('beforeunload', function () {
    localStorage.setItem('wb_music_time', audio.currentTime);
    localStorage.setItem('wb_music_time_saved', Date.now());
  });

  // 4. Autoplay Handling (Browsers block audio until first interaction)
  function playAudio() {
    if (isMuted) return;
    audio.play().catch(function (err) {
      console.log('Autoplay prevented. Music will play upon first user interaction.');
      var startPlay = function () {
        if (!isMuted) {
          audio.play().catch(function() {});
        }
        document.removeEventListener('click', startPlay);
        document.removeEventListener('touchstart', startPlay);
      };
      document.addEventListener('click', startPlay);
      document.addEventListener('touchstart', startPlay);
    });
  }

  // Attempt initial play
  playAudio();

  // 5. Create Music Toggle Button dynamically
  var toggleBtn = document.createElement('div');
  toggleBtn.className = 'music-toggle-btn liquid-glass glass-border';
  toggleBtn.title = isMuted ? 'Play Music' : 'Mute Music';

  var icon = document.createElement('span');
  icon.className = 'material-symbols-outlined';
  icon.id = 'music-toggle-icon';
  icon.textContent = isMuted ? 'volume_off' : 'volume_up';
  toggleBtn.appendChild(icon);

  document.body.appendChild(toggleBtn);

  // Toggle Action
  toggleBtn.addEventListener('click', function () {
    isMuted = !isMuted;
    audio.muted = isMuted;
    localStorage.setItem('wb_muted', isMuted);

    icon.textContent = isMuted ? 'volume_off' : 'volume_up';
    toggleBtn.title = isMuted ? 'Play Music' : 'Mute Music';

    if (!isMuted) {
      audio.play().catch(function (err) {
        console.error('Failed to play audio:', err);
      });
    } else {
      audio.pause();
    }
  });
})();
