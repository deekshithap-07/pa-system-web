/**
 * YouTube story modal — play embed in a popup; YouTube logo links out to YT.
 */

let modalEl = null;
let lastFocus = null;
let escBound = false;

const YT_WATCH = "https://www.youtube.com/watch";
const YT_EMBED = "https://www.youtube.com/embed";

function parseYouTube(input = {}) {
  const raw =
    input.youtubeUrl ||
    input.href ||
    (input.videoId ? `${YT_WATCH}?v=${input.videoId}` : "");
  let videoId = input.videoId || "";
  let start = Number(input.start) || 0;

  try {
    const url = new URL(raw, window.location.origin);
    if (!videoId) {
      if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.replace(/^\//, "").split("/")[0];
      } else {
        videoId = url.searchParams.get("v") || "";
      }
    }
    if (!start) {
      const t = url.searchParams.get("t") || url.searchParams.get("start") || "";
      const m = String(t).match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?|^(\d+)$/);
      if (m) {
        if (m[4]) start = Number(m[4]);
        else start = (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
      }
    }
  } catch {
    /* keep fallbacks */
  }

  return { videoId, start, watchUrl: videoId ? `${YT_WATCH}?v=${videoId}${start ? `&t=${start}s` : ""}` : raw };
}

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.id = "pa-video-modal";
  modalEl.className = "pa-video-modal";
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.innerHTML = `
    <div class="pa-video-modal__backdrop" data-video-close tabindex="-1"></div>
    <div class="pa-video-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pa-video-modal-title">
      <button type="button" class="pa-video-modal__close" data-video-close aria-label="Close video">×</button>
      <h2 id="pa-video-modal-title" class="sr-only">Watch story</h2>
      <div class="pa-video-modal__frame">
        <iframe
          data-video-frame
          title="Possibilities Africa story video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
      <p class="pa-video-modal__hint">
        <a data-video-youtube href="#" target="_blank" rel="noopener noreferrer">Watch on YouTube →</a>
      </p>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.querySelectorAll("[data-video-close]").forEach((el) => {
    el.addEventListener("click", closeVideoModal);
  });

  if (!escBound) {
    escBound = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalEl?.classList.contains("is-open")) closeVideoModal();
    });
  }

  return modalEl;
}

export function openVideoModal(opts = {}) {
  const { videoId, start, watchUrl } = parseYouTube(opts);
  if (!videoId) return;

  const root = ensureModal();
  const frame = root.querySelector("[data-video-frame]");
  const ytLink = root.querySelector("[data-video-youtube]");
  const title = opts.title || "Possibilities Africa over the years";

  lastFocus = document.activeElement;
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    playsinline: "1",
  });
  if (start > 0) params.set("start", String(start));

  if (frame) {
    frame.title = title;
    frame.src = `${YT_EMBED}/${videoId}?${params.toString()}`;
  }
  if (ytLink) {
    ytLink.href = watchUrl;
    ytLink.textContent = "Watch on YouTube →";
  }

  const titleEl = root.querySelector("#pa-video-modal-title");
  if (titleEl) titleEl.textContent = title;

  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("pa-video-modal-open");
  root.querySelector("[data-video-close]")?.focus?.();
}

export function closeVideoModal() {
  if (!modalEl) return;
  const frame = modalEl.querySelector("[data-video-frame]");
  if (frame) frame.src = "";
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pa-video-modal-open");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  lastFocus = null;
}

export function bindHomeWatchStory(root = document) {
  const btn = root.querySelector("[data-home-watch-story]");
  if (!btn) return () => {};

  const onClick = (e) => {
    e.preventDefault();
    openVideoModal({
      youtubeUrl: btn.getAttribute("data-youtube-url") || "",
      videoId: btn.getAttribute("data-video-id") || "",
      start: btn.getAttribute("data-video-start") || "0",
      title: btn.getAttribute("data-video-title") || "Possibilities Africa over the years",
    });
  };

  btn.addEventListener("click", onClick);
  return () => {
    btn.removeEventListener("click", onClick);
    closeVideoModal();
  };
}
