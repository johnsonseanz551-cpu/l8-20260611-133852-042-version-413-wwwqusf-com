(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalSearch();
    setupPlayers();
  });

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupLocalSearch() {
    var input = document.querySelector('.js-local-search') || document.querySelector('.js-search-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var activeFilters = [];

    if (!cards.length) {
      return;
    }

    if (input && initial) {
      input.value = initial;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var group = chip.parentElement;
        Array.prototype.slice.call(group.querySelectorAll('.filter-chip')).forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        collectFilters();
        applyFilter();
      });
    });

    function collectFilters() {
      activeFilters = Array.prototype.slice.call(document.querySelectorAll('.filter-chip.active'))
        .map(function (chip) {
          return (chip.getAttribute('data-filter') || '').trim().toLowerCase();
        })
        .filter(Boolean);
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilters = activeFilters.every(function (filter) {
          return text.indexOf(filter) !== -1;
        });
        var keep = matchQuery && matchFilters;
        card.style.display = keep ? '' : 'none';
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    collectFilters();
    applyFilter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.play-overlay');
      var playUrl = video ? video.getAttribute('data-play') : '';
      var hls = null;
      var prepared = false;
      var preparing = null;

      if (!video || !overlay || !playUrl) {
        return;
      }

      function prepareVideo() {
        if (prepared) {
          return Promise.resolve();
        }
        if (preparing) {
          return preparing;
        }
        preparing = new Promise(function (resolve, reject) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(playUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              prepared = true;
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                reject(new Error('video'));
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
            prepared = true;
            resolve();
          } else {
            reject(new Error('video'));
          }
        });
        return preparing;
      }

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
        }
        overlay.classList.add('hidden');
        video.controls = true;
        prepareVideo()
          .then(function () {
            return video.play();
          })
          .catch(function () {
            overlay.classList.remove('hidden');
          });
      }

      overlay.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }
})();
