# Audio: Sprachaufnahmen, Soundeffekte, Musik

Lumi funktioniert ohne eine einzige Audiodatei: Sprache kommt dann von der Systemstimme,
Effekte und Xylophon werden synthetisch erzeugt. Jede Datei, die du hinzufügst, ersetzt
automatisch das jeweilige Provisorium – Schritt für Schritt, ohne Code-Änderung.

Alle Dateien liegen unter `src/assets/audio/` und werden beim Build automatisch gefunden.

## 1. Sprachaufnahmen

```sh
yarn voice:lines
```

erzeugt `docs/voice-lines-de.csv` und `docs/voice-lines-en.csv` mit allen Sätzen (je ~94),
dem benötigten Dateinamen und ob die Aufnahme schon existiert.

- Ablage: `src/assets/audio/voice/de/<datei>.mp3` bzw. `.../voice/en/...`
- Der Dateiname leitet sich aus dem Text ab („Wo ist die Kuh?“ → `wo-ist-die-kuh.mp3`).
  Wird ein Text im Code geändert, braucht er eine neue Aufnahme – das Script zeigt es an.
- Zahlen-Zeilen (`1.mp3` … `10.mp3`) werden als Wort gesprochen („eins“, „zwei“ …).
- Ein Satz wird nur dann aufgenommen abgespielt, wenn **alle** seine Teile vorhanden sind;
  sonst liest die Systemstimme ihn ganz. So wechselt die Stimme nie mitten im Satz.

**Aufnahme-Tipps**
- Warm, langsam, deutlich, freudig – wie man mit einem 3-jährigen Kind spricht.
- Ruhiger Raum, Handy nah am Mund (ca. 20 cm), immer dieselbe Person pro Sprache.
- Stille am Anfang/Ende abschneiden, Lautstärke angleichen (z. B. Audacity: „Normalisieren“ auf −1 dB).
- Format: MP3 mono, 44.1 kHz, 96–128 kbit/s. Alle 94 Zeilen zusammen ≈ 1–2 MB.

**Alternative TTS:** Hochwertige KI-Stimmen sind möglich. Vor der Nutzung die Lizenz
prüfen (kommerzielle Nutzung, Nutzung in Apps, keine Namensnennung nötig?).

## 2. Soundeffekte

Ablage: `src/assets/audio/sfx/`

| Datei             | Wofür                                 |
| ----------------- | ------------------------------------- |
| `tap.mp3`         | Antippen von Knöpfen                  |
| `pop.mp3`         | Ballon platzt                         |
| `snap.mp3`        | Richtig / Form rastet ein             |
| `wrong.mp3`       | Sanftes „Nicht ganz“ (nie bestrafend) |
| `success.mp3`     | Runde geschafft (Konfetti)            |
| `xylo-0.mp3` … `xylo-7.mp3` | Xylophon C5 D5 E5 F5 G5 A5 H5 C6 |

Kurz halten (< 1 s, Xylophon ~1,5 s ausklingend). Gute Quellen mit CC0-Lizenz
(keine Namensnennung, kommerziell erlaubt): kenney.nl, freesound.org (Filter „CC0“),
sonniss.com (GDC-Bundles). Lizenz jeder Datei in `docs/CREDITS.md` notieren.

## 3. Hintergrundmusik

Ablage: `src/assets/audio/music/loop.mp3` – ein nahtlos loopender, ruhiger Track
(30–90 s). Sobald die Datei existiert, erscheint im Eltern-Bereich der Schalter „Musik“.
Die Musik läuft leise (12 %) unter allem anderen.
