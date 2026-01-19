// ====== 診断データ（ここを増やせば量産できる） ======
const RESULTS = [
  {
    min: 0, max: 19,
    headline: "社畜レベル：ひよこ",
    desc: "自分のペースを守れるタイプ。休むのが上手。将来も伸びしろしかない。",
    tags: ["定時退社", "境界線が強い", "健康第一"]
  },
  {
    min: 20, max: 39,
    headline: "社畜レベル：見習い",
    desc: "ちょっと頑張りすぎる時がある。予定を詰める前に睡眠を確保して勝てる。",
    tags: ["真面目", "頼まれがち", "計画で勝つ"]
  },
  {
    min: 40, max: 59,
    headline: "社畜レベル：中堅",
    desc: "忙しさに慣れている。気づいたらタスクが増えているので、断る技術を獲得しよう。",
    tags: ["処理能力", "火消し担当", "断る練習"]
  },
  {
    min: 60, max: 79,
    headline: "社畜レベル：ベテラン",
    desc: "責任感が強すぎる。あなたが休むと回らない状態になっていないか点検が必要。",
    tags: ["責任感", "抱え込み", "仕組み化"]
  },
  {
    min: 80, max: 100,
    headline: "社畜レベル：伝説",
    desc: "その献身、尊い。だが体は1つ。まずは休暇を取って、仕事を減らす導線を作ろう。",
    tags: ["伝説級", "燃え尽き注意", "守るべきは体"]
  }
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

function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

function pickResult(score) {
  return RESULTS.find(r => score >= r.min && score <= r.max) ?? RESULTS[0];
}

function buildShareText(name, score, headline) {
  return `【社畜レベル診断】\n${name} の結果：${score}%\n${headline}\n#社畜レベル診断`;
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

  resultCard.classList.remove("hidden");
  scoreNum.textContent = String(score);
  meterBar.style.width = `${score}%`;

  resultHeadline.textContent = r.headline;
  resultDesc.textContent = r.desc;

  resultTags.innerHTML = "";
  r.tags.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `#${t}`;
    resultTags.appendChild(li);
  });

  const shareText = buildShareText(name, score, r.headline);
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
  // 0〜100
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
  const headline = resultHeadline.textContent || "";
  const text = buildShareText(name, score, headline) + "\n" + location.href;
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "コピーしました";
    setTimeout(() => copyBtn.textContent = "結果をコピー", 1200);
  }catch{
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
(function restoreFromQuery(){
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const scoreStr = params.get("score");
  if (!name || !scoreStr) return;
  const score = clamp(Number(scoreStr), 0, 100);
  nameInput.value = name;
  renderResult(name, score);
})();
