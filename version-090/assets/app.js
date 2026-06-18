(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-result]');
    var input = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('select[data-filter]'));

    selects.forEach(function (select) {
      var key = select.getAttribute('data-filter');
      var values = cards.map(function (card) {
        return card.getAttribute('data-' + key) || '';
      }).filter(Boolean).filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = select.value;
      });

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || card.getAttribute('data-' + key) === filters[key];
        });
        var show = matchKeyword && matchFilters;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  });
})();
