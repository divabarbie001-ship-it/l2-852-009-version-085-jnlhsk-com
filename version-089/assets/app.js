(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    play();
  }

  function setupSearch() {
    var inputs = selectAll('[data-search]');
    if (!inputs.length) {
      return;
    }

    inputs.forEach(function (input) {
      var scope = input.closest('main') || document;
      var cards = selectAll('[data-title]', scope);
      var chips = selectAll('[data-filter]', scope);
      var currentFilter = '';

      function apply() {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-info') || '')).toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = !currentFilter || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
        });
      }

      input.addEventListener('input', apply);

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          currentFilter = chip.getAttribute('data-filter') || '';
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.player-cover');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-hls') || '';
      var ready = false;

      function bind() {
        if (ready || !src) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function start() {
        bind();
        box.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
