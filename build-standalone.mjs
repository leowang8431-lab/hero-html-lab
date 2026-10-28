// Build an offline, single-file preview from the four original pages.
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const destination = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(root, '..', 'hero-home-standalone.html');
const pages = [
  { id: 'home', hash: 'home', file: 'index.html' },
  { id: 'quotes', hash: 'quotes', file: 'quotes.html' },
  { id: 'projects', hash: 'projects', file: 'projects.html' },
  { id: 'machine', hash: 'game', file: 'machine.html' }
];
const mimeTypes = {
  '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf'
};
const dataCache = new Map();
const assets = new Map();
const read = relativePath => readFile(path.join(root, relativePath), 'utf8');
const escapeAttribute = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const decodeEntities = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const jsonForScript = value => JSON.stringify(value).replace(/</g, '\\u003c');
// Raw script/style text must be escaped for its HTML context, not HTML-encoded.
const scriptText = value => value.replace(/<\/script/gi, '<\\/script');
const styleText = value => value.replace(/<\/style/gi, '\\3c /style');

async function replaceAsync(text, pattern, replacement) {
  const matches = [...text.matchAll(pattern)];
  const values = await Promise.all(matches.map(match => replacement(...match)));
  let result = '';
  let cursor = 0;
  matches.forEach((match, index) => {
    result += text.slice(cursor, match.index) + values[index];
    cursor = match.index + match[0].length;
  });
  return result + text.slice(cursor);
}

function localPath(reference, fromDirectory = root) {
  const cleaned = decodeEntities(reference).trim();
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(cleaned)) {
    throw new Error(`Offline preview cannot load an external resource: ${cleaned}`);
  }
  const absolute = path.resolve(fromDirectory, decodeURIComponent(cleaned.split(/[?#]/)[0]));
  const relative = path.relative(root, absolute);
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
    throw new Error(`Resource must be inside the website folder: ${cleaned}`);
  }
  return absolute;
}

async function dataUri(reference, fromDirectory = root) {
  if (/^data:/i.test(reference)) return reference;
  const absolute = localPath(reference, fromDirectory);
  if (!dataCache.has(absolute)) {
    const mime = mimeTypes[path.extname(absolute).toLowerCase()];
    if (!mime) throw new Error(`Unsupported offline resource: ${absolute}`);
    dataCache.set(absolute, readFile(absolute).then(bytes => `data:${mime};base64,${bytes.toString('base64')}`));
  }
  const fragment = reference.includes('#') ? reference.slice(reference.indexOf('#')) : '';
  return (await dataCache.get(absolute)) + fragment;
}

async function registerAsset(reference) {
  const absolute = localPath(reference);
  const key = path.relative(root, absolute).split(path.sep).join('/');
  if (!assets.has(key)) assets.set(key, await dataUri(reference));
  return key;
}

function hashForLink(reference) {
  const normalized = decodeEntities(reference).replace(/^\.\//, '').split(/[?#]/)[0].toLowerCase();
  const page = pages.find(item => item.file === normalized);
  return page ? `#${page.hash}` : reference;
}

async function embedMain(markup) {
  let output = await replaceAsync(markup, /<img\b[^>]*>/gi, async tag => {
    const source = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    if (!source || /^data:/i.test(source[2])) return tag;
    if (/\bsrcset\s*=/i.test(tag)) throw new Error('Add srcset handling before building responsive source images.');
    const key = await registerAsset(source[2]);
    return tag.replace(source[0], `data-asset="${escapeAttribute(key)}"`);
  });
  output = output.replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])(.*?)\2/gi,
    (match, prefix, quote, href) => `${prefix}${quote}${escapeAttribute(hashForLink(href))}${quote}`);
  return output;
}

async function embedScript(source) {
  // Replace image literals only; keep the original functions and their state.
  return replaceAsync(source, /(["'])(assets\/[^'"\r\n]+)\1/g, async (_match, _quote, reference) => {
    const key = await registerAsset(reference);
    return `window.HERO_ASSETS[${JSON.stringify(key)}]`;
  });
}

async function embedCss(source) {
  if (/@import\b/i.test(source)) throw new Error('Inline CSS imports before building the offline preview.');
  return replaceAsync(source, /url\(\s*(?:(["'])(.*?)\1|([^)]*?))\s*\)/gi,
    async (match, _quote, quoted, unquoted) => {
      const reference = (quoted ?? unquoted).trim();
      if (!reference || reference.startsWith('#') || /^data:/i.test(reference)) return match;
      return `url("${await dataUri(reference, path.join(root, 'assets', 'css'))}")`;
    });
}

const sources = await Promise.all(pages.map(async page => {
  const source = await read(page.file);
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i);
  const title = source.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  if (!main || !title) throw new Error(`Missing main or title in ${page.file}`);
  return { ...page, source, title: decodeEntities(title[1]), main: main[1] };
}));
const views = await Promise.all(sources.map(async page =>
  `<section id="view-${page.id}" data-view="${page.id}"${page.id === 'home' ? '' : ' hidden'}>\n${await embedMain(page.main)}\n</section>`
));
const [css, theme, app, quotes, game] = await Promise.all([
  read('assets/css/style.css').then(embedCss),
  read('assets/js/theme.js').then(embedScript),
  read('assets/js/app.js').then(embedScript),
  read('assets/js/quotes.js').then(embedScript),
  read('assets/js/game.js').then(embedScript)
]);
let head = sources[0].source.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1];
if (!head) throw new Error('Home page is missing its head.');
head = head.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
  .replace(/<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])[^>]*>/gi, '');
head = await replaceAsync(head, /<link\b[^>]*>/gi, async tag => {
  const href = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
  if (!href) return tag;
  return tag.replace(href[0], `href="${escapeAttribute(await dataUri(href[2]))}"`);
});

const assetBootstrap = `// Each image is embedded once and shared by every view.\nwindow.HERO_ASSETS = Object.freeze(${jsonForScript(Object.fromEntries(assets))});\nfor (const image of document.querySelectorAll('img[data-asset]')) {\n  image.src = window.HERO_ASSETS[image.dataset.asset];\n}`;
const router = `// Hash navigation keeps the original four pages together in one file.\n(() => {\n  'use strict';\n  const pages = ${jsonForScript(sources.map(({ id, hash, file, title }) => ({ id, hash, file, title })))};\n  const byHash = new Map(pages.map(page => [page.hash, page]));\n  byHash.set('machine', pages.find(page => page.id === 'machine'));\n  const views = document.querySelectorAll('[data-view]');\n  for (const link of document.querySelectorAll('a[href]')) {\n    const href = link.getAttribute('href');\n    const file = href.replace(/^\\.\\//, '').split(/[?#]/)[0].toLowerCase();\n    const page = pages.find(page => page.file === file);\n    if (page) link.setAttribute('href', '#' + page.hash);\n  }\n  function scrollToTop() {\n    const previous = document.documentElement.style.scrollBehavior;\n    document.documentElement.style.scrollBehavior = 'auto';\n    window.scrollTo(0, 0);\n    document.documentElement.style.scrollBehavior = previous;\n  }\n  function showView(scroll) {\n    let hash;\n    try { hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase(); }\n    catch (_) { return; }\n    const page = byHash.get(hash || 'home');\n    // Fragment links such as Skip to main content keep the current view.\n    if (!page) return;\n    for (const view of views) view.hidden = view.dataset.view !== page.id;\n    document.body.dataset.page = page.id;\n    document.title = page.title;\n    for (const link of document.querySelectorAll('#main-nav a')) {\n      if (link.getAttribute('href') === '#' + page.hash) link.setAttribute('aria-current', 'page');\n      else link.removeAttribute('aria-current');\n    }\n    if (scroll) scrollToTop();\n  }\n  window.addEventListener('hashchange', () => showView(true));\n  document.addEventListener('click', event => {\n    const link = event.target.closest('a[href]');\n    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;\n    const hash = link.getAttribute('href');\n    if (hash === window.location.hash && byHash.has(hash.slice(1))) scrollToTop();\n  });\n  showView(false);\n})();`;

const markup = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head.trim()}\n<script>\n${scriptText(theme)}\n</script>\n<style>\n${styleText(css)}\n</style>\n</head>\n<body data-page="home">\n<a class="skip-link" href="#main">Skip to main content</a>\n<header id="site-header"></header>\n<main id="main" tabindex="-1">\n${views.join('\n')}\n</main>\n<footer id="site-footer"></footer>\n<noscript><p>Enable JavaScript to navigate this offline preview and use the interactive features.</p></noscript>\n`;
const scripts = [assetBootstrap, app, quotes, game, router];
const html = markup + scripts.map(source => `<script>\n${scriptText(source)}\n</script>`).join('\n') + '\n</body>\n</html>\n';

// Fail instead of delivering a preview with missing files or duplicate IDs.
const ids = [...markup.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate IDs in combined views.');
for (const page of pages) {
  if (!markup.includes(`id="view-${page.id}"`)) throw new Error(`Missing view: ${page.id}`);
}
if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet["']/i.test(html)) {
  throw new Error('An external script or stylesheet remains.');
}
for (const match of markup.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi)) {
  if (!/^(?:data:|#)/i.test(match[2])) throw new Error(`Unbundled resource or page link: ${match[2]}`);
}
for (const match of markup.matchAll(/\bdata-asset\s*=\s*["']([^"']+)["']/gi)) {
  if (!assets.has(match[1])) throw new Error(`Missing embedded image: ${match[1]}`);
}
if (assets.size !== 4) throw new Error(`Expected four shared character images, found ${assets.size}.`);

await mkdir(path.dirname(destination), { recursive: true });
await writeFile(`${destination}.tmp`, html, 'utf8');
await rename(`${destination}.tmp`, destination);
console.log(`Standalone preview ready: ${destination}`);
console.log(`4 views; ${assets.size} shared images; ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MiB; no external resources.`);
