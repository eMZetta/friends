// Der erste Start: Galip versteckt sich, das Kind begrüßt ihn sanft, dann erst beginnt die App.
const KEY = 'lumi.intro'

/** Alte Installationen kennen die Einführung nicht, haben aber schon gespielt und sollen sie nicht nachholen müssen.
 *  Einstellungen zählen nicht: Die App legt sie beim ersten Start selbst an. */
const EXISTING_KEYS = ['lumi.stats', 'lumi.stickers', 'lumi.friendship', 'lumi.seenGames']

export function introSeen(): boolean {
  try {
    if (localStorage.getItem(KEY) === '1') return true
    return EXISTING_KEYS.some((key) => localStorage.getItem(key) !== null)
  } catch {
    // Ohne Speicher gäbe es die Einführung bei jedem Start; lieber gar nicht zeigen.
    return true
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Ohne Speicher erscheint sie beim nächsten Start noch einmal.
  }
}
