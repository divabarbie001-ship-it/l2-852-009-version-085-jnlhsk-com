(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var region = scope.querySelector('[data-region-select]');
      var cards = selectAll('.movie-card', scope);

      function apply() {
        var term = normalize(input ? input.value : '');
        var regionValue = normalize(region ? region.value : '');
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchRegion = !regionValue || cardRegion === regionValue;
          card.classList.toggle('hidden-by-filter', !(matchTerm && matchRegion));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (region) {
        region.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupVideo(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-ready') === '1') {
      return;
    }
    video.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }
    video.src = stream;
  }

  function playVideo(shell, video) {
    setupVideo(video);
    shell.classList.add('started');
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-mask');
      if (!video) {
        return;
      }
      if (button) {
        button.addEventListener('click', function () {
          playVideo(shell, video);
        });
      }
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          playVideo(shell, video);
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('started');
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<a class="movie-card movie-card-small" href="' + movie.href + '" data-title="' + escapeHtml(movie.title) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '    <span class="poster-gradient"><span>' + escapeHtml(movie.oneLine) + '</span></span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    if (input && query) {
      input.value = params.get('q');
    }
    var movies = window.SITE_MOVIES;
    var matches = query ? movies.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.category,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(query) !== -1;
    }) : movies.slice(0, 64);
    if (title) {
      title.textContent = query ? '搜索结果' : '热门片单';
    }
    results.innerHTML = matches.slice(0, 160).map(renderSearchCard).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
