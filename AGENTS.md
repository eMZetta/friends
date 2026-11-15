# Galip: Hinweise für Agenten und Mitwirkende

Dieses Dokument soll genügen, um ohne Vorwissen weiterzuarbeiten. Offene Aufgaben stehen in `TODO.md`,
Audio in `docs/AUDIO.md`, Release in `docs/RELEASE.md`, Store-Texte in `docs/STORE.md`.

## Worum es geht

- Persönliches Projekt: Die kleine Nichte des Entwicklers und sein Hund **Galip** (Border Terrier, lieb, lebhaft, aber
  ängstlicher vor dem Kind als das Kind vor ihm) sollen ihre Angst voreinander verlieren und Freunde werden.
  Galip ist das Maskottchen der App. Im echten Leben rennt er vor einem zu wilden Kind weg, in der App auch.
- Lern-App für Kinder von **3 bis 6 Jahren**, kostenlos, werbefrei, ohne Tracking, offline. Primär iPad (auch alt, iPadOS 15),
  geht auch auf dem iPhone. Soll in den App Store. Die Eltern müssen überzeugt werden, nicht nur die Kinder.
- Leitlinie für jede Entscheidung: **ruhig und sanft**. Keine plötzlichen lauten Geräusche, keine hektische Bewegung,
  nichts, was ein nervöses Kind oder einen nervösen Hund erschreckt. Wildes Tippen erschreckt Galip bewusst.
- Optische Richtung: heiter, einladend, aber klar **kein Abklatsch** von Lucas & Friends / RV AppStudio. Darum Dämmerwiese,
  Glühwürmchen, Baloo 2, unterschiedliche Kachelformen, kein Blauhimmel-Wolken-Hügel-Baukasten.
- Der Name war früher „Lumi". Intern bleibt vieles absichtlich bei Lumi: Bundle-ID `ch.lumikids.app`, localStorage-Schlüssel `lumi.*`.
  **Nicht umbenennen**, das würde bestehende Spielstände entwerten.

## Arbeitsweise (Wünsche des Entwicklers)

- **Antworten auf Deutsch**, mit korrekten Umlauten. Code-Bezeichner bleiben englisch, Kommentare und UI-Texte sind deutsch.
- **Jede fertige Änderung committen und nach `origin/main` pushen**, ohne nachzufragen. Commit-Nachrichten auf Deutsch.
- Vor jedem Commit: `yarn lint` (läuft mit `--fix` und ändert Dateien!), `yarn type-check` bzw.
  `yarn vue-tsc --noEmit -p tsconfig.app.json`, `yarn test:unit --run`.
- Ehrlich berichten, was geprüft wurde und was nicht (siehe „Ungeprüft" in `TODO.md`).
- Downloads, Veröffentlichen, Ausgaben (z. B. Suno-Guthaben) und Anmeldungen nur nach ausdrücklichem Ja des Entwicklers.

## Stack und Befehle

Vue 3 + TypeScript, Vite, Pinia, vue-router (Hash-Verlauf), Capacitor 8 (iOS/Android), Vitest, Cypress, yarn 1.

```sh
yarn dev --port 5173   # Dev-Server (danach beenden, der Port bleibt sonst belegt)
yarn build             # Typecheck + Build
yarn test:unit --run   # Vitest einmalig
yarn test:e2e          # Cypress gegen den Preview-Build
yarn voice:lines       # docs/voice-lines-*.csv neu erzeugen
yarn voice:import <aufnahme> "<satz>" de   # Aufnahme zuschneiden, normalisieren, richtig benennen (ffmpeg)
yarn audio:loop <stück.mp3> 4             # nahtlosen Musik-Loop erzeugen (ffmpeg)
yarn assets            # Icons/Splash aus Galips Zeichnung (siehe unten)
```

## Aufbau

- `src/views/HomeView.vue`: Startbildschirm. **Vier Welten** (`WORLDS`: Knobeln, Zahlen & ABC, Tierfreunde, Farben & Musik)
  um ein großes Galip. Ein Tipp öffnet ein Fenster (`.backdrop`/`.panel`) mit den Spielen der Welt. Galip trabt selbst herum,
  holt Bälle, flieht vor wildem Tippen. Sprechblase erzählt das Kapitel zur Herzzahl.
- `src/views/IntroView.vue`: Einführung beim allerersten Start (`/intro`, Router-Guard in `src/router/index.ts`).
- `src/views/games/*Game.vue`: elf Spiele, alle in `GameShell.vue` (Home-Knopf gedrückt halten, Hügel, Galip am Rand).
- `src/components/GalipMascot.vue`: Galip als SVG mit Rig (Atmen, Blinzeln, Ohren, Rute, Trab). Pose `front|side|back`,
  Props `happy/shy/flip/walking/action`. Aktionen in `galipActions.ts`.
- `src/components/GameArt.vue`: Vorschaubilder für Welten und Spiele. `AnimalIcon`, `ShapeIcon`, `CountItem`, `BalloonIcon`,
  `StickerArt`: Illustrationen. `RewardBurst.vue`: Belohnung nach einer Runde. `FriendFinale.vue`/`FriendMedal.vue`: Ende der Geschichte.
  `ParentGate.vue`: Eltern-Bereich hinter einer Rechenaufgabe (Sprache, Schwierigkeit, Zeitlimit, Spiele ausblenden, Statistik, freiwillige „Kaffeekasse" über `@capgo/native-purchases`, schaltet nichts frei).
- `src/lib/i18n.ts`: **alle Texte** (de und en, Typ folgt aus `de`). `src/lib/voiceLines.ts`: Liste aller gesprochenen Sätze.
- `src/lib/speech.ts` (`say`, Dateiname `voiceKey`), `audio.ts`, `sound.ts`, `music.ts`: Ton. Ohne Audiodateien läuft alles mit
  Systemstimme und synthetischen Effekten, jede Datei unter `src/assets/audio/` ersetzt das Provisorium automatisch.
- `src/stores/`: `friendship` (Herzen), `settings`, `stats`, `stickers`, `usage` (Tageslimit), `gate`.
- localStorage-Schlüssel: `lumi.friendship`, `.friendship.rounds`, `.friendship.finale`, `.intro`, `.settings`, `.stats`,
  `.stickers`, `.seenGames`, `.usage`, `.gate`.

## Galips Geschichte (Spielmechanik)

- Herzen `trust` 0 bis 5 (`MAX_TRUST`). Jede **dritte fertige Runde** (`ROUNDS_PER_HEART`) in irgendeinem Spiel gibt ein Herz
  (`finishRound`, aufgerufen in `RewardBurst`). Ballwerfen und ruhiges Warten auf dem Startbildschirm geben ebenfalls Herzen.
- Jedes Herz ist ein Kapitel (`t.story[0..5]`, Sprechblase auf dem Startbildschirm). Mit mehr Vertrauen wagt sich Galip weiter weg
  und hält mehr Tipps aus, bevor er flieht. Im Spielrahmen lugt er mit den Ohren (0 Herzen) bis ganz sichtbar (5 Herzen) herein.
- Bei 5 Herzen: Abschlussszene „Beste Freunde" mit Medaille (einmal automatisch, danach aus dem Album wiederholbar).
- Einführung beim ersten Start: Galip versteckt sich hinter dem Hügel, ruhiges Antippen lockt ihn hervor, wildes Tippen erschreckt ihn.
  Bestehende Installationen (Stats, Sticker, Herzen, seenGames vorhanden) überspringen sie. `lumi.settings` zählt nicht, die App schreibt sie selbst.

## Zeichenstil (alles in Galips Look)

Keine dunklen Umrisse. Weicher Lichtverlauf von oben (weiß 30 %) nach unten (warmes Violett 22 %) als Überlagerung (`shade`),
dunkle warme Augen `#2a1d17` mit weißem Glanzpunkt, rosige Bäckchen `#ff8fa3` (50 %). Farben in `src/lib/colors.ts`.
Jede Komponente hat ihren eigenen `<linearGradient>` mit `useId()`. Neue Motive im selben Stil zeichnen.

Galips Zeichnung ist die Quelle für App-Icon, Favicons und Splash: `assets/galip.svg.part` wird **erzeugt**
(`node scripts/make-galip-part.mjs`), dann `node scripts/make-assets.mjs` und `npx capacitor-assets generate --ios`;
`website/icon.png` (256 px) von Hand aus `assets/icon-only.png` verkleinern.

## Ein neues Spiel hinzufügen

`src/lib/games.ts` (`GAME_IDS`), Route in `src/router/index.ts`, `GAME_COLORS` und `WORLDS` in `HomeView.vue`,
Vorschau in `GameArt.vue`, Name in `i18n.ts` (`games`, de und en), Sätze in `voiceLines.ts`, Spielliste in `README.md`,
`GAMES` in `cypress/e2e/app.cy.ts` und `scripts/screenshots.mjs`. Danach `yarn voice:lines`.

## Fallstricke (alle schon passiert)

- **Scoped CSS und Klassennamen:** Das Wurzelelement einer Kindkomponente bekommt die Scope-ID der Eltern. Heißt eine Klasse im
  Elternteil wie die Klasse im Kind (z. B. `.galip` im Maskottchen-SVG), greifen die Elternstile auf das Kind. In `IntroView` heißt sie deshalb `.buddy`.
- **Zeilenenden:** Der Arbeitsbaum hat teils CRLF, das Repo LF (`.gitattributes`). Git-Warnungen dazu sind harmlos. Beim Bearbeiten per Skript
  das Zeilenende der Datei beibehalten.
- **`yarn lint` ändert Dateien** (`--fix`). Eine Datei danach neu lesen, bevor man sie wieder bearbeitet.
- **Apostrophe:** Texte mit `'` (z. B. „Los geht's") in `i18n.ts` in doppelte Anführungszeichen setzen, sonst Syntaxfehler.
- **Neuer Satz in `i18n.ts`:** Ohne Eintrag in `voiceLines.ts` taucht er nicht in den Aufnahmelisten auf. Der Dateiname einer Aufnahme folgt dem
  Text (`voiceKey`); ändert sich der Text, braucht er eine neue Aufnahme. Ein mehrteiliger Satz wird nur aufgenommen gespielt, wenn **alle** Teile aufgenommen sind.
- **Silhouetten im Schatten-Spiel** nutzen `filter: brightness(0)` auf den Tier-SVGs; neue Tierzeichnungen dort testen.
- **Tests im Browser (Claude in Chrome):** Der Viewport lässt sich nicht verkleinern, Hochformat daher nicht prüfbar. Klicks der Automatisierung sind zu langsam
  für „wildes Tippen", stattdessen `pointerdown`-Ereignisse per Skript auslösen. In einem Hintergrund-Tab stehen CSS-Übergänge teils still.
  Zum Testen des ersten Starts `localStorage.clear()` und neu laden; zum Testen der Herzen `lumi.friendship` auf `0` bis `5` setzen
  (bei `5` zusätzlich `lumi.friendship.finale` auf `1`, sonst erscheint die Abschlussszene). Testwerte danach wieder löschen.
- **Dev-Server beenden**, wenn man fertig ist (Port 5173). Die Vue-DevTools-Leiste unten in der Mitte gibt es nur im Dev-Modus.

## Zugänge und Quellen für Audio

In Chrome (Erweiterung Claude in Chrome) ist der Entwickler bei **Suno** angemeldet (bezahltes Abo, kommerzielle Nutzung erlaubt)
und bei **ChatGPT**. **Pixabay** war beim letzten Versuch **nicht** angemeldet (Stöbern geht, Download womöglich nur mit Login).
Passwörter gibt nur der Entwickler selbst ein. Stand der Audioarbeit, Kandidaten und die zwei bereits erzeugten Suno-Songs
„Dusk Lullaby" sowie zwei Test-Sprachclips „Toll gemacht!" stehen in `TODO.md`. Jede veröffentlichte Audiodatei gehört in `docs/CREDITS.md`.

## Erinnerung des Entwicklers beim Weiterarbeiten

Der Entwickler hat den Eindruck, die App wirke „wie ein schnell zusammengebasteltes Hobbyprojekt". Die Arbeit seit dem
15.11.2026 (Welten, Illustrationsstil, Geschichte, Szenerie, Einführung) zielt darauf. Reihenfolge der geplanten Themen:
A Startbildschirm (fertig), B Illustrationsstil (fertig), D Geschichte (fertig), C Ton (offen, braucht Entscheidungen und Dateien),
danach die Punkte unter „App-Eindruck" in `TODO.md`.
