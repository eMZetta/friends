# TODO

## App-Eindruck: weg vom Hobbyprojekt (Stand 2026-11-15)

Erledigt: Startbildschirm mit vier Welten, einheitlicher Illustrationsstil, Galips Geschichte (Vertrauen durch Spielrunden,
Sprechblasen, Medaille „Beste Freunde"), Szenerie und Galip in den Spielen, Einführung beim ersten Start.

### Ungeprüft (bitte einmal ansehen)
- [ ] Hochformat und kleine Geräte (iPhone): Startbildschirm mit Welten, Fenster einer Welt, Einführung, Galip im Spielrahmen
- [ ] Belohnungsansicht mit Herzen und aufspringendem neuen Herz (nach drei fertigen Runden)
- [ ] Sticker-Album und Schatten-Spiel mit den neuen Zeichnungen (Silhouetten-Filter)
- [ ] Einführung: Sprechblase wechselt beim Erschrecken sofort auf „Hoppla!" (in der Automatisierung nicht sicher gesehen)
- [ ] Cypress-Tests ausführen (`yarn test:e2e`), insbesondere nach den Änderungen am Startbildschirm (`.tile` gibt es dort jetzt erst im Welten-Fenster)

### Ideen und offene Punkte
- [ ] **Herzen oben** auf dem Startbildschirm haben keine Erklärung: direkt an Galip hängen oder mit Beschriftung/Symbol versehen
- [ ] **Übergänge zwischen Spielrunden:** Nach einer Runde geht es ohne Übergang weiter; sanfter Wechsel, vielleicht Galip kurz zeigen
- [ ] **Eltern-Bereich, Store-Seite (`store/`) und Website (`website/`)** auf den Gesamteindruck prüfen; Screenshots (`scripts/screenshots.mjs`) und
      Store-Texte an den neuen Startbildschirm und die Geschichte anpassen (Spielübersicht zeigt jetzt Welten statt 11 Kacheln)
- [ ] **App-Icon/Splash** zeigen noch Galips Zeichnung von vorher; nach Änderungen an Galip neu erzeugen
      (siehe Memory „Galip drawing & icon pipeline": `make-galip-part.mjs`, `make-assets.mjs`, `capacitor-assets`)
- [ ] **Spiel-Hintergründe:** Pastellverläufe der Spiele und die Buchstaben-Kacheln sind noch im alten Stil; an Galip-Look und Szenerie angleichen
- [ ] **Ende der Geschichte** weiter ausbauen: ein Kind als Figur im Finale (größeres Zeichenprojekt)
- [ ] **Tests:** Ansichten (Startbildschirm, Einführung, Finale) haben nur Store-Tests, keine Komponententests
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
