// games/script.js

/* ============================================================
   Alphabet Match — capital ↔ small letter matching game
   ============================================================ */

const ALPHABET = [
  { letter: "A", word: "Apple",      emoji: "🍎" },
  { letter: "B", word: "Balloon",    emoji: "🎈" },
  { letter: "C", word: "Cat",        emoji: "🐱" },
  { letter: "D", word: "Dog",        emoji: "🐶" },
  { letter: "E", word: "Elephant",   emoji: "🐘" },
  { letter: "F", word: "Fish",       emoji: "🐟" },
  { letter: "G", word: "Grapes",     emoji: "🍇" },
  { letter: "H", word: "House",      emoji: "🏠" },
  { letter: "I", word: "Ice cream",  emoji: "🍦" },
  { letter: "J", word: "Juice",      emoji: "🧃" },
  { letter: "K", word: "Key",        emoji: "🔑" },
  { letter: "L", word: "Lion",       emoji: "🦁" },
  { letter: "M", word: "Moon",       emoji: "🌙" },
  { letter: "N", word: "Notebook",   emoji: "📓" },
  { letter: "O", word: "Octopus",    emoji: "🐙" },
  { letter: "P", word: "Penguin",    emoji: "🐧" },
  { letter: "Q", word: "Queen",      emoji: "👑" },
  { letter: "R", word: "Rainbow",    emoji: "🌈" },
  { letter: "S", word: "Sun",        emoji: "☀️" },
  { letter: "T", word: "Tree",       emoji: "🌳" },
  { letter: "U", word: "Umbrella",   emoji: "☂️" },
  { letter: "V", word: "Violin",     emoji: "🎻" },
  { letter: "W", word: "Watermelon", emoji: "🍉" },
  { letter: "X", word: "Xylophone",  emoji: "🎹" },
  { letter: "Y", word: "Yarn",       emoji: "🧶" },
  { letter: "Z", word: "Zebra",      emoji: "🦓" }
];

/* ---------- elements ---------- */
const board      = document.getElementById("board");
const pairsStat  = document.getElementById("pairsStat");
const movesStat  = document.getElementById("movesStat");
const timeStat   = document.getElementById("timeStat");
const levelSelect= document.getElementById("levelSelect");
const restartBtn = document.getElementById("restartBtn");
const soundBtn   = document.getElementById("soundBtn");
const hintEl     = document.getElementById("hint");
const winEl      = document.getElementById("win");
const winStats   = document.getElementById("winStats");
const playAgain  = document.getElementById("playAgain");

/* ---------- state ---------- */
const state = {
  totalPairs: 0,
  firstCard: null,
  locked: false,
  moves: 0,
  matched: 0,
  startTime: null,
  timerId: null
};

/* ============================================================
   Sound (tiny WebAudio blips — no files needed)
   ============================================================ */
let audioCtx = null;
let soundOn = true;

function audio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(freq, dur = 0.12, type = "sine", vol = 0.07, delay = 0) {
  if (!soundOn) return;
  const ctx = audio();
  if (!ctx) return;

  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

const sfx = {
  select: () => beep(660, 0.08, "sine", 0.05),
  match:  () => { beep(660, 0.10, "sine", 0.07); beep(988, 0.16, "sine", 0.07, 0.09); },
  wrong:  () => beep(180, 0.20, "sawtooth", 0.045),
  win:    () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.18, "sine", 0.07, i * 0.11))
};

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundBtn.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on");
  if (soundOn) sfx.select();
});

/* ============================================================
   Helpers
   ============================================================ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickLetterPool(pairCount) {
  // Smaller sets use earlier letters so beginners meet familiar words.
  if (pairCount <= 6)  return ALPHABET.slice(0, 10); // A–J
  if (pairCount <= 8)  return ALPHABET.slice(0, 16); // A–P
  if (pairCount <= 13) return ALPHABET.slice();      // A–Z
  return ALPHABET.slice();                           // full 26
}

function buildDeck(pairCount) {
  const pool = pickLetterPool(pairCount);
  const chosen = pairCount >= 26 ? pool : shuffle(pool).slice(0, pairCount);

  const deck = [];
  chosen.forEach(entry => {
    deck.push({ ...entry, kind: "upper" });
    deck.push({ ...entry, kind: "lower" });
  });
  return shuffle(deck);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

/* ============================================================
   Timer
   ============================================================ */
function startTimer() {
  if (state.timerId) return;
  state.startTime = Date.now();
  state.timerId = setInterval(() => {
    const secs = Math.floor((Date.now() - state.startTime) / 1000);
    timeStat.textContent = formatTime(secs);
  }, 250);
}

function stopTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}

/* ============================================================
   Board rendering
   ============================================================ */
function makeCardEl(card, index) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card";
  btn.dataset.letter = card.letter;
  btn.dataset.kind = card.kind;
  btn.style.setProperty("--d", (index * 14) + "ms");
  btn.setAttribute(
    "aria-label",
    (card.kind === "upper" ? "Capital " : "Small ") + card.letter + ", " + card.word
  );

  const glyph = document.createElement("span");
  glyph.className = "glyph";
  glyph.textContent = card.kind === "upper" ? card.letter : card.letter.toLowerCase();

  const pic = document.createElement("span");
  pic.className = "pic";
  pic.textContent = card.emoji;
  pic.setAttribute("aria-hidden", "true");

  const word = document.createElement("span");
  word.className = "word";
  word.textContent = card.word;

  btn.append(glyph, pic, word);
  return btn;
}

function renderBoard(deck) {
  board.innerHTML = "";
  const frag = document.createDocumentFragment();
  deck.forEach((card, i) => frag.appendChild(makeCardEl(card, i)));
  board.appendChild(frag);
}

/* ============================================================
   Game flow
   ============================================================ */
function newGame() {
  const pairCount = Number(levelSelect.value);

  state.totalPairs = pairCount;
  state.firstCard = null;
  state.locked = false;
  state.moves = 0;
  state.matched = 0;
  state.startTime = null;

  stopTimer();

  movesStat.textContent = "0";
  timeStat.textContent = "0:00";
  pairsStat.textContent = "0 / " + pairCount;
  hintEl.innerHTML = "Tap a <strong>capital</strong> letter, then its <strong>small</strong> letter.";
  winEl.hidden = true;

  renderBoard(buildDeck(pairCount));
}

function handleBoardClick(event) {
  const cardEl = event.target.closest(".card");
  if (!cardEl) return;
  if (state.locked) return;
  if (cardEl.classList.contains("matched")) return;
  if (cardEl === state.firstCard) return;

  startTimer();

  // First pick
  if (!state.firstCard) {
    state.firstCard = cardEl;
    cardEl.classList.add("selected");
    sfx.select();
    return;
  }

  // Second pick
  const first = state.firstCard;
  const second = cardEl;

  second.classList.add("selected");
  state.moves++;
  movesStat.textContent = state.moves;
  state.locked = true;

  const isMatch =
    first.dataset.letter === second.dataset.letter &&
    first.dataset.kind !== second.dataset.kind;

  if (isMatch) {
    sfx.match();
    first.classList.remove("selected");
    second.classList.remove("selected");
    first.classList.add("matched");
    second.classList.add("matched");

    state.matched++;
    pairsStat.textContent = state.matched + " / " + state.totalPairs;
    state.firstCard = null;
    state.locked = false;

    if (state.matched === state.totalPairs) finishGame();
    return;
  }

  // No match — show it, then clear
  sfx.wrong();
  first.classList.add("wrong");
  second.classList.add("wrong");

  setTimeout(() => {
    first.classList.remove("wrong", "selected");
    second.classList.remove("wrong", "selected");
    state.firstCard = null;
    state.locked = false;
  }, 620);
}

function finishGame() {
  stopTimer();
  const elapsed = state.startTime
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : 0;

  sfx.win();
  hintEl.innerHTML = "🎉 Brilliant! Every letter found its partner.";

  winStats.textContent =
    state.totalPairs + " pairs · " +
    state.moves + " moves · " +
    formatTime(elapsed);

  setTimeout(() => { winEl.hidden = false; }, 320);
}

/* ============================================================
   Events
   ============================================================ */
board.addEventListener("click", handleBoardClick);
restartBtn.addEventListener("click", newGame);
levelSelect.addEventListener("change", newGame);
playAgain.addEventListener("click", newGame);

winEl.addEventListener("click", (e) => {
  if (e.target === winEl) winEl.hidden = true;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !winEl.hidden) winEl.hidden = true;
});

/* ---------- start ---------- */
newGame();