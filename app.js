const app = document.getElementById("app");

let words = [];
let index = 0;

/* ========== 首页 ========== */
function renderHome() {
  app.innerHTML = `
    <div class="center">
      <label class="upload-circle">
        +
        <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" hidden>
      </label>
      <p>点击上传 Excel / CSV</p>
    </div>
  `;

  document.getElementById("fileInput").addEventListener("change", loadFile);
}

/* ========== 读取 Excel ========== */
function loadFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    const data = new Uint8Array(evt.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    words = rows
      .filter(r => r.length >= 3)
      .map(r => ({
        word: r[0],
        example: r[1],
        meaning: r[2]
      }));

    index = Math.floor(Math.random() * words.length);
    renderStudy(); // ⚠️ 直接切换，不留首页
  };
  reader.readAsArrayBuffer(file);
}

/* ========== 背词界面 ========== */
function renderStudy() {
  const w = words[index];

  app.innerHTML = `
    <div id="viewer">
      <div id="word">${w.word}</div>
      <div id="example">${w.example}</div>

      <div class="controls">
        <button id="prev">上一个</button>
        <button id="speak">🔊 发音</button>
        <button id="next">下一个</button>
      </div>
    </div>

    <div class="modal hidden" id="modal">
      <div class="modal-content">
        <div id="meaning">${w.meaning}</div>
        <button id="ok">确定</button>
      </div>
    </div>
  `;

  document.getElementById("word").onclick = () =>
    document.getElementById("modal").classList.remove("hidden");

  document.getElementById("ok").onclick = () => {
    nextWord();
  };

  document.getElementById("next").onclick = nextWord;
  document.getElementById("prev").onclick = prevWord;

  document.getElementById("speak").onclick = () => {
    const u = new SpeechSynthesisUtterance(w.word);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };
}

function nextWord() {
  index = (index + 1) % words.length;
  renderStudy();
}

function prevWord() {
  index = (index - 1 + words.length) % words.length;
  renderStudy();
}

/* 启动 */
renderHome();
