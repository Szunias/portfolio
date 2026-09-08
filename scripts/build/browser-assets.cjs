/* Browser asset transforms. JavaScript is shipped verbatim after syntax validation. */
const vm = require('node:vm');

// Preserve CSS token boundaries instead of treating JavaScript's \s as CSS
// whitespace. URLs are opaque, and stylesheets with unquoted escapes fall back
// to the original source rather than risking a changed selector or value.
function minifyCss(source) {
  const space = ch => ch !== undefined && /[\t\n\f\r ]/.test(ch);
  const structural = '{};,>';
  let out = '';
  let i = 0;
  let quote = null;
  while (i < source.length) {
    const ch = source[i];
    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < source.length) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    // A hex escape may consume one following whitespace character, leaving
    // the next as a descendant combinator. Preserve the whole stylesheet.
    if (ch === '\\') return source;
    if (source.slice(i, i + 4).toLowerCase() === 'url(' &&
        (i === 0 || !/[\w\-\u0080-\uffff]/.test(source[i - 1]))) {
      let end = i + 4;
      let urlQuote = null;
      for (; end < source.length; end++) {
        const next = source[end];
        if (next === '\\') { end++; continue; }
        if (urlQuote) {
          if (next === urlQuote) urlQuote = null;
        } else if (next === '"' || next === "'") {
          urlQuote = next;
        } else if (next === '(') {
          return source;
        } else if (next === ')') {
          break;
        }
      }
      if (end >= source.length || urlQuote) return source;
      out += source.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) return source;
      // Empty comments retain token separation without inventing a space:
      // .a/**/.b is a compound selector, not the descendant selector .a .b.
      out += '/**/';
      i = end + 2;
      continue;
    }
    if (space(ch)) {
      while (space(source[i])) i++;
      const prev = out[out.length - 1];
      const next = source[i];
      if (prev && next !== undefined && prev !== ' ' &&
          !structural.includes(prev) && !structural.includes(next)) out += ' ';
      continue;
    }
    // Do not delete semicolons inside nested custom-property blocks.
    out += ch;
    i++;
  }
  return out;
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
