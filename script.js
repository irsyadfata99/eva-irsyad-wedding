// ---------- Live comment form ("Ucapan & Doa untuk Mempelai") ----------
const letterForm = document.getElementById("letter-form");
const lettersList = document.getElementById("letters-list");

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

letterForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("letter-name").value.trim();
  const message = document.getElementById("letter-message").value.trim();
  if (!name || !message) return;

  const item = document.createElement("div");
  item.className = "letter-item new";
  item.innerHTML = `<div class="byline">${escapeHTML(name)}</div><p class="msg">${escapeHTML(message)}</p>`;
  lettersList.prepend(item);

  letterForm.reset();
});

// ---------- Countdown to the wedding date ----------
const target = new Date("2026-09-19T08:00:00+07:00").getTime();

function tick() {
  const now = Date.now();
  let diff = target - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("cd-days").textContent = String(days).padStart(
    2,
    "0",
  );
  document.getElementById("cd-hours").textContent = String(hours).padStart(
    2,
    "0",
  );
  document.getElementById("cd-minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("cd-seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );
}
tick();
setInterval(tick, 1000);

// ---------- Personalized access card ----------
// Reads ?to=NamaTamu&meja=5 from the invitation link and renders
// either a personalized seating ticket, or a "private invitation" lock state.
(function () {
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get("to");
  const tableNumber = params.get("meja") || params.get("table");
  const wrap = document.getElementById("access-wrap");

  function makeCode(name, table) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const suffix = String(100 + (sum % 900));
    return `WT-${table}-${suffix}`;
  }

  if (guestName && tableNumber) {
    const safeName = escapeHTML(guestName);
    const safeTable = escapeHTML(tableNumber);
    wrap.innerHTML = `
      <div class="ticket">
        <div class="ticket-main">
          <div class="eyebrow">Undangan Bersifat Privat</div>
          <div class="ticket-to">Kepada Yth.</div>
          <div class="ticket-name">${safeName}</div>
          <div class="ticket-meta">
            <div><span class="k">Date</span><span class="v">Saturday, September 19 2026</span></div>
            <div><span class="k">Time</span><span class="v">08.00 — 14.00 WIB</span></div>
            <div><span class="k">Location</span><span class="v">Grand Ballroom, Luminor Hotel</span></div>
          </div>
        </div>
        <div class="ticket-stub">
          <div class="stub-label">Table</div>
          <div class="stub-table">${safeTable}</div>
          <div class="stub-barcode"></div>
          <div class="stub-code">${makeCode(guestName, tableNumber)}</div>
        </div>
      </div>
      <div class="access-cta">
        <a class="rsvp-btn" href="#">Confirm Attendance</a>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="ticket ticket-locked">
        <div class="ticket-main">
          <div class="eyebrow">Limited Access</div>
          <div class="ticket-name">This invitation is private</div>
          <p>Please open this page via the private link sent to you to view your table number.</p>
        </div>
      </div>
    `;
  }
})();
