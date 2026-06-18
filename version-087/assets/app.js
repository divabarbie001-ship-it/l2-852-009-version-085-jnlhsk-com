(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-target]"));
    var index = 0;
    var timer = null;

    function activate(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        activate(Number(thumb.getAttribute("data-hero-target")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function uniqueValues(cards, name) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + name);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select || select.getAttribute("data-filled") === "true") {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.setAttribute("data-filled", "true");
  }

  function cardMatches(card, filters) {
    var text = (card.getAttribute("data-text") || "").toLowerCase();
    var keyword = (filters.text || "").trim().toLowerCase();
    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }
    return ["region", "type", "year", "category"].every(function (name) {
      return !filters[name] || card.getAttribute("data-" + name) === filters[name];
    });
  }

  function sortCards(cards, mode) {
    var sorted = cards.slice();
    sorted.sort(function (a, b) {
      if (mode === "year-desc") {
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      }
      if (mode === "year-asc") {
        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
      }
      if (mode === "title") {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      }
      return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
    });
    return sorted;
  }

  function setupFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]")).map(function (panel) {
      return panel.closest("section") || panel.parentElement;
    });

    sections.forEach(function (section) {
      var panel = section.querySelector("[data-filter-section]");
      var grid = section.querySelector("[data-card-grid]");
      if (!panel || !grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var textInput = panel.querySelector("[data-filter='text']");
      var regionSelect = panel.querySelector("[data-filter='region']");
      var typeSelect = panel.querySelector("[data-filter='type']");
      var yearSelect = panel.querySelector("[data-filter='year']");
      var categorySelect = panel.querySelector("[data-filter='category']");
      var sortSelect = panel.querySelector("[data-sort]");
      var empty = section.querySelector("[data-no-result]");
      var initialQuery = section.getAttribute("data-initial-query") || new URLSearchParams(window.location.search).get("q") || "";

      fillSelect(regionSelect, uniqueValues(cards, "region"));
      fillSelect(typeSelect, uniqueValues(cards, "type"));
      fillSelect(yearSelect, uniqueValues(cards, "year"));

      if (textInput && initialQuery) {
        textInput.value = initialQuery;
      }

      function apply() {
        var filters = {
          text: textInput ? textInput.value : "",
          region: regionSelect ? regionSelect.value : "",
          type: typeSelect ? typeSelect.value : "",
          year: yearSelect ? yearSelect.value : "",
          category: categorySelect ? categorySelect.value : ""
        };
        var visible = 0;
        sortCards(cards, sortSelect ? sortSelect.value : "index").forEach(function (card) {
          grid.appendChild(card);
          var matched = cardMatches(card, filters);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [textInput, regionSelect, typeSelect, yearSelect, categorySelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (playUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var button = document.getElementById("moviePlayButton");
    if (!video || !playUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(playUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else {
      video.src = playUrl;
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
