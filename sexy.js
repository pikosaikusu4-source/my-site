// ====== 診断データ（ここを増やせば量産できる） ======
const RESULTS = [
  {
    min: 0, max: 19,
    headline: "色気レベル：ピュア",
    desc: "無理に飾らない自然体が魅力。守ってあげたくなる雰囲気で、安心感の中にふとしたドキッが混ざるタイプ。",
    tags: ["癒し", "透明感", "安心感"]
  },
  {
    min: 20, max: 39,
    headline: "色気レベル：ほのか",
    desc: "距離が近づいた瞬間に雰囲気が変わる“ギャップ型”。普段は控えめでも、目線や声のトーンで刺さる。",
    tags: ["ギャップ", "ふとした表情", "素直"]
  },
  {
    min: 40, max: 59,
    headline: "色気レベル：誘惑",
    desc: "視線や仕草に色気がにじむタイプ。本人は普通のつもりなのに、相手の方が先に意識してしまう。",
    tags: ["雰囲気", "視線", "余韻"]
  },
  {
    min: 60, max: 79,
    headline: "色気レベル：大人",
    desc: "落ち着きと余裕が魅力。近づくと安心するのに、どこか刺激もある。『この人には敵わない』と思われがち。",
    tags: ["包容力", "余裕", "距離感の上手さ"]
  },
  {
    min: 80, max: 100,
    headline: "色気レベル：危険",
    desc: "近づくほど深みにハマる“引力型”。一度気になると目で追ってしまう。魅力が強い分、相手を振り回しがちなので注意。",
    tags: ["中毒性", "引力", "魔性"]
  }
];

// 追加要素：最後に“ひとこと”を添える（軽いドキッ演出）
const ONE_LINERS = [
  "今日は少しだけ、余裕のある笑顔を意識してみて。",
  "ゆっくり話すだけで、印象が変わる日。",
  "相手の目を見て頷くと、距離が縮まりやすい。",
  "香りや身だしなみを整えると、魅力が跳ねる。",
  "引くのが上手い人ほど、惹きつける。"
];

// ====== 文字列→安定した疑似乱数（同じ名前なら同じ結果） ======
function hashStringToInt(str) {
  // 簡易ハッシュ（djb2）
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h >>> 0; // unsigned
  }
  return h;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function pickResult(score) {
  return RESULTS.find(r => score >= r.min && score <= r.max) ?? RESULTS[0];
}

function buildShareText(name, score, headline, oneLiner) {
  return `【大人の色気診断（18+）】\n${name} の結果：${score}%\n${headline}\nひとこと：${oneLiner}\n#大人の色気診断`;
}

// ====== DOM ======
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

function renderResult(name, score) {
  const r = pickResult(score);

  // “ひとこと”も名前から固定にする（同じ名前→同じひとこと）
  const h2 = hashStringToInt(name + "|one");
  const oneLiner = ONE_LINERS[h2 % ONE_LINERS.length];

  resultCard.classList.remove("hidden");
  scoreNum.textContent = String(score);
  meterBar.style.width = `${score}%`;

  resultHeadline.textContent = r.headline;
  resultDesc.textContent = `${r.desc}\n\nひとこと：${oneLiner}`;

  resultTags.innerHTML = "";
  r.tags.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `#${t}`;
    resultTags.appendChild(li);
  });

  const shareText = buildShareText(name, score, r.headline, oneLiner);
  const shareUrl = location.href.split("#")[0]; // hash除去
  const xUrl = "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(shareText) + "&url=" + encodeURIComponent(shareUrl);
  tweetBtn.href = xUrl;

  // URLに結果を残す（リロードで復元できる）
  const params = new URLSearchParams(location.search);
  params.set("name", name);
  params.set("score", String(score));
  history.replaceState(null, "", "?" + params.toString());
}

function diagnose() {
  const raw = nameInput.value.trim();
  const name = raw.length ? raw : "名無し";

  const h = hashStringToInt(name);

  // 0〜100（固定）
  const score = clamp(h % 101, 0, 100);

  renderResult(name, score);
}

diagBtn.addEventListener("click", diagnose);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") diagnose();
});

copyBtn.addEventListener("click", async () => {
  const raw = nameInput.value.trim();
  const name = raw.length ? raw : "名無し";
  const score = Number(scoreNum.textContent || 0);

  const h2 = hashStringToInt(name + "|one");
  const oneLiner = ONE_LINERS[h2 % ONE_LINERS.length];
  const headline = resultHeadline.textContent || "";

  const text = buildShareText(name, score, headline, oneLiner) + "\n" + location.href;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "コピーしました";
    setTimeout(() => copyBtn.textContent = "結果をコピー", 1200);
  } catch {
    // クリップボードが使えない環境用フォールバック
    prompt("コピーして使ってください", text);
  }
});

againBtn.addEventListener("click", () => {
  resultCard.classList.add("hidden");
  meterBar.style.width = "0%";
  scoreNum.textContent = "0";
  history.replaceState(null, "", location.pathname);
  nameInput.focus();
});

// ページ読み込み時に復元
(function restoreFromQuery() {
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const scoreStr = params.get("score");
  if (!name || !scoreStr) return;

  const score = clamp(Number(scoreStr), 0, 100);
  nameInput.value = name;
  renderResult(name, score);
})();
