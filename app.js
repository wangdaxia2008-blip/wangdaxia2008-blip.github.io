{\rtf1\ansi\ansicpg936\cocoartf2639
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;\f1\fnil\fcharset134 PingFangSC-Regular;\f2\fnil\fcharset0 AppleColorEmoji;
}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // app.js - 
\f1 \'d6\'a7\'b3\'d6\'c9\'cf\'b4\'ab\'bc\'c7\'c2\'bc\'d3\'eb\'d6\'f7\'cc\'e2\'c9\'e8\'d6\'c3
\f0 \
let words = [];\
let order = [];\
let pos = 0;\
let lastFileName = '';\
\
const fileInput = document.getElementById('fileInput');\
const uploaderCircle = document.getElementById('uploaderCircle');\
const uploaderView = document.getElementById('uploaderView');\
const studyView = document.getElementById('studyView');\
const wordEl = document.getElementById('word');\
const exampleEl = document.getElementById('example');\
const playBtn = document.getElementById('playBtn');\
const nextBtn = document.getElementById('nextBtn');\
const prevBtn = document.getElementById('prevBtn');\
const backBtn = document.getElementById('backBtn');\
\
const historyBtn = document.getElementById('historyBtn');\
const historyModal = document.getElementById('historyModal');\
const historyList = document.getElementById('historyList');\
const closeHistory = document.getElementById('closeHistory');\
const clearHistory = document.getElementById('clearHistory');\
\
const themeToggle = document.getElementById('themeToggle');\
\
// ------------------- Theme handling -------------------\
function applyTheme(theme)\{\
  document.body.classList.remove('theme-light','theme-dark');\
  document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');\
  localStorage.setItem('appTheme', theme);\
  themeToggle.textContent = theme === 'light' ? '
\f2 \uc0\u55356 \u57113 
\f0 ' : '
\f2 \uc0\u9728 \u65039 
\f0 ';\
\}\
\
function initTheme()\{\
  const saved = localStorage.getItem('appTheme');\
  if(saved)\{\
    applyTheme(saved);\
  \} else \{\
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;\
    applyTheme(prefersDark ? 'dark' : 'light');\
  \}\
\}\
themeToggle.addEventListener('click', ()=>\{\
  const cur = document.body.classList.contains('theme-light') ? 'light' : 'dark';\
  applyTheme(cur === 'light' ? 'dark' : 'light');\
\});\
initTheme();\
\
// ------------------- Upload / parse -------------------\
uploaderCircle.addEventListener('click', ()=> fileInput.click());\
fileInput.addEventListener('change', ev => \{\
  const f = ev.target.files[0];\
  if(!f) return;\
  lastFileName = f.name;\
  readFile(f);\
  fileInput.value = '';\
\});\
\
function readFile(file)\{\
  const name = file.name.toLowerCase();\
  if(name.endsWith('.csv'))\{\
    const r = new FileReader();\
    r.onload = e => parseCsvString(e.target.result, file.name);\
    r.readAsText(file, 'utf-8');\
  \} else \{\
    const r = new FileReader();\
    r.onload = e => \{\
      try \{\
        const data = new Uint8Array(e.target.result);\
        const wb = XLSX.read(data, \{type:'array'\});\
        const sheet = wb.SheetNames[0];\
        const arr = XLSX.utils.sheet_to_json(wb.Sheets[sheet], \{header:1, raw:false\});\
        parseTableArray(arr, file.name);\
      \} catch(err)\{\
        alert('
\f1 \'bd\'e2\'ce\'f6
\f0  Excel 
\f1 \'b3\'f6\'b4\'ed\'a3\'ba
\f0 ' + err.message);\
      \}\
    \};\
    r.readAsArrayBuffer(file);\
  \}\
\}\
\
function parseCsvString(txt, filename)\{\
  const wb = XLSX.read(txt, \{type:'string'\});\
  const sheet = wb.SheetNames[0];\
  const arr = XLSX.utils.sheet_to_json(wb.Sheets[sheet], \{header:1, raw:false\});\
  parseTableArray(arr, filename);\
\}\
\
function parseTableArray(arr, filename)\{\
  const rows = arr.filter(r => r && r.some(c => c !== null && c !== undefined && String(c).trim() !== ''));\
  if(rows.length === 0)\{ alert('
\f1 \'b1\'ed\'b8\'f1\'ce\'aa\'bf\'d5\'bb\'f2\'ce\'de\'b7\'a8\'ca\'b6\'b1\'f0\'a3\'ac\'c7\'eb\'bc\'ec\'b2\'e9
\f0 '); return; \}\
  let start = 0;\
  const f0 = String(rows[0][0] || '').toLowerCase();\
  if(f0.match(/word|
\f1 \'b5\'a5\'b4\'ca
\f0 |
\f1 \'b4\'ca
\f0 /)) start = 1;\
  const parsed = [];\
  for(let i = start; i < rows.length; i++)\{\
    const r = rows[i];\
    const w = (r[0] || '').toString().trim();\
    const ex = (r[1] || '').toString().trim();\
    const d = (r[2] || '').toString().trim();\
    if(!w) continue;\
    parsed.push(\{word:w, example:ex, meaning:d\});\
  \}\
  if(parsed.length === 0)\{ alert('
\f1 \'ce\'b4\'bd\'e2\'ce\'f6\'b5\'bd\'d3\'d0\'d0\'a7\'b5\'a5\'b4\'ca\'a3\'ac\'c7\'eb\'c8\'b7\'c8\'cf\'c1\'d0\'cb\'b3\'d0\'f2\'a3\'ba\'b5\'a5\'b4\'ca\'a1\'a2\'c0\'fd\'be\'e4\'a1\'a2\'ca\'cd\'d2\'e5
\f0 '); return; \}\
\
  words = parsed;\
  order = words.map((_,i)=>i);\
  shuffleOrder();\
  saveUploadRecord(filename, words.length);\
  enterStudy();\
\}\
\
// ------------------- Records (localStorage) -------------------\
function getRecords()\{\
  const raw = localStorage.getItem('uploadRecords');\
  if(!raw) return [];\
  try \{ return JSON.parse(raw); \} catch \{ return []; \}\
\}\
function saveRecords(arr)\{ localStorage.setItem('uploadRecords', JSON.stringify(arr)); \}\
\
function saveUploadRecord(filename, count)\{\
  const rec = \{ name: filename || ('file_' + Date.now()), count: count, time: new Date().toISOString() \};\
  const arr = getRecords();\
  arr.unshift(rec);\
  // keep last 20\
  if(arr.length > 20) arr.length = 20;\
  saveRecords(arr);\
\}\
\
// show history\
historyBtn.addEventListener('click', ()=> \{ renderHistory(); historyModal.classList.remove('hidden'); historyModal.style.display = 'flex'; \});\
closeHistory.addEventListener('click', ()=> \{ historyModal.classList.add('hidden'); historyModal.style.display = 'none'; \});\
clearHistory.addEventListener('click', ()=> \{ if(confirm('
\f1 \'c8\'b7\'b6\'a8\'c7\'e5\'bf\'d5\'c9\'cf\'b4\'ab\'bc\'c7\'c2\'bc\'a3\'bf
\f0 '))\{ localStorage.removeItem('uploadRecords'); renderHistory(); \} \});\
\
function renderHistory()\{\
  const arr = getRecords();\
  if(arr.length === 0)\{\
    historyList.innerHTML = '<div style="padding:12px;color:var(--muted-dark)">
\f1 \'c3\'bb\'d3\'d0\'c9\'cf\'b4\'ab\'bc\'c7\'c2\'bc\'a3\'a8\'e4\'af\'c0\'c0\'c6\'f7\'bd\'f6\'b1\'a3\'b4\'e6\'ce\'c4\'bc\'fe\'c3\'fb\'a1\'a2\'b5\'a5\'b4\'ca\'ca\'fd\'d3\'eb\'ca\'b1\'bc\'e4\'a3\'ac\'b2\'bb\'c4\'dc\'bb\'d6\'b8\'b4\'ce\'c4\'bc\'fe\'a3\'a9\'a1\'a3
\f0 </div>';\
    return;\
  \}\
  historyList.innerHTML = arr.map((r, idx) => \{\
    const date = new Date(r.time).toLocaleString();\
    return `<div class="record">\
      <div class="meta"><div><strong>$\{r.name\}</strong></div><div class="date">$\{date\}</div></div>\
      <div style="text-align:right"><div>$\{r.count\} 
\f1 \'b8\'f6
\f0 </div><div><button class="small ghost" data-idx="$\{idx\}" onclick="viewRecord($\{idx\})">
\f1 \'cf\'ea\'c7\'e9
\f0 </button></div></div>\
    </div>`;\
  \}).join('');\
\}\
// expose viewRecord to global for inline onclick\
window.viewRecord = function(i)\{\
  const arr = getRecords();\
  if(!arr[i]) return;\
  const r = arr[i];\
  alert(`
\f1 \'ce\'c4\'bc\'fe\'a3\'ba
\f0 $\{r.name\}\\n
\f1 \'b5\'a5\'b4\'ca\'ca\'fd\'a3\'ba
\f0 $\{r.count\}\\n
\f1 \'c9\'cf\'b4\'ab\'ca\'b1\'bc\'e4\'a3\'ba
\f0 $\{new Date(r.time).toLocaleString()\}\\n\\n
\f1 \'cc\'e1\'ca\'be\'a3\'ba\'e4\'af\'c0\'c0\'c6\'f7\'bd\'f6\'b1\'a3\'b4\'e6\'d4\'aa\'d0\'c5\'cf\'a2\'a3\'ac\'c8\'f4\'d0\'e8\'d6\'d8\'d0\'c2\'c1\'b7\'cf\'b0\'c7\'eb\'d6\'d8\'d0\'c2\'c9\'cf\'b4\'ab\'d4\'ad\'ce\'c4\'bc\'fe\'a1\'a3
\f0 `);\
\};\
\
// ------------------- study functions -------------------\
function shuffleOrder()\{\
  for(let i=order.length-1;i>0;i--)\{ const j = Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; \}\
\}\
\
function enterStudy()\{\
  document.getElementById('uploaderView').classList.add('hidden');\
  document.getElementById('studyView').classList.remove('hidden');\
  pos = 0;\
  showCard(pos);\
\}\
\
function showCard(i)\{\
  if(order.length === 0) return;\
  if(i < 0) i = 0;\
  if(i >= order.length)\{\
    wordEl.textContent = '
\f1 \'d2\'d1\'cd\'ea\'b3\'c9
\f0  
\f2 \uc0\u55356 \u57225 
\f0 ';\
    exampleEl.textContent = '
\f1 \'cd\'ea\'b3\'c9\'ba\'f3\'bf\'c9\'b7\'b5\'bb\'d8\'c9\'cf\'b4\'ab\'d0\'c2\'b1\'ed\'b8\'f1
\f0 ';\
    return;\
  \}\
  pos = i;\
  const it = words[order[pos]];\
  wordEl.textContent = it.word;\
  exampleEl.textContent = it.example || '';\
\}\
\
// controls\
nextBtn.addEventListener('click', ()=> \{ if(pos < order.length-1) pos++; showCard(pos); \});\
prevBtn.addEventListener('click', ()=> \{ if(pos > 0) pos--; showCard(pos); \});\
backBtn.addEventListener('click', ()=> \{ document.getElementById('studyView').classList.add('hidden'); document.getElementById('uploaderView').classList.remove('hidden'); words=[]; order=[]; pos=0; \});\
\
// popup meaning on word click\
wordEl.addEventListener('click', ()=> \{\
  const it = words[order[pos]];\
  if(!it) return;\
  const ok = confirm(it.word + '\\n\\n' + (it.meaning || '(
\f1 \'ce\'de\'ca\'cd\'d2\'e5
\f0 )') + '\\n\\n
\f1 \'b0\'b4
\f0 \'93
\f1 \'c8\'b7\'b6\'a8
\f0 \'94
\f1 \'cc\'f8\'b5\'bd\'cf\'c2\'d2\'bb\'b8\'f6
\f0 ');\
  if(ok)\{ if(pos < order.length-1) pos++; showCard(pos); \}\
\});\
\
// speech\
playBtn.addEventListener('click', ()=> \{ const it = words[order[pos]]; if(it) speak(it.word); \});\
\
function speak(text)\{\
  if(!('speechSynthesis' in window))\{ alert('
\f1 \'b5\'b1\'c7\'b0\'e4\'af\'c0\'c0\'c6\'f7\'b2\'bb\'d6\'a7\'b3\'d6\'b7\'a2\'d2\'f4
\f0 '); return; \}\
  const u = new SpeechSynthesisUtterance(text);\
  const ascii = text.replace(/[^ -~]/g,'');\
  u.lang = (ascii.length / Math.max(1, text.length) > 0.6) ? 'en-US' : 'zh-CN';\
  speechSynthesis.cancel();\
  speechSynthesis.speak(u);\
\}\
\
// accessibility\
document.addEventListener('keydown', (e) => \{\
  if((e.key === ' ' || e.key === 'Enter') && document.activeElement === wordEl)\{ e.preventDefault(); wordEl.click(); \}\
\});\
\
// init render history on load\
renderHistory();\
}