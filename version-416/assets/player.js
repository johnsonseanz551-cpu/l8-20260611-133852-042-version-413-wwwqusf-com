(function () {
  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hls = null;
    var requested = false;

    if (!video || !button || !stream) {
      return;
    }

    var play = function () {
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    };

    var attach = function () {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          if (requested) {
            play();
          }
        }, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            play();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            button.classList.remove('is-hidden');
          }
        });
        window.addEventListener('beforeunload', function () {
          if (hls) {
            hls.destroy();
          }
        }, { once: true });
        return;
      }

      video.src = stream;
    };

    var start = function () {
      requested = true;
      button.classList.add('is-hidden');
      attach();
      if (ready && video.readyState > 0) {
        play();
      }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
  });
})();
