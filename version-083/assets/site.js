document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initBackTop();
  initHeroSlider();
  initFilters();
  initSearchPage();
  initPlayers();
  initCurrentPlayButtons();
});

function initMobileMenu() {
  var button = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".mobile-nav");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function initBackTop() {
  var button = document.querySelector(".back-top");
  if (!button) {
    return;
  }
  window.addEventListener("scroll", function () {
    button.classList.toggle("is-visible", window.scrollY > 420);
  });
  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initHeroSlider() {
  var root = document.querySelector("[data-hero]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer;
  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }
  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      restart();
    });
  });
  restart();
}

function initFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function (scope) {
    var section = scope.closest("section") || document;
    var input = scope.querySelector("[data-filter-keyword]");
    var category = scope.querySelector("[data-filter-category]");
    var year = scope.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
    var empty = section.querySelector("[data-filter-empty]");
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var categoryValue = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year
        ].join(" ").toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (categoryValue && card.dataset.category !== categoryValue) {
          ok = false;
        }
        if (yearValue && card.dataset.year !== yearValue) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
}

function initSearchPage() {
  var results = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-search-empty]");
  var input = document.querySelector("[data-search-input]");
  if (!results || !window.movieSearchData) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  if (input) {
    input.value = query;
  }
  if (!query.trim()) {
    return;
  }
  var lowered = query.trim().toLowerCase();
  var matches = window.movieSearchData.filter(function (movie) {
    return [
      movie.title,
      movie.region,
      movie.year,
      movie.genre,
      movie.category,
      movie.tags,
      movie.description
    ].join(" ").toLowerCase().indexOf(lowered) !== -1;
  });
  results.innerHTML = matches.slice(0, 120).map(renderSearchCard).join("");
  if (empty) {
    empty.hidden = matches.length !== 0;
  }
}

function renderSearchCard(movie) {
  var tags = movie.tags.split(" ").filter(Boolean).slice(0, 3).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");
  return [
    "<a class="movie-card" href="" + movie.url + "">",
    "<span class="poster"><img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy" decoding="async"><span class="card-badge">" + escapeHtml(movie.category) + "</span><span class="card-duration">" + escapeHtml(movie.duration) + "</span><span class="card-play">▶</span></span>",
    "<span class="movie-card-body"><strong>" + escapeHtml(movie.title) + "</strong><em>" + escapeHtml(movie.description) + "</em><span class="movie-meta"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></span><span class="tag-row">" + tags + "</span></span>",
    "</a>"
  ].join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, function (match) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      """: "&quot;"
    }[match];
  });
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  players.forEach(function (box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".video-overlay");
    var state = box.querySelector(".video-state");
    if (!video) {
      return;
    }
    var src = video.dataset.src;
    var ready = false;
    var hls;
    var wantPlay = false;
    function setState(message) {
      if (!state) {
        return;
      }
      if (message) {
        state.textContent = message;
        state.hidden = false;
      } else {
        state.textContent = "";
        state.hidden = true;
      }
    }
    function tryPlay() {
      if (!wantPlay) {
        return;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setState("点击视频控件即可播放");
        });
      }
    }
    function attach() {
      if (ready || !src) {
        return;
      }
      ready = true;
      setState("正在加载视频");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState("");
          tryPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState("视频加载失败，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          setState("");
          tryPlay();
        }, { once: true });
      } else {
        video.src = src;
        video.load();
        setState("");
      }
    }
    if (overlay) {
      overlay.addEventListener("click", function () {
        wantPlay = true;
        attach();
        tryPlay();
      });
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setState("");
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime < video.duration) {
        overlay.classList.remove("is-hidden");
      }
    });
    video.addEventListener("click", function () {
      attach();
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function initCurrentPlayButtons() {
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-current]"));
  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      var overlay = document.querySelector(".video-overlay");
      var frame = document.querySelector(".video-frame");
      if (frame) {
        frame.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (overlay) {
        overlay.click();
      }
    });
  });
}
