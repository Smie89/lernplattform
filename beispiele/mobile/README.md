# Mini-Shop als Android-App mit Appium-Tests

Beispielprojekt zum Bereich **Testautomation → Mobile Apps mit Appium** der Lernplattform.

| Ordner / Datei | Inhalt |
|---|---|
| `app/` | Android-App in Java, ohne Bibliotheken: Produkte, Warenkorb, Rabatt, Bestellung – gleiche Regeln wie der Web-Shop |
| `app/src/test/` | JUnit-Tests der Logik – laufen auf der JVM in Sekunden, ohne Emulator |
| `tests/` | Ende-zu-Ende-Tests mit Appium (UiAutomator2) und pytest, Screen Object in `screens.py` |
| `ci-tests.sh` | startet Appium, führt die Tests aus, beendet Appium (für die CI) |

## Voraussetzungen

- JDK 17 oder neuer, Android SDK (z. B. über Android Studio), `ANDROID_HOME` gesetzt
- Gradle 8.10 (oder Android Studio)
- Node.js 22.22+ für Appium
- Python 3.10+

## Bauen und testen

```bash
gradle testDebugUnitTest assembleDebug          # Unit-Tests und APK

npm install -g appium@4.0.2
appium driver install uiautomator2@10.4.0
appium &                                         # Server auf Port 4723

emulator -avd <Name> -no-window &                # oder ein Gerät per USB mit aktiviertem USB-Debugging
adb wait-for-device

pip install -r requirements.txt
pytest -v
```

## Vier Befunde beim Schreiben der Tests

- `driver.background_app(2)` holte die App auf dem Emulator nur manchmal zurück. Stabil: in den Hintergrund,
  warten, `activate_app` und prüfen, dass die App im Vordergrund ist (`test_zustand.py`).
- Passt die ganze Seite auf den Bildschirm, gilt die ScrollView manchmal nicht als scrollbar – die Suche mit
  `UiScrollable` fand dann sichtbare Elemente nicht. Das Screen Object sucht deshalb erst direkt und scrollt nur
  bei Bedarf (`screens.py`).
- Nur in der CI (kleiner Emulator, Querformat): `UiScrollable` wischte so nah am unteren Rand, dass die
  Gestensteuerung von Android die App auf den Startbildschirm schickte (logcat: „Gesture Monitor swipe-up is
  stealing touch“). Das Screen Object wischt deshalb selbst, mit Abstand zu den Rändern.
- Nach dem Drehen war ein eben gefundenes Element manchmal schon veraltet (`StaleElementReferenceException`).
  Das Screen Object liest Werte deshalb mit Wiederholung (`_wiederholt`).

Schlägt ein Test fehl, liegen unter `testergebnisse/` ein Screenshot und eine Textdatei mit App-Zustand, aktiver
Activity und Elementbaum; das CI-Skript sichert zusätzlich das Android-Log (`logcat.txt`).
