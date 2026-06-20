(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      body.classList.toggle('no-scroll', mobilePanel.classList.contains('is-open'));
    });
  }

  document.addEventListener('error', function (event) {
    if (event.target && event.target.tagName === 'IMG') {
      event.target.classList.add('image-missing');
    }
  }, true);

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === index);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === index);
      });
    };

    var next = function () {
      if (slides.length > 0) {
        activate((current + 1) % slides.length);
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        if (timer) {
          clearInterval(timer);
          timer = setInterval(next, 5000);
        }
      });
    });

    if (slides.length > 1) {
      timer = setInterval(next, 5000);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var keyword = scope.querySelector('[data-filter-keyword]');
    var year = scope.querySelector('[data-filter-year]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-list] .movie-card'));
    var empty = scope.querySelector('[data-empty-state]');

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var apply = function () {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;

      items.forEach(function (item) {
        var text = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year')
        ].join(' '));
        var show = true;

        if (q && text.indexOf(q) === -1) {
          show = false;
        }
        if (y && normalize(item.getAttribute('data-year')) !== y) {
          show = false;
        }
        if (r && normalize(item.getAttribute('data-region')) !== r) {
          show = false;
        }
        if (t && normalize(item.getAttribute('data-type')) !== t) {
          show = false;
        }

        item.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [keyword, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIES) {
    var input = searchPage.querySelector('[data-search-input]');
    var resultBox = searchPage.querySelector('[data-search-results]');
    var empty = searchPage.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    var renderCard = function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<div class="poster-frame">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
        '<span class="poster-play">▶</span>' +
        '</div>' +
        '</a>' +
        '<div class="movie-info">' +
        '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
        '<p class="movie-desc">' + escapeHtml(movie.description) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    };

    var runSearch = function (value) {
      var q = String(value || '').trim().toLowerCase();
      if (!q) {
        resultBox.innerHTML = '';
        empty.textContent = '输入关键词即可查找影片';
        empty.classList.add('is-visible');
        return;
      }

      var words = q.split(/\s+/).filter(Boolean);
      var results = window.MOVIES.filter(function (movie) {
        var text = [movie.title, movie.description, movie.genre, movie.region, movie.type, movie.year, movie.tags.join(' ')].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 96);

      resultBox.innerHTML = results.map(renderCard).join('');
      empty.textContent = results.length ? '' : '暂无匹配内容';
      empty.classList.toggle('is-visible', results.length === 0);
    };

    runSearch(query);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
