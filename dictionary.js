// Dictionary handling.
//
// The game loads a real English word list (words.txt, one word per line) so any
// valid word built from the level's letters scores. Until the list finishes
// loading - or if it fails to load - the game falls back to accepting each
// level's defined goal words so it always remains playable.
//
// words.txt is expected next to index.html. Use a permissively licensed list.
const Dictionary = (function () {
  let words = null;        // Set of uppercase words once loaded
  let loaded = false;

  function load() {
    return fetch('words.txt')
      .then(function (r) {
        if (!r.ok) throw new Error('no word list');
        return r.text();
      })
      .then(function (text) {
        words = new Set(
          text.split(/\r?\n/).map(function (w) { return w.trim().toUpperCase(); })
              .filter(function (w) { return w.length >= 3; })
        );
        loaded = true;
      })
      .catch(function () {
        words = null;
        loaded = true; // give up; use fallback
      });
  }

  // Can the word be built from the available letters (respecting counts)?
  function canBuild(word, letters) {
    const pool = {};
    letters.forEach(function (ch) { pool[ch] = (pool[ch] || 0) + 1; });
    for (const ch of word) {
      if (!pool[ch]) return false;
      pool[ch]--;
    }
    return true;
  }

  function isValid(word, level, letters) {
    word = word.toUpperCase();
    if (word.length < 3) return false;
    if (!canBuild(word, letters)) return false;
    // Always accept the level's defined goal words.
    if (level && level.goals && level.goals.indexOf(word) !== -1) return true;
    if (words && words.size) return words.has(word);
    return false;
  }

  return { load: load, isValid: isValid, isLoaded: function () { return loaded; } };
})();
