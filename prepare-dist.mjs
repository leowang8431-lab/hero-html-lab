// No dependencies and no framework: copy the four static pages for hosting.
import { cp, mkdir, access } from 'node:fs/promises';
for (const name of ['rocket', 'spider', 'strange', 'thanos']) {
  await access(`assets/images/${name}.png`).catch(() => {
    throw new Error(`Missing required character cutout: ${name}.png`);
  });
}
await mkdir('dist', { recursive: true });
for (const page of ['index.html', 'quotes.html', 'projects.html', 'machine.html']) {
  await cp(page, `dist/${page}`);
}
await cp('assets', 'dist/assets', { recursive: true });
console.log('Static site ready in dist/.');
