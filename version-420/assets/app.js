document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
        var slides = Array.from(hero.querySelectorAll(".hero-slide"));
        var dots = Array.from(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var searchInput = document.querySelector(".site-search");
    var yearFilter = document.querySelector(".year-filter");
    var typeFilter = document.querySelector(".type-filter");
    var cards = Array.from(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function runFilter() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var year = normalize(yearFilter ? yearFilter.value : "");
        var type = normalize(typeFilter ? typeFilter.value : "");

        cards.forEach(function (card) {
            var text = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.type,
                card.dataset.genre
            ].join(" "));
            var yearMatch = !year || normalize(card.dataset.year) === year;
            var typeMatch = !type || normalize(card.dataset.type) === type;
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            card.classList.toggle("is-filtered-out", !(yearMatch && typeMatch && keywordMatch));
        });
    }

    [searchInput, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", runFilter);
            control.addEventListener("change", runFilter);
        }
    });

    document.querySelectorAll(".player-shell").forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var videoUrl = shell.dataset.videoUrl;
        var ready = false;

        function startVideo() {
            if (!video || !videoUrl) {
                return;
            }

            if (!ready) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                    ready = true;
                    video.play();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        ready = true;
                        video.play();
                    });
                } else {
                    video.src = videoUrl;
                    ready = true;
                    video.play();
                }
            } else {
                video.play();
            }

            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");
        }

        if (cover) {
            cover.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!ready || video.paused) {
                    startVideo();
                }
            });
        }
    });
});
