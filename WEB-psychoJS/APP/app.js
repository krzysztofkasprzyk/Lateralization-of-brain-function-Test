(function () {
  "use strict";

  const APP_VERSION = "Wersja webowa PsychoJS 1.0";
  const VIEWING_DISTANCE_CM = 57;
  const ECCENTRICITY_DEG = 3.5;
  const LETTER_HEIGHT_DEG = 0.5;
  const STORAGE_KEYS = {
    stimuli: "tldt_web_stimuli_v1",
    calibration: "tldt_web_calibration_v1",
    backup: "tldt_web_backup_v1",
    logs: "tldt_web_logs_v1",
  };
  const DEFAULT_STIMULI = {
    wordPairs: [
      ["agenda", "asenga"], ["alibi", "acipi"], ["aura", "aita"], ["kasyno", "kanyso"],
      ["film", "fitz"], ["gala", "dara"], ["garaże", "łapaże"], ["jazz", "jaik"],
      ["jury", "jula"], ["menu", "besu"], ["piano", "pieni"], ["radio", "rapoo"],
      ["snob", "ssib"], ["studio", "slugio"], ["taxi", "taia"], ["wirus", "gilus"],
    ],
    nonwordPairs: [
      ["lara", "vata"], ["sneg", "snik"], ["cadisy", "canisi"], ["eure", "euta"],
      ["janz", "japt"], ["beny", "bevu"], ["asanca", "asande"], ["gitus", "giris"],
      ["turnex", "turmel"], ["slougou", "slougue"], ["vavade", "vavege"], ["pueni", "peani"],
      ["juto", "jula"], ["taht", "tawl"], ["rageu", "rapea"], ["firl", "fibm"],
    ],
    practice: [
      { lvf: "okno", rvf: "okto", correctResponse: "f" },
      { lvf: "lamta", rvf: "lampa", correctResponse: "j" },
      { lvf: "kwiat", rvf: "kwiap", correctResponse: "f" },
      { lvf: "mispa", rvf: "miska", correctResponse: "j" },
      { lvf: "papier", rvf: "papner", correctResponse: "f" },
      { lvf: "serte", rvf: "serce", correctResponse: "j" },
      { lvf: "mleto", rvf: "melko", correctResponse: "space" },
      { lvf: "lamta", rvf: "lanpa", correctResponse: "space" },
      { lvf: "wazom", rvf: "wazun", correctResponse: "space" },
      { lvf: "palec", rvf: "paleg", correctResponse: "f" },
    ],
  };
  const CSV_FIELDS = [
    "participant_ID", "trial_number", "block_number", "trial_type", "LVF_stimulus", "RVF_stimulus",
    "correct_response", "participant_response", "accuracy", "reaction_time_ms",
    "response_time_from_stimulus", "no_response", "date", "time", "refresh_rate",
    "monitor_resolution", "fullscreen", "viewing_distance_cm", "fixation_duration",
    "stimulus_duration", "response_window", "experiment_version", "random_seed",
  ];
  const INSTRUCTION_PAGES = [
    {
      title: "Na czym polega zadanie",
      body: "W każdej próbie zobaczysz dwa bodźce jednocześnie: jeden po lewej, a drugi po prawej stronie punktu fiksacji.\n\nTwoim zadaniem jest zdecydować, po której stronie pojawiło się prawdziwe słowo.",
    },
    {
      title: "Odpowiedzi",
      body: "Jeśli prawdziwe słowo pojawi się po <span class=\"left-key\">LEWEJ</span>, naciśnij <span class=\"left-key\">F</span>.\nJeśli prawdziwe słowo pojawi się po <span class=\"right-key\">PRAWEJ</span>, naciśnij <span class=\"right-key\">J</span>.\nJeśli po obu stronach nie ma prawdziwego słowa, naciśnij <strong>Spację</strong>.",
    },
    {
      title: "Ważne",
      body: "Patrz cały czas na środek ekranu. Bodźce są widoczne bardzo krótko, dlatego reaguj możliwie szybko i dokładnie.\n\nPodczas prób menu pauzy otwiera klawisz <strong>Backspace</strong>.",
    },
    {
      title: "Trening",
      body: "Najpierw pojawi się 10 prób treningowych z informacją zwrotną.\n\nPo treningu zobaczysz podsumowanie, a dopiero potem rozpocznie się część główna z 256 próbami.",
    },
  ];
  const SCREEN_IDS = [
    "screen-home", "screen-config", "screen-calibration", "screen-keyboard", "screen-editor",
    "screen-info", "screen-instructions", "screen-ready", "screen-break", "screen-run",
    "screen-summary", "screen-error", "screen-self-test",
  ];
  const ELEMENT_IDS = [
    "screen-home", "screen-config", "screen-calibration", "screen-keyboard", "screen-editor",
    "screen-info", "screen-instructions", "screen-ready", "screen-break", "screen-run",
    "screen-summary", "screen-error", "screen-self-test", "nav-config", "nav-keyboard",
    "nav-calibration", "nav-editor", "nav-info", "nav-self-test", "home-backup-status",
    "config-form", "participant-id", "csv-name", "practice-count", "main-count",
    "monitor-width-cm", "fixation-ms", "stimulus-ms", "response-ms", "choose-save-file",
    "save-status", "environment-summary", "geometry-summary", "config-error", "config-back",
    "config-keyboard", "config-calibration", "config-editor", "start-button",
    "calibration-environment", "calibration-monitor-width", "calibration-preview",
    "calibration-left", "calibration-right", "save-calibration", "calibration-back",
    "key-card-f", "key-card-j", "key-card-space", "key-card-backspace", "key-status-f",
    "key-status-j", "key-status-space", "key-status-backspace", "keyboard-last-event",
    "keyboard-back", "editor-word-nonword", "editor-nonword-nonword", "editor-practice",
    "editor-error", "save-editor", "reset-editor", "editor-back", "info-platform",
    "info-resolution", "info-refresh", "info-scale", "info-back", "instruction-progress",
    "instruction-title", "instruction-body", "instruction-next", "ready-progress",
    "ready-title", "ready-body", "ready-next", "break-progress", "break-title", "break-body",
    "break-next", "run-stage", "trial-phase-label", "trial-counter", "fixation", "stimulus-left",
    "stimulus-right", "feedback", "pause-overlay", "pause-resume", "pause-fullscreen",
    "pause-abort", "pause-close-app", "confirm-overlay", "confirm-title", "confirm-body",
    "confirm-yes", "confirm-no", "summary-status", "summary-title", "summary-body",
    "summary-download", "summary-download-log", "summary-restart", "error-body",
    "error-download-log", "error-download-csv", "error-restart", "self-test-output",
    "self-test-back", "fullscreen-overlay", "fullscreen-overlay-body",
    "fullscreen-overlay-resume", "fullscreen-overlay-menu",
  ];

  const state = {
    env: null,
    refreshRateLabel: "pomiar...",
    config: null,
    stimuli: cloneStimuli(DEFAULT_STIMULI),
    calibration: { monitorWidthCm: 53.0 },
    instructionIndex: 0,
    readyMode: "",
    phase: "idle",
    practiceTrials: [],
    mainTrials: [],
    currentList: [],
    currentIndex: -1,
    currentTrial: null,
    currentTiming: null,
    awaitingResponse: false,
    paused: false,
    pauseStartedAt: 0,
    breakShown: false,
    rows: [],
    csvHeaderLine: `${CSV_FIELDS.join(",")}\n`,
    csvTextCache: "",
    lastCsvBlobUrl: "",
    lastLogBlobUrl: "",
    fileHandle: null,
    fileWriter: null,
    filePosition: 0,
    backupMeta: null,
    logs: [],
    selfTestMode: false,
    autoPilotEnabled: false,
    autoPilotTimer: 0,
    autoPilotResponseInjected: false,
    fullscreenResumeTimer: 0,
    fullscreenTransitionActive: false,
    fullscreenRecoveryNeeded: false,
    confirmAction: null,
    keyboardTimers: {},
    psycho: {
      enabled: false,
      keyHandlerInstalled: false,
      window: null,
      fixationStim: null,
      leftStim: null,
      rightStim: null,
      rafId: 0,
      lastVisibility: { fixation: false, left: false, right: false },
    },
  };
  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindElements();
    installGlobalErrorHandlers();
    bindEvents();
    loadStoredState();
    renderStimulusEditor();
    refreshFormsFromState();
    state.env = detectEnvironment();
    renderEnvironmentInfo();
    showScreen("screen-home");
    updateBackupNotice();
    updateSaveStatus();
    try {
      state.refreshRateLabel = await measureRefreshRate();
    } catch (_error) {
      state.refreshRateLabel = "nie udało się zmierzyć";
    }
    renderEnvironmentInfo();
    updateGeometrySummary();
    if (!psychoJsAssetsAvailable()) {
      logEvent("ERROR", "Nie znaleziono lokalnych bibliotek PsychoJS. Wersja WEB-psychoJS nie uruchomi etapu prób.");
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("self_test") === "1") {
      state.selfTestMode = true;
      showScreen("screen-self-test");
      runSelfTests();
      return;
    }
    if (params.get("e2e_test") === "1") {
      state.selfTestMode = true;
      state.autoPilotEnabled = true;
      showScreen("screen-self-test");
      runE2ETest();
      return;
    }
  }

  function bindElements() {
    ELEMENT_IDS.forEach((id) => {
      elements[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    elements["nav-config"].addEventListener("click", openConfigScreen);
    elements["nav-keyboard"].addEventListener("click", openKeyboardScreen);
    elements["nav-calibration"].addEventListener("click", openCalibrationScreen);
    elements["nav-editor"].addEventListener("click", openEditorScreen);
    elements["nav-info"].addEventListener("click", openInfoScreen);
    elements["nav-self-test"].addEventListener("click", () => {
      showScreen("screen-self-test");
      runSelfTests();
    });
    elements["participant-id"].addEventListener("input", hydrateDefaultFileName);
    elements["monitor-width-cm"].addEventListener("input", syncCalibrationFields);
    elements["calibration-monitor-width"].addEventListener("input", syncConfigMonitorWidth);
    elements["config-form"].addEventListener("submit", onStartRequested);
    elements["choose-save-file"].addEventListener("click", chooseSaveFile);
    elements["config-back"].addEventListener("click", resetToMenu);
    elements["config-keyboard"].addEventListener("click", openKeyboardScreen);
    elements["config-calibration"].addEventListener("click", openCalibrationScreen);
    elements["config-editor"].addEventListener("click", openEditorScreen);
    elements["save-calibration"].addEventListener("click", saveCalibration);
    elements["calibration-back"].addEventListener("click", openConfigScreen);
    elements["keyboard-back"].addEventListener("click", resetToMenu);
    elements["save-editor"].addEventListener("click", saveStimulusEditor);
    elements["reset-editor"].addEventListener("click", resetStimulusEditor);
    elements["editor-back"].addEventListener("click", openConfigScreen);
    elements["info-back"].addEventListener("click", resetToMenu);
    elements["instruction-next"].addEventListener("click", advanceInstruction);
    elements["ready-next"].addEventListener("click", advanceReady);
    elements["break-next"].addEventListener("click", continueAfterBreak);
    elements["pause-resume"].addEventListener("click", resumeFromPause);
    elements["pause-fullscreen"].addEventListener("click", toggleFullscreen);
    elements["pause-abort"].addEventListener("click", () => {
      openConfirm("Zakończyć test?", "Jeśli zakończysz test teraz, bieżąca sesja zostanie przerwana. Wyniki pozostaną w kopii awaryjnej i w wybranym pliku CSV, jeśli był wskazany.", async function () {
        closeConfirm();
        abortExperiment();
      });
    });
    elements["pause-close-app"].addEventListener("click", () => {
      openConfirm("Zamknąć kartę?", "Chrome może zablokować automatyczne zamknięcie karty. Jeśli to się nie uda, zobaczysz komunikat i będzie można wrócić do testu.", function () {
        closeConfirm();
        closeAppAttempt();
      });
    });
    elements["confirm-yes"].addEventListener("click", () => {
      if (typeof state.confirmAction === "function") {
        state.confirmAction();
      }
    });
    elements["confirm-no"].addEventListener("click", closeConfirm);
    elements["summary-download"].addEventListener("click", downloadCsvFallback);
    elements["summary-download-log"].addEventListener("click", downloadLogFile);
    elements["summary-restart"].addEventListener("click", resetToMenu);
    elements["error-download-log"].addEventListener("click", downloadLogFile);
    elements["error-download-csv"].addEventListener("click", downloadCsvFallback);
    elements["error-restart"].addEventListener("click", resetToMenu);
    elements["self-test-back"].addEventListener("click", resetToMenu);
    elements["fullscreen-overlay-resume"].addEventListener("click", () => {
      void resumeFromFullscreenOverlay();
    });
    elements["fullscreen-overlay-menu"].addEventListener("click", resetToMenu);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  }

  function installGlobalErrorHandlers() {
    window.addEventListener("error", (event) => {
      const error = event.error instanceof Error ? event.error : new Error(event.message || "Nieznany błąd");
      handleFatalError(error);
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      handleFatalError(reason);
    });
  }

  function loadStoredState() {
    const storedStimuli = safeParseJson(loadStorage(STORAGE_KEYS.stimuli));
    if (storedStimuli && validateStimuliPayload(storedStimuli).ok) {
      state.stimuli = storedStimuli;
    }
    const storedCalibration = safeParseJson(loadStorage(STORAGE_KEYS.calibration));
    if (storedCalibration && Number.isFinite(Number(storedCalibration.monitorWidthCm))) {
      state.calibration.monitorWidthCm = round1(Number(storedCalibration.monitorWidthCm));
    }
    const storedLogs = safeParseJson(loadStorage(STORAGE_KEYS.logs));
    if (Array.isArray(storedLogs)) {
      state.logs = storedLogs.slice(-200);
    }
  }

  function detectEnvironment() {
    const ua = navigator.userAgent || "";
    const platform = navigator.userAgentData && navigator.userAgentData.platform
      ? navigator.userAgentData.platform
      : navigator.platform || ua;
    let platformLabel = "Nieznany system";
    if (/mac/i.test(platform) || /Mac OS/i.test(ua)) {
      platformLabel = "macOS";
    } else if (/win/i.test(platform)) {
      platformLabel = "Windows";
    } else if (/linux/i.test(platform)) {
      platformLabel = "Linux";
    }
    return {
      platformLabel,
      resolutionLabel: `${window.screen.width} × ${window.screen.height} px`,
      scaleLabel: `${round2(window.devicePixelRatio || 1)}x`,
      userAgent: ua,
    };
  }

  async function measureRefreshRate() {
    return new Promise((resolve, reject) => {
      const samples = [];
      let lastTs = 0;
      let frames = 0;
      function step(ts) {
        if (lastTs) {
          samples.push(ts - lastTs);
        }
        lastTs = ts;
        frames += 1;
        if (frames < 40) {
          requestAnimationFrame(step);
          return;
        }
        if (!samples.length) {
          reject(new Error("Brak próbek odświeżania"));
          return;
        }
        const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        resolve(`${Math.round(1000 / avg)} Hz`);
      }
      requestAnimationFrame(step);
    });
  }

  function renderEnvironmentInfo() {
    if (!state.env) {
      return;
    }
    const envText =
      `Wykryty system: ${state.env.platformLabel}. Rozdzielczość: ${state.env.resolutionLabel}. ` +
      `Skalowanie: ${state.env.scaleLabel}. Szacowane odświeżanie: ${state.refreshRateLabel}.`;
    elements["environment-summary"].textContent =
      `${envText} Przed badaniem koniecznie potwierdź szerokość monitora w centymetrach według specyfikacji producenta.`;
    elements["calibration-environment"].textContent = envText;
    elements["info-platform"].textContent = state.env.platformLabel;
    elements["info-resolution"].textContent = state.env.resolutionLabel;
    elements["info-refresh"].textContent = state.refreshRateLabel;
    elements["info-scale"].textContent = state.env.scaleLabel;
  }

  function refreshFormsFromState() {
    elements["participant-id"].value = elements["participant-id"].value || "ID_01";
    elements["monitor-width-cm"].value = String(state.calibration.monitorWidthCm);
    elements["calibration-monitor-width"].value = String(state.calibration.monitorWidthCm);
    hydrateDefaultFileName();
  }

  function hydrateDefaultFileName() {
    const participantId = sanitizeParticipantId(elements["participant-id"].value || "ID_01");
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    elements["csv-name"].value = `${participantId}_${stamp}.csv`;
  }

  function syncCalibrationFields() {
    elements["calibration-monitor-width"].value = elements["monitor-width-cm"].value;
    updateGeometrySummary();
  }

  function syncConfigMonitorWidth() {
    elements["monitor-width-cm"].value = elements["calibration-monitor-width"].value;
    renderCalibrationPreview();
    updateGeometrySummary();
  }

  function updateGeometrySummary() {
    const widthCm = Number(elements["monitor-width-cm"].value || state.calibration.monitorWidthCm);
    const geometry = computeGeometry(widthCm, window.innerWidth || window.screen.width || 1920);
    elements["geometry-summary"].textContent =
      `Dla szerokości ${round1(widthCm)} cm i odległości ${VIEWING_DISTANCE_CM} cm wysokość liter 0,5° to około ${round1(geometry.fontPx)} px, a ekscentryczność 3,5° to około ${round1(geometry.offsetPx)} px od środka ekranu.`;
    renderCalibrationPreview();
  }

  function renderCalibrationPreview() {
    const widthCm = Number(elements["calibration-monitor-width"].value || state.calibration.monitorWidthCm);
    const geometry = computeGeometry(widthCm, window.innerWidth || window.screen.width || 1920);
    const fontPx = clamp(geometry.fontPx, 18, 54);
    const offsetPx = clamp(geometry.offsetPx, 70, 420);
    elements["calibration-preview"].textContent =
      `Podgląd wykorzystuje ekscentryczność ${ECCENTRICITY_DEG}° i wysokość znaków ${LETTER_HEIGHT_DEG}°. Jeśli szerokość monitora jest błędna, pozycje bodźców również będą błędne.`;
    elements["calibration-left"].style.fontSize = `${fontPx}px`;
    elements["calibration-right"].style.fontSize = `${fontPx}px`;
    elements["calibration-left"].style.left = `calc(50% - ${offsetPx}px)`;
    elements["calibration-right"].style.left = `calc(50% + ${offsetPx}px)`;
  }

  function openConfigScreen() {
    clearConfigError();
    updateSaveStatus();
    updateGeometrySummary();
    showScreen("screen-config");
  }

  function openCalibrationScreen() {
    updateGeometrySummary();
    showScreen("screen-calibration");
  }

  function openKeyboardScreen() {
    resetKeyboardScreen();
    showScreen("screen-keyboard");
  }

  function openEditorScreen() {
    renderStimulusEditor();
    showScreen("screen-editor");
  }

  function openInfoScreen() {
    renderEnvironmentInfo();
    showScreen("screen-info");
  }

  function resetToMenu() {
    clearRunState();
    closeConfirm();
    exitFullscreen().catch(() => {});
    showScreen("screen-home");
    updateBackupNotice();
    clearConfigError();
  }

  function resetKeyboardScreen() {
    ["f", "j", "space", "backspace"].forEach((key) => {
      elements[`key-status-${key}`].textContent = "Oczekuje";
      elements[`key-card-${key}`].classList.remove("key-card-active");
    });
    elements["keyboard-last-event"].textContent = "Ostatni klawisz: brak.";
  }

  function renderStimulusEditor() {
    elements["editor-word-nonword"].value = state.stimuli.wordPairs.map((pair) => pair.join(",")).join("\n");
    elements["editor-nonword-nonword"].value = state.stimuli.nonwordPairs.map((pair) => pair.join(",")).join("\n");
    elements["editor-practice"].value = state.stimuli.practice.map((trial) => `${trial.lvf},${trial.rvf},${trial.correctResponse}`).join("\n");
    elements["editor-error"].classList.add("hidden");
    elements["editor-error"].textContent = "";
  }

  function saveStimulusEditor() {
    try {
      const parsed = {
        wordPairs: parsePairLines(elements["editor-word-nonword"].value, 16, "słowo,antysłowo"),
        nonwordPairs: parsePairLines(elements["editor-nonword-nonword"].value, 16, "antysłowo,antysłowo"),
        practice: parsePracticeLines(elements["editor-practice"].value, 10),
      };
      const validation = validateStimuliPayload(parsed);
      if (!validation.ok) {
        throw new Error(validation.message);
      }
      state.stimuli = parsed;
      saveStorage(STORAGE_KEYS.stimuli, JSON.stringify(state.stimuli));
      elements["editor-error"].classList.add("hidden");
      logEvent("INFO", "Zapisano niestandardowy zestaw bodźców.");
      openConfigScreen();
    } catch (error) {
      elements["editor-error"].textContent = error instanceof Error ? error.message : String(error);
      elements["editor-error"].classList.remove("hidden");
    }
  }

  function resetStimulusEditor() {
    state.stimuli = cloneStimuli(DEFAULT_STIMULI);
    saveStorage(STORAGE_KEYS.stimuli, JSON.stringify(state.stimuli));
    renderStimulusEditor();
  }

  function validateStimuliPayload(payload) {
    if (!payload || !Array.isArray(payload.wordPairs) || payload.wordPairs.length !== 16) {
      return { ok: false, message: "Lista słowo-antysłowo musi zawierać dokładnie 16 par." };
    }
    if (!Array.isArray(payload.nonwordPairs) || payload.nonwordPairs.length !== 16) {
      return { ok: false, message: "Lista antysłowo-antysłowo musi zawierać dokładnie 16 par." };
    }
    if (!Array.isArray(payload.practice) || payload.practice.length !== 10) {
      return { ok: false, message: "Trening musi zawierać dokładnie 10 prób." };
    }
    return { ok: true };
  }

  function parsePairLines(rawValue, expectedCount, label) {
    const rows = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (rows.length !== expectedCount) {
      throw new Error(`Sekcja ${label} musi mieć dokładnie ${expectedCount} wierszy.`);
    }
    return rows.map((line, index) => {
      const parts = line.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
      if (parts.length !== 2) {
        throw new Error(`Wiersz ${index + 1} w sekcji ${label} powinien zawierać dokładnie dwa elementy oddzielone przecinkiem.`);
      }
      return [parts[0], parts[1]];
    });
  }

  function parsePracticeLines(rawValue, expectedCount) {
    const rows = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (rows.length !== expectedCount) {
      throw new Error(`Sekcja treningowa musi mieć dokładnie ${expectedCount} wierszy.`);
    }
    return rows.map((line, index) => {
      const parts = line.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
      if (parts.length !== 3) {
        throw new Error(`Wiersz ${index + 1} w treningu powinien mieć format: LVF,RVF,F/J/space.`);
      }
      const response = normalizeStoredResponse(parts[2]);
      if (!response) {
        throw new Error(`Wiersz ${index + 1} w treningu ma niepoprawną odpowiedź. Dozwolone: F, J, space.`);
      }
      return { lvf: parts[0], rvf: parts[1], correctResponse: response };
    });
  }

  function saveCalibration() {
    try {
      const widthCm = parseMonitorWidth(elements["calibration-monitor-width"].value);
      state.calibration.monitorWidthCm = round1(widthCm);
      elements["monitor-width-cm"].value = String(state.calibration.monitorWidthCm);
      saveStorage(STORAGE_KEYS.calibration, JSON.stringify(state.calibration));
      updateGeometrySummary();
      logEvent("INFO", `Zapisano kalibrację monitora: ${state.calibration.monitorWidthCm} cm.`);
      openConfigScreen();
    } catch (error) {
      handleNonFatalMessage(error instanceof Error ? error.message : String(error));
    }
  }

  function parseMonitorWidth(rawValue) {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 20 || value > 120) {
      throw new Error("Szerokość monitora musi być liczbą z zakresu 20-120 cm.");
    }
    return value;
  }

  async function onStartRequested(event) {
    event.preventDefault();
    clearConfigError();
    try {
      if (!psychoJsAssetsAvailable()) {
        throw new Error("Brakuje lokalnych bibliotek PsychoJS. Sprawdź, czy folder APP/lib został poprawnie rozpakowany.");
      }
      const widthCm = parseMonitorWidth(elements["monitor-width-cm"].value);
      state.calibration.monitorWidthCm = round1(widthCm);
      saveStorage(STORAGE_KEYS.calibration, JSON.stringify(state.calibration));
      await prepareSessionFromConfig(readConfig());
      await enterFullscreenForRun(true);
      state.phase = "instructions";
      state.instructionIndex = 0;
      renderInstructionPage();
      showScreen("screen-instructions");
    } catch (error) {
      showConfigError(error instanceof Error ? error.message : String(error));
    }
  }

  async function prepareSessionFromConfig(config) {
    state.config = config;
    state.practiceTrials = buildPracticeTrials(state.config.randomSeed + 1);
    state.mainTrials = buildMainTrials(state.config.leftKey, state.config.rightKey, state.config.randomSeed);
    state.rows = [];
    state.csvTextCache = "";
    state.backupMeta = { sessionId: `${state.config.participantId}_${Date.now()}`, createdAt: new Date().toISOString() };
    persistBackup();
    buildCsvDownloadBlob();
  }

  function readConfig() {
    const participantId = sanitizeParticipantId(elements["participant-id"].value);
    if (!participantId) {
      throw new Error("Wpisz poprawne ID uczestnika.");
    }
    const csvName = normalizeCsvName(elements["csv-name"].value, participantId);
    const fixationMs = parsePositiveInt(elements["fixation-ms"].value, "Ustaw poprawny czas fiksacji.");
    const stimulusMs = parsePositiveInt(elements["stimulus-ms"].value, "Ustaw poprawny czas prezentacji bodźców.");
    const responseMs = parsePositiveInt(elements["response-ms"].value, "Ustaw poprawny czas okna odpowiedzi.");
    if (Number(elements["practice-count"].value) !== 10 || Number(elements["main-count"].value) !== 256) {
      throw new Error("Ta wersja procedury wymaga dokładnie 10 prób treningowych i 256 prób głównych.");
    }
    if (responseMs <= stimulusMs) {
      throw new Error("Okno odpowiedzi musi być dłuższe niż ekspozycja bodźców.");
    }
    return {
      participantId,
      csvName,
      leftKey: "f",
      rightKey: "j",
      fixationMs,
      stimulusMs,
      responseMs,
      practiceCount: 10,
      mainCount: 256,
      monitorWidthCm: state.calibration.monitorWidthCm,
      randomSeed: generateSeed(),
      refreshRate: state.refreshRateLabel,
      monitorResolution: state.env ? state.env.resolutionLabel.replace(" × ", "x").replace(" px", "") : `${window.screen.width}x${window.screen.height}`,
    };
  }

  function parsePositiveInt(rawValue, message) {
    const value = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(message);
    }
    return value;
  }

  function buildPracticeTrials(seed) {
    const rng = mulberry32(seed);
    const trials = state.stimuli.practice.map((trial, index) => ({
      phase: "practice",
      trialNumber: index + 1,
      blockNumber: 0,
      trialType: "practice",
      lvfStimulus: trial.lvf,
      rvfStimulus: trial.rvf,
      correctResponse: trial.correctResponse,
    }));
    return shuffleCopy(trials, rng);
  }

  function buildMainTrials(leftKey, rightKey, seed) {
    const uniqueTrials = [];
    state.stimuli.wordPairs.forEach(([word, nonword]) => {
      uniqueTrials.push({ phase: "main", trialType: "word_nonword", lvfStimulus: word, rvfStimulus: nonword, correctResponse: leftKey });
      uniqueTrials.push({ phase: "main", trialType: "nonword_word", lvfStimulus: nonword, rvfStimulus: word, correctResponse: rightKey });
    });
    state.stimuli.nonwordPairs.forEach(([a, b]) => {
      uniqueTrials.push({ phase: "main", trialType: "nonword_nonword", lvfStimulus: a, rvfStimulus: b, correctResponse: "space" });
      uniqueTrials.push({ phase: "main", trialType: "nonword_nonword", lvfStimulus: b, rvfStimulus: a, correctResponse: "space" });
    });
    const repeated = [];
    for (let repeat = 0; repeat < 4; repeat += 1) {
      uniqueTrials.forEach((trial) => repeated.push({ ...trial }));
    }
    const shuffled = shuffleCopy(repeated, mulberry32(seed));
    return shuffled.map((trial, index) => ({ ...trial, trialNumber: index + 1, blockNumber: index + 1 <= 128 ? 1 : 2 }));
  }

  function renderInstructionPage() {
    const page = INSTRUCTION_PAGES[state.instructionIndex];
    elements["instruction-progress"].textContent = `${state.instructionIndex + 1} / ${INSTRUCTION_PAGES.length}`;
    elements["instruction-title"].textContent = page.title;
    elements["instruction-body"].innerHTML = page.body;
    maybeAutoAdvanceInstructions();
  }

  function advanceInstruction() {
    if (state.phase !== "instructions") {
      return;
    }
    state.instructionIndex += 1;
    if (state.instructionIndex >= INSTRUCTION_PAGES.length) {
      showReadyScreen("practice");
      return;
    }
    renderInstructionPage();
    maybeAutoAdvanceInstructions();
  }

  function showReadyScreen(mode) {
    state.readyMode = mode;
    if (mode === "practice") {
      elements["ready-progress"].textContent = "Przed treningiem";
      elements["ready-title"].textContent = "Za chwilę rozpocznie się trening";
      elements["ready-body"].textContent =
        "Trening zawiera 10 prób i po każdej próbie pokaże informację zwrotną. Po jego zakończeniu zobaczysz procentowe podsumowanie skuteczności i rozkładu odpowiedzi przed rozpoczęciem części głównej.";
    } else {
      elements["ready-progress"].textContent = "Przed częścią główną";
      elements["ready-title"].textContent = "Za chwilę rozpocznie się część główna";
      elements["ready-body"].textContent =
        "Część główna zawiera 256 prób w dwóch blokach po 128. W połowie pojawi się ekran przerwy. Podczas prób menu pauzy otwiera Backspace.";
    }
    showScreen("screen-ready");
    maybeAutoAdvanceReady();
  }

  async function advanceReady() {
    if (state.readyMode === "practice") {
      await startPractice();
      return;
    }
    if (state.readyMode === "main") {
      await startMain();
    }
  }

  function psychoJsAssetsAvailable() {
    return !!(
      window.psychoJS &&
      psychoJS.core &&
      psychoJS.event &&
      psychoJS.visual &&
      typeof psychoJS.visual.Window === "function" &&
      typeof psychoJS.visual.TextStim === "function"
    );
  }

  function bootstrapPsychoJsGlobals() {
    if (!psychoJsAssetsAvailable()) {
      throw new Error("Nie znaleziono lokalnych plików PsychoJS wymaganych do uruchomienia wersji WEB-psychoJS.");
    }
    psychoJS.debug = false;
    psychoJS.NOT_STARTED = psychoJS.NOT_STARTED || "NOT_STARTED";
    psychoJS.STARTED = psychoJS.STARTED || "STARTED";
    psychoJS.FINISHED = psychoJS.FINISHED || "FINISHED";
    psychoJS.STOPPED = psychoJS.STOPPED || "STOPPED";
    if (!psychoJS.logging) {
      psychoJS.logging = {};
    }
    if (typeof psychoJS.logging.data !== "function") {
      psychoJS.logging.data = function () { return undefined; };
    }
    if (typeof psychoJS.logging.info !== "function") {
      psychoJS.logging.info = function () { return undefined; };
    }
    if (typeof psychoJS.logging.warn !== "function") {
      psychoJS.logging.warn = function () { return undefined; };
    }
    if (typeof psychoJS.logging.error !== "function") {
      psychoJS.logging.error = function () { return undefined; };
    }
    if (!psychoJS.resourceManager) {
      psychoJS.resourceManager = {
        getStatus: function () { return "READY"; },
        setStatusCallback: function () { return undefined; },
      };
    }
  }

  function getRunClockSeconds() {
    if (psychoJsAssetsAvailable() && psychoJS.core && typeof psychoJS.core.getTime === "function") {
      return psychoJS.core.getTime();
    }
    return performance.now() / 1000;
  }

  function normalizePsychoJsKey(keyName) {
    const normalized = String(keyName || "").trim().toLowerCase();
    if (normalized === "f" || normalized === "j" || normalized === "space") {
      return normalized;
    }
    return "";
  }

  function ensurePsychoJsEngine() {
    bootstrapPsychoJsGlobals();
    if (!state.psycho.keyHandlerInstalled) {
      document.addEventListener("keydown", psychoJS.event._keyDownHandler, false);
      state.psycho.keyHandlerInstalled = true;
    }
    if (!state.psycho.window) {
      const runStage = elements["run-stage"];
      const psychoWindow = new psychoJS.visual.Window({
        color: "white",
        colorSpace: "named",
        units: "pix",
        fullscr: false,
      });
      psychoJS.window = psychoWindow;
      psychoWindow._renderer.view.classList.add("psychojs-canvas");
      runStage.insertBefore(psychoWindow._renderer.view, runStage.firstChild);
      state.psycho.window = psychoWindow;
      state.psycho.fixationStim = new psychoJS.visual.TextStim({
        win: psychoWindow,
        name: "fixation",
        text: "+",
        font: "Courier New",
        color: "black",
        colorSpace: "named",
        units: "pix",
        height: 32,
        bold: true,
        autoLog: false,
      });
      state.psycho.leftStim = new psychoJS.visual.TextStim({
        win: psychoWindow,
        name: "lvfStimulus",
        text: "",
        font: "Courier New",
        color: "black",
        colorSpace: "named",
        units: "pix",
        height: 32,
        bold: true,
        autoLog: false,
      });
      state.psycho.rightStim = new psychoJS.visual.TextStim({
        win: psychoWindow,
        name: "rvfStimulus",
        text: "",
        font: "Courier New",
        color: "black",
        colorSpace: "named",
        units: "pix",
        height: 32,
        bold: true,
        autoLog: false,
      });
    }
    state.psycho.enabled = true;
    resizePsychoJsStage();
    clearPsychoJsEvents();
  }

  function clearPsychoJsEvents() {
    if (psychoJsAssetsAvailable() && psychoJS.event && typeof psychoJS.event.clearEvents === "function") {
      psychoJS.event.clearEvents();
    }
  }

  function clearAutoPilotTimer() {
    if (state.autoPilotTimer) {
      window.clearTimeout(state.autoPilotTimer);
      state.autoPilotTimer = 0;
    }
  }

  function clearFullscreenResumeTimer() {
    if (state.fullscreenResumeTimer) {
      window.clearTimeout(state.fullscreenResumeTimer);
      state.fullscreenResumeTimer = 0;
    }
  }

  function scheduleAutoPilotAction(callback, delayMs) {
    if (!state.autoPilotEnabled) {
      return;
    }
    clearAutoPilotTimer();
    state.autoPilotTimer = window.setTimeout(() => {
      state.autoPilotTimer = 0;
      try {
        callback();
      } catch (error) {
        handleFatalError(error);
      }
    }, delayMs);
  }

  function maybeAutoAdvanceInstructions() {
    if (!state.autoPilotEnabled || state.phase !== "instructions") {
      return;
    }
    scheduleAutoPilotAction(() => advanceInstruction(), 25);
  }

  function maybeAutoAdvanceReady() {
    if (!state.autoPilotEnabled || !isScreenVisible("screen-ready")) {
      return;
    }
    scheduleAutoPilotAction(() => {
      void advanceReady();
    }, 25);
  }

  function maybeAutoAdvanceBreak() {
    if (!state.autoPilotEnabled || !(state.phase === "practice-summary" || state.phase === "main-break")) {
      return;
    }
    scheduleAutoPilotAction(() => {
      void continueAfterBreak();
    }, 25);
  }

  function getAutoPilotKeyDescriptor(correctResponse) {
    if (correctResponse === "f") {
      return { code: "KeyF", key: "f", keyCode: 70 };
    }
    if (correctResponse === "j") {
      return { code: "KeyJ", key: "j", keyCode: 74 };
    }
    return { code: "Space", key: " ", keyCode: 32 };
  }

  function injectAutoPilotResponse(timing) {
    if (!state.autoPilotEnabled || state.autoPilotResponseInjected || !window.psychoJS || !psychoJS._keyBuffer || !state.currentTrial) {
      return;
    }
    const descriptor = getAutoPilotKeyDescriptor(state.currentTrial.correctResponse);
    const responseDelayMs = Math.min(
      Math.max(state.config.stimulusMs + 12, 20),
      Math.max(20, state.config.responseMs - 8)
    );
    psychoJS._keyBuffer.push({
      code: descriptor.code,
      key: descriptor.key,
      keyCode: descriptor.keyCode,
      timestamp: timing.stimulusOnsetAt + (responseDelayMs / 1000),
    });
    state.autoPilotResponseInjected = true;
  }

  function resizePsychoJsStage() {
    if (!state.psycho.window) {
      return;
    }
    const runStage = elements["run-stage"];
    const width = Math.max(Math.floor(runStage.clientWidth || window.innerWidth || 1280), 800);
    const height = Math.max(Math.floor(runStage.clientHeight || window.innerHeight || 720), 600);
    const renderer = state.psycho.window._renderer;
    const container = state.psycho.window._container;
    renderer.resize(width, height);
    renderer.view.style.position = "absolute";
    renderer.view.style.left = "0";
    renderer.view.style.top = "0";
    renderer.view.style.width = "100%";
    renderer.view.style.height = "100%";
    container.position.x = width / 2;
    container.position.y = height / 2;
    container.scale.y = -1;
    updatePsychoStimGeometry();
    renderPsychoJsFrame(false, false, false);
  }

  function updatePsychoStimGeometry() {
    if (!state.psycho.window || !state.psycho.fixationStim || !state.psycho.leftStim || !state.psycho.rightStim) {
      return;
    }
    const widthPx = Math.max(state.psycho.window.size[0] || 0, elements["run-stage"].clientWidth || 0, 1280);
    const geometry = computeGeometry(state.config ? state.config.monitorWidthCm : state.calibration.monitorWidthCm, widthPx);
    const fontPx = clamp(geometry.fontPx, 20, 56);
    const offsetPx = clamp(geometry.offsetPx, 80, widthPx * 0.32);
    state.psycho.fixationStim.setHeight(fontPx);
    state.psycho.fixationStim.setPos([0, 0]);
    state.psycho.leftStim.setHeight(fontPx);
    state.psycho.leftStim.setPos([-offsetPx, 0]);
    state.psycho.rightStim.setHeight(fontPx);
    state.psycho.rightStim.setPos([offsetPx, 0]);
  }

  function setPsychoStimText(leftText, rightText) {
    if (!state.psycho.leftStim || !state.psycho.rightStim) {
      return;
    }
    state.psycho.leftStim.setText(String(leftText || ""));
    state.psycho.rightStim.setText(String(rightText || ""));
  }

  function setAutoDrawIfNeeded(stimulus, shouldDraw, cacheKey) {
    if (!stimulus) {
      return;
    }
    if (state.psycho.lastVisibility[cacheKey] !== shouldDraw) {
      stimulus.setAutoDraw(shouldDraw);
      state.psycho.lastVisibility[cacheKey] = shouldDraw;
    }
  }

  function renderPsychoJsFrame(showFixation, showLeft, showRight) {
    if (!state.psycho.window) {
      return;
    }
    setAutoDrawIfNeeded(state.psycho.fixationStim, showFixation, "fixation");
    setAutoDrawIfNeeded(state.psycho.leftStim, showLeft, "left");
    setAutoDrawIfNeeded(state.psycho.rightStim, showRight, "right");
    state.psycho.window._refresh();
    state.psycho.window._writeLogOnFlip();
    state.psycho.window._renderer.render(state.psycho.window._container);
  }

  function destroyPsychoJsEngine() {
    if (state.psycho.rafId) {
      window.cancelAnimationFrame(state.psycho.rafId);
      state.psycho.rafId = 0;
    }
    if (state.psycho.keyHandlerInstalled && psychoJsAssetsAvailable()) {
      document.removeEventListener("keydown", psychoJS.event._keyDownHandler, false);
      state.psycho.keyHandlerInstalled = false;
    }
    if (state.psycho.window) {
      try {
        renderPsychoJsFrame(false, false, false);
      } catch (_error) {
        // Ignore teardown render errors.
      }
      try {
        state.psycho.window.close();
      } catch (_error) {
        // Ignore close errors.
      }
    }
    state.psycho.enabled = false;
    state.psycho.window = null;
    state.psycho.fixationStim = null;
    state.psycho.leftStim = null;
    state.psycho.rightStim = null;
    state.psycho.lastVisibility = { fixation: false, left: false, right: false };
  }

  function runPsychoJsSmokeTest() {
    ensurePsychoJsEngine();
    setPsychoStimText("agenda", "asenga");
    renderPsychoJsFrame(true, false, false);
    renderPsychoJsFrame(false, true, true);
    renderPsychoJsFrame(false, false, false);
    destroyPsychoJsEngine();
  }

  async function startPractice() {
    state.phase = "practice";
    state.currentList = state.practiceTrials.slice();
    state.currentIndex = -1;
    state.breakShown = false;
    await enterFullscreenForRun();
    showScreen("screen-run");
    applyRunLayout();
    runNextTrial();
  }

  async function startMain() {
    state.phase = "main";
    state.currentList = state.mainTrials.slice();
    state.currentIndex = -1;
    state.breakShown = false;
    await enterFullscreenForRun();
    showScreen("screen-run");
    applyRunLayout();
    runNextTrial();
  }

  function runNextTrial() {
    clearRunSurface();
    if (state.phase === "practice") {
      state.currentIndex += 1;
      if (state.currentIndex >= state.currentList.length) {
        showPracticeSummary();
        return;
      }
      state.currentTrial = state.currentList[state.currentIndex];
      updateCounter("TRENING", `${state.currentIndex + 1} / ${state.currentList.length}`);
      startTrialAnimation();
      return;
    }
    if (state.phase === "main") {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex === 128 && !state.breakShown) {
        state.breakShown = true;
        showMidwayBreak();
        return;
      }
      state.currentIndex = nextIndex;
      if (state.currentIndex >= state.currentList.length) {
        finishExperiment("completed");
        return;
      }
      state.currentTrial = state.currentList[state.currentIndex];
      updateCounter("BADANIE", `${state.currentIndex + 1} / ${state.currentList.length}`);
      startTrialAnimation();
    }
  }

  function updateCounter(phaseLabel, progressLabel) {
    elements["trial-phase-label"].textContent = phaseLabel;
    elements["trial-counter"].textContent = progressLabel;
  }

  function clearRunSurface() {
    state.awaitingResponse = false;
    state.currentTiming = null;
    state.autoPilotResponseInjected = false;
    state.fullscreenTransitionActive = false;
    clearFullscreenResumeTimer();
    if (state.psycho.rafId) {
      window.cancelAnimationFrame(state.psycho.rafId);
      state.psycho.rafId = 0;
    }
    clearPsychoJsEvents();
    renderPsychoJsFrame(false, false, false);
    hide(elements["fixation"]);
    hide(elements["stimulus-left"]);
    hide(elements["stimulus-right"]);
    hide(elements["feedback"]);
    hide(elements["pause-overlay"]);
    elements["feedback"].textContent = "";
    elements["stimulus-left"].textContent = "";
    elements["stimulus-right"].textContent = "";
  }

  function startTrialAnimation() {
    ensurePsychoJsEngine();
    const config = state.config;
    const startAt = getRunClockSeconds();
    state.currentTiming = {
      fixationEndsAt: startAt + (config.fixationMs / 1000),
      stimulusOnsetAt: startAt + (config.fixationMs / 1000),
      stimulusEndsAt: startAt + ((config.fixationMs + config.stimulusMs) / 1000),
      responseEndsAt: startAt + ((config.fixationMs + config.responseMs) / 1000),
    };
    state.awaitingResponse = true;
    state.paused = false;
    state.autoPilotResponseInjected = false;
    elements["stimulus-left"].textContent = state.currentTrial.lvfStimulus;
    elements["stimulus-right"].textContent = state.currentTrial.rvfStimulus;
    setPsychoStimText(state.currentTrial.lvfStimulus, state.currentTrial.rvfStimulus);
    updatePsychoStimGeometry();
    clearPsychoJsEvents();
    renderPsychoJsFrame(false, false, false);

    function tick() {
      if (!state.awaitingResponse || !state.currentTiming) {
        return;
      }
      if (state.paused) {
        state.psycho.rafId = requestAnimationFrame(tick);
        return;
      }
      const timing = state.currentTiming;
      const now = getRunClockSeconds();
      const showFixation = now < timing.fixationEndsAt;
      const showStimulus = now >= timing.stimulusOnsetAt && now < timing.stimulusEndsAt;
      renderPsychoJsFrame(showFixation, showStimulus, showStimulus);
      if (now >= timing.stimulusOnsetAt) {
        injectAutoPilotResponse(timing);
        const capturedKeys = psychoJS.event.getKeys({ keyList: ["f", "j", "space"], timeStamped: true });
        if (capturedKeys.length > 0) {
          const lastKey = capturedKeys[capturedKeys.length - 1];
          const pressedKey = normalizePsychoJsKey(lastKey[0]);
          if (pressedKey) {
            const responseMs = Math.max(0, (lastKey[1] - timing.stimulusOnsetAt) * 1000);
            completeTrial(pressedKey, responseMs, 0);
            return;
          }
        }
      }
      if (now >= timing.responseEndsAt) {
        renderPsychoJsFrame(false, false, false);
        completeTrial("", null, 1);
        return;
      }
      state.psycho.rafId = requestAnimationFrame(tick);
    }

    state.psycho.rafId = requestAnimationFrame(tick);
  }

  async function completeTrial(pressedKey, responseTimeFromStimulus, noResponse) {
    state.awaitingResponse = false;
    hide(elements["fixation"]);
    hide(elements["stimulus-left"]);
    hide(elements["stimulus-right"]);
    const row = buildRow(state.currentTrial, pressedKey, responseTimeFromStimulus, noResponse);
    state.rows.push(row);
    state.csvTextCache = buildCsvText();
    persistBackup();
    await appendCsvRow(row);
    if (state.phase === "practice") {
      const feedback = buildPracticeFeedback(row, state.currentTrial.correctResponse);
      await showFeedback(feedback.text, feedback.className);
    }
    runNextTrial();
  }

  function buildPracticeFeedback(row, correctResponse) {
    if (row.no_response === 1) {
      return { text: "Nie udzielono odpowiedzi", className: "feedback-warning" };
    }
    if (correctResponse === "space" && row.participant_response === "SPACJA") {
      return { text: "Poprawnie - po obu stronach nie było słowa", className: "feedback-success" };
    }
    if (row.accuracy === 1) {
      return { text: "Poprawnie", className: "feedback-success" };
    }
    if (correctResponse === "space") {
      return { text: "Błędnie - obie strony były niepoprawne", className: "feedback-danger" };
    }
    return { text: "Błędnie", className: "feedback-danger" };
  }

  function showFeedback(message, className) {
    return new Promise((resolve) => {
      elements["feedback"].textContent = message;
      elements["feedback"].className = `feedback ${className}`;
      show(elements["feedback"]);
      window.setTimeout(() => {
        hide(elements["feedback"]);
        elements["feedback"].className = "feedback hidden";
        resolve();
      }, 700);
    });
  }

  function buildRow(trial, pressedKey, responseTimeFromStimulus, noResponse) {
    const now = new Date();
    const responseLabel = responseToCsvLabel(pressedKey);
    const responseFromStimulus = responseTimeFromStimulus == null ? "" : formatMs(responseTimeFromStimulus);
    const reactionTime = responseTimeFromStimulus == null ? "" : formatMs(responseTimeFromStimulus);
    return {
      participant_ID: state.config.participantId,
      trial_number: trial.trialNumber,
      block_number: trial.blockNumber,
      trial_type: trial.trialType,
      LVF_stimulus: trial.lvfStimulus,
      RVF_stimulus: trial.rvfStimulus,
      correct_response: responseToCsvLabel(trial.correctResponse),
      participant_response: responseLabel,
      accuracy: noResponse ? 0 : Number(pressedKey === trial.correctResponse),
      reaction_time_ms: reactionTime,
      response_time_from_stimulus: responseFromStimulus,
      no_response: noResponse,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      time: formatClockTimeWithMs(now),
      refresh_rate: state.config.refreshRate,
      monitor_resolution: state.config.monitorResolution,
      fullscreen: !!document.fullscreenElement,
      viewing_distance_cm: VIEWING_DISTANCE_CM,
      fixation_duration: state.config.fixationMs,
      stimulus_duration: state.config.stimulusMs,
      response_window: state.config.responseMs,
      experiment_version: APP_VERSION,
      random_seed: state.config.randomSeed,
    };
  }

  async function showPracticeSummary() {
    await exitFullscreen().catch(() => {});
    const rows = state.rows.filter((row) => row.trial_type === "practice");
    state.phase = "practice-summary";
    elements["break-progress"].textContent = "Po treningu";
    elements["break-title"].textContent = "Trening zakończony";
    elements["break-body"].textContent =
      `Poprawność: ${percent(rows.filter((row) => row.accuracy === 1).length, rows.length)}\n` +
      `Średni czas odpowiedzi od bodźca: ${computeMeanRt(rows)} ms\n` +
      `${buildResponseStatsSummary(rows)}\n\nZa chwilę rozpocznie się część główna badania.`;
    showScreen("screen-break");
    maybeAutoAdvanceBreak();
  }

  async function showMidwayBreak() {
    await exitFullscreen().catch(() => {});
    const rows = state.rows.filter((row) => row.trial_type !== "practice" && row.block_number === 1);
    state.phase = "main-break";
    elements["break-progress"].textContent = "Przerwa";
    elements["break-title"].textContent = "Połowa badania";
    elements["break-body"].textContent =
      `Ukończone próby: 128 / 256\n` +
      `Poprawność: ${percent(rows.filter((row) => row.accuracy === 1).length, rows.length)}\n` +
      `Średni czas odpowiedzi od bodźca: ${computeMeanRt(rows)} ms\n` +
      `${buildResponseStatsSummary(rows)}\n\nNaciśnij Spację albo kliknij, aby rozpocząć drugi blok.`;
    showScreen("screen-break");
    maybeAutoAdvanceBreak();
  }

  async function continueAfterBreak() {
    if (state.phase === "practice-summary") {
      showReadyScreen("main");
      return;
    }
    if (state.phase === "main-break") {
      state.phase = "main";
      await enterFullscreenForRun();
      showScreen("screen-run");
      applyRunLayout();
      runNextTrial();
    }
  }

  async function finishExperiment(status) {
    state.awaitingResponse = false;
    clearRunState();
    await exitFullscreen().catch(() => {});
    await closeCsvWriter();
    buildCsvDownloadBlob();
    buildLogBlob();
    persistBackup();
    const practiceRows = state.rows.filter((row) => row.trial_type === "practice");
    const mainRows = state.rows.filter((row) => row.trial_type !== "practice");
    const saveInfo = state.fileHandle
      ? `Dane były dopisywane do wybranego pliku CSV: ${state.fileHandle.name}.`
      : "Nie wybrano pliku bezpośredniego zapisu. Dane są dostępne do pobrania jako CSV.";
    elements["summary-status"].textContent = status === "completed" ? "Badanie zakończone" : "Test przerwany";
    elements["summary-title"].textContent = status === "completed" ? "Podsumowanie testu" : "Sesja została przerwana";
    elements["summary-body"].textContent =
      `Ukończone próby główne: ${mainRows.length} / ${state.config.mainCount}\n` +
      `Trening - poprawne odpowiedzi: ${percent(practiceRows.filter((row) => row.accuracy === 1).length, practiceRows.length)}\n` +
      `Badanie - poprawne odpowiedzi: ${percent(mainRows.filter((row) => row.accuracy === 1).length, mainRows.length || 1)}\n` +
      `Badanie - średni czas odpowiedzi od bodźca: ${computeMeanRt(mainRows)} ms\n\n` +
      `${saveInfo}\nKopia awaryjna sesji została zapisana w pamięci przeglądarki pod identyfikatorem: ${state.backupMeta ? state.backupMeta.sessionId : "brak"}.`;
    showScreen("screen-summary");
    if (state.selfTestMode && state.autoPilotEnabled) {
      finalizeAutoPilotE2E(status, practiceRows, mainRows);
    }
    if (!state.fileHandle && !state.selfTestMode) {
      downloadCsvFallback();
    }
  }

  function abortExperiment() {
    clearRunState();
    finishExperiment("aborted");
  }

  function clearRunState() {
    state.awaitingResponse = false;
    state.paused = false;
    state.currentTiming = null;
    state.currentTrial = null;
    clearAutoPilotTimer();
    clearFullscreenResumeTimer();
    state.fullscreenTransitionActive = false;
    state.fullscreenRecoveryNeeded = false;
    hide(elements["pause-overlay"]);
    hide(elements["fullscreen-overlay"]);
    closeConfirm();
    destroyPsychoJsEngine();
  }

  function openPauseMenu() {
    if (!state.awaitingResponse || state.paused) {
      return;
    }
    state.paused = true;
    state.pauseStartedAt = getRunClockSeconds();
    clearPsychoJsEvents();
    show(elements["pause-overlay"]);
  }

  function resumeFromPause() {
    if (!state.paused || !state.currentTiming) {
      return;
    }
    const delta = getRunClockSeconds() - state.pauseStartedAt;
    state.currentTiming.fixationEndsAt += delta;
    state.currentTiming.stimulusOnsetAt += delta;
    state.currentTiming.stimulusEndsAt += delta;
    state.currentTiming.responseEndsAt += delta;
    state.paused = false;
    clearPsychoJsEvents();
    hide(elements["pause-overlay"]);
  }

  function openConfirm(title, body, action) {
    state.confirmAction = action;
    elements["confirm-title"].textContent = title;
    elements["confirm-body"].textContent = body;
    show(elements["confirm-overlay"]);
  }

  function closeConfirm() {
    state.confirmAction = null;
    hide(elements["confirm-overlay"]);
  }

  function closeAppAttempt() {
    logEvent("INFO", "Użytkownik wybrał próbę zamknięcia karty.");
    window.close();
    window.setTimeout(() => {
      if (!window.closed) {
        handleNonFatalMessage("Chrome zablokował automatyczne zamknięcie karty. Zamknij kartę ręcznie lub wróć do testu.");
      }
    }, 200);
  }

  async function chooseSaveFile() {
    clearConfigError();
    if (!window.showSaveFilePicker) {
      updateSaveStatus("Ta wersja Chrome nie wspiera bezpośredniego wyboru pliku. CSV będzie można pobrać po zakończeniu.");
      return;
    }
    try {
      const suggestedName = normalizeCsvName(elements["csv-name"].value, sanitizeParticipantId(elements["participant-id"].value || "ID_01"));
      state.fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: "Plik CSV", accept: { "text/csv": [".csv"] } }],
      });
      updateSaveStatus(`Wybrano plik: ${state.fileHandle.name}. Chrome będzie dopisywał dane po każdej próbie.`);
      logEvent("INFO", `Wybrano plik CSV: ${state.fileHandle.name}.`);
    } catch (_error) {
      updateSaveStatus("Nie wybrano pliku. Badanie nadal zapisze kopię awaryjną w przeglądarce.");
    }
  }

  function updateSaveStatus(message) {
    elements["save-status"].textContent = message || (state.fileHandle
      ? `Wybrano plik: ${state.fileHandle.name}. Chrome będzie dopisywał dane po każdej próbie.`
      : "Jeśli chcesz wskazać dokładną lokalizację CSV, kliknij przycisk wyboru pliku. Niezależnie od tego aplikacja zapisuje kopię awaryjną w pamięci przeglądarki.");
  }

  async function appendCsvRow(row) {
    if (!state.fileHandle) {
      return;
    }
    try {
      if (!state.fileWriter) {
        state.fileWriter = await state.fileHandle.createWritable();
        await state.fileWriter.write(state.csvHeaderLine);
        state.filePosition = new TextEncoder().encode(state.csvHeaderLine).length;
      }
      const line = serializeCsvRow(row);
      await state.fileWriter.write({ type: "write", position: state.filePosition, data: line });
      state.filePosition += new TextEncoder().encode(line).length;
    } catch (error) {
      logEvent("WARN", "Nie udało się dopisać wiersza do pliku CSV. Aplikacja przechodzi na kopię awaryjną.", error instanceof Error ? error.stack : String(error));
      state.fileHandle = null;
      state.fileWriter = null;
      state.filePosition = 0;
      updateSaveStatus("Chrome nie pozwolił zapisać do wybranego pliku. Dalszy zapis będzie utrzymywany tylko w kopii awaryjnej.");
    }
  }

  async function closeCsvWriter() {
    if (!state.fileWriter) {
      return;
    }
    try {
      await state.fileWriter.close();
    } catch (_error) {
      // Ignore close errors.
    } finally {
      state.fileWriter = null;
      state.filePosition = 0;
    }
  }

  function buildCsvText() {
    return state.csvHeaderLine + state.rows.map(serializeCsvRow).join("");
  }

  function buildCsvDownloadBlob() {
    if (state.lastCsvBlobUrl) {
      URL.revokeObjectURL(state.lastCsvBlobUrl);
    }
    state.csvTextCache = buildCsvText();
    state.lastCsvBlobUrl = URL.createObjectURL(new Blob([state.csvTextCache], { type: "text/csv;charset=utf-8" }));
  }

  function downloadCsvFallback() {
    if (!state.rows.length) {
      return;
    }
    if (!state.lastCsvBlobUrl) {
      buildCsvDownloadBlob();
    }
    const anchor = document.createElement("a");
    anchor.href = state.lastCsvBlobUrl;
    anchor.download = state.config ? state.config.csvName : "wyniki.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function buildLogBlob() {
    if (state.lastLogBlobUrl) {
      URL.revokeObjectURL(state.lastLogBlobUrl);
    }
    const text = state.logs.map((entry) => `${entry.time} [${entry.level}] ${entry.message}${entry.details ? `\n${entry.details}` : ""}`).join("\n\n");
    state.lastLogBlobUrl = URL.createObjectURL(new Blob([text || "Brak wpisów logu."], { type: "text/plain;charset=utf-8" }));
  }

  function downloadLogFile() {
    buildLogBlob();
    const anchor = document.createElement("a");
    anchor.href = state.lastLogBlobUrl;
    anchor.download = `log_${state.backupMeta ? state.backupMeta.sessionId : Date.now()}.log`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function persistBackup() {
    const payload = {
      meta: state.backupMeta,
      config: state.config,
      rows: state.rows,
      csvName: state.config ? state.config.csvName : "",
      csvText: state.csvTextCache || buildCsvText(),
      logEntries: state.logs,
      updatedAt: new Date().toISOString(),
    };
    saveStorage(STORAGE_KEYS.backup, JSON.stringify(payload));
    updateBackupNotice();
  }

  function updateBackupNotice() {
    const backup = safeParseJson(loadStorage(STORAGE_KEYS.backup));
    elements["home-backup-status"].textContent = !backup || !backup.meta
      ? "Kopia awaryjna wyników będzie zapisywana w pamięci przeglądarki po każdej próbie."
      : `Ostatnia kopia awaryjna: ${backup.meta.sessionId}. Zapis ostatniej zmiany: ${backup.updatedAt || "brak danych"}.`;
  }

  function logEvent(level, message, details) {
    const entry = { time: new Date().toISOString(), level, message, details: details || "" };
    state.logs.push(entry);
    state.logs = state.logs.slice(-200);
    saveStorage(STORAGE_KEYS.logs, JSON.stringify(state.logs));
    if (level === "ERROR") {
      console.error(message, details || "");
    } else if (level === "WARN") {
      console.warn(message, details || "");
    } else {
      console.log(message, details || "");
    }
  }

  function handleNonFatalMessage(message) {
    logEvent("WARN", message);
    if (isScreenVisible("screen-config")) {
      showConfigError(message);
      return;
    }
    window.alert(message);
  }

  function handleFatalError(error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logEvent("ERROR", err.message, err.stack || "");
    destroyPsychoJsEngine();
    buildCsvDownloadBlob();
    buildLogBlob();
    persistBackup();
    closeCsvWriter().catch(() => {});
    exitFullscreen().catch(() => {});
    elements["error-body"].textContent =
      `Treść błędu: ${err.message}\n\n` +
      `Kopia awaryjna sesji została zapisana w pamięci przeglądarki pod identyfikatorem: ${state.backupMeta ? state.backupMeta.sessionId : "brak"}.\n` +
      `${state.fileHandle ? `Wybrany plik CSV: ${state.fileHandle.name}.` : "Nie wskazano pliku bezpośredniego zapisu CSV."}\n\nPobierz log i kopię CSV, a następnie wróć do menu.`;
    if (state.selfTestMode) {
      document.title = "WEB_PSYCHOJS_E2E_TEST_FAIL";
    }
    showScreen("screen-error");
  }

  function onKeyDown(event) {
    const code = event.code || "";
    if (state.selfTestMode) {
      if (code === "Escape") {
        resetToMenu();
      }
      return;
    }
    if (isScreenVisible("screen-keyboard")) {
      if (code === "Space" || code === "Backspace") {
        event.preventDefault();
      }
      handleKeyboardTestKey(event);
      return;
    }
    if (state.fullscreenRecoveryNeeded) {
      if (code === "Space" || code === "Backspace" || code === "Enter") {
        event.preventDefault();
      }
      return;
    }
    if (code === "Backspace" && (state.awaitingResponse || state.paused)) {
      event.preventDefault();
    }
    if (state.phase === "instructions" && code === "Space") {
      event.preventDefault();
      advanceInstruction();
      return;
    }
    if (isScreenVisible("screen-ready") && code === "Space") {
      event.preventDefault();
      advanceReady();
      return;
    }
    if ((state.phase === "practice-summary" || state.phase === "main-break") && code === "Space") {
      event.preventDefault();
      continueAfterBreak();
      return;
    }
    if (code === "Backspace" && state.awaitingResponse) {
      openPauseMenu();
      return;
    }
    if (!state.awaitingResponse || state.paused || !state.currentTiming) {
      return;
    }
    if (state.psycho.enabled) {
      const key = normalizeResponseKey(event);
      if (key) {
        event.preventDefault();
      }
      return;
    }
    const key = normalizeResponseKey(event);
    if (!key) {
      return;
    }
    const now = typeof event.timeStamp === "number" ? event.timeStamp : performance.now();
    if (now < state.currentTiming.stimulusOnsetAt) {
      return;
    }
    event.preventDefault();
    completeTrial(key, now - state.currentTiming.stimulusOnsetAt, 0);
  }

  function handleKeyboardTestKey(event) {
    const response = normalizeResponseKey(event) || (event.code === "Backspace" ? "backspace" : "");
    if (!response) {
      return;
    }
    const labelMap = { f: "F", j: "J", space: "Spacja", backspace: "Backspace" };
    const stamp = formatClockTimeWithMs(new Date());
    elements[`key-status-${response}`].textContent = `Wykryto ${labelMap[response]} o ${stamp}`;
    elements["keyboard-last-event"].textContent = `Ostatni klawisz: ${labelMap[response]} o ${stamp}.`;
    elements[`key-card-${response}`].classList.add("key-card-active");
    clearTimeout(state.keyboardTimers[response]);
    state.keyboardTimers[response] = window.setTimeout(() => {
      elements[`key-card-${response}`].classList.remove("key-card-active");
    }, 450);
  }

  function normalizeResponseKey(event) {
    const key = (event.key || "").toLowerCase();
    if (key === "f") return "f";
    if (key === "j") return "j";
    if (event.code === "Space") return "space";
    return "";
  }

  async function enterFullscreenForRun(required = false) {
    const root = document.documentElement;
    if (state.selfTestMode) {
      resizePsychoJsStage();
      return;
    }
    if (document.fullscreenElement || !root.requestFullscreen) {
      scheduleFullscreenRefresh();
      if (required && !document.fullscreenElement && !root.requestFullscreen) {
        throw new Error("Ta przeglądarka nie pozwala uruchomić badania w trybie pełnoekranowym.");
      }
      return;
    }
    try {
      await root.requestFullscreen();
      scheduleFullscreenRefresh();
    } catch (_error) {
      logEvent("WARN", "Chrome odrzucił włączenie pełnego ekranu.");
      if (required) {
        throw new Error("Aby rozpocząć badanie, włącz pełny ekran i spróbuj ponownie.");
      }
    }
  }

  async function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
    scheduleFullscreenRefresh();
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await exitFullscreen().catch(() => {});
    } else {
      await enterFullscreenForRun();
    }
  }

  function applyRunLayout() {
    const widthPx = Math.max(elements["run-stage"].clientWidth || 0, window.innerWidth || 0, 1280);
    const geometry = computeGeometry(state.config ? state.config.monitorWidthCm : state.calibration.monitorWidthCm, widthPx);
    const fontPx = clamp(geometry.fontPx, 20, 56);
    const offsetPx = clamp(geometry.offsetPx, 80, widthPx * 0.32);
    elements["fixation"].style.fontSize = `${fontPx}px`;
    elements["stimulus-left"].style.fontSize = `${fontPx}px`;
    elements["stimulus-right"].style.fontSize = `${fontPx}px`;
    elements["stimulus-left"].style.left = `calc(50% - ${offsetPx}px)`;
    elements["stimulus-right"].style.left = `calc(50% + ${offsetPx}px)`;
    updatePsychoStimGeometry();
  }

  function handleResize() {
    updateGeometrySummary();
    if (isScreenVisible("screen-run")) {
      applyRunLayout();
      resizePsychoJsStage();
    }
  }

  function scheduleFullscreenRefresh() {
    [50, 150, 300].forEach((delay) => {
      window.setTimeout(handleResize, delay);
    });
  }

  function handleFullscreenChange() {
    scheduleFullscreenRefresh();
    const fullscreenManagedScreen = isScreenVisible("screen-instructions") ||
      isScreenVisible("screen-ready") ||
      isScreenVisible("screen-break") ||
      isScreenVisible("screen-run");
    if (!fullscreenManagedScreen || state.selfTestMode) {
      return;
    }
    if (document.fullscreenElement) {
      if (state.fullscreenRecoveryNeeded) {
        state.fullscreenRecoveryNeeded = false;
        hide(elements["fullscreen-overlay"]);
        if (state.awaitingResponse && state.currentTiming && state.fullscreenTransitionActive) {
          clearFullscreenResumeTimer();
          state.fullscreenResumeTimer = window.setTimeout(() => {
            state.fullscreenResumeTimer = 0;
            if (!state.awaitingResponse || !state.currentTiming || !state.fullscreenTransitionActive) {
              return;
            }
            const delta = getRunClockSeconds() - state.pauseStartedAt;
            state.currentTiming.fixationEndsAt += delta;
            state.currentTiming.stimulusOnsetAt += delta;
            state.currentTiming.stimulusEndsAt += delta;
            state.currentTiming.responseEndsAt += delta;
            state.paused = false;
            state.fullscreenTransitionActive = false;
            clearPsychoJsEvents();
            handleResize();
          }, 220);
        }
      }
      return;
    }
    if (state.awaitingResponse && state.currentTiming && !state.paused) {
      state.paused = true;
      state.pauseStartedAt = getRunClockSeconds();
      state.fullscreenTransitionActive = true;
      clearPsychoJsEvents();
    }
    state.fullscreenRecoveryNeeded = true;
    elements["fullscreen-overlay-body"].textContent =
      "Badanie zostało wstrzymane, ponieważ przeglądarka opuściła tryb pełnoekranowy. Aby kontynuować, wróć do pełnego ekranu. Test nie ruszy dalej, dopóki pełny ekran nie zostanie przywrócony.";
    show(elements["fullscreen-overlay"]);
  }

  async function resumeFromFullscreenOverlay() {
    try {
      await enterFullscreenForRun(true);
    } catch (error) {
      handleNonFatalMessage(error instanceof Error ? error.message : String(error));
    }
    if (document.fullscreenElement) {
      hide(elements["fullscreen-overlay"]);
    }
  }

  function computeGeometry(monitorWidthCm, widthPx) {
    const safeWidthCm = Math.max(20, Number(monitorWidthCm) || 53);
    const safeWidthPx = Math.max(800, Number(widthPx) || window.screen.width || 1920);
    const pxPerCm = safeWidthPx / safeWidthCm;
    return {
      fontPx: visualAngleToCm(LETTER_HEIGHT_DEG) * pxPerCm,
      offsetPx: visualAngleToCm(ECCENTRICITY_DEG) * pxPerCm,
    };
  }

  function visualAngleToCm(angleDeg) {
    return 2 * VIEWING_DISTANCE_CM * Math.tan((angleDeg * Math.PI) / 360);
  }

  function responseToCsvLabel(value) {
    if (!value) return "";
    if (value === "space") return "SPACJA";
    return value.toUpperCase();
  }

  function computeMeanRt(rows) {
    const values = rows.map((row) => Number(row.response_time_from_stimulus)).filter((value) => Number.isFinite(value) && value > 0);
    return values.length ? formatMs(values.reduce((sum, value) => sum + value, 0) / values.length) : "brak";
  }

  function formatClockTimeWithMs(dateValue) {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}.${String(date.getMilliseconds()).padStart(3, "0")}`;
  }

  function buildResponseStatsSummary(rows) {
    const total = rows.length || 1;
    const leftCount = rows.filter((row) => row.participant_response === "F").length;
    const rightCount = rows.filter((row) => row.participant_response === "J").length;
    const spaceCount = rows.filter((row) => row.participant_response === "SPACJA").length;
    const noResponseCount = rows.filter((row) => row.no_response === 1).length;
    return [
      "Rozkład odpowiedzi:",
      `Lewa strona (F): ${percent(leftCount, total)}`,
      `Prawa strona (J): ${percent(rightCount, total)}`,
      `Brak słowa (Spacja): ${percent(spaceCount, total)}`,
      `Brak odpowiedzi: ${percent(noResponseCount, total)}`,
    ].join("\n");
  }

  function percent(part, total) {
    return !total ? "0%" : `${round2((part / total) * 100)}%`;
  }

  function sanitizeParticipantId(value) {
    return (value || "").trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").replace(/^_+|_+$/g, "");
  }

  function normalizeCsvName(value, participantId) {
    const source = (value || "").trim() || `${participantId}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`;
    const safe = source.replace(/[<>:"/\\|?*]+/g, "_");
    return safe.toLowerCase().endsWith(".csv") ? safe : `${safe}.csv`;
  }

  function generateSeed() {
    return Math.floor(Math.random() * 1000000000);
  }

  function normalizeStoredResponse(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "f" || normalized === "j") return normalized;
    if (normalized === "space" || normalized === "spacja") return "space";
    return "";
  }

  function buildCsvValidationReport(rows) {
    const mainRows = rows.filter((row) => row.trial_type !== "practice");
    const counts = new Map();
    mainRows.forEach((row) => {
      const key = `${row.trial_type}|${row.LVF_stimulus}|${row.RVF_stimulus}|${row.correct_response}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return { total: rows.length, mainRows: mainRows.length, unique: counts.size, allRepeated4: [...counts.values()].every((value) => value === 4) };
  }

  function serializeCsvRow(row) {
    return `${CSV_FIELDS.map((field) => csvEscape(row[field])).join(",")}\n`;
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    return /[,"\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, "\"\"")}"` : stringValue;
  }

  function cloneStimuli(source) {
    return JSON.parse(JSON.stringify(source));
  }

  function shuffleCopy(items, rng) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      const current = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = current;
    }
    return copy;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function next() {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadStorage(key) {
    try { return window.localStorage.getItem(key); } catch (_error) { return ""; }
  }

  function saveStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_error) { /* ignore */ }
  }

  function safeParseJson(rawValue) {
    if (!rawValue) return null;
    try { return JSON.parse(rawValue); } catch (_error) { return null; }
  }

  function showConfigError(message) {
    elements["config-error"].textContent = message;
    elements["config-error"].classList.remove("hidden");
  }

  function clearConfigError() {
    elements["config-error"].textContent = "";
    elements["config-error"].classList.add("hidden");
  }

  function isScreenVisible(id) {
    return !!elements[id] && elements[id].classList.contains("active");
  }

  function showScreen(id) {
    SCREEN_IDS.forEach((screenId) => {
      elements[screenId].classList.toggle("active", screenId === id);
    });
    document.body.classList.toggle("experiment-mode", [
      "screen-instructions",
      "screen-ready",
      "screen-break",
      "screen-run",
    ].includes(id));
  }

  function show(element) { element.classList.remove("hidden"); }
  function hide(element) { element.classList.add("hidden"); }
  function toggle(element, shouldShow) { element.classList.toggle("hidden", !shouldShow); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function round1(value) { return Math.round(value * 10) / 10; }
  function round2(value) { return Math.round(value * 100) / 100; }
  function round3(value) { return Math.round(value * 1000) / 1000; }
  function formatMs(value) { return round3(value); }

  function runSelfTests() {
    try {
      assert(psychoJsAssetsAvailable(), "Biblioteki PsychoJS nie zostały załadowane.");
      const parsed = validateStimuliPayload(state.stimuli);
      assert(parsed.ok, parsed.message || "Walidacja bodźców");
      [1001, 1002, 1003].forEach((seed) => validateTrialSet(buildMainTrials("f", "j", seed)));
      assert(buildPracticeTrials(1004).length === 10, "Trening powinien mieć 10 prób.");
      const geometry = computeGeometry(53, 1920);
      assert(geometry.fontPx > 0 && geometry.offsetPx > 0, "Geometria musi dawać dodatnie wartości.");
      const clockString = formatClockTimeWithMs(new Date("2026-04-08T13:14:15.321"));
      assert(/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(clockString), "Czas klawiatury i CSV powinien zawierać milisekundy.");
      runPsychoJsSmokeTest();
      psychoJS.event._onMouseDown({ button: 0, offsetX: 12, offsetY: 18 });
      state.awaitingResponse = true;
      state.currentTiming = { fixationEndsAt: 2, stimulusOnsetAt: 2, stimulusEndsAt: 2.2, responseEndsAt: 4 };
      state.paused = false;
      handleFullscreenChange();
      assert(state.paused === true, "Zmiana fullscreen powinna chwilowo zatrzymać próbę na czas przeliczenia layoutu.");
      state.awaitingResponse = false;
      state.currentTiming = null;
      state.paused = false;
      state.fullscreenTransitionActive = false;
      clearFullscreenResumeTimer();
      state.phase = "instructions";
      state.instructionIndex = 0;
      renderInstructionPage();
      showScreen("screen-instructions");
      assert(window.getComputedStyle(document.body).backgroundColor === "rgb(255, 255, 255)", "Ekrany instrukcji powinny mieć białe tło.");
      assert(window.getComputedStyle(document.querySelector("#screen-instructions .instruction-card")).backgroundColor === "rgb(255, 255, 255)", "Karta instrukcji powinna mieć białe tło.");
      const syntheticRows = createSyntheticRowsForTest();
      const practiceRows = syntheticRows.filter((row) => row.trial_type === "practice");
      const practiceStats = buildResponseStatsSummary(practiceRows);
      assert(practiceStats.includes("Lewa strona (F):") && practiceStats.includes("%"), "Podsumowanie treningu powinno pokazywać procenty odpowiedzi.");
      const validation = buildCsvValidationReport(syntheticRows);
      assert(validation.mainRows === 256, "CSV syntetyczny powinien mieć 256 prób głównych.");
      assert(validation.unique === 64, "CSV syntetyczny powinien mieć 64 kombinacje.");
      assert(validation.allRepeated4, "Każda kombinacja musi wystąpić 4 razy.");
      assert(syntheticRows.length === 266, "Całość powinna mieć 266 wierszy razem z treningiem.");
      saveStorage(STORAGE_KEYS.backup, JSON.stringify({ meta: { sessionId: "TEST_1" }, rows: syntheticRows }));
      assert(loadStorage(STORAGE_KEYS.backup).includes("TEST_1"), "Kopia awaryjna powinna się zapisać.");
      showScreen("screen-self-test");
      elements["self-test-output"].textContent = "WEB_PSYCHOJS_SELF_TEST_OK\nSprawdzono 3 zestawy po 256 prób.\nWalidacja kombinacji 64 × 4: OK.\nTrening 10 prób: OK.\nSilnik PsychoJS: OK.\nGeometria i zapis kopii awaryjnej: OK.";
      document.title = "WEB_PSYCHOJS_SELF_TEST_OK";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      elements["self-test-output"].textContent = `WEB_PSYCHOJS_SELF_TEST_FAIL\n${message}`;
      document.title = "WEB_PSYCHOJS_SELF_TEST_FAIL";
    }
  }

  async function runE2ETest() {
    try {
      assert(psychoJsAssetsAvailable(), "Biblioteki PsychoJS nie zostały załadowane.");
      state.autoPilotEnabled = true;
      await prepareSessionFromConfig({
        participantId: "TEST_WEB",
        csvName: "TEST_WEB_20260408.csv",
        leftKey: "f",
        rightKey: "j",
        fixationMs: 16,
        stimulusMs: 16,
        responseMs: 64,
        monitorWidthCm: 53,
        randomSeed: 8888,
        refreshRate: "60 Hz",
        monitorResolution: "1920x1080",
      });
      state.phase = "instructions";
      state.instructionIndex = 0;
      elements["self-test-output"].textContent = "WEB_PSYCHOJS_E2E_TEST_RUNNING\nUruchamianie pełnego przebiegu 10 + 256 prób...";
      renderInstructionPage();
      showScreen("screen-instructions");
      maybeAutoAdvanceInstructions();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      elements["self-test-output"].textContent = `WEB_PSYCHOJS_E2E_TEST_FAIL\n${message}`;
      document.title = "WEB_PSYCHOJS_E2E_TEST_FAIL";
    }
  }

  function finalizeAutoPilotE2E(status, practiceRows, mainRows) {
    try {
      assert(status === "completed", "E2E: badanie nie zostało zakończone.");
      const validation = buildCsvValidationReport(state.rows);
      assert(practiceRows.length === 10, "E2E: trening powinien mieć 10 prób.");
      assert(mainRows.length === 256, "E2E: liczba prób głównych.");
      assert(validation.mainRows === 256, "E2E: liczba prób głównych w CSV.");
      assert(validation.unique === 64, "E2E: liczba unikalnych kombinacji.");
      assert(validation.allRepeated4, "E2E: każda kombinacja 4 razy.");
      assert(state.csvTextCache.split("\n").length === 268, "E2E: poprawna liczba linii CSV wraz z pustą końcówką.");
      assert(mainRows.every((row) => row.response_time_from_stimulus !== "" && Number(row.response_time_from_stimulus) > 0), "E2E: każde RT powinno być dodatnie.");
      elements["self-test-output"].textContent =
        "WEB_PSYCHOJS_E2E_TEST_OK\n" +
        "Przeszedł pełny rzeczywisty przebieg: 10 prób treningowych + 256 prób głównych.\n" +
        "Zweryfikowano podział 128/128, 64 kombinacje × 4, zapis CSV i dodatnie czasy reakcji.\n" +
        `Średni czas RT w teście automatycznym: ${computeMeanRt(mainRows)} ms.`;
      document.title = "WEB_PSYCHOJS_E2E_TEST_OK";
      showScreen("screen-self-test");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      elements["self-test-output"].textContent = `WEB_PSYCHOJS_E2E_TEST_FAIL\n${message}`;
      document.title = "WEB_PSYCHOJS_E2E_TEST_FAIL";
      showScreen("screen-self-test");
    }
  }

  function createSyntheticRowsForTest() {
    const rows = [];
    const practiceTrials = buildPracticeTrials(9999);
    const mainTrials = buildMainTrials("f", "j", 7777);
    practiceTrials.forEach((trial, index) => {
      rows.push(buildSyntheticRow(trial, index % 3 === 0 ? "" : trial.correctResponse, index % 3 === 0 ? null : 420 + index, index % 3 === 0 ? 1 : 0));
    });
    mainTrials.forEach((trial, index) => {
      const noResponse = index % 11 === 0 ? 1 : 0;
      rows.push(buildSyntheticRow(trial, noResponse ? "" : trial.correctResponse, noResponse ? null : 430 + (index % 13), noResponse));
    });
    return rows;
  }

  function buildSyntheticRow(trial, pressedKey, responseTimeFromStimulus, noResponse) {
    return {
      participant_ID: "TEST", trial_number: trial.trialNumber, block_number: trial.blockNumber, trial_type: trial.trialType,
      LVF_stimulus: trial.lvfStimulus, RVF_stimulus: trial.rvfStimulus, correct_response: responseToCsvLabel(trial.correctResponse),
      participant_response: responseToCsvLabel(pressedKey), accuracy: noResponse ? 0 : Number(pressedKey === trial.correctResponse),
      reaction_time_ms: responseTimeFromStimulus == null ? "" : formatMs(responseTimeFromStimulus),
      response_time_from_stimulus: responseTimeFromStimulus == null ? "" : formatMs(responseTimeFromStimulus),
      no_response: noResponse, date: "2026-04-08", time: "12:00:00", refresh_rate: "60 Hz",
      monitor_resolution: "1920x1080", fullscreen: false, viewing_distance_cm: VIEWING_DISTANCE_CM,
      fixation_duration: 1000, stimulus_duration: 100, response_window: 2000, experiment_version: APP_VERSION, random_seed: 7777,
    };
  }

  function validateTrialSet(trials) {
    assert(trials.length === 256, "Triale główne muszą mieć długość 256.");
    const counts = new Map();
    const byType = { word_nonword: 0, nonword_word: 0, nonword_nonword: 0 };
    trials.forEach((trial) => {
      const key = `${trial.trialType}|${trial.lvfStimulus}|${trial.rvfStimulus}|${trial.correctResponse}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      byType[trial.trialType] += 1;
    });
    assert(counts.size === 64, "Powinno być 64 unikalnych kombinacji.");
    assert([...counts.values()].every((value) => value === 4), "Każda kombinacja powinna wystąpić 4 razy.");
    assert(byType.word_nonword === 64, "Typ word_nonword powinien mieć 64 próby.");
    assert(byType.nonword_word === 64, "Typ nonword_word powinien mieć 64 próby.");
    assert(byType.nonword_nonword === 128, "Typ nonword_nonword powinien mieć 128 prób.");
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }
})();
