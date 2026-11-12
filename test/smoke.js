'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const assert = (cond, msg) => {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  console.log('PASS: ' + msg);
};

const noop = () => {};
const ctxStub = new Proxy({}, {
  get: (t, p) => {
    if (p === 'createRadialGradient' || p === 'createLinearGradient') return () => ({ addColorStop: noop });
    if (p === 'measureText') return () => ({ width: 0 });
    return noop;
  },
  set: () => true,
});

const elements = {};
function makeEl(id) {
  return {
    id, style: {}, classList: { add: noop, remove: noop, contains: () => false },
    textContent: '', innerHTML: '',
    appendChild: noop, addEventListener: noop, onclick: null,
    getContext: () => ctxStub,
    width: 0, height: 0,
  };
}

global.document = {
  getElementById: id => elements[id] || (elements[id] = makeEl(id)),
  createElement: tag => makeEl('el_' + Math.random()),
};
global.devicePixelRatio = 1;
global.window = { innerWidth: 1280, innerHeight: 720, addEventListener: noop };
global.localStorage = { getItem: () => null, setItem: noop };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = noop;

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/);
assert(match, 'index.html contains a script block');

const driver = `
const assert = (c, m) => { if (!c) { console.error('FAIL: ' + m); process.exit(1); } console.log('PASS: ' + m); };

initAudio();
startGame();
assert(state === 'playing', 'game starts into playing state');
assert(wave === 1 && enemies.length > 0, 'wave 1 spawned enemies: ' + enemies.length);

keys.KeyW = true; keys.KeyD = true;
let leveled = false;
for (let f = 0; f < 60 * 60; f++) {
  update(1/60);
  if (state === 'levelup') { leveled = true; chooseUpgrade(pendingCards[0]); }
  if (state === 'gameover') break;
  player.hp = Math.max(player.hp, 50);
}
assert(leveled, 'leveled up during 60s combat sim');
assert(kills > 0, 'enemies were killed: ' + kills);
assert(score > 0, 'score accumulated: ' + score);
assert(player.level > 1, 'player level > 1: ' + player.level);

openLevelUp();
assert(pendingCards.length > 0 && pendingCards.length <= 3, 'level-up offers 1-3 cards');
chooseUpgrade(pendingCards[0]);
assert(state === 'playing', 'upgrade choice returns to playing');

togglePause(); assert(state === 'paused', 'pause works');
togglePause(); assert(state === 'playing', 'unpause works');

keys.KeyW = false; keys.KeyD = false;
player.hp = 0.1;
spawnEnemy('boss', player.x, player.y);
let died = false;
for (let f = 0; f < 600 && !died; f++) { update(1/60); if (state === 'gameover') died = true; }
assert(died, 'player dies and game over triggers');

startGame();
assert(state === 'playing' && player.hp === 100 && wave === 1, 'restart resets state cleanly');

let nan = false;
for (let f = 0; f < 60 * 600; f++) {
  update(1/60);
  if (state === 'levelup') chooseUpgrade(pendingCards[0]);
  if (state === 'gameover') break;
  if (!isFinite(player.x) || !isFinite(player.y) || !isFinite(player.hp)) { nan = true; break; }
}
assert(!nan, 'no NaN in player state over long sim (wave ' + wave + ', state ' + state + ')');

console.log('\\nALL SMOKE TESTS PASSED');
`;

vm.runInThisContext(match[1] + '\n' + driver, { filename: 'game.js' });
