(function () {
  "use strict";

  const WORD_NONWORD_PAIRS = [
    ["agenda", "asenga"],
    ["alibi", "acipi"],
    ["aura", "aita"],
    ["kasyno", "kanyso"],
    ["film", "fitz"],
    ["gala", "dara"],
    ["garaze", "lapaze"],
    ["jazz", "jaik"],
    ["jury", "jula"],
    ["menu", "besu"],
    ["piano", "pieni"],
    ["radio", "rapoo"],
    ["snob", "ssib"],
    ["studio", "slugio"],
    ["taxi", "taia"],
    ["wirus", "gilus"],
  ];

  const NONWORD_NONWORD_PAIRS = [
    ["lara", "vata"],
    ["sneg", "snik"],
    ["cadisy", "canisi"],
    ["eure", "euta"],
    ["janz", "japt"],
    ["beny", "bevu"],
    ["asanca", "asande"],
    ["gitus", "giris"],
    ["turnex", "turmel"],
    ["slougou", "slougue"],
    ["vavade", "vavege"],
    ["pueni", "peani"],
    ["juto", "jula"],
    ["taht", "tawl"],
    ["rageu", "rapea"],
    ["firl", "fibm"],
  ];

  const PRACTICE_TRIALS_SPEC = [
    ["okno", "okto", "f"],
    ["lamta", "lampa", "j"],
    ["kwiat", "kwiap", "f"],
    ["mispa", "miska", "j"],
    ["papier", "papner", "f"],
    ["serte", "serce", "j"],
    ["mleto", "melko", "space"],
    ["lamta", "lanpa", "space"],
    ["wazom", "wazun", "space"],
    ["palec", "paleg", "f"],
  ];

  const CSV_FIELDS = [
    "participant_ID",
    "trial_number",
    "block_number",
    "trial_type",
    "LVF_stimulus",
    "RVF_stimulus",
    "correct_response",
    "participant_response",
    "accuracy",
    "reaction_time_ms",
    "response_time_from_stimulus",
    "no_response",
    "date",
    "time",
    "refresh_rate",
    "monitor_resolution",
    "fullscreen",
    "viewing_distance_cm",
    "fixation_duration",
    "stimulus_duration",
    "response_window",
    "experiment_version",
    "random_seed",
  ];

  const APP_VERSION = "Web version 1";
  const VIEWING_DISTANCE_CM = 57;

  const state = {
    config: null,
    phase: "idle",
    instructionIndex: 0,
    practiceTrials: [],
    mainTrials: [],
    currentList: [],
    currentIndex: -1,
    currentTrial: null,
    breakShown: false,
    trialStimulusOnset: 0,
    rafId: 0,
    awaitingResponse: false,
    paused: false,
    csvRows: [],
    csvHeaderLine: `${CSV_FIELDS.join(",")}\n`,
    fileHandle: null,
    fileWriter: null,
    filePosition: 0,
    lastCsvBlobUrl: "",
    summaryContext: null,
    selfTestMode: false,
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindElements();
    bindEvents();
    hydrateDefaultFileName();

    const params = new URLSearchParams(window.location.search);
    if (params.get("self_test") === "1") {
      state.selfTestMode = true;
      showScreen("screen-self-test");
      runSelfTests();
      return;
    }
    if (params.get("e2e_test") === "1") {
      state.selfTestMode = true;
      showScreen("screen-self-test");
      runE2ETest();
      return;
    }

    showScreen("screen-home");
  }

  function bindElements() {
    [
      "screen-home",
      "screen-instructions",
      "screen-break",
      "screen-run",
      "screen-summary",
      "screen-self-test",
      "config-form",
      "participant-id",
      "csv-name",
      "practice-count",
      "main-count",
      "fixation-ms",
      "stimulus-ms",
      "response-ms",
      "left-key",
      "right-key",
      "choose-save-file",
      "save-status",
      "config-error",
      "config-info",
      "start-button",
      "self-test-button",
      "instruction-progress",
      "instruction-title",
      "instruction-body",
      "instruction-next",
      "break-progress",
      "break-title",
      "break-body",
      "break-next",
      "run-stage",
      "trial-counter",
      "trial-phase-label",
      "fixation",
      "stimulus-left",
      "stimulus-right",
      "feedback",
      "pause-overlay",
      "pause-resume",
      "pause-fullscreen",
      "pause-abort",
      "summary-status",
      "summary-title",
      "summary-body",
      "summary-download",
      "summary-restart",
      "self-test-output",
      "self-test-back",
    ].forEach((id) => {
      elements[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    elements["participant-id"].addEventListener("input", hydrateDefaultFileName);
    elements["config-form"].addEventListener("submit", onStartRequested);
    elements["choose-save-file"].addEventListener("click", chooseSaveFile);
    elements["instruction-next"].addEventListener("click", advanceInstruction);
    elements["break-next"].addEventListener("click", continueAfterBreak);
    elements["pause-resume"].addEventListener("click", resumeFromPause);
    elements["pause-fullscreen"].addEventListener("click", toggleFullscreen);
    elements["pause-abort"].addEventListener("click", abortExperiment);
    elements["summary-restart"].addEventListener("click", resetToMenu);
    elements["summary-download"].addEventListener("click", downloadCsvFallback);
    elements["self-test-button"].addEventListener("click", () => {
      showScreen("screen-self-test");
      runSelfTests();
    });
    elements["self-test-back"].addEventListener("click", resetToMenu);
    document.addEventListener("keydown", onKeyDown);
  }

  function hydrateDefaultFileName() {
    const participantId = sanitizeParticipantId(elements["participant-id"].value || "ID_01");
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    elements["csv-name"].value = `${participantId}_${stamp}.csv`;
  }

  function onStartRequested(event) {
    event.preventDefault();
    clearConfigError();

    try {
      state.config = readConfig();
      state.practiceTrials = buildPracticeTrials();
      state.mainTrials = buildMainTrials(state.config.leftKey, state.config.rightKey, state.config.randomSeed);
      state.csvRows = [];
      state.summaryContext = null;
      state.phase = "instructions";
      state.instructionIndex = 0;
      requestFullscreenIfPossible();
      updateSaveStatus();
      showInstructionPage();
    } catch (error) {
      showConfigError(error instanceof Error ? error.message : String(error));
    }
  }

  function readConfig() {
    const participantId = sanitizeParticipantId(elements["participant-id"].value);
    if (!participantId) {
      throw new Error("Wpisz poprawne ID uczestnika.");
    }

    const csvName = normalizeCsvName(elements["csv-name"].value, participantId);
    const fixationMs = parsePositiveInt(elements["fixation-ms"].value, "Ustaw poprawny czas fiksacji.");
    const stimulusMs = parsePositiveInt(elements["stimulus-ms"].value, "Ustaw poprawny czas prezentacji bodzcow.");
    const responseMs = parsePositiveInt(elements["response-ms"].value, "Ustaw poprawny czas okna odpowiedzi.");
    const practiceCount = parsePositiveInt(elements["practice-count"].value, "Liczba prob treningowych jest niepoprawna.");
    const mainCount = parsePositiveInt(elements["main-count"].value, "Liczba prob glownych jest niepoprawna.");

    if (practiceCount !== 10) {
      throw new Error("Ta wersja wymaga 10 prob treningowych.");
    }
    if (mainCount !== 256) {
      throw new Error("Ta wersja wymaga 256 prob glownych.");
    }
    if (responseMs <= stimulusMs) {
      throw new Error("Okno odpowiedzi musi byc dluzsze niz czas ekspozycji bodzcow.");
    }

    return {
      participantId,
      csvName,
      leftKey: "f",
      rightKey: "j",
      fixationMs,
      stimulusMs,
      responseMs,
      practiceCount,
      mainCount,
      randomSeed: generateSeed(),
      refreshRate: detectRefreshRateLabel(),
      monitorResolution: `${window.screen.width}x${window.screen.height}`,
      fullscreen: !!document.fullscreenElement,
    };
  }

  function parsePositiveInt(rawValue, message) {
    const value = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(message);
    }
    return value;
  }

  function showConfigError(message) {
    elements["config-error"].textContent = message;
    elements["config-error"].classList.remove("hidden");
  }

  function clearConfigError() {
    elements["config-error"].textContent = "";
    elements["config-error"].classList.add("hidden");
  }

  function sanitizeParticipantId(value) {
    return (value || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "";
  }

  function normalizeCsvName(value, participantId) {
    const source = (value || "").trim() || `${participantId}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`;
    const safe = source.replace(/[<>:"/\\|?*]+/g, "_");
    return safe.toLowerCase().endsWith(".csv") ? safe : `${safe}.csv`;
  }

  function generateSeed() {
    return Math.floor(Math.random() * 1000000000);
  }

  function detectRefreshRateLabel() {
    if (typeof window.screen.frameRate === "number" && window.screen.frameRate > 0) {
      return `${Math.round(window.screen.frameRate)} Hz`;
    }
    return "browser_estimate";
  }

  function buildMainTrials(leftKey, rightKey, seed) {
    const rng = mulberry32(seed);
    const uniqueTrials = [];

    WORD_NONWORD_PAIRS.forEach(([word, nonword]) => {
      uniqueTrials.push({
        phase: "main",
        blockNumber: 0,
        trialType: "word_nonword",
        lvfStimulus: word,
        rvfStimulus: nonword,
        correctResponse: leftKey,
      });
      uniqueTrials.push({
        phase: "main",
        blockNumber: 0,
        trialType: "nonword_word",
        lvfStimulus: nonword,
        rvfStimulus: word,
        correctResponse: rightKey,
      });
    });

    NONWORD_NONWORD_PAIRS.forEach(([a, b]) => {
      uniqueTrials.push({
        phase: "main",
        blockNumber: 0,
        trialType: "nonword_nonword",
        lvfStimulus: a,
        rvfStimulus: b,
        correctResponse: "space",
      });
      uniqueTrials.push({
        phase: "main",
        blockNumber: 0,
        trialType: "nonword_nonword",
        lvfStimulus: b,
        rvfStimulus: a,
        correctResponse: "space",
      });
    });

    const repeated = [];
    for (let repeatIndex = 0; repeatIndex < 4; repeatIndex += 1) {
      uniqueTrials.forEach((trial) => repeated.push({ ...trial }));
    }

    shuffleInPlace(repeated, rng);
    return repeated.map((trial, index) => {
      const trialNumber = index + 1;
      const blockNumber = trialNumber <= 128 ? 1 : 2;
      const blockTrialNumber = blockNumber === 1 ? trialNumber : trialNumber - 128;
      return {
        ...trial,
        trialNumber,
        blockNumber,
        blockTrialNumber,
      };
    });
  }

  function buildPracticeTrials() {
    const trials = PRACTICE_TRIALS_SPEC.map(([lvf, rvf, correctResponse], index) => ({
      phase: "practice",
      blockNumber: 0,
      trialNumber: index + 1,
      blockTrialNumber: index + 1,
      trialType: "practice",
      lvfStimulus: lvf,
      rvfStimulus: rvf,
      correctResponse,
    }));
    shuffleInPlace(trials, Math.random);
    return trials;
  }

  function shuffleInPlace(items, randomSource) {
    const nextRandom = typeof randomSource === "function" ? randomSource : Math.random;
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(nextRandom() * (index + 1));
      const current = items[index];
      items[index] = items[swapIndex];
      items[swapIndex] = current;
    }
    return items;
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

  function showInstructionPage() {
    const pages = [
      {
        title: "Na czym polega zadanie",
        body: "W kazdej probie zobaczysz dwa bodzce jednoczesnie.\nTwoim zadaniem jest zdecydowac, po ktorej stronie pojawilo sie prawdziwe slowo.",
      },
      {
        title: "Odpowiedzi",
        body: "Jesli prawdziwe slowo pojawi sie po <span class=\"left-key\">LEWEJ</span>, nacisnij <span class=\"left-key\">F</span>.\nJesli prawdziwe slowo pojawi sie po <span class=\"right-key\">PRAWEJ</span>, nacisnij <span class=\"right-key\">J</span>.\nJesli po obu stronach nie ma prawdziwego slowa, nacisnij SPACJE.",
      },
      {
        title: "Wazne",
        body: "Patrz na srodek ekranu i reaguj tak szybko oraz tak dokladnie, jak potrafisz.\nBodzce sa widoczne bardzo krotko, zgodnie z procedura TLDT.",
      },
      {
        title: "Trening",
        body: "Najpierw zobaczysz 10 prob treningowych z informacja zwrotna.\nPo treningu pojawi sie podsumowanie i przejscie do czesci glownej.",
      },
    ];

    const page = pages[state.instructionIndex];
    elements["instruction-progress"].textContent = `${state.instructionIndex + 1} / ${pages.length}`;
    elements["instruction-title"].textContent = page.title;
    elements["instruction-body"].innerHTML = page.body;
    showScreen("screen-instructions");
  }

  function advanceInstruction() {
    if (state.phase !== "instructions") {
      return;
    }
    state.instructionIndex += 1;
    if (state.instructionIndex >= 4) {
      startPractice();
      return;
    }
    showInstructionPage();
  }

  function startPractice() {
    state.phase = "practice";
    state.currentList = state.practiceTrials.slice();
    state.currentIndex = -1;
    showScreen("screen-run");
    runNextTrial();
  }

  function runNextTrial() {
    clearTrialSurface();

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
      if (state.currentIndex === 127 && !state.breakShown) {
        state.breakShown = true;
        showBreakSummary();
        return;
      }

      state.currentIndex += 1;
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

  function clearTrialSurface() {
    cancelAnimationFrame(state.rafId);
    state.awaitingResponse = false;
    state.paused = false;
    elements["pause-overlay"].classList.add("hidden");
    hide(elements["fixation"]);
    hide(elements["stimulus-left"]);
    hide(elements["stimulus-right"]);
    hide(elements["feedback"]);
    elements["feedback"].textContent = "";
    elements["stimulus-left"].textContent = "";
    elements["stimulus-right"].textContent = "";
  }

  function startTrialAnimation() {
    const trial = state.currentTrial;
    const config = state.config;
    const trialStart = performance.now();
    const stimulusOnset = trialStart + config.fixationMs;
    const trialEnd = stimulusOnset + config.responseMs;

    state.awaitingResponse = true;
    state.trialStimulusOnset = stimulusOnset;

    const tick = (now) => {
      if (state.paused) {
        state.rafId = requestAnimationFrame(tick);
        return;
      }

      const showFixation = now < stimulusOnset;
      const showStimulus = now >= stimulusOnset && now < stimulusOnset + config.stimulusMs;

      toggle(elements["fixation"], showFixation);
      toggle(elements["stimulus-left"], showStimulus);
      toggle(elements["stimulus-right"], showStimulus);

      if (showStimulus) {
        elements["stimulus-left"].textContent = trial.lvfStimulus;
        elements["stimulus-right"].textContent = trial.rvfStimulus;
      } else {
        elements["stimulus-left"].textContent = "";
        elements["stimulus-right"].textContent = "";
      }

      if (now >= trialEnd) {
        completeTrial("", null, 1);
        return;
      }

      state.rafId = requestAnimationFrame(tick);
    };

    state.rafId = requestAnimationFrame(tick);
  }

  async function completeTrial(pressedKey, responseTimeFromStimulus, noResponse) {
    cancelAnimationFrame(state.rafId);
    state.awaitingResponse = false;
    hide(elements["fixation"]);
    hide(elements["stimulus-left"]);
    hide(elements["stimulus-right"]);

    const trial = state.currentTrial;
    const result = buildRow(trial, pressedKey, responseTimeFromStimulus, noResponse);
    state.csvRows.push(result);
    await appendCsvRow(result);

    if (state.phase === "practice") {
      const message = buildPracticeFeedback(result, trial.correctResponse);
      await showFeedback(message.text, message.color);
    }

    runNextTrial();
  }

  function buildPracticeFeedback(row, correctResponse) {
    if (row.no_response === 1) {
      return { text: "Nie udzielono odpowiedzi", color: "var(--warning)" };
    }
    if (correctResponse === "space" && row.participant_response === "SPACJA") {
      return { text: "Poprawnie - po obu stronach nie bylo slowa", color: "var(--success)" };
    }
    if (row.accuracy === 1) {
      return { text: "Poprawnie", color: "var(--success)" };
    }
    if (correctResponse === "space") {
      return { text: "Blednie - obie strony byly niepoprawne", color: "var(--danger)" };
    }
    return { text: "Blednie", color: "var(--danger)" };
  }

  function showFeedback(message, colorValue) {
    return new Promise((resolve) => {
      elements["feedback"].textContent = message;
      elements["feedback"].style.color = colorValue;
      show(elements["feedback"]);
      window.setTimeout(() => {
        hide(elements["feedback"]);
        resolve();
      }, 650);
    });
  }

  function buildRow(trial, pressedKey, responseTimeFromStimulus, noResponse) {
    const now = new Date();
    const responseFromStimulus = responseTimeFromStimulus == null ? "" : round2(responseTimeFromStimulus);
    const reactionTime = responseTimeFromStimulus == null ? "" : round2(Math.max(0, responseTimeFromStimulus - state.config.stimulusMs));
    const responseLabel = responseToCsvLabel(pressedKey);
    const accuracy = noResponse ? 0 : Number(pressedKey === trial.correctResponse);

    return {
      participant_ID: state.config.participantId,
      trial_number: trial.trialNumber,
      block_number: trial.blockNumber,
      trial_type: trial.trialType,
      LVF_stimulus: trial.lvfStimulus,
      RVF_stimulus: trial.rvfStimulus,
      correct_response: responseToCsvLabel(trial.correctResponse),
      participant_response: responseLabel,
      accuracy: accuracy,
      reaction_time_ms: reactionTime,
      response_time_from_stimulus: responseFromStimulus,
      no_response: noResponse,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
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

  function responseToCsvLabel(value) {
    if (!value) {
      return "";
    }
    if (value === "space") {
      return "SPACJA";
    }
    return value.toUpperCase();
  }

  function round2(value) {
    return Math.round(value * 100) / 100;
  }

  function showPracticeSummary() {
    const rows = state.csvRows.filter((row) => row.trial_type === "practice");
    const correct = rows.filter((row) => row.accuracy === 1).length;
    const meanRt = computeMeanRt(rows);
    elements["break-progress"].textContent = "Po treningu";
    elements["break-title"].textContent = "Trening zakonczony";
    elements["break-body"].textContent =
      `Poprawnosc: ${percent(correct, rows.length)}\n` +
      `Sredni czas odpowiedzi od bodzca: ${meanRt} ms\n\n` +
      `Za chwile rozpocznie sie czesc glowna z 256 probami.`;
    state.phase = "practice-summary";
    showScreen("screen-break");
  }

  function continueAfterBreak() {
    if (state.phase === "practice-summary") {
      state.phase = "main";
      state.currentList = state.mainTrials.slice();
      state.currentIndex = -1;
      state.breakShown = false;
      showScreen("screen-run");
      runNextTrial();
      return;
    }

    if (state.phase === "main-break") {
      state.phase = "main";
      showScreen("screen-run");
      runNextTrial();
    }
  }

  function showBreakSummary() {
    const rows = state.csvRows.filter((row) => row.trial_type !== "practice" && row.block_number === 1);
    const leftCount = rows.filter((row) => row.participant_response === "F").length;
    const rightCount = rows.filter((row) => row.participant_response === "J").length;
    const spaceCount = rows.filter((row) => row.participant_response === "SPACJA").length;
    const noResponseCount = rows.filter((row) => row.no_response === 1).length;
    elements["break-progress"].textContent = "Przerwa";
    elements["break-title"].textContent = "Polowa badania";
    elements["break-body"].textContent =
      `Ukonczone proby: 128 / 256\n` +
      `Lewa odpowiedz: ${leftCount}\n` +
      `Prawa odpowiedz: ${rightCount}\n` +
      `Spacja: ${spaceCount}\n` +
      `Brak odpowiedzi: ${noResponseCount}\n\n` +
      `Nacisnij Spacje albo kliknij, aby przejsc do drugiej polowy badania.`;
    state.phase = "main-break";
    showScreen("screen-break");
  }

  async function finishExperiment(status) {
    await closeCsvWriter();
    const practiceRows = state.csvRows.filter((row) => row.trial_type === "practice");
    const mainRows = state.csvRows.filter((row) => row.trial_type !== "practice");
    state.summaryContext = {
      status,
      practiceAccuracy: percent(practiceRows.filter((row) => row.accuracy === 1).length, practiceRows.length),
      practiceMeanRt: computeMeanRt(practiceRows),
      mainAccuracy: percent(mainRows.filter((row) => row.accuracy === 1).length, mainRows.length || 1),
      mainMeanRt: computeMeanRt(mainRows),
      completedMainTrials: mainRows.length,
    };

    elements["summary-status"].textContent = status === "completed" ? "Badanie zakonczone" : "Test przerwany";
    elements["summary-title"].textContent = status === "completed" ? "Podsumowanie testu" : "Sesja zostala przerwana";
    elements["summary-body"].textContent =
      `Ukonczone proby glowne: ${state.summaryContext.completedMainTrials} / ${state.config.mainCount}\n` +
      `Trening - poprawne: ${state.summaryContext.practiceAccuracy}\n` +
      `Trening - sredni RT od bodzca: ${state.summaryContext.practiceMeanRt} ms\n` +
      `Badanie - poprawne: ${state.summaryContext.mainAccuracy}\n` +
      `Badanie - sredni RT od bodzca: ${state.summaryContext.mainMeanRt} ms\n\n` +
      `${state.fileHandle ? "Dane byly zapisywane do wybranego pliku CSV." : "Jesli nie wybrano pliku w Chrome, CSV mozna pobrac teraz."}`;

    showScreen("screen-summary");

    buildCsvDownloadBlob();
  }

  function computeMeanRt(rows) {
    const values = rows
      .map((row) => Number(row.response_time_from_stimulus))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!values.length) {
      return "brak";
    }
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return `${round2(mean)}`;
  }

  function percent(part, total) {
    if (!total) {
      return "0%";
    }
    return `${round2((part / total) * 100)}%`;
  }

  function abortExperiment() {
    clearTrialSurface();
    finishExperiment("aborted");
  }

  function resumeFromPause() {
    state.paused = false;
    elements["pause-overlay"].classList.add("hidden");
  }

  function onKeyDown(event) {
    if (state.selfTestMode) {
      if (event.key === "Escape") {
        resetToMenu();
      }
      return;
    }

    if (state.phase === "instructions" && event.code === "Space") {
      event.preventDefault();
      advanceInstruction();
      return;
    }

    if ((state.phase === "practice-summary" || state.phase === "main-break") && event.code === "Space") {
      event.preventDefault();
      continueAfterBreak();
      return;
    }

    if (event.key === "Escape" && state.awaitingResponse) {
      event.preventDefault();
      state.paused = true;
      elements["pause-overlay"].classList.remove("hidden");
      return;
    }

    if (!state.awaitingResponse || state.paused) {
      return;
    }

    const key = normalizeResponseKey(event);
    if (!key) {
      return;
    }

    const now = performance.now();
    if (now < state.trialStimulusOnset) {
      return;
    }
    event.preventDefault();
    completeTrial(key, now - state.trialStimulusOnset, 0);
  }

  function normalizeResponseKey(event) {
    const key = event.key.toLowerCase();
    if (key === "f") {
      return "f";
    }
    if (key === "j") {
      return "j";
    }
    if (event.code === "Space") {
      return "space";
    }
    return "";
  }

  async function chooseSaveFile() {
    clearConfigError();
    if (!window.showSaveFilePicker) {
      state.fileHandle = null;
      updateSaveStatus("Przegladarka nie wspiera bezposredniego wyboru pliku. CSV zostanie pobrany na koncu.");
      return;
    }

    try {
      const suggestedName = normalizeCsvName(elements["csv-name"].value, sanitizeParticipantId(elements["participant-id"].value || "ID_01"));
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: "Plik CSV",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      state.fileHandle = handle;
      updateSaveStatus(`Wybrano plik: ${handle.name}. Dane beda dopisywane po kazdej probie.`);
    } catch (_error) {
      state.fileHandle = null;
      updateSaveStatus("Nie wybrano pliku. CSV zostanie pobrany na koncu sesji.");
    }
  }

  function updateSaveStatus(message) {
    if (message) {
      elements["save-status"].textContent = message;
      return;
    }
    elements["save-status"].textContent = state.fileHandle
      ? `Wybrano plik: ${state.fileHandle.name}. Dane beda dopisywane po kazdej probie.`
      : "W Chrome mozesz wybrac plik CSV przed startem. Jesli pominiesz ten krok, plik pobierze sie na koncu.";
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
      await state.fileWriter.write({
        type: "write",
        position: state.filePosition,
        data: line,
      });
      state.filePosition += new TextEncoder().encode(line).length;
    } catch (_error) {
      state.fileHandle = null;
      state.fileWriter = null;
      state.filePosition = 0;
      updateSaveStatus("Chrome nie pozwolil zapisac do wybranego pliku. CSV zostanie pobrany na koncu sesji.");
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

  function serializeCsvRow(row) {
    const values = CSV_FIELDS.map((field) => csvEscape(row[field]));
    return `${values.join(",")}\n`;
  }

  function csvEscape(value) {
    if (value === null || value === undefined) {
      return "";
    }
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, "\"\"")}"`;
    }
    return stringValue;
  }

  function buildCsvDownloadBlob() {
    if (state.lastCsvBlobUrl) {
      URL.revokeObjectURL(state.lastCsvBlobUrl);
    }
    const lines = [state.csvHeaderLine, ...state.csvRows.map(serializeCsvRow)];
    const blob = new Blob(lines, { type: "text/csv;charset=utf-8" });
    state.lastCsvBlobUrl = URL.createObjectURL(blob);
  }

  function downloadCsvFallback() {
    if (!state.csvRows.length) {
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

  function requestFullscreenIfPossible() {
    const root = elements["run-stage"];
    if (document.fullscreenElement || !root.requestFullscreen) {
      return;
    }
    root.requestFullscreen().catch(() => {
      // Browser can reject fullscreen if gesture context is lost.
    });
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    requestFullscreenIfPossible();
  }

  function resetToMenu() {
    clearTrialSurface();
    state.phase = "idle";
    state.instructionIndex = 0;
    state.currentList = [];
    state.currentIndex = -1;
    state.currentTrial = null;
    state.breakShown = false;
    state.paused = false;
    showScreen("screen-home");
    clearConfigError();
    updateSaveStatus();
  }

  function showScreen(id) {
    [
      "screen-home",
      "screen-instructions",
      "screen-break",
      "screen-run",
      "screen-summary",
      "screen-self-test",
    ].forEach((screenId) => {
      toggle(elements[screenId], screenId === id);
      elements[screenId].classList.toggle("active", screenId === id);
    });
  }

  function show(element) {
    element.classList.remove("hidden");
  }

  function hide(element) {
    element.classList.add("hidden");
  }

  function toggle(element, shouldShow) {
    element.classList.toggle("hidden", !shouldShow);
  }

  function runSelfTests() {
    const results = [];
    try {
      const trials = buildMainTrials("f", "j", 123456);
      assert(trials.length === 256, "Main trials = 256");

      const uniqueCounts = new Map();
      trials.forEach((trial) => {
        const key = `${trial.trialType}|${trial.lvfStimulus}|${trial.rvfStimulus}|${trial.correctResponse}`;
        uniqueCounts.set(key, (uniqueCounts.get(key) || 0) + 1);
      });
      assert(uniqueCounts.size === 64, "Unique combinations = 64");
      assert([...uniqueCounts.values()].every((value) => value === 4), "Each combination repeated 4 times");

      const countsByType = trials.reduce((accumulator, trial) => {
        accumulator[trial.trialType] = (accumulator[trial.trialType] || 0) + 1;
        return accumulator;
      }, {});
      assert(countsByType.word_nonword === 64, "word_nonword = 64");
      assert(countsByType.nonword_word === 64, "nonword_word = 64");
      assert(countsByType.nonword_nonword === 128, "nonword_nonword = 128");

      const practice = buildPracticeTrials();
      assert(practice.length === 10, "Practice trials = 10");

      const sampleRow = {
        participant_ID: "ID_01",
        trial_number: 1,
        block_number: 1,
        trial_type: "word_nonword",
        LVF_stimulus: "agenda",
        RVF_stimulus: "asenga",
        correct_response: "F",
        participant_response: "F",
        accuracy: 1,
        reaction_time_ms: 320,
        response_time_from_stimulus: 420,
        no_response: 0,
        date: "2026-04-08",
        time: "12:00:00",
        refresh_rate: "browser_estimate",
        monitor_resolution: "1920x1080",
        fullscreen: false,
        viewing_distance_cm: 57,
        fixation_duration: 1000,
        stimulus_duration: 100,
        response_window: 2000,
        experiment_version: APP_VERSION,
        random_seed: 123,
      };

      const csvLine = serializeCsvRow(sampleRow);
      assert(csvLine.includes("agenda"), "CSV serialization works");
      assert(csvLine.split(",").length === CSV_FIELDS.length, "CSV fields count matches");

      results.push("WEB_SELF_TEST_OK");
      results.push("Main trials: 256");
      results.push("Unique combinations: 64");
      results.push("Per-combination repetitions: 4");
      results.push("Practice trials: 10");
      results.push("CSV serialization: OK");
      results.push("Chrome launcher model: static files, no dependencies");
      elements["self-test-output"].textContent = results.join("\n");
      document.title = "WEB_SELF_TEST_OK";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      elements["self-test-output"].textContent = `WEB_SELF_TEST_FAIL\n${message}`;
      document.title = "WEB_SELF_TEST_FAIL";
    }
  }

  function assert(condition, label) {
    if (!condition) {
      throw new Error(label);
    }
  }

  function runE2ETest() {
    try {
      const config = {
        participantId: "TEST_WEB",
        csvName: "TEST_WEB_20260408.csv",
        leftKey: "f",
        rightKey: "j",
        fixationMs: 1000,
        stimulusMs: 100,
        responseMs: 2000,
        practiceCount: 10,
        mainCount: 256,
        randomSeed: 987654,
        refreshRate: "browser_estimate",
        monitorResolution: "1920x1080",
        fullscreen: false,
      };

      state.config = config;
      state.csvRows = [];
      const practiceTrials = buildPracticeTrials();
      const mainTrials = buildMainTrials("f", "j", config.randomSeed);

      practiceTrials.forEach((trial, index) => {
        state.csvRows.push(
          buildRow(
            trial,
            index % 2 === 0 ? trial.correctResponse : "",
            index % 2 === 0 ? 420 : null,
            index % 2 === 0 ? 0 : 1
          )
        );
      });

      mainTrials.forEach((trial, index) => {
        const shouldRespond = index % 5 !== 0;
        state.csvRows.push(
          buildRow(
            trial,
            shouldRespond ? trial.correctResponse : "",
            shouldRespond ? 430 + (index % 7) * 10 : null,
            shouldRespond ? 0 : 1
          )
        );
      });

      assert(state.csvRows.length === 266, "Total rows = 266");
      assert(state.csvRows.filter((row) => row.trial_type === "practice").length === 10, "Practice rows = 10");
      assert(state.csvRows.filter((row) => row.trial_type !== "practice").length === 256, "Main rows = 256");
      assert(state.csvRows.filter((row) => row.block_number === 1).length === 128, "Block 1 rows = 128");
      assert(state.csvRows.filter((row) => row.block_number === 2).length === 128, "Block 2 rows = 128");
      assert(state.csvRows.every((row) => CSV_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(row, field))), "Every row has all CSV fields");

      const lines = [state.csvHeaderLine, ...state.csvRows.map(serializeCsvRow)];
      assert(lines.length === 267, "CSV lines with header = 267");

      elements["self-test-output"].textContent =
        "WEB_E2E_TEST_OK\n" +
        "Total rows: 266\n" +
        "Practice rows: 10\n" +
        "Main rows: 256\n" +
        "Block 1 rows: 128\n" +
        "Block 2 rows: 128\n" +
        "CSV fields: complete";
      document.title = "WEB_E2E_TEST_OK";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      elements["self-test-output"].textContent = `WEB_E2E_TEST_FAIL\n${message}`;
      document.title = "WEB_E2E_TEST_FAIL";
    }
  }
})();
