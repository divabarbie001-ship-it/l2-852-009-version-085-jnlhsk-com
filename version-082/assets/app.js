
(function () {
  const root = document.documentElement;

  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function lc(value) {
    return String(value || '').toLowerCase();
  }

  function setupHeroSlider() {
    const slides = qsa('[data-hero-slide]');
    if (!slides.length) return;
    let index = slides.findIndex((slide) => slide.classList.contains('active'));
    if (index < 0) index = 0;
    const activate = (next) => {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === next));
      index = next;
    };
    activate(index);
    const interval = 5500;
    setInterval(() => {
      activate((index + 1) % slides.length);
    }, interval);
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    if (prev) prev.addEventListener('click', () => activate((index - 1 + slides.length) % slides.length));
    if (next) next.addEventListener('click', () => activate((index + 1) % slides.length));
  }

  function filterCards(container, query, extraFn) {
    const cards = qsa('[data-card]', container);
    let visible = 0;
    const q = lc(query).trim();
    cards.forEach((card) => {
      const text = lc(card.dataset.search || card.textContent);
      const ok = !q || text.includes(q);
      const extra = extraFn ? extraFn(card) : true;
      const show = ok && extra;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    const count = container.querySelector('[data-result-count]');
    if (count) count.textContent = visible;
    const empty = container.querySelector('[data-empty-state]');
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }

  function setupInlineFilters() {
    qsa('[data-filter-root]').forEach((rootEl) => {
      const input = rootEl.querySelector('[data-filter-input]');
      const buttons = qsa('[data-filter-button]', rootEl);
      const cards = qsa('[data-card]', rootEl);
      if (!input || !cards.length) return;
      const state = {
        tab: rootEl.dataset.defaultFilter || 'all',
        query: input.value || ''
      };
      const apply = () => {
        let visible = 0;
        const q = lc(state.query).trim();
        cards.forEach((card) => {
          const text = lc(card.dataset.search || card.textContent);
          const category = lc(card.dataset.category || '');
          const year = lc(card.dataset.year || '');
          const type = lc(card.dataset.type || '');
          const region = lc(card.dataset.region || '');
          const matchTab = state.tab === 'all' || category === state.tab || type === state.tab || region === state.tab || year === state.tab;
          const matchQuery = !q || text.includes(q);
          const show = matchTab && matchQuery;
          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });
        const count = rootEl.querySelector('[data-result-count]');
        if (count) count.textContent = visible;
        const empty = rootEl.querySelector('[data-empty-state]');
        if (empty) empty.style.display = visible ? 'none' : 'block';
      };
      input.addEventListener('input', () => {
        state.query = input.value;
        apply();
      });
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          buttons.forEach((b) => b.classList.remove('active'));
          button.classList.add('active');
          state.tab = lc(button.dataset.filter || 'all');
          apply();
        });
      });
      apply();
    });
  }

  function renderSearchCard(movie) {
    return `
      <article class="movie-card" data-card data-search="${escapeAttr([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.summary, movie.one_line].join(' '))}">
        <a class="movie-link" href="${movie.href}">
          <div class="movie-poster" style="--gradient: ${movie.gradient};">
            <span class="poster-badge">${escapeHtml(movie.category_name)}</span>
            <strong class="poster-title">${escapeHtml(movie.title)}</strong>
            <span class="poster-sub">${escapeHtml(movie.one_line || movie.summary || '')}</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.summary || movie.one_line || '')}</p>
            <div class="card-meta">
              <span>${escapeHtml(movie.year || '')}</span>
              <span>${escapeHtml(movie.region || '')}</span>
              <span>${escapeHtml(movie.type || '')}</span>
            </div>
          </div>
        </a>
      </article>`;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/\n/g, ' ');
  }

  function setupSearchPage() {
    const page = document.querySelector('[data-search-page]');
    if (!page || !window.MOVIE_INDEX) return;
    const input = page.querySelector('[data-search-input]');
    const year = page.querySelector('[data-search-year]');
    const type = page.querySelector('[data-search-type]');
    const region = page.querySelector('[data-search-region]');
    const results = page.querySelector('[data-search-results]');
    const count = page.querySelector('[data-search-count]');
    const empty = page.querySelector('[data-empty-state]');
    const pick = () => {
      const q = lc(input && input.value || '').trim();
      const yearValue = lc(year && year.value || 'all');
      const typeValue = lc(type && type.value || 'all');
      const regionValue = lc(region && region.value || 'all');
      const filtered = window.MOVIE_INDEX.filter((movie) => {
        const text = lc([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.summary, movie.one_line].join(' '));
        return (!q || text.includes(q))
          && (yearValue === 'all' || lc(movie.year) === yearValue)
          && (typeValue === 'all' || lc(movie.type) === typeValue)
          && (regionValue === 'all' || lc(movie.region).includes(regionValue));
      });
      if (count) count.textContent = filtered.length;
      if (results) {
        results.innerHTML = filtered.slice(0, 120).map(renderSearchCard).join('');
      }
      if (empty) empty.style.display = filtered.length ? 'none' : 'block';
    };
    [input, year, type, region].forEach((el) => {
      if (el) el.addEventListener('input', pick);
      if (el) el.addEventListener('change', pick);
    });
    pick();
  }

  function setupPlayer() {
    const video = document.querySelector('video[data-hls-src]');
    if (!video) return;
    const hlsSrc = video.dataset.hlsSrc;
    const fallbackSrc = video.dataset.fallbackSrc;
    const start = () => {
      const ready = () => {
        const play = video.play();
        if (play && typeof play.catch === 'function') play.catch(() => {});
      };
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, ready);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
        video.addEventListener('loadedmetadata', ready, { once: true });
      } else {
        video.src = fallbackSrc;
        video.addEventListener('loadedmetadata', ready, { once: true });
      }
    };
    const button = document.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', () => {
        if (!video.src) start();
        const play = video.play();
        if (play && typeof play.catch === 'function') play.catch(() => {});
      });
    }
    if (video.dataset.autoload === '1') {
      start();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupHeroSlider();
    setupInlineFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
