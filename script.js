// ----- Theme -----
const themeBtn = document.getElementById("themeBtn");
const root = document.documentElement;

function loadTheme() {
  const t = localStorage.getItem("theme") || "dark";
  root.dataset.theme = t === "light" ? "light" : "dark";
}
function toggleTheme() {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
}
loadTheme();
themeBtn.addEventListener("click", toggleTheme);

// ----- Text counter -----
const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const copyMsg = document.getElementById("copyMsg");

function updateCounts() {
  const t = textInput.value || "";
  charCount.textContent = String(t.length);

  // 日本語では単語境界が曖昧なので「空白区切りの塊」を単語としてざっくり数える
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  wordCount.textContent = String(words);
}
textInput.addEventListener("input", updateCounts);
updateCounts();

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textInput.value);
    copyMsg.textContent = "コピーしました。";
  } catch {
    copyMsg.textContent = "コピーできませんでした（ブラウザの権限を確認）。";
  }
  setTimeout(() => (copyMsg.textContent = ""), 1500);
});

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  updateCounts();
});

// ----- Memo (localStorage) -----
const memoTitle = document.getElementById("memoTitle");
const memoBody = document.getElementById("memoBody");
const lastSaved = document.getElementById("lastSaved");
const exportBtn = document.getElementById("exportBtn");
const resetMemoBtn = document.getElementById("resetMemoBtn");

const MEMO_KEY = "miniToolsMemo_v1";

function nowStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function loadMemo() {
  const raw = localStorage.getItem(MEMO_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    memoTitle.value = data.title || "";
    memoBody.value = data.body || "";
    lastSaved.textContent = data.savedAt || "-";
  } catch {
    // ignore
  }
}

let memoTimer = null;
function scheduleSaveMemo() {
  if (memoTimer) clearTimeout(memoTimer);
  memoTimer = setTimeout(() => {
    const data = {
      title: memoTitle.value,
      body: memoBody.value,
      savedAt: nowStr(),
    };
    localStorage.setItem(MEMO_KEY, JSON.stringify(data));
    lastSaved.textContent = data.savedAt;
  }, 400);
}

memoTitle.addEventListener("input", scheduleSaveMemo);
memoBody.addEventListener("input", scheduleSaveMemo);
loadMemo();

resetMemoBtn.addEventListener("click", () => {
  localStorage.removeItem(MEMO_KEY);
  memoTitle.value = "";
  memoBody.value = "";
  lastSaved.textContent = "-";
});

exportBtn.addEventListener("click", () => {
  const title = memoTitle.value.trim() || "memo";
  const body = memoBody.value || "";
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
});

// ----- Password generator -----
const useUpper = document.getElementById("useUpper");
const useLower = document.getElementById("useLower");
const useNum = document.getElementById("useNum");
const useSym = document.getElementById("useSym");
const pwLen = document.getElementById("pwLen");
const genBtn = document.getElementById("genBtn");
const pwCopyBtn = document.getElementById("pwCopyBtn");
const pwOut = document.getElementById("pwOut");
const pwMsg = document.getElementById("pwMsg");

function randInt(max) {
  // cryptoが使えるならそれを使う
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function generatePassword() {
  const U = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 似てる文字を少し避ける
  const L = "abcdefghijkmnopqrstuvwxyz";
  const N = "23456789";
  const S = "!@#$%^&*()-_=+[]{};:,.?";

  let pool = "";
  if (useUpper.checked) pool += U;
  if (useLower.checked) pool += L;
  if (useNum.checked) pool += N;
  if (useSym.checked) pool += S;

  const len = Math.max(6, Math.min(64, Number(pwLen.value || 16)));

  if (!pool) {
    pwMsg.textContent = "少なくとも1つはチェックしてください。";
    return "";
  }

  let out = "";
  for (let i = 0; i < len; i++) {
    out += pool[randInt(pool.length)];
  }
  pwMsg.textContent = "";
  return out;
}

genBtn.addEventListener("click", () => {
  const p = generatePassword();
  pwOut.value = p;
});

pwCopyBtn.addEventListener("click", async () => {
  if (!pwOut.value) return;
  try {
    await navigator.clipboard.writeText(pwOut.value);
    pwMsg.textContent = "コピーしました。";
  } catch {
    pwMsg.textContent = "コピーできませんでした。";
  }
  setTimeout(() => (pwMsg.textContent = ""), 1500);
});
