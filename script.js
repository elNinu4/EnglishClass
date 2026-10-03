// script.js

/* ---------- Word of the day ---------- */
const words = [
  {w:"serendipity", p:"noun", d:"Finding something valuable or lovely without looking for it.", e:"Running into my old teacher at the market was pure serendipity."},
  {w:"resilient", p:"adjective", d:"Able to recover quickly from difficulty.", e:"She was resilient — one bad grade never stopped her from trying again."},
  {w:"meticulous", p:"adjective", d:"Showing great attention to detail.", e:"His meticulous notes made the whole class jealous."},
  {w:"eloquent", p:"adjective", d:"Fluent and persuasive in speaking or writing.", e:"Her eloquent closing argument won the debate."},
  {w:"candid", p:"adjective", d:"Honest and direct, even when it's uncomfortable.", e:"He gave a candid answer about why the project failed."},
  {w:"ponder", p:"verb", d:"To think about something carefully.", e:"I pondered the question all the way home."},
  {w:"vivid", p:"adjective", d:"Producing powerful, clear images in the mind.", e:"The opening paragraph was so vivid I could smell the rain."},
  {w:"empathy", p:"noun", d:"The ability to understand another person's feelings.", e:"Reading novels is one of the best ways to build empathy."}
];

// Changes once per day, then cycles through the list.
const idx = Math.floor(Date.now() / 86400000) % words.length;
const t = words[idx];
document.getElementById("wotd-word").textContent = t.w;
document.getElementById("wotd-pos").textContent = t.p;
document.getElementById("wotd-def").textContent = t.d;
document.getElementById("wotd-ex").textContent = "\u201C" + t.e + "\u201D";

/* ---------- Surprise me ---------- */
const activities = [
  `Write a six-word story about your morning.`,
  `Vocabulary charades — act it out, no words allowed.`,
  `Two truths and a lie, all in the past tense.`,
  `Rewrite a fairy tale from the villain's point of view.`,
  `Speed debate: 60 seconds per side, no prep.`,
  `Describe this room to someone who has never seen it.`,
  `Find five objects nearby and make them rhyme.`,
  `Finish this line: "The door opened and..."`,
  `Explain your favourite film in exactly three sentences.`
];

const out = document.getElementById("surpriseOut");
document.getElementById("surprise").addEventListener("click", () => {
  out.textContent = "👉 " + activities[Math.floor(Math.random() * activities.length)];
});