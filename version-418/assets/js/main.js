(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateCards(scopeSelector, query, category) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));
    var q = normalize(query);
    var cat = category || 'all';

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardCategory = card.getAttribute('data-category') || '';
      var matchText = !q || text.indexOf(q) !== -1;
      var matchCategory = cat === 'all' || cardCategory === cat;
      card.classList.toggle('is-hidden', !(matchText && matchCategory));
    });
  }

  document.querySelectorAll('.search-control').forEach(function (input) {
    var target = input.getAttribute('data-search-target') || '[data-card]';
    input.addEventListener('input', function () {
      var active = document.querySelector('.filter-chip.active');
      var category = active ? active.getAttribute('data-filter-category') : 'all';
      updateCards(target, input.value, category);
    });
  });

  document.querySelectorAll('.filter-chip').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('.search-panel') || document;
      var input = panel.querySelector('.search-control');
      var target = input ? input.getAttribute('data-search-target') : '[data-card]';
      var category = button.getAttribute('data-filter-category') || 'all';
      panel.querySelectorAll('.filter-chip').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      updateCards(target, input ? input.value : '', category);
    });
  });
})();
