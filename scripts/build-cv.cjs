'use strict';

// Prints src/cv/cv.html to the one-page A4 Igor_Szuniewicz_CV.pdf through
// headless Firefox and its built-in WebDriver BiDi. No npm packages; Node 22+
// supplies WebSocket. Not part of the website build: the build only copies the
// committed PDF.
//
//   node scripts/build-cv.cjs                       replaces the public PDF
//   node scripts/build-cv.cjs --output preview.pdf  writes a candidate instead
//
// Firefox is found at FIREFOX_BIN, the default macOS or Windows install, or on PATH.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src', 'cv', 'cv.html');

function parseArgs(argv) {
  const at = argv.indexOf('--output');
  if (at !== -1 && !argv[at + 1]) throw new Error('--output needs a file path');
  return { output: path.resolve(at === -1 ? path.join(root, 'Igor_Szuniewicz_CV.pdf') : argv[at + 1]) };
}

function firefoxBinary() {
  const candidates = [
    process.env.FIREFOX_BIN,
    '/Applications/Firefox.app/Contents/MacOS/firefox',
    'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
  ].filter(Boolean);
  return candidates.find((file) => fs.existsSync(file)) || 'firefox';
}

// Firefox picks a free port for port 0 and announces it on stderr.
function launchFirefox(profile) {
  const child = spawn(firefoxBinary(), ['--headless', '--profile', profile, '--remote-debugging-port', '0', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error(`Firefox did not start WebDriver BiDi:\n${log}`)), 30000);
    child.on('error', (error) => { clearTimeout(timer); reject(new Error(`Cannot start Firefox (${error.message}); set FIREFOX_BIN`)); });
    child.stderr.on('data', (chunk) => {
      log += chunk;
      const match = /WebDriver BiDi listening on (ws:\/\/\S+)/.exec(log);
      if (match) { clearTimeout(timer); resolve(match[1].replace(/\/$/, '')); }
    });
  });
  return { child, endpoint };
}

function bidi(url) {
  const socket = new WebSocket(`${url}/session`);
  const pending = new Map();
  let id = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.type === 'error') waiter.reject(new Error(`${message.error}: ${message.message}`));
    else waiter.resolve(message.result);
  };
  const opened = new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = () => reject(new Error('WebDriver BiDi connection failed')); });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return { opened, send, close: () => socket.close() };
}

// Firefox also writes an outline from the headings, whose /Count entries are not
// pages, so only page objects are counted.
function pageCount(pdf) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

async function main() {
  const { output } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(source)) throw new Error(`Missing ${path.relative(root, source)}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-firefox-'));
  const { child, endpoint } = launchFirefox(profile);
  let session;
  try {
    session = bidi(await endpoint);
    await session.opened;
    await session.send('session.new', { capabilities: {} });
    const { contexts } = await session.send('browsingContext.getTree', {});
    const context = contexts[0].context;
    await session.send('browsingContext.navigate', { context, url: pathToFileURL(source).href, wait: 'complete' });
    await session.send('script.evaluate', { expression: 'document.fonts.ready.then(() => true)', target: { context }, awaitPromise: true });
    const printed = await session.send('browsingContext.print', {
      context,
      background: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      page: { width: 21, height: 29.7 },
      shrinkToFit: false,
    });
    const pdf = Buffer.from(printed.data, 'base64');
    const pages = pageCount(pdf);
    if (pages !== 1) throw new Error(`The CV must fit one A4 page; Firefox produced ${pages}`);
    fs.writeFileSync(output, pdf);
    console.log(`${path.relative(root, output) || output}: 1 page, ${Math.round(pdf.length / 1024)} KB`);
    await session.send('session.end', {}).catch(() => {});
  } finally {
    if (session) session.close();
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once('exit', resolve));
      child.kill();
      await exited;
    }
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
