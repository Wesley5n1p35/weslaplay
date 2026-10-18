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
  const btnOpenDirect = document.getElementById('btnOpenDirect');
  const presetChips = document.querySelectorAll('.preset-chip');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const ytSearchResults = document.getElementById('ytSearchResults');

  let currentVideoId = 'M576WGiDBdQ';
  let currentVideoTitle = '⚡ Cybertruck Off-Road';

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
    if (!input) return null;
    const raw = input.trim();
    if (!raw) return null;

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

    return null;
  }

  function playYouTube(videoId, title) {
    if (!videoId) return;
    currentVideoId = videoId;
    currentVideoTitle = title || currentVideoTitle;

    ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1&origin=https://wesley5n1p35.github.io`;
    localStorage.setItem(STORAGE.LAST_YT_VIDEO, videoId);

    if (nowPlayingTitle) {
      nowPlayingTitle.textContent = currentVideoTitle;
    }

    // Highlight matching chip if any
    presetChips.forEach(c => {
      if (c.dataset.vid === videoId) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  // Format seconds to mm:ss
  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Search YouTube by video name / topic
  async function searchYouTube(query) {
    if (!ytSearchResults) return;

    ytSearchResults.style.display = 'block';
    ytSearchResults.innerHTML = `
      <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: var(--text-muted); font-size: 14px;">
        🔍 Searching for "<strong>${escapeHtml(query)}</strong>"...
      </div>
    `;

    try {
      const resp = await fetch(`https://api.piped.private.coffee/search?q=${encodeURIComponent(query)}&filter=all`);
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();

      const streams = (data.items || []).filter(item => item.type === 'stream' && item.url);

      if (streams.length === 0) {
        ytSearchResults.innerHTML = `
          <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: var(--text-muted); font-size: 14px;">
            No direct video results found for "<strong>${escapeHtml(query)}</strong>".
            <div style="margin-top: 10px;">
              <a href="https://m.youtube.com/results?search_query=${encodeURIComponent(query)}" target="_blank" class="btn btn-secondary" style="display:inline-block; font-size:13px; padding: 8px 16px;">
                Open in YouTube ↗
              </a>
            </div>
          </div>
        `;
        return;
      }

      // Auto-play the first result
      const first = streams[0];
      const firstId = first.url.replace('/watch?v=', '');
      playYouTube(firstId, first.title);
      if (ytSearchInput) ytSearchInput.value = first.title;

      // Render search result cards
      ytSearchResults.innerHTML = streams.slice(0, 8).map(v => {
        const vidId = v.url.replace('/watch?v=', '');
        const duration = formatDuration(v.duration);
        return `
          <div class="search-result-card" data-vid="${vidId}" data-title="${escapeHtml(v.title)}">
            <div class="search-result-thumb-box">
              <img src="${v.thumbnail || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`}" alt="${escapeHtml(v.title)}" loading="lazy">
              ${duration ? `<span class="search-result-duration">${duration}</span>` : ''}
            </div>
            <div class="search-result-meta">
              <div class="search-result-title">${escapeHtml(v.title)}</div>
              <div class="search-result-channel">${escapeHtml(v.uploaderName || '')}</div>
            </div>
          </div>
        `;
      }).join('');

      // Wire up card clicks
      ytSearchResults.querySelectorAll('.search-result-card').forEach(card => {
        card.addEventListener('click', () => {
          const vid = card.dataset.vid;
          const title = card.dataset.title;
          if (vid) {
            if (ytSearchInput) ytSearchInput.value = title;
            playYouTube(vid, title);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });

    } catch (err) {
      console.warn('Direct search error, providing fallback:', err);
      ytSearchResults.innerHTML = `
        <div style="grid-column: 1/-1; padding: 18px; text-align: center; color: var(--text-muted); font-size: 14px;">
          Search timed out. You can open search results directly:
          <div style="margin-top: 10px;">
            <a href="https://m.youtube.com/results?search_query=${encodeURIComponent(query)}" class="btn btn-primary" style="display:inline-block; font-size:13px; padding: 8px 16px;">
              View "${escapeHtml(query)}" on YouTube ↗
            </a>
          </div>
        </div>
      `;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function handleSearchOrPlay() {
    const raw = (ytSearchInput ? ytSearchInput.value.trim() : '');
    if (!raw) return;

    const directId = extractVideoId(raw);
    if (directId) {
      // It's a YouTube link or ID
      if (ytSearchResults) ytSearchResults.style.display = 'none';
      playYouTube(directId, 'YouTube Video');
    } else {
      // It's a video title or search phrase
      searchYouTube(raw);
    }
  }

  if (btnPlaySearch && ytSearchInput) {
    btnPlaySearch.addEventListener('click', handleSearchOrPlay);

    ytSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchOrPlay();
      }
    });

    ytSearchInput.addEventListener('input', () => {
      if (btnClearSearch) {
        btnClearSearch.style.display = ytSearchInput.value.length > 0 ? 'block' : 'none';
      }
    });
  }

  if (btnOpenDirect) {
    btnOpenDirect.addEventListener('click', () => {
      const inputVal = (ytSearchInput ? ytSearchInput.value.trim() : '');
      const directId = extractVideoId(inputVal) || currentVideoId;
      if (inputVal && !extractVideoId(inputVal)) {
        window.location.href = `https://m.youtube.com/results?search_query=${encodeURIComponent(inputVal)}`;
      } else {
        window.location.href = `https://m.youtube.com/watch?v=${directId}`;
      }
    });
  }

  if (btnClearSearch && ytSearchInput) {
    btnClearSearch.addEventListener('click', () => {
      ytSearchInput.value = '';
      btnClearSearch.style.display = 'none';
      if (ytSearchResults) ytSearchResults.style.display = 'none';
      ytSearchInput.focus();
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const vid = chip.dataset.vid;
      const title = chip.dataset.title || chip.textContent.trim();
      if (vid) {
        if (ytSearchInput) {
          // Show the friendly name of the video in the search bar, NOT the weird ID code!
          ytSearchInput.value = title;
          if (btnClearSearch) btnClearSearch.style.display = 'block';
        }
        if (ytSearchResults) ytSearchResults.style.display = 'none';
        playYouTube(vid, title);
      }
    });
  });

  // Restore last video if available
  const lastVideo = localStorage.getItem(STORAGE.LAST_YT_VIDEO);
  if (lastVideo) {
    currentVideoId = lastVideo;
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
