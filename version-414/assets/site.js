(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var next = root.querySelector("[data-hero-next]");
        var prev = root.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
    }

    function initMovieFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var region = panel.querySelector("[data-filter-region]");
            var genre = panel.querySelector("[data-filter-genre]");
            var count = panel.querySelector("[data-filter-count]");
            var list = panel.nextElementSibling;
            if (!list || !list.hasAttribute("data-filter-list")) {
                list = document.querySelector("[data-filter-list]");
            }
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var regionValue = region ? region.value : "";
                var genreValue = genre ? genre.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textOf(card);
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (yearValue && (card.getAttribute("data-year") || "") !== yearValue) {
                        matched = false;
                    }
                    if (regionValue && haystack.indexOf(regionValue.toLowerCase()) === -1) {
                        matched = false;
                    }
                    if (genreValue && haystack.indexOf(genreValue.toLowerCase()) === -1) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visible);
                }
            }

            [input, year, region, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function setupPlayer(url) {
        var video = document.getElementById("movie-video");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !url) {
            return;
        }
        var prepared = false;

        function attach() {
            if (!prepared) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                prepared = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", attach);
        }
        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                attach();
            }
        });
    }

    window.setupPlayer = setupPlayer;

    ready(function () {
        initNavigation();
        initHeroSlider();
        initMovieFilters();
    });
})();
