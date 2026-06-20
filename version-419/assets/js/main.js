(function () {
  'use strict';

  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initNavigation() {
    var toggle = $('.nav-toggle');
    var mobileNav = $('.mobile-nav');
    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHeroCarousel() {
    var hero = $('.hero');
    if (!hero) {
      return;
    }

    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-pressed', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initHeaderSearch() {
    $all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var root = form.getAttribute('data-root') || '';
        var target = root + 'search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initCategoryFilters() {
    var filterBar = $('[data-filter-bar]');
    var grid = $('[data-filter-grid]');
    if (!filterBar || !grid) {
      return;
    }

    var cards = $all('[data-movie-card]', grid);
    var emptyState = $('[data-empty-state]');
    var countEl = $('[data-filter-count]');

    function valueOf(name) {
      var field = $('[name="' + name + '"]', filterBar);
      return field ? field.value : '';
    }

    function applyFilters() {
      var keyword = normalizeText(valueOf('keyword'));
      var year = valueOf('year');
      var region = valueOf('region');
      var type = valueOf('type');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' '));

        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countEl) {
        countEl.textContent = '显示 ' + visible + ' 部';
      }
      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    $all('input, select', filterBar).forEach(function (field) {
      field.addEventListener('input', applyFilters);
      field.addEventListener('change', applyFilters);
    });

    var reset = $('[data-filter-reset]', filterBar);
    if (reset) {
      reset.addEventListener('click', function () {
        $all('input, select', filterBar).forEach(function (field) {
          field.value = '';
        });
        applyFilters();
      });
    }

    applyFilters();
  }

  function movieCardHTML(movie, root) {
    var href = root + movie.href;
    var cover = root + movie.cover;
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a href="' + escapeHTML(href) + '" aria-label="观看' + escapeHTML(movie.title) + '">',
      '    <div class="movie-poster">',
      '      <img src="' + escapeHTML(cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '      <span class="badge">' + escapeHTML(movie.category) + '</span>',
      '      <span class="year-badge">' + escapeHTML(movie.year) + '</span>',
      '      <span class="card-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3 class="movie-card-title">' + escapeHTML(movie.title) + '</h3>',
      '      <p class="movie-card-meta">' + escapeHTML(movie.genre) + '</p>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function initSearchPage() {
    var page = $('[data-search-page]');
    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var form = $('[data-search-form]', page);
    var keywordInput = $('[name="q"]', page);
    var categorySelect = $('[name="category"]', page);
    var yearSelect = $('[name="year"]', page);
    var results = $('[data-search-results]', page);
    var count = $('[data-search-count]', page);
    var empty = $('[data-empty-state]', page);
    var params = new URLSearchParams(window.location.search);
    var root = page.getAttribute('data-root') || '';

    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    function render() {
      var keyword = normalizeText(keywordInput ? keywordInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalizeText([
          movie.title,
          movie.genre,
          movie.region,
          movie.type,
          movie.tags
        ].join(' '));

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (category && movie.category !== category) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        return true;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.map(function (movie) {
          return movieCardHTML(movie, root);
        }).join('\n');
      }
      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部影片';
      }
      if (empty) {
        empty.classList.toggle('visible', matched.length === 0);
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', render);
        field.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroCarousel();
    initHeaderSearch();
    initCategoryFilters();
    initSearchPage();
  });
})();
