(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function uniqueSorted(values) {
        return Array.prototype.slice.call(new Set(values.filter(Boolean))).sort(function (a, b) {
            var an = parseInt(a, 10);
            var bn = parseInt(b, 10);
            if (!Number.isNaN(an) && !Number.isNaN(bn)) {
                return bn - an;
            }
            return String(a).localeCompare(String(b), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        uniqueSorted(values).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var root = document.querySelector("[data-filter-root]");
        if (!root) {
            return;
        }
        var input = root.querySelector("[data-search-input]");
        var yearSelect = root.querySelector("[data-year-filter]");
        var typeSelect = root.querySelector("[data-type-filter]");
        var regionSelect = root.querySelector("[data-region-filter]");
        var count = root.querySelector("[data-result-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        fillSelect(yearSelect, cards.map(function (card) { return card.dataset.year; }));
        fillSelect(typeSelect, cards.map(function (card) { return card.dataset.type; }));
        fillSelect(regionSelect, cards.map(function (card) { return card.dataset.region; }));

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }

        function textOf(card) {
            return [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" ").toLowerCase();
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchesYear = !year || card.dataset.year === year;
                var matchesType = !type || card.dataset.type === type;
                var matchesRegion = !region || card.dataset.region === region;
                var show = matchesKeyword && matchesYear && matchesType && matchesRegion;
                card.classList.toggle("is-filtered-out", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    function initPlayer() {
        var config = window.__MOVIE_PLAYER__;
        var video = document.querySelector("[data-main-video]");
        var playButton = document.querySelector("[data-play-button]");
        var status = document.querySelector("[data-player-status]");
        if (!config || !video || !playButton) {
            return;
        }

        var hls = null;
        var loaded = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            setStatus("正在加载高清播放源…");

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源已就绪");
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("网络加载异常，正在重试…");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("媒体解码异常，正在恢复…");
                        hls.recoverMediaError();
                    } else {
                        setStatus("播放器遇到错误，请刷新页面后重试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("播放源已就绪");
                }, { once: true });
            } else {
                setStatus("当前浏览器缺少 HLS 播放能力，请使用最新版浏览器打开");
            }
        }

        function play() {
            loadSource();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setStatus("播放未自动开始，请再次点击视频控件播放");
                });
            }
        }

        playButton.addEventListener("click", play);
        video.addEventListener("play", function () {
            playButton.classList.add("is-hidden");
            setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
            playButton.classList.remove("is-hidden");
            setStatus("已暂停，点击可继续播放");
        });
        video.addEventListener("ended", function () {
            playButton.classList.remove("is-hidden");
            setStatus("播放结束");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHeroCarousel();
        initFilters();
        initPlayer();
    });
})();
