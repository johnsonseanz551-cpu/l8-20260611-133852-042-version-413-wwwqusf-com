(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        if (slides.length) {
            var active = 0;
            var changeSlide = function (index) {
                active = index % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    changeSlide(i);
                });
            });
            changeSlide(0);
            window.setInterval(function () {
                changeSlide(active + 1);
            }, 5000);
        }

        var searchPanels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
        searchPanels.forEach(function (panel) {
            var input = panel.querySelector(".movie-search");
            var year = panel.querySelector(".movie-year");
            var region = panel.querySelector(".movie-region");
            var scope = document.querySelector(panel.getAttribute("data-target") || "body") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");
            var apply = function () {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var regionValue = region ? region.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var matched = (!keyword || text.indexOf(keyword) !== -1) && (!yearValue || cardYear === yearValue) && (!regionValue || cardRegion === regionValue);
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            };
            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.querySelector(".movie-player-video");
        var overlay = document.querySelector(".player-overlay");
        var button = document.querySelector(".player-start-button");
        var initialized = false;
        var hlsInstance = null;
        var attach = function () {
            if (!video || initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        };
        var start = function () {
            if (!video) {
                return;
            }
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        };
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
}());
