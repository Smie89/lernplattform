"""Appium-Sitzung für die Tests der Mini-Shop-App.

Voraussetzungen: laufender Emulator (oder angeschlossenes Gerät), Appium-Server mit UiAutomator2-Treiber
(Standard: http://127.0.0.1:4723) und die gebaute App unter app/build/outputs/apk/debug/app-debug.apk.
"""
import os
from pathlib import Path

import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options

APP = Path(__file__).parents[1] / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
APPIUM_URL = os.environ.get("APPIUM_URL", "http://127.0.0.1:4723")
SCREENSHOTS = Path(__file__).parents[1] / "testergebnisse"


@pytest.fixture(scope="session")
def optionen() -> UiAutomator2Options:
    if not APP.exists():
        pytest.fail(f"App fehlt: {APP} – erst 'gradle assembleDebug' ausführen")
    o = UiAutomator2Options()
    o.app = str(APP)
    o.app_package = "de.lernplattform.minishop"
    o.app_activity = ".MainActivity"
    o.auto_grant_permissions = True
    o.new_command_timeout = 120
    o.set_capability("appium:disableWindowAnimation", True)   # Animationen machen Tests langsam und wackelig
    return o


@pytest.fixture(scope="session")
def sitzung(optionen):
    """Eine Appium-Sitzung für alle Tests – das Installieren der App dauert, das Neustarten nicht."""
    driver = webdriver.Remote(APPIUM_URL, options=optionen)
    driver.implicitly_wait(0)   # nur explizite Wartezeiten, siehe screens.py
    yield driver
    driver.quit()


@pytest.fixture
def driver(sitzung, request):
    """Vor jedem Test: App frisch starten (Zustand weg), hochkant. Bei Fehlschlag: Screenshot sichern."""
    sitzung.orientation = "PORTRAIT"
    sitzung.terminate_app("de.lernplattform.minishop")
    sitzung.execute_script("mobile: clearApp", {"appId": "de.lernplattform.minishop"})
    sitzung.activate_app("de.lernplattform.minishop")
    yield sitzung
    bericht = getattr(request.node, "rep_call", None)
    if bericht is not None and bericht.failed:
        SCREENSHOTS.mkdir(exist_ok=True)
        basis = SCREENSHOTS / request.node.name
        sitzung.get_screenshot_as_file(f"{basis}.png")
        # Was war vorn? Lief die App noch? Welche Elemente gab es? – für die Analyse nach dem CI-Lauf
        zustand = sitzung.query_app_state("de.lernplattform.minishop")
        Path(f"{basis}.txt").write_text(
            f"App-Zustand: {zustand} (4 = Vordergrund, 3 = Hintergrund, 1 = beendet)\n"
            f"Aktivität: {sitzung.current_package}/{sitzung.current_activity}\n"
            f"Ausrichtung: {sitzung.orientation}\n\n{sitzung.page_source}",
            encoding="utf-8",
        )


@pytest.hookimpl(wrapper=True)
def pytest_runtest_makereport(item, call):
    """Merkt sich das Ergebnis jeder Phase am Test – für den Screenshot bei Fehlschlag."""
    bericht = yield
    setattr(item, f"rep_{bericht.when}", bericht)
    return bericht
