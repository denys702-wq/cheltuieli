const test = require('node:test'), assert = require('node:assert/strict');
const { load } = require('./load');

const A = load(['NOISE', 'nm', 'cleanDesc', 'parseAmt', 'apFromText', 'parseCSV', 'parseDateStr', 'mi', 'ymAdd']);

test('parseAmt: formate românești și englezești', () => {
  assert.equal(A.parseAmt('12,50'), 12.5);
  assert.equal(A.parseAmt('1.234,56'), 1234.56);
  assert.equal(A.parseAmt('1,234.56'), 1234.56);
  assert.equal(A.parseAmt('1.234'), 1234);
  assert.equal(A.parseAmt('45 RON'), 45);
  assert.equal(A.parseAmt(''), 0);
  assert.equal(A.parseAmt(null), 0);
});

test('apFromText: extrage suma și comerciantul din notificări', () => {
  const r = A.apFromText('Plata de 45,90 RON la KAUFLAND BUCURESTI cu cardul ****1234');
  assert.equal(r.amt, 45.9);
  assert.match(r.mer, /kaufland/i);
});

test('apFromText: ignoră încasările și textele fără sumă', () => {
  assert.equal(A.apFromText('Ai primit 200 RON de la Ion').skip, 1);
  assert.equal(A.apFromText('Salariu 5000 RON').skip, 1);
  assert.equal(A.apFromText('Bună ziua'), null);
  assert.equal(A.apFromText(''), null);
});

const J = v => JSON.parse(JSON.stringify(v)); // aducem rezultatul din contextul vm în realm-ul testului
test('parseCSV: separatori și ghilimele', () => {
  assert.deepEqual(J(A.parseCSV('a,b\n1,2\n')), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(J(A.parseCSV('a;b\r\n"x;y";2')), [['a', 'b'], ['x;y', '2']]);
  assert.deepEqual(J(A.parseCSV('a,b\n"he said ""hi""",2')), [['a', 'b'], ['he said "hi"', '2']]);
  assert.deepEqual(J(A.parseCSV('a,b\n\n,\n1,2')), [['a', 'b'], ['1', '2']]);
});

test('parseDateStr: ISO, zi-lună-an și valori invalide', () => {
  assert.equal(A.parseDateStr('2026-03-07'), '2026-03-07');
  assert.equal(A.parseDateStr('25/12/2026'), '2026-12-25');
  assert.equal(A.parseDateStr('12/25/2026'), '2026-12-25');
  assert.equal(A.parseDateStr('2026-13-40'), null);
  assert.equal(A.parseDateStr('abc'), null);
});

test('ymAdd: trece corect peste ani', () => {
  assert.equal(A.ymAdd('2026-11', 3), '2027-02');
  assert.equal(A.ymAdd('2026-01', -1), '2025-12');
  assert.equal(A.ymAdd('2026-05', 0), '2026-05');
});

test('nm și cleanDesc: normalizează diacriticele și zgomotul', () => {
  assert.equal(A.nm('  Cumpărături  ÎN  Mâncare! '), 'cumparaturi in mancare');
  assert.equal(A.cleanDesc('PLATA POS Kaufland 12345678'), 'Kaufland');
});

const H = load(['hcRun']);
test('hcRun: date curate nu dau probleme', () => {
  const d = { tx: [{ id: 1, type: 'exp', amt: 10, date: '2026-03-07' }], pl: [], subs: [], goals: [], cats: [{ id: 1 }] };
  assert.deepEqual(J(H.hcRun(d)), []);
});

test('hcRun: prinde sume, date, tipuri și id-uri greșite', () => {
  const d = { tx: [{ id: 1, type: 'exp', amt: -5, date: '2026-13-45' }, { id: 1, type: 'x', amt: 3, date: '2026-01-01' }], pl: [{ amt: 'a' }], subs: [], goals: [], cats: [] };
  const r = J(H.hcRun(d)).join('|');
  for (const k of ['sumă invalidă', 'dată invalidă', 'tip necunoscut', 'id duplicat', 'planificate', 'categorii']) assert.match(r, new RegExp(k));
});
