// ---------- Shared: read guest info from the invitation link ----------
// ?to=NamaTamu&meja=5
const inviteParams = new URLSearchParams(window.location.search);
const guestNameParam = inviteParams.get("to");
const tableNumberParam = inviteParams.get("meja") || inviteParams.get("table");

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Opening cover ----------
(function () {
  const cover = document.getElementById("cover");
  const openBtn = document.getElementById("cover-open-btn");
  const guestNameEl = document.getElementById("cover-guest-name");
  const music = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  if (guestNameParam) {
    guestNameEl.textContent = guestNameParam;
  }

  openBtn.addEventListener("click", function () {
    cover.classList.add("opened");
    document.body.classList.remove("locked");

    // Try to start background music now that we have a user gesture.
    // If there's no music file yet (or the browser blocks it), fail silently.
    if (music) {
      music.play().then(
        function () {
          musicToggle.classList.add("playing");
          musicToggle.setAttribute("aria-pressed", "true");
        },
        function () {
          /* no file yet / autoplay blocked — ignore */
        },
      );
    }

    window.setTimeout(function () {
      cover.style.display = "none";
    }, 700);
  });
})();

// ---------- Music toggle ----------
(function () {
  const music = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");
  if (!music || !musicToggle) return;

  musicToggle.addEventListener("click", function () {
    if (music.paused) {
      music.play().then(
        function () {
          musicToggle.classList.add("playing");
          musicToggle.setAttribute("aria-pressed", "true");
        },
        function () {
          /* file missing or playback blocked — ignore */
        },
      );
    } else {
      music.pause();
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });
})();

// ---------- Gallery video: autoplay (muted) when scrolled into view ----------
(function () {
  const galleryVideo = document.getElementById("gallery-video");
  if (!galleryVideo || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          galleryVideo.play().catch(function () {
            /* browser blocked it — user can still tap play manually */
          });
        } else {
          galleryVideo.pause();
        }
      });
    },
    { threshold: 0.5 },
  );

  observer.observe(galleryVideo);
})();

// ---------- Live comment form ("Ucapan & Doa untuk Mempelai") ----------
// Backed by Supabase so every guest sees the same comment list.
// Fill these in from Project Settings > API in your Supabase dashboard.
const SUPABASE_URL = "https://kdojvhkasloeonrymqka.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fh5yCbctAoI32MAcIHeZ0w_GlU140mG";

const letterForm = document.getElementById("letter-form");
const lettersList = document.getElementById("letters-list");
const lettersSubmitBtn = letterForm.querySelector(".letters-submit");

const supabaseConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
  typeof window.supabase !== "undefined";

const supabaseClient = supabaseConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function renderComment(name, message) {
  const item = document.createElement("div");
  item.className = "letter-item new";
  item.innerHTML = `<div class="byline">${escapeHTML(name)}</div><p class="msg">${escapeHTML(message)}</p>`;
  return item;
}

function showLettersEmptyState(text) {
  lettersList.innerHTML = `<p class="letters-loading">${text}</p>`;
}

async function loadComments() {
  if (!supabaseClient) {
    showLettersEmptyState(
      "Belum terhubung ke database — ucapan belum tersimpan permanen.",
    );
    return;
  }
  const { data, error } = await supabaseClient
    .from("comments")
    .select("name, message")
    .order("created_at", { ascending: false });

  if (error) {
    showLettersEmptyState("Gagal memuat ucapan. Coba refresh halaman.");
    return;
  }
  if (!data || data.length === 0) {
    showLettersEmptyState(
      "Jadilah yang pertama mengirim ucapan untuk mempelai!",
    );
    return;
  }
  lettersList.innerHTML = "";
  data.forEach(function (c) {
    lettersList.appendChild(renderComment(c.name, c.message));
  });
}
loadComments();

letterForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("letter-name").value.trim();
  const message = document.getElementById("letter-message").value.trim();
  if (!name || !message) return;

  lettersSubmitBtn.disabled = true;

  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("comments")
      .insert([{ name: name, message: message }]);

    lettersSubmitBtn.disabled = false;

    if (error) {
      alert("Maaf, ucapan gagal terkirim. Coba lagi ya.");
      return;
    }
    // Remove empty-state placeholder if this is the first comment
    const emptyState = lettersList.querySelector(".letters-loading");
    if (emptyState) emptyState.remove();
    lettersList.prepend(renderComment(name, message));
  } else {
    // No database configured yet — fall back to local-only display
    // (won't persist across refreshes or other guests).
    lettersSubmitBtn.disabled = false;
    const emptyState = lettersList.querySelector(".letters-loading");
    if (emptyState) emptyState.remove();
    lettersList.prepend(renderComment(name, message));
  }

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
// Reuses the guest name / table number already parsed above, and renders
// either a personalized seating ticket, or a "private invitation" lock state.
(function () {
  const wrap = document.getElementById("access-wrap");

  function makeCode(name, table) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const suffix = String(100 + (sum % 900));
    return `WT-${table}-${suffix}`;
  }

  // Nomor WhatsApp Irsyad & Eva untuk menerima konfirmasi RSVP tamu.
  // Format: kode negara + nomor, tanpa "+" atau "0" di depan.
  const RSVP_CONTACTS = [
    { label: "Irsyad", phone: "6281318465501" },
    { label: "Eva", phone: "62895110010746" },
  ];

  function makeRsvpLink(phone, name, table) {
    const message =
      `Assalamu'alaikum, saya *${name}*` +
      (table ? ` (Meja ${table})` : "") +
      `.\nDengan ini saya konfirmasi *InsyaAllah hadir* di pernikahan Irsyad & Eva. 🙏`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  if (guestNameParam && tableNumberParam) {
    const safeName = escapeHTML(guestNameParam);
    const safeTable = escapeHTML(tableNumberParam);

    const rsvpButtons = RSVP_CONTACTS.map(function (c) {
      const link = makeRsvpLink(c.phone, guestNameParam, tableNumberParam);
      return `<a class="rsvp-btn" href="${link}" target="_blank" rel="noopener">Konfirmasi ke ${c.label}</a>`;
    }).join("");

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
          <div class="stub-code">${makeCode(guestNameParam, tableNumberParam)}</div>
        </div>
      </div>
      <div class="access-cta">
        <p class="rsvp-note">Konfirmasi kehadiran ke:</p>
        <div class="rsvp-group">${rsvpButtons}</div>
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
