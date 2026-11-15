# TODO

## App-Eindruck: weg vom Hobbyprojekt (Stand 2026-11-15)

Erledigt: Startbildschirm mit vier Welten, einheitlicher Illustrationsstil, Galips Geschichte (Vertrauen durch Spielrunden,
Sprechblasen, Medaille „Beste Freunde"), Szenerie und Galip in den Spielen, Einführung beim ersten Start.

### Ungeprüft (bitte einmal ansehen)
- [ ] Hochformat und kleine Geräte (iPhone): Startbildschirm mit Welten, Fenster einer Welt, Einführung, Galip im Spielrahmen
- [ ] Belohnungsansicht mit Herzen und aufspringendem neuen Herz (nach drei fertigen Runden)
- [ ] Sticker-Album und Schatten-Spiel mit den neuen Zeichnungen (Silhouetten-Filter)
- [ ] Einführung: Sprechblase wechselt beim Erschrecken sofort auf „Hoppla!" (in der Automatisierung nicht sicher gesehen)

### Ideen und offene Punkte
- [ ] **Herzen oben** auf dem Startbildschirm haben keine Erklärung: direkt an Galip hängen oder mit Beschriftung/Symbol versehen
- [ ] **Übergänge zwischen Spielrunden:** Nach einer Runde geht es ohne Übergang weiter; sanfter Wechsel, vielleicht Galip kurz zeigen
- [ ] **Eltern-Bereich, Store-Seite (`store/`) und Website (`website/`)** auf den Gesamteindruck prüfen; Screenshots (`scripts/screenshots.mjs`) und
      Store-Texte an den neuen Startbildschirm und die Geschichte anpassen (Spielübersicht zeigt jetzt Welten statt 11 Kacheln)
- [ ] **App-Icon/Splash** zeigen noch Galips Zeichnung von vorher; nach Änderungen an Galip neu erzeugen
      (siehe Memory „Galip drawing & icon pipeline": `make-galip-part.mjs`, `make-assets.mjs`, `capacitor-assets`)
- [ ] **Spiel-Hintergründe:** Pastellverläufe der Spiele und die Buchstaben-Kacheln sind noch im alten Stil; an Galip-Look und Szenerie angleichen
- [ ] **Idee: Eltern sprechen die Texte selbst ein** (eigene Stimme statt Systemstimme, auch als Lösung für Sound-Punkt „Sprachzeilen")
  - **Ziel:** Im Eltern-Bereich gibt es eine Seite „Meine Stimme", auf der alle gesprochenen Sätze aufgelistet sind (Quelle: `voiceLines.ts`,
    ~200 pro Sprache). Eltern, Onkel, Oma oder die Nichte selbst nehmen sie mit dem Mikrofon auf. Die Aufnahme ersetzt dann die Systemstimme.
    Emotional passend zum Projekt: Das Kind hört die vertraute Stimme, und Galip „spricht" mit Onkel/Tante/Mama.
  - **UX für Eltern ohne Technik-Kenntnis** (wichtigste Anforderung):
    - Keine Dateien, keine Fachwörter („Aufnahme", „Sprechen", „Fertig"), alles mit großen Knöpfen, Symbolen und klarem Ablauf.
    - Sätze nicht als lange Liste, sondern **nach Szenen gruppiert** und als geführter Weg: „Los geht's" führt Satz für Satz durch
      („Lob nach einer Runde", „Galip begrüßt dich", „Tiere", „Zahlen" …). Fortschritt sichtbar („23 von 203 aufgenommen").
    - **Beispiel-Szene zu jedem Satz:** Neben dem Text steht ein kleines Bild bzw. eine Mini-Vorschau der echten Spielsituation, in der das Kind den Satz hört
      (z. B. Ballon-Spiel mit „Lass die roten Ballone platzen!", Belohnung mit Konfetti zu „Toll gemacht!", Galip-Sprechblase zu den Geschichts-Sätzen).
      Wiederverwendbar: `GameArt.vue`, `AnimalIcon`, `GalipMascot`, `RewardBurst`; evtl. Standbild je Szene statt Live-Komponente.
    - **Ablauf pro Satz:** Satz groß anzeigen, Knopf „Aufnehmen" (großer roter Kreis) mit kurzem Countdown 3-2-1, sichtbarer Pegel, automatisches Ende
      bei Stille oder Knopf „Fertig", sofort **Anhören**, dann „Behalten" oder „Nochmal". Vorlesen der Systemstimme zum Vergleich ist erlaubt.
    - Hilfe in einfachen Worten: Tipps vor dem Start („ruhiger Raum, Handy 20 cm vom Mund, freundlich und langsam sprechen wie mit dem Kind"),
      Hinweis, wenn zu leise oder zu laut; automatisch Stille am Anfang/Ende abschneiden und Lautstärke angleichen (Web Audio im Gerät).
    - Man kann jederzeit aufhören; ohne Aufnahme spricht weiter die Systemstimme (pro Satz einzeln, kein Alles-oder-nichts).
      Einzelne Aufnahme löschen, neu aufnehmen, alle löschen. Mikrofon-Erlaubnis freundlich erklären, bevor das System fragt.
    - Pro Sprache getrennt (de/en), ggf. mehrere Sprecher/Profile („Mama", „Onkel Michi") und Auswahl, wer gerade spricht: später prüfen.
    - Vorschlag: zuerst nur **Kernsätze** (Begrüßung, Lob, Galips Geschichte, Spielnamen) empfehlen, die haben die größte Wirkung; Rest optional.
  - **Technik / Hinweise für die Umsetzung:**
    - Heute werden Aufnahmen **beim Build** per `import.meta.glob` gefunden (`src/lib/audio.ts`, `speech.ts`). Eigene Aufnahmen entstehen zur Laufzeit,
      brauchen also Speicher auf dem Gerät (IndexedDB oder Capacitor Filesystem) und eine Suche in `say()`: erst Eltern-Aufnahme, dann gebündelte Datei,
      dann Systemstimme. Mehrteilige Sätze nur mit Aufnahme spielen, wenn **alle** Teile aufgenommen sind (bestehende Regel beibehalten).
    - Aufnehmen mit `getUserMedia` + `MediaRecorder`. Auf iOS/WKWebView (iPadOS 15) liefert er MP4/AAC statt WebM; `decodeAudioData` kann das. Auf echtem Gerät testen.
      iOS braucht `NSMicrophoneUsageDescription` in `ios/App/App/Info.plist`, Android `RECORD_AUDIO` im Manifest (Text in Eltern-Sprache).
    - Dateiname/Schlüssel wie bisher über `voiceKey(text)`; dynamische Sätze (Zahlen, `countGive(n, thing)`, Tiernamen) sind viele: gruppieren statt einzeln auflisten.
    - **Datenschutz:** Aufnahmen bleiben nur auf dem Gerät, nichts wird hochgeladen (zum Versprechen „kein Tracking, offline" passend).
      `website/privacy.html`, App-Store-Datenschutzangaben und `docs/STORE.md` müssen das Mikrofon erwähnen. Funktion nur hinter dem Eltern-Gate.
    - Wird ein Text im Code geändert, ist die dazugehörige Aufnahme verwaist: in der Liste als „neu aufnehmen" markieren.
    - Tests: Speicher-Logik (Schlüssel, Priorität der Quellen) per Vitest, Aufnahme-Ablauf per Cypress mit gefälschtem Mikrofon (`--use-fake-device-for-media-stream`).
- [ ] **Ende der Geschichte** weiter ausbauen: ein Kind als Figur im Finale (größeres Zeichenprojekt)
- [ ] **Tests:** Cypress deckt Welten, Einführung, Eltern-Bereich und alle Spiele ab (6 Tests, grün). Es fehlen Tests für Belohnung/Herzen, Finale und Album
- [ ] Vue-DevTools-Leiste unten ist nur im Dev-Modus (`yarn dev`), nicht im Build; nichts zu tun, nur nicht verwechseln

## Sound (Stand 2026-11-15)

Die App läuft ohne Audiodateien (Systemstimme, synthetische Effekte). Jede Datei ersetzt das Provisorium
automatisch, siehe `docs/AUDIO.md`. Quellen: Suno (bezahltes Abo, kommerzielle Nutzung erlaubt), Pixabay.

### Hintergrundmusik
- [x] Zwei Varianten „Dusk Lullaby" in Suno erzeugt (Konto, My Workspace, je 1:01, Instrumental, 70 BPM)
- [ ] **Du:** beide anhören, die bessere wählen (oder neu erzeugen lassen, wenn keine passt)
- [ ] Gewählte Variante als MP3 aus Suno herunterladen, z. B. nach `~/Downloads/dusk-lullaby.mp3`
- [ ] `node scripts/make-loop.mjs <datei.mp3> 4` → schreibt `src/assets/audio/music/loop.mp3` (nahtlos)
- [ ] Prüfen: Im Eltern-Bereich erscheint der Schalter „Musik", Lautstärke 12 % ist leise genug (Hund!)
- [ ] Eintrag in `docs/CREDITS.md` (Suno, Prompt, Datum, Abo-Stufe)

### Soundeffekte (`src/assets/audio/sfx/`)
- [ ] `tap.mp3` (Antippen), `pop.mp3` (Ballon), `snap.mp3` (richtig/einrasten), `wrong.mp3` (sanftes „nicht ganz"),
      `success.mp3` (Runde geschafft). Je unter 1 s, weich, nichts Schrilles oder Lautes.
- [ ] Quelle: Pixabay Sound Effects (Content-Lizenz: frei, auch kommerziell, ohne Namensnennung) oder Suno „Sounds"
- [ ] Je Datei in `docs/CREDITS.md` eintragen (Titel, Autor, URL, Lizenz)
- [ ] Hinweis: In Chrome ist Pixabay **nicht angemeldet** (oben „Log in"). Zum Anhören reicht das, für den
      Download verlangt Pixabay womöglich ein Login (Passwort gibst du selbst ein).
- [ ] Kandidaten (alle auf pixabay.com/sound-effects/…, vorher anhören, ob sie weich genug sind):
  - `tap`: `technology-soft-app-button-tap-sound-2-547872`, `film-special-effects-soft-ui-click-147352`, `film-special-effects-soft-interface-click-126517`
  - `pop`: `film-special-effects-bubble-pop-06-351337`, `film-special-effects-bubble-pop-406640`, `film-special-effects-bubble-pop-08-351339`
  - `snap`: `technology-correct-472358`, `film-special-effects-correct-6033`, `film-special-effects-rightanswer-95219`
  - `wrong`: `film-special-effects-error-notification-352286`, `film-special-effects-error-126627` (klingen womöglich zu hart:
    sonst ein weiches, tiefes „Bloop" suchen oder in Suno „Sounds" erzeugen)
  - `success`: `technology-ui-success-chime-513565`, `film-special-effects-reward-chime-144757`, `technology-ui-chime-success-sound-551841`
- [ ] Optional: `xylo-0.mp3` … `xylo-7.mp3` (C5 bis C6, ~1,5 s ausklingend); die synthetischen Töne sind schon brauchbar

### Sprachzeilen (je Sprache ~200, Liste: `yarn voice:lines`)
- [x] Suno „Speech" getestet: „Toll gemacht!" (2 Clips à 0:12, vermutlich viel Stille)
- [ ] **Du:** Stimmqualität der beiden Testclips beurteilen (warm genug? kindgerecht?)
- [ ] Entscheiden: alle Zeilen oder nur Kernsätze aufnehmen lassen
      (Lob `praise`, Spielaufforderungen, Galips Geschichte `story*`, `bestFriends`, Spielnamen). Der Rest bleibt Systemstimme.
- [ ] Pro Zeile: erzeugen, herunterladen, dann `node scripts/import-voice.mjs <datei> "<satz>" de`
      (schneidet Stille ab, gleicht Lautstärke an, legt unter dem richtigen Namen ab)
- [ ] Danach `yarn voice:lines` und den Stand in den CSVs prüfen
- [ ] Englische Zeilen genauso (oder Englisch zunächst bei der Systemstimme lassen)
- [ ] Ein Satz mit mehreren Teilen (z. B. Lob + Sticker) wird nur aufgenommen gespielt, wenn alle Teile existieren

### Vor dem Release
- [ ] `docs/CREDITS.md` vollständig, Lizenzen geprüft
- [ ] App Store: Hinweis zu KI-generierter Musik/Stimme in den Notizen für die Prüfung klären
- [ ] Gesamtlautstärke im Hörtest mit dem echten Hund Galip
