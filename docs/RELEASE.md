# Release: vom PC (ohne Mac) bis in den App Store

Der iOS-Build läuft auf einem Mac in der Cloud bei **Codemagic** (Gratis-Kontingent:
500 Build-Minuten/Monat, ein Build dauert ca. 10 min). Die Konfiguration steht in
`codemagic.yaml`.

## Einmalige Einrichtung

### 1. Apple Developer Program
- Anmelden unter developer.apple.com/programs (99 USD/Jahr, Freischaltung 1–2 Tage).

### 2. Bundle-ID festlegen
- Die App-ID ist aktuell `ch.lumikids.app` (Platzhalter). Wenn du eine andere willst
  (z. B. eigene Domain rückwärts), **vor dem ersten Upload** ändern in:
  `capacitor.config.ts`, `codemagic.yaml` (`bundle_identifier`) und
  `ios/App/App.xcodeproj/project.pbxproj` (`PRODUCT_BUNDLE_IDENTIFIER`, 2×).
- Danach unter developer.apple.com → Identifiers die App-ID registrieren.

### 3. App in App Store Connect anlegen
- appstoreconnect.apple.com → Apps → „+“ → Neue App: Plattform iOS, Name „Galip“
  (Name muss im Store frei sein!), Sprache Deutsch, Bundle-ID wählen.
- Die numerische **Apple-ID** der App (App-Informationen) in `codemagic.yaml` bei
  `APP_STORE_APPLE_ID` eintragen.

### 4. API-Schlüssel für Codemagic
- App Store Connect → Benutzer und Zugriff → Integrationen → App Store Connect API →
  Schlüssel erstellen, Rolle **App Manager**. `.p8`-Datei herunterladen (nur einmal möglich!),
  Issuer-ID und Key-ID notieren.

### 5. Code auf GitHub
- Privates Repository erstellen und das Projekt hochladen (Codemagic baut aus Git).

### 6. Codemagic
- codemagic.io mit GitHub anmelden, Repository hinzufügen („Capacitor App“ → `codemagic.yaml` wird erkannt).
- Team settings → Integrations → Developer Portal → API-Schlüssel hinzufügen,
  Name exakt: **Lumi App Store Connect**.
- Team settings → Code signing identities → iOS certificates → „Generate certificate“
  (Typ Apple Distribution), dann iOS provisioning profiles → „Fetch profiles“.

## Einen Build auslösen

```sh
git tag v1.0.0
git push origin v1.0.0
```

Oder in Codemagic manuell „Start new build“. Nach ~10 min ist der Build in TestFlight.
Auf dem iPad die App **TestFlight** installieren und Galip testen.

## Vor der Einreichung (App Store Connect)

- **Kategorie:** Bildung, Unterkategorie *Kinder* → Altersgruppe **5 und jünger**.
- **App-Datenschutz:** „Keine Daten erfasst“ (stimmt: kein Tracking, keine Server, keine Konten).
- **Datenschutzerklärung-URL:** Pflicht, auch ohne Datenerfassung (z. B. GitHub Pages).
- **Preis:** Kostenlos. Keine In-App-Käufe.
- **Screenshots:** iPad 13" (2064×2752 bzw. Querformat 2752×2064), mind. 3 Stück.
- **Altersfreigabe-Fragebogen:** überall „Keine“ → 4+.
- **Test-Hinweis für Apple:** Eltern-Gate erklären („Für Eltern“ → ausgeschriebene Zahl eintippen).

## Lokale Befehle

| Befehl          | Wofür                                                     |
| --------------- | --------------------------------------------------------- |
| `yarn ios:sync` | Web-App bauen und ins iOS-Projekt kopieren                |
| `yarn assets`   | App-Icon und Startbildschirm aus `scripts/make-assets.mjs` neu erzeugen |
| `yarn voice:lines` | Liste aller Sprachaufnahmen erzeugen (siehe `AUDIO.md`) |

Der Ordner `ios/` gehört ins Git-Repository, er ist das native Xcode-Projekt.

## Android (Google Play)

Der Workflow `android-play` in `codemagic.yaml` baut ein signiertes `.aab` bei jedem Tag `v*`.

1. **Upload-Keystore** liegt lokal in `~/galip-keys/` (nicht im Git!). In Codemagic unter
   Team settings → Code signing identities → Android keystores hochladen, Referenzname
   **galip_keystore**, Key-Alias `galip-upload`, Passwörter siehe `zugangsdaten.txt`.
2. Play Console → App erstellen („Galip“, Paketname `ch.lumikids.app`), Play App Signing aktivieren.
3. Den **ersten** Upload macht man von Hand: Codemagic-Artefakt `.aab` herunterladen →
   Testen → Interner Test → Release erstellen. Danach optional Service-Account-Automatik
   (Block `publishing` in der YAML).
4. Versionscode kommt aus der Zeit (`BUILD_NUMBER`), steigt also automatisch.
