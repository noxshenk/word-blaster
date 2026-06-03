(function () {
  'use strict';

  // 1. Initialize Audio Element
  var audio = null;
  var isMuted = localStorage.getItem('wb_muted') === 'true';

  try {
    audio = new Audio('song/JVKE - golden hour _instrumental_.mp3');
    audio.loop = true;
    audio.muted = isMuted;
  } catch (e) {
    console.error('Audio initialization failed:', e);
  }

  // Helper for safe audio playback (prevents crash if play() returns undefined on older browsers)
  function safePlay() {
    if (!audio) return;
    try {
      var promise = audio.play();
      if (promise !== undefined && typeof promise.catch === 'function') {
        promise.catch(function (err) {
          console.log('Autoplay prevented. Music will play upon first interaction.');
          var startPlay = function () {
            if (!isMuted && audio) {
              var p = audio.play();
              if (p !== undefined && typeof p.catch === 'function') {
                p.catch(function() {});
              }
            }
            document.removeEventListener('click', startPlay);
            document.removeEventListener('touchstart', startPlay);
          };
          document.addEventListener('click', startPlay);
          document.addEventListener('touchstart', startPlay);
        });
      }
    } catch (e) {
      console.warn('Playback error caught:', e);
    }
  }

  // 2. Playback Position Persistence Across Navigation
  if (audio) {
    audio.addEventListener('loadedmetadata', function () {
      var savedTime = localStorage.getItem('wb_music_time');
      var savedTimestamp = localStorage.getItem('wb_music_time_saved');
      if (savedTime && savedTimestamp) {
        var age = Date.now() - parseInt(savedTimestamp, 10);
        // Only resume position if it was saved within the last 10 seconds (i.e. page transition)
        if (age < 10000) {
          try {
            audio.currentTime = parseFloat(savedTime);
          } catch (err) {
            console.warn('Failed to restore playback time:', err);
          }
        }
      }
    });

    // Track playback time and store it before unload
    window.addEventListener('beforeunload', function () {
      try {
        localStorage.setItem('wb_music_time', audio.currentTime);
        localStorage.setItem('wb_music_time_saved', Date.now());
      } catch (err) {}
    });
  }

  // Attempt initial play
  if (!isMuted) {
    safePlay();
  }

  // 3. Create Music Toggle Button dynamically
  function initButton() {
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
      localStorage.setItem('wb_muted', isMuted);

      icon.textContent = isMuted ? 'volume_off' : 'volume_up';
      toggleBtn.title = isMuted ? 'Play Music' : 'Mute Music';

      if (audio) {
        audio.muted = isMuted;
        if (!isMuted) {
          safePlay();
        } else {
          audio.pause();
        }
      }
    });
  }

  if (document.body) {
    initButton();
  } else {
    document.addEventListener('DOMContentLoaded', initButton);
  }
})();
