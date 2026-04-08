import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..", "APP");
const outputPath = path.resolve(__dirname, "WEB_PSYCHOJS_TEST_256.csv");
const port = 8766;
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

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({
    executablePath: findChromeExecutable(),
    headless: true,
    args: ["--disable-gpu"],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await page.goto(`http://127.0.0.1:${port}/index.html?e2e_test=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.title === "WEB_PSYCHOJS_E2E_TEST_OK" || document.title === "WEB_PSYCHOJS_E2E_TEST_FAIL",
      { timeout: 90000 }
    );

    const title = await page.title();
    const outputText = await page.locator("#self-test-output").textContent().catch(() => "");
    if (title !== "WEB_PSYCHOJS_E2E_TEST_OK") {
      const errorBody = await page.locator("#error-body").textContent().catch(() => "");
      throw new Error(`E2E zakończył się błędem.\nTitle: ${title}\nOutput: ${outputText || "(brak)"}\nError: ${errorBody || "(brak)"}`);
    }

    const backupRaw = await page.evaluate((key) => window.localStorage.getItem(key), backupKey);
    assert(backupRaw, "Brakuje kopii awaryjnej w localStorage.");
    const backup = JSON.parse(backupRaw);
    assert(typeof backup.csvText === "string" && backup.csvText.trim().length > 0, "Brakuje tekstu CSV w kopii awaryjnej.");

    fs.writeFileSync(outputPath, backup.csvText, "utf8");

    const rowCount = backup.csvText.trim().split(/\r?\n/).length - 1;
    console.log(`CSV_SAVED=${outputPath}`);
    console.log(`CSV_ROWS=${rowCount}`);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

run().catch((error) => {
  console.error("CSV_EXPORT_FAIL");
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
