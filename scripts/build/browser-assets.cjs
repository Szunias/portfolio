/* Browser asset transforms. JavaScript is shipped verbatim after syntax validation. */
const vm = require('node:vm');

// Conservative CSS minifier: strips comments and collapses whitespace, but
// leaves every other token untouched. It is string-aware so quoted content
// (e.g. content: "*/") cannot be corrupted, and it never removes spaces
// around ':' or inside calc(), where whitespace is syntactically meaningful.
function minifyCss(source) {
  let out = '';
  let i = 0;
  const n = source.length;
  let quote = null;
  const structural = '{};,>';
  while (i < n) {
    const ch = source[i];
    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < n) { out += source[i + 1]; i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; out += ch; i++; continue; }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      // A comment can separate two tokens; keep a single space when both
      // neighbours are token characters so `a/**/b` cannot fuse into `ab`.
      const prev = out[out.length - 1];
      const next = source[i];
      if (prev && next && !structural.includes(prev) && prev !== ' ' &&
          !structural.includes(next) && !/\s/.test(next)) out += ' ';
      continue;
    }
    if (/\s/.test(ch)) {
      while (i < n && /\s/.test(source[i])) i++;
      const prev = out[out.length - 1];
      const next = source[i];
      if (prev && next !== undefined && prev !== ' ' &&
          !structural.includes(prev) && !structural.includes(next)) out += ' ';
      continue;
    }
    if (ch === '}') {
      while (out.endsWith(' ')) out = out.slice(0, -1);
      if (out.endsWith(';')) out = out.slice(0, -1);
      out += '}';
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out.trim();
}

// Syntax gate for browser JS. The build only concatenates files, so without
// this a syntax error ships to production and breaks the page at runtime.
// Pages load classic scripts (no type="module"), so vm.Script is the matching
// parser: it accepts exactly what the browser accepts here.
function assertParsableJs(source, label) {
  try {
    new vm.Script(source, { filename: label });
  } catch (err) {
    throw new Error(`JavaScript syntax error in ${label}: ${err.message}`);
  }
}


module.exports = { minifyCss, assertParsableJs };
