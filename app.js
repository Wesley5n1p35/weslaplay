/* ===================================================================
   WESLAPLAY — Client Controller for YouTube, Plex & Netflix
   Zero-Hardware In-Car Browser Portal (Drive-Compatible)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE = {
    SAFETY_CONFIRMED: 'weslaplay_passenger_confirmed',
    PLEX_URL: 'weslaplay_plex_url',
    LAST_YT_VIDEO: 'weslaplay_last_yt_video'
  };

  // --- Element Selectors ---
  const safetyModal = document.getElementById('safetyModal');
  const passengerCheck = document.getElementById('passengerCheck');
  const btnAcknowledge = document.getElementById('btnAcknowledge');
  const btnResetSafety = document.getElementById('btnResetSafety');

  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const btnTheaterBreakout = document.getElementById('btnTheaterBreakout');

  const ytIframe = document.getElementById('ytIframe');
  const ytSearchInput = document.getElementById('ytSearchInput');
  const btnPlaySearch = document.getElementById('btnPlaySearch');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const presetChips = document.querySelectorAll('.preset-chip');

  const plexUrlInput = document.getElementById('plexUrlInput');
  const btnSavePlexUrl = document.getElementById('btnSavePlexUrl');
  const btnOpenPlex = document.getElementById('btnOpenPlex');

  // --- 1. Passenger Safety Confirmation Gate ---
  function checkSafetyConfirmation() {
    const isConfirmed = localStorage.getItem(STORAGE.SAFETY_CONFIRMED) === 'true';
    if (!isConfirmed) {
      safetyModal.classList.add('show');
    }
  }

  if (passengerCheck) {
    passengerCheck.addEventListener('change', () => {
      btnAcknowledge.disabled = !passengerCheck.checked;
    });
  }

  if (btnAcknowledge) {
    btnAcknowledge.addEventListener('click', () => {
      localStorage.setItem(STORAGE.SAFETY_CONFIRMED, 'true');
      safetyModal.classList.remove('show');
    });
  }

  if (btnResetSafety) {
    btnResetSafety.addEventListener('click', () => {
      localStorage.removeItem(STORAGE.SAFETY_CONFIRMED);
      safetyModal.classList.add('show');
      passengerCheck.checked = false;
      btnAcknowledge.disabled = true;
    });
  }

  checkSafetyConfirmation();

  // --- 2. Tab Navigation ---
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // --- 3. YouTube Embed Video Parser & Player ---
  function extractVideoId(input) {
    const raw = input.trim();
    if (!raw) return 'jfKfPfyJRdk'; // Default Lofi Girl

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      return raw;
    }

    // youtu.be/<id>
    const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com/watch?v=<id>
    const watchMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // youtube.com/embed/<id>
    const embedMatch = raw.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/shorts/<id>
    const shortsMatch = raw.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // If text query, return null so we can build a search embed or playlist
    return null;
  }

  function playYouTube(queryOrId) {
    const videoId = extractVideoId(queryOrId);

    if (videoId) {
      ytIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1`;
      localStorage.setItem(STORAGE.LAST_YT_VIDEO, videoId);
    } else {
      // YouTube Embed search query player
      const encodedQuery = encodeURIComponent(queryOrId.trim());
      ytIframe.src = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodedQuery}&autoplay=1&playsinline=1`;
    }
  }

  if (btnPlaySearch && ytSearchInput) {
    btnPlaySearch.addEventListener('click', () => {
      if (ytSearchInput.value.trim()) {
        playYouTube(ytSearchInput.value);
      }
    });

    ytSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (ytSearchInput.value.trim()) {
          playYouTube(ytSearchInput.value);
        }
      }
    });

    ytSearchInput.addEventListener('input', () => {
      if (btnClearSearch) {
        btnClearSearch.style.display = ytSearchInput.value.length > 0 ? 'block' : 'none';
      }
    });
  }

  if (btnClearSearch && ytSearchInput) {
    btnClearSearch.addEventListener('click', () => {
      ytSearchInput.value = '';
      btnClearSearch.style.display = 'none';
      ytSearchInput.focus();
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const vid = chip.dataset.vid;
      if (vid) {
        if (ytSearchInput) {
          ytSearchInput.value = vid;
          if (btnClearSearch) btnClearSearch.style.display = 'block';
        }
        playYouTube(vid);
      }
    });
  });

  // Restore last video if available
  const lastVideo = localStorage.getItem(STORAGE.LAST_YT_VIDEO);
  if (lastVideo && lastVideo !== 'jfKfPfyJRdk') {
    ytIframe.src = `https://www.youtube-nocookie.com/embed/${lastVideo}?autoplay=0&enablejsapi=1&rel=0&playsinline=1`;
  }

  // --- 4. Plex Configuration & Launcher ---
  function loadPlexUrl() {
    const saved = localStorage.getItem(STORAGE.PLEX_URL) || 'https://app.plex.tv/desktop';
    if (plexUrlInput) plexUrlInput.value = saved;
    return saved;
  }
  loadPlexUrl();

  if (btnSavePlexUrl && plexUrlInput) {
    btnSavePlexUrl.addEventListener('click', () => {
      const val = plexUrlInput.value.trim() || 'https://app.plex.tv/desktop';
      localStorage.setItem(STORAGE.PLEX_URL, val);
      alert('Plex default URL saved!');
    });
  }

  if (btnOpenPlex) {
    btnOpenPlex.addEventListener('click', () => {
      const url = plexUrlInput.value.trim() || 'https://app.plex.tv/desktop';
      window.location.href = url;
    });
  }

  // --- 5. Theater Breakout (Optional Parked Mode) ---
  if (btnTheaterBreakout) {
    btnTheaterBreakout.addEventListener('click', () => {
      const currentUrl = encodeURIComponent(window.location.href);
      const theaterRedirect = `https://www.youtube.com/redirect?q=${currentUrl}`;
      window.location.href = theaterRedirect;
    });
  }

});
