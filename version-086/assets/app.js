(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var root = input.closest("main") || document;
      var activeFilter = "all";
      var buttons = root.querySelectorAll("[data-filter-button]");
      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        root.querySelectorAll(".movie-card, .rank-item").forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var filterText = (card.getAttribute("data-filter") || "").toLowerCase();
          var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
          var matchFilter = activeFilter === "all" || filterText.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchKeyword && matchFilter;
          card.classList.toggle("hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        var empty = root.querySelector("[data-empty-state]");
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeFilter = button.getAttribute("data-filter-button") || "all";
          apply();
        });
      });
      input.addEventListener("input", apply);
      apply();
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var current = 0;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      show(0);
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });
})();
