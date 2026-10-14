// Încarcă din app.js doar funcțiile pure cerute, fără DOM și fără Firebase.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').split('\n');

function grab(name) {
  const fn = SRC.findIndex(l => l.startsWith('function ' + name + '(') || l.startsWith('async function ' + name + '('));
  if (fn >= 0) {
    if (/}\s*$/.test(SRC[fn]) && !/^\s*$/.test(SRC[fn]) && SRC[fn].includes('{') && SRC[fn].trim().endsWith('}') && balanced(SRC[fn])) return SRC[fn];
    let e = fn + 1;
    while (e < SRC.length && SRC[e] !== '}') e++;
    return SRC.slice(fn, e + 1).join('\n');
  }
  const cn = SRC.findIndex(l => l.startsWith('const ' + name + '='));
  if (cn >= 0) return SRC[cn];
  throw new Error('nu găsesc ' + name + ' în app.js');
}
function balanced(s) { let d = 0; for (const c of s) { if (c === '{') d++; else if (c === '}') d--; } return d === 0; }

function load(names, extra) {
  const ctx = vm.createContext(Object.assign({ csvOpt: { dmy: true }, p2: n => String(n).padStart(2, '0') }, extra || {}));
  vm.runInContext(names.map(grab).join('\n') + '\n' + names.map(n => `this.${n}=${n};`).join(''), ctx);
  return ctx;
}
module.exports = { load };
