(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (button && menu) {
      button.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var form = document.querySelector("[data-filter-form]");
    var grid = document.querySelector("[data-filter-grid]");
    if (form && grid) {
      var input = document.getElementById("searchInput");
      var typeFilter = document.getElementById("typeFilter");
      var regionFilter = document.getElementById("regionFilter");
      var yearFilter = document.getElementById("yearFilter");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var note = document.querySelector("[data-filter-note]");

      function includesText(value, query) {
        return String(value || "").toLowerCase().indexOf(query) !== -1;
      }

      function applyFilters() {
        var query = String(input && input.value || "").trim().toLowerCase();
        var typeValue = String(typeFilter && typeFilter.value || "");
        var regionValue = String(regionFilter && regionFilter.value || "");
        var yearValue = String(yearFilter && yearFilter.value || "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesQuery = !query || includesText(haystack, query);
          var matchesType = !typeValue || includesText(card.getAttribute("data-type"), typeValue) || includesText(card.getAttribute("data-genre"), typeValue) || includesText(card.getAttribute("data-tags"), typeValue);
          var matchesRegion = !regionValue || includesText(card.getAttribute("data-region"), regionValue);
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var show = matchesQuery && matchesType && matchesRegion && matchesYear;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (note) {
          note.textContent = visible ? "已更新筛选结果。" : "没有匹配的影片。";
        }
      }

      [input, typeFilter, regionFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });
    }
  });
}());
