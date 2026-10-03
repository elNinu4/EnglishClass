// games/script.js — small helpers for the games hub

const toastEl = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

// Placeholder cards aren't links yet — give a friendly nudge instead of nothing.
document.querySelectorAll(".card-soon").forEach(card => {
  card.addEventListener("click", () => {
    showToast("🎲 This game isn't ready yet — check back soon!");
  });
});