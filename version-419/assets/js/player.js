(function () {
  'use strict';

  function initHlsPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-overlay]');
    var loading = shell.querySelector('[data-video-loading]');
    var errorBox = shell.querySelector('[data-video-error]');
    var source = shell.getAttribute('data-hls-src');
    var initialized = false;
    var hls = null;

    function showLoading(show) {
      if (loading) {
        loading.hidden = !show;
      }
    }

    function showError(message) {
      showLoading(false);
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.hidden = true;
      }
    }

    function attachSource() {
      if (initialized || !video || !source) {
        return Promise.resolve();
      }
      initialized = true;
      showLoading(true);

      return new Promise(function (resolve) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            showLoading(false);
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showError('视频加载失败，请刷新页面后重试。');
              if (hls) {
                hls.destroy();
                hls = null;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            showLoading(false);
            resolve();
          }, { once: true });
          video.addEventListener('error', function () {
            showError('视频加载失败，请检查网络或稍后重试。');
          });
        } else {
          showError('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Firefox 或 Safari。');
          resolve();
        }
      });
    }

    function play() {
      attachSource().then(function () {
        hideOverlay();
        if (video && video.play) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              if (overlay) {
                overlay.hidden = false;
              }
            });
          }
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', hideOverlay);
      video.addEventListener('waiting', function () {
        showLoading(true);
      });
      video.addEventListener('playing', function () {
        showLoading(false);
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-hls-src]')).forEach(initHlsPlayer);
  });
})();
