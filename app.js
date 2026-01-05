const fileInput = document.getElementById("fileInput");
const home = document.getElementById("home");
const viewer = document.getElementById("viewer");

const wordEl = document.getElementById("word");
const exampleEl = document.getElementById("example");
const meaningEl = document.getElementById("meaning");

const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirmBtn");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const speakBtn = document.getElementById("speakBtn");
const themeBtn = document.getElementById("themeBtn");

let words = [];
let index = 0;

/* 读取文件 */
fileInput.addEventListener("change", e => {
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
    showWord();

    home.classList.add("hidden");
    viewer.classList.remove("hidden");
  };
  reader.readAsArrayBuffer(file);
});

/* 显示单词 */
function showWord() {
  const w = words[index];
  wordEl.textContent = w.word;
  exampleEl.textContent = w.example;
}

/* 点击单词显示释义 */
wordEl.addEventListener("click", () => {
  meaningEl.textContent = words[index].meaning;
  modal.classList.remove("hidden");
});

/* 确认进入下一个 */
confirmBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  index = (index + 1) % words.length;
  showWord();
});

/* 上下 */
nextBtn.onclick = () => {
  index = (index + 1) % words.length;
  showWord();
};
prevBtn.onclick = () => {
  index = (index - 1 + words.length) % words.length;
  showWord();
};

/* 发音 */
speakBtn.onclick = () => {
  const u = new SpeechSynthesisUtterance(words[index].word);
  u.lang = "en-US";
  speechSynthesis.speak(u);
};

/* 日夜模式 */
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};
