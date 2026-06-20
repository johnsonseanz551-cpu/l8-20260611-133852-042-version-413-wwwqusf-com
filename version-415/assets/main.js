(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }
  function filterCards(value) {
    var keyword = normalize(value);
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      card.classList.toggle('is-hidden', keyword !== '' && text.indexOf(keyword) === -1);
    });
  }
  if (query && cards.length) {
    inputs.forEach(function (input) {
      input.value = query;
    });
    filterCards(query);
  }
  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });
}());
