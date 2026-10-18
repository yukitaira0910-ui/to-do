import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'), js=fs.readFileSync('app.js','utf8'), css=fs.readFileSync('styles.css','utf8'), worker=fs.readFileSync('worker.js','utf8');
test('immediate memo input exists',()=>assert.match(html,/id="task-input"/));
test('swipe status implementation exists',()=>{assert.match(js,/pointerdown/);assert.match(js,/delta<0\?'done':'active'/)});
test('full screen skeleton exists',()=>assert.match(html,/id="loading"/));
test('liquid glass styling exists',()=>assert.match(css,/backdrop-filter:blur/));
test('Cloudflare Worker includes Google and Workers AI',()=>{assert.match(worker,/accounts\.google\.com/);assert.match(worker,/env\.AI\.run/)});
