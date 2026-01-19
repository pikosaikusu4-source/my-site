// ===== 診断データ =====
const RESULTS = [
  {
    min: 0, max: 19,
    headline: "色気レベル：ピュア",
    desc: "自然体の魅力が強いタイプ。無理に飾らない雰囲気が安心感とドキッを同時に与える。",
    tags: ["透明感", "癒し", "安心感"]
  },
  {
    min: 20, max: 39,
    headline: "色気レベル：ほのか",
    desc: "距離が縮んだ瞬間に雰囲気が変わるギャップ型。控えめなのに印象に残る。",
    tags: ["ギャップ", "素直", "やさしさ"]
  },
  {
    min: 40, max: 59,
    headline: "色気レベル：誘惑",
    desc: "視線や仕草に色気がにじむタイプ。本人は無自覚なのに相手が意識してしまう。",
    tags: ["視線", "雰囲気", "余韻"]
  },
  {
    min: 60, max: 79,
    headline: "色気レベル：大人",
    desc: "落ち着きと余裕が魅力。近づくと安心するのに、どこか刺激もある存在。",
    tags: ["包容力", "余裕", "距離感"]
  },
  {
    min: 80, max: 100,
    headline: "色気レベル：危険",
    desc: "近づくほど深みにハマる引力型。気づいたら目で追ってしまうタイプ。",
    tags: ["中毒性", "引力", "魔性"]
  }
];

const ONE_LINERS = [
  "今日は少しだけ余裕のある笑顔を意識してみて。",
  "目を見て話すだけで印象が変わる日。",
  "ゆっくり話すと距離が縮まりやすい。",
  "香りと身だしなみが武器になる日。",
  "引く余裕が一番の魅力。"
];

// ===== 共通関数 =====
function hashStringToInt(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function pickResult(score) {
  return RESULTS.find(r => score >= r.min && score <= r.max) ?? RESULTS[0];
}

function buildShareText(name, score, headline, one) {
  return `【大人の色気診断】\n${name} の結果：${score}%\n${headline}\nひとこと：${one}\n#大人の色気診断`;
}

// ===== DOM =====
const nameInput = document.getElementById("nameInput");
const diagBtn = document.getElementById("diagBtn");
const resultCard = document.getElementById("resultCard");
const meterBar = document.getElementById("meterBar");
const scoreNum = document.getElementById("scoreNum");
const resultHeadline = document.getElementById("resultHeadline");
const resultDesc = document.getElementById("resultDesc");
const resultTags = document.getElementById("resultTags");
const copyBtn = document.getElementById("copyBtn");
const tweetBtn = document.getElementById("tweetBtn");
const againBtn = document.getElementById("againBtn");

// ===== 表示処理 =====
function renderResult(name, score) {
  const r = pickResult(score);
  const h2 = hashStringToInt(name + "|one");
  const one = ONE_LINERS[h2 % ONE_LINERS.length];

  resultCard.classList.remove("hidden");
  scoreNum.textContent = score;
  meterBar.style.width = score + "%";

  resultHeadline.textContent = r.headline;
  resultDesc.textContent = r.desc + "\n\nひとこと：" + one;

  resultTags.innerHTML = "";
  r.tags.forEach(t => {
    const li = document.createElement("li");
    li.textContent = "#" + t;
    resultTags.appendChild(li);
  });

  const shareText = buildShareText(name, score, r.headline, one);
  const shareUrl = location.href.split("#")[0];

  tweetBtn.href =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(shareText) +
    "&url=" +
    encodeURIComponent(shareUrl);

  const params = new URLSearchParams(location.search);
  params.set("name", name);
  params.set("score", score);
  history.replaceState(null, "", "?" + params.toString());
}

// ===== 診断 =====
function diagnose() {
  const raw = nameInput.value.trim();
  const name = raw.length ? raw : "名無し";
  const h = hashStringToInt(name);
  const score = clamp(h % 101, 0, 100);
  renderResult(name, score);
}

diagBtn.addEventListener("click", diagnose);
nameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") diagnose();
});

// ===== コピー =====
copyBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "名無し";
  const score = Number(scoreNum.textContent || 0);

  const h2 = hashStringToInt(name + "|one");
  const one = ONE_LINERS[h2 % ONE_LINERS.length];
  const headline = resultHeadline.textContent || "";

  const text = buildShareText(name, score, headline, one) + "\n" + location.href;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "コピーしました";
    setTimeout(() => copyBtn.textContent = "結果をコピー", 1200);
  } catch {
    prompt("コピーして使ってください", text);
  }
});

// ===== リセット =====
againBtn.addEventListener("click", () => {
  resultCard.classList.add("hidden");
  meterBar.style.width = "0%";
  scoreNum.textContent = "0";
  history.replaceState(null, "", location.pathname);
  nameInput.focus();
});

// ===== URL復元 =====
(function restore() {
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const scoreStr = params.get("score");
  if (!name || !scoreStr) return;

  const score = clamp(Number(scoreStr), 0, 100);
  nameInput.value = name;
  renderResult(name, score);
})();
