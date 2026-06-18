
(function () {
  function qs(root, sel) { return (root || document).querySelector(sel); }
  function qsa(root, sel) { return Array.from((root || document).querySelectorAll(sel)); }
  function initMenu() {
    const btn = qs(document, '[data-menu-button]');
    const menu = qs(document, '[data-mobile-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () { menu.classList.toggle('hidden'); });
  }
  function normalize(text) { return (text || '').toLowerCase().trim(); }
  function initSearch() {
    const input = qs(document, '[data-search-input]');
    if (!input) return;
    const cards = qsa(document, '[data-movie-card]');
    const empty = qs(document, '[data-empty-state]');
    const counter = qs(document, '[data-search-count]');
    const run = function () {
      const term = normalize(input.value);
      let visible = 0;
      cards.forEach(function (card) {
        const hay = normalize(card.getAttribute('data-search-text'));
        const ok = !term || hay.indexOf(term) !== -1;
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      if (counter) counter.textContent = String(visible);
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    };
    input.addEventListener('input', run);
    run();
  }
  function initPlayer() {
    const wrapper = qs(document, '[data-player]');
    if (!wrapper) return;
    const video = qs(wrapper, 'video');
    const m3u8 = wrapper.getAttribute('data-m3u8');
    const poster = wrapper.getAttribute('data-poster');
    const playBtn = qs(wrapper, '[data-play-button]');
    const overlay = qs(wrapper, '[data-player-overlay]');
    const status = qs(wrapper, '[data-player-status]');
    if (!video || !m3u8) return;
    if (poster) video.poster = poster;
    function setStatus(text) { if (status) status.textContent = text; }
    function startPlayback() {
      try {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放器遇到错误，已切换到直接播放模式');
              try { video.src = m3u8; video.play(); } catch (e) {}
            }
          });
          setStatus('正在载入播放源');
        } else {
          video.src = m3u8;
          setStatus('正在载入播放源');
        }
        Promise.resolve(video.play()).then(function () {
          if (overlay) overlay.classList.add('opacity-0', 'pointer-events-none');
          setStatus('播放中');
        }).catch(function () { setStatus('点击画面即可播放'); });
      } catch (err) {
        video.src = m3u8;
        video.play().catch(function () {});
      }
    }
    function reveal() {
      if (overlay) overlay.classList.add('opacity-0', 'pointer-events-none');
      startPlayback();
    }
    if (playBtn) playBtn.addEventListener('click', reveal);
    wrapper.addEventListener('click', function (ev) {
      if (ev.target === wrapper || ev.target === video || ev.target.closest('[data-player-click-area]')) {
        if (video.paused) reveal();
      }
    });
    video.addEventListener('play', function () { if (overlay) overlay.classList.add('opacity-0', 'pointer-events-none'); setStatus('播放中'); });
    video.addEventListener('pause', function () { setStatus('已暂停'); });
    setStatus('点击播放按钮开始观看');
  }
  function initScrollButtons() {
    qsa(document, '[data-scroll-target]').forEach(function (btn) {
      const target = qs(document, btn.getAttribute('data-scroll-target'));
      if (!target) return;
      btn.addEventListener('click', function () {
        const amount = Number(btn.getAttribute('data-scroll-step') || '520');
        target.scrollBy({ left: amount, behavior: 'smooth' });
      });
    });
  }
  function initBackToTop() {
    const back = qs(document, '[data-back-top]');
    if (!back) return;
    function update() {
      back.classList.toggle('opacity-0', window.scrollY < 300);
      back.classList.toggle('pointer-events-none', window.scrollY < 300);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    back.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  document.addEventListener('DOMContentLoaded', function () {
    initMenu(); initSearch(); initPlayer(); initScrollButtons(); initBackToTop();
  });
})();
