// `npm run cms`: local writing setup.
//   - Astro dev server        http://localhost:4321  (editor at /admin/)
//   - Decap CMS file backend  internal, on DECAP_PORT
//   - Publish hook            http://localhost:8081  (what /admin talks to)
//
// The hook passes every editor request through to Decap. When a write succeeds
// (Publish, delete, image upload) it commits exactly those files, builds the site
// with the SEO check, and pushes, so the post goes live via GitHub Actions.
// git authenticates through gh (`gh auth setup-git`). Ctrl+C stops everything.
import { spawn, execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';

const HOOK_PORT = 8081; // Decap's admin UI expects the local backend here
const DECAP_PORT = 8082;
const WRITE_ACTIONS = new Set(['persistEntry', 'persistMedia', 'deleteFile', 'deleteFiles']);
const DEBOUNCE_MS = 1500; // a post and its images arrive as separate requests

const win = process.platform === 'win32';
const run = promisify(execFile);
const sh = (cmd, args) => run(win ? `${cmd}.cmd` : cmd, args, { shell: win, maxBuffer: 32 * 1024 * 1024 });
const log = (msg) => console.log(`\x1b[2m[publish]\x1b[0m ${msg}`);

/* ---------- child processes ---------- */

const devAlreadyRunning = await fetch('http://localhost:4321/').then(() => true, () => false);

const procs = [
  spawn(win ? 'decap-server.cmd' : 'decap-server', [], {
    env: { ...process.env, PORT: String(DECAP_PORT) },
    stdio: ['ignore', 'ignore', 'pipe'],
    shell: win,
  }),
];
procs[0].stderr.on('data', (d) => process.stderr.write(`[cms] ${d}`));
if (devAlreadyRunning) console.log('  Using the dev server already running on :4321');
else procs.push(spawn(win ? 'astro.cmd' : 'astro', ['dev'], { stdio: 'inherit', shell: win }));

/* ---------- publish queue ---------- */

let pending = { paths: new Set(), messages: [] };
let timer;
let busy = Promise.resolve();

function schedule(paths, message) {
  paths.forEach((p) => pending.paths.add(p));
  if (message) pending.messages.push(message);
  clearTimeout(timer);
  timer = setTimeout(() => {
    const batch = pending;
    pending = { paths: new Set(), messages: [] };
    busy = busy.then(() => publish(batch)).catch((e) => log(`\x1b[31mfailed:\x1b[0m ${e.stderr || e.message}`));
  }, DEBOUNCE_MS);
}

async function publish({ paths, messages }) {
  const files = [...paths];
  // Stage additions, edits and deletions of just these paths.
  await sh('git', ['add', '-A', '--', ...files]);
  const { stdout: staged } = await sh('git', ['diff', '--cached', '--name-only', '--', ...files]);
  if (!staged.trim()) return log('nothing changed');

  const subject = messages.find((m) => !/^upload/i.test(m)) ?? messages[0] ?? 'Update content';
  await sh('git', [
    'commit',
    '-m', subject,
    '-m', `Published from the local CMS.\n\nFiles:\n${staged.trim().split('\n').map((f) => `- ${f}`).join('\n')}`,
    '--', ...files,
  ]);
  log(`committed: ${subject}`);

  log('building + SEO check…');
  try {
    const { stdout } = await sh('npm', ['run', 'build', '--silent']);
    const summary = stdout.trim().split('\n').filter((l) => /SEO check|^\s+[!✗]/.test(l));
    summary.forEach((l) => log(l.trim()));
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim().split('\n').slice(-15).join('\n');
    log(`\x1b[31mbuild failed, not pushed.\x1b[0m Fix it and Publish again (or push manually).\n${out}`);
    return;
  }

  try {
    await sh('git', ['push']);
  } catch {
    log('push rejected, rebasing on remote…');
    await sh('git', ['pull', '--rebase', '--autostash']);
    await sh('git', ['push']);
  }
  log('\x1b[32mpushed.\x1b[0m Live in ~1 min: https://github.com/YatharthKaushal/YatharthKaushal.github.io/actions');
}

/* ---------- pass-through hook in front of Decap ---------- */

function writtenPaths(action, params = {}) {
  switch (action) {
    case 'persistEntry':
      return [
        ...(params.entry ? [params.entry.path] : []),
        ...(params.dataFiles ?? []).map((f) => f.path),
        ...(params.assets ?? []).map((a) => a.path),
      ];
    case 'persistMedia':
      return [params.asset?.path];
    case 'deleteFile':
      return [params.path];
    case 'deleteFiles':
      return params.paths ?? [];
    default:
      return [];
  }
}

const hook = createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);

  let upstream;
  try {
    upstream = await fetch(`http://127.0.0.1:${DECAP_PORT}${req.url}`, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : body,
    });
  } catch {
    res.writeHead(502).end('Decap backend not ready');
    return;
  }

  const resBody = Buffer.from(await upstream.arrayBuffer());
  const headers = Object.fromEntries(upstream.headers);
  delete headers['content-encoding'];
  delete headers['content-length'];
  res.writeHead(upstream.status, headers).end(resBody);

  if (!upstream.ok || req.method !== 'POST') return;
  try {
    const { action, params } = JSON.parse(body.toString() || '{}');
    if (!WRITE_ACTIONS.has(action)) return;
    const paths = writtenPaths(action, params).filter(Boolean);
    if (paths.length) schedule(paths, params?.options?.commitMessage);
  } catch {
    // not JSON; nothing to publish
  }
});

hook.listen(HOOK_PORT, () => console.log('\n  Editor: http://localhost:4321/admin/  (Publish = commit + build + push)\n'));

/* ---------- shutdown ---------- */

let stopping = false;
async function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  hook.close();
  for (const p of procs) if (p.exitCode === null) p.kill('SIGTERM');
  await busy; // let an in-flight publish finish
  setTimeout(() => process.exit(code), 300);
}

for (const p of procs) p.on('exit', (code) => stopAll(code ?? 0));
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
