// Original levels. Each level supplies a base word; the player must find the
// listed "goals" to clear the level. Any other valid dictionary word made from
// the letters scores as a bonus. Add or edit levels freely.
const LEVELS = [
  { base: 'CATS',  goals: ['CAT', 'CATS', 'ACTS', 'CAST'] },
  { base: 'RAIN',  goals: ['RAIN', 'RAN', 'AIR', 'AIN'] },
  { base: 'STAR',  goals: ['STAR', 'ARTS', 'RATS', 'TAR', 'ART'] },
  { base: 'BLOW',  goals: ['BLOW', 'BOWL', 'LOW', 'OWL', 'BOW'] },
  { base: 'PLANT', goals: ['PLANT', 'PLAN', 'PANT', 'TAP', 'NAP', 'ANT'] },
  { base: 'SHINE', goals: ['SHINE', 'SHIN', 'HENS', 'HIS', 'SIN', 'HEN'] },
  { base: 'STREAM', goals: ['STREAM', 'STEAM', 'TEARS', 'RATES', 'MEAT', 'STAR'] },
  { base: 'GARDEN', goals: ['GARDEN', 'DANGER', 'RANGE', 'GRADE', 'READ', 'DEAR'] }
];
