# Lumi – Lernspiele für Kleinkinder

Kostenlose, werbefreie Lern-App für Kinder von 2–5 Jahren, primär für iPads (auch ältere Modelle mit iPadOS 15).
Keine Werbung, kein Tracking, keine Logins, alles offline.

## Spiele

| Spiel   | Lernziel                                     |
| ------- | -------------------------------------------- |
| Formen  | Formen erkennen, Feinmotorik (Drag & Drop)   |
| Zählen  | Mengen 1–10, Eins-zu-eins-Zuordnung          |
| Ballone | Farben erkennen und benennen                 |
| Tiere   | Tiernamen und -geräusche, Wortschatz         |
| Memory  | Gedächtnis, Paare finden (2–6 Paare)         |
| Muster  | Muster fortsetzen (AB, AAB, ABB, ABC, AABB)  |
| Musik   | Xylophon: frei spielen oder Kinderlieder nachspielen |
| Schatten | Tier am Schatten erkennen, Wortschatz        |
| Groß & Klein | Größen vergleichen (groß/klein, größte/kleinste) |
| Malen   | Frei malen mit dem Finger, Farben wählen     |
| Buchstaben | Anfangsbuchstaben von Tiernamen (4–5 Jahre) |

Sprachen: Deutsch und Englisch (Einstellung hinter dem Eltern-Gate).

## Entwicklung

```sh
yarn          # Abhängigkeiten installieren
yarn dev      # Dev-Server, auch im WLAN erreichbar (iPad: http://<PC-IP>:5173)
yarn build    # Typecheck + Produktions-Build nach dist/
yarn test:unit
yarn lint
```

## Struktur

- `src/views/HomeView.vue` – Startbildschirm mit Spielauswahl
- `src/views/games/` – die einzelnen Spiele
- `src/components/` – Maskottchen, Belohnung, Eltern-Gate, Spielrahmen
- `src/views/AlbumView.vue` – Sticker-Album (Belohnung nach jeder Runde)
- `src/lib/` – Sprache (i18n), Audio, Sprachausgabe, Hilfe-Hinweise, Sticker
- `src/assets/audio/` – optionale Aufnahmen, Effekte, Musik (siehe `docs/AUDIO.md`)
- `ios/` – natives Xcode-Projekt (Capacitor), Build über Codemagic (siehe `docs/RELEASE.md`)

## Für Kleinkinder gebaut

- Hilfe bei Untätigkeit: Aufgabe wird wiederholt, danach zeigt eine Hand, was zu tun ist.
- Beim ersten Öffnen eines Spiels führt die Hand es einmal vor.
- Spiel verlassen nur durch Gedrückthalten des Haus-Knopfs.
- Einstellungen nur über das Eltern-Gate (ausgeschriebene Zahl eintippen). Nach 3 Fehlversuchen sperrt es 30 Sekunden.
- Im Eltern-Bereich: Sprache, Geräusche, Sprachausgabe, Musik, Tageslimit (Lumi macht danach Pause) und Spiele ausblenden.
  Eine Lernübersicht zeigt pro Spiel Spielzeit und Runden. Alles wird nur lokal auf dem Gerät gespeichert.

## Kompatibilität

Build-Target ist Safari 14 / ES2020. Keine CSS-Features neuer als Safari 15 verwenden
(z. B. kein `:has()`, keine Container Queries).
