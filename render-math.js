// Build-time only. The browser receives native MathML, without a CDN or JavaScript renderer.
const fs = require('node:fs');
const katex = require('./vendor/katex/katex.min.js');
const formulas = JSON.parse(fs.readFileSync(0, 'utf8'));
const rendered = formulas.map(({tex, display}) => katex.renderToString(tex, {
  displayMode: display,
  output: 'mathml',
  throwOnError: true,
  trust: false,
  strict: 'ignore',
}));
process.stdout.write(JSON.stringify(rendered));
