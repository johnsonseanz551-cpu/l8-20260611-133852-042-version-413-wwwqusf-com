(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    var current = slides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
    });
    if (current < 0) {
        current = 0;
    }

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    if (slides.length) {
        var timer = setInterval(function () {
            setSlide(current + 1);
        }, 5200);
        qsa('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                clearInterval(timer);
                setSlide(current - 1);
            });
        });
        qsa('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                clearInterval(timer);
                setSlide(current + 1);
            });
        });
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                clearInterval(timer);
                setSlide(index);
            });
        });
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function applySearch(term) {
        var cards = qsa('[data-search]');
        if (!cards.length) {
            return;
        }
        var keyword = normalize(term);
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') + ' ' + card.textContent);
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        var empty = qs('.empty-state');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    var searchInput = qs('[data-page-search]');
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;
        applySearch(initial);
        searchInput.addEventListener('input', function () {
            applySearch(searchInput.value);
        });
    }

    window.initMoviePlayer = function (source) {
        var video = qs('#movie-player');
        var overlay = qs('.player-overlay');
        if (!video || !source) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            video.setAttribute('data-ready', '1');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.style.display = 'none';
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    if (overlay) {
                        overlay.style.display = 'flex';
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
    };
})();
