(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    forms.forEach(function (form) {
      var scope = form.closest("main") || document;
      var list = scope.querySelector("[data-filter-list]");
      var emptyState = scope.querySelector("[data-empty-state]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var input = form.querySelector("[data-filter-input]");
      var yearSelect = form.querySelector("[data-filter-year]");
      var regionSelect = form.querySelector("[data-filter-region]");
      var typeSelect = form.querySelector("[data-filter-type]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function applyFilter() {
        var query = valueOf(input);
        var year = valueOf(yearSelect);
        var region = valueOf(regionSelect);
        var type = valueOf(typeSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (type && cardType.indexOf(type) === -1) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", applyFilter);
      form.addEventListener("change", applyFilter);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && input) {
        input.value = q;
        applyFilter();
      }
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");

    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function attachSource(video, sourceUrl) {
    if (!video || !sourceUrl || video.getAttribute("data-source-loaded") === "true") {
      return;
    }

    video.setAttribute("data-source-loaded", "true");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    loadHlsLibrary(function () {
      if (!window.Hls || !window.Hls.isSupported()) {
        video.src = sourceUrl;
        return;
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var sourceUrl = player.getAttribute("data-video-url");

      function startPlayback() {
        attachSource(video, sourceUrl);
        player.classList.add("is-playing");

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }

        startPlayback();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
