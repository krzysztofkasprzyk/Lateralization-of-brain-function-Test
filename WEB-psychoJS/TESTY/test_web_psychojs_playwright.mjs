import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..", "APP");
const port = 8765;
const backupKey = "tldt_web_backup_v1";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findChromeExecutable() {
  const candidates = [
    path.join(process.env.ProgramFiles || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.LocalAppData || "", "Google", "Chrome", "Application", "chrome.exe"),
  ].filter(Boolean);

  const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
  assert(executablePath, "Nie znaleziono lokalnej instalacji Google Chrome.");
  return executablePath;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
      const resolvedPath = path.normalize(path.join(appRoot, normalizedPath));
      if (!resolvedPath.startsWith(appRoot)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs.readFile(resolvedPath, (error, data) => {
        if (error) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": getMimeType(resolvedPath) });
        res.end(data);
      });
    });

    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function validateRows(rows) {
  assert(Array.isArray(rows), "Kopia awaryjna nie zawiera tablicy wierszy.");
  assert(rows.length === 266, `Oczekiwano 266 wierszy, otrzymano ${rows.length}.`);

  const practiceRows = rows.filter((row) => row.trial_type === "practice");
  const mainRows = rows.filter((row) => row.trial_type !== "practice");
  assert(practiceRows.length === 10, `Trening powinien mieć 10 prób, ma ${practiceRows.length}.`);
  assert(mainRows.length === 256, `Część główna powinna mieć 256 prób, ma ${mainRows.length}.`);

  const counts = new Map();
  for (const row of mainRows) {
    const key = `${row.trial_type}|${row.LVF_stimulus}|${row.RVF_stimulus}|${row.correct_response}`;
    counts.set(key, (counts.get(key) || 0) + 1);
    const rt = Number(row.response_time_from_stimulus);
    assert(Number.isFinite(rt) && rt > 0, `Nieprawidłowy RT w próbie ${row.trial_number}: ${row.response_time_from_stimulus}`);
    assert(/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(String(row.time || "")), `Pole time nie zawiera milisekund w próbie ${row.trial_number}: ${row.time}`);
  }

  assert(counts.size === 64, `Oczekiwano 64 unikalnych kombinacji, otrzymano ${counts.size}.`);
  for (const [key, count] of counts.entries()) {
    assert(count === 4, `Kombinacja ${key} występuje ${count} razy zamiast 4.`);
  }
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({
    executablePath: findChromeExecutable(),
    headless: true,
    args: ["--disable-gpu"],
  });

  try {
    const baseUrl = `http://127.0.0.1:${port}/index.html`;

    const previewPage = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await previewPage.goto(baseUrl, { waitUntil: "networkidle" });
    await previewPage.click("#nav-config");
    await previewPage.click("#start-button");
    await previewPage.waitForSelector("#screen-instructions.active");

    const bodyBackground = await previewPage.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    const cardBackground = await previewPage.evaluate(() => window.getComputedStyle(document.querySelector("#screen-instructions .instruction-card")).backgroundColor);
    assert(bodyBackground === "rgb(255, 255, 255)", `Ekran instrukcji powinien mieć białe tło, ma ${bodyBackground}.`);
    assert(cardBackground === "rgb(255, 255, 255)", `Karta instrukcji powinna mieć białe tło, ma ${cardBackground}.`);

    const e2ePage = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await e2ePage.goto(`${baseUrl}?e2e_test=1`, { waitUntil: "domcontentloaded" });
    await e2ePage.waitForFunction(
      () => document.title === "WEB_PSYCHOJS_E2E_TEST_OK" || document.title === "WEB_PSYCHOJS_E2E_TEST_FAIL",
      { timeout: 90000 }
    );

    const title = await e2ePage.title();
    const outputText = await e2ePage.locator("#self-test-output").textContent().catch(() => "");
    if (title !== "WEB_PSYCHOJS_E2E_TEST_OK") {
      const errorBody = await e2ePage.locator("#error-body").textContent().catch(() => "");
      throw new Error(`E2E zakończył się niepowodzeniem.\nTitle: ${title}\nOutput: ${outputText || "(brak)"}\nError: ${errorBody || "(brak)"}`);
    }

    assert(outputText && outputText.includes("WEB_PSYCHOJS_E2E_TEST_OK"), "Brakuje potwierdzenia E2E w UI.");

    const backupRaw = await e2ePage.evaluate((key) => window.localStorage.getItem(key), backupKey);
    assert(backupRaw, "Brakuje kopii awaryjnej zapisanej w localStorage.");
    const backup = JSON.parse(backupRaw);
    validateRows(backup.rows);

    console.log("WEB_PSYCHOJS_TEST_OK");
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

run().catch((error) => {
  console.error("WEB_PSYCHOJS_TEST_FAIL");
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
