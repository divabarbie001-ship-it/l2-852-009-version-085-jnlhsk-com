(function () {
  var loaderPromise = null;

  function loadScript(src) {
    if (loaderPromise) {
      return loaderPromise;
    }

    loaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return loaderPromise;
  }

  function startPlayer(card) {
    var video = card.querySelector('video');
    var stream = video ? video.getAttribute('data-stream') : '';

    if (!video || !stream) {
      return;
    }

    function playNow() {
      card.classList.add('playing');
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          card.classList.remove('playing');
        });
      }
    }

    if (video.getAttribute('data-ready') === '1') {
      playNow();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      playNow();
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js').then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.setAttribute('data-ready', '1');
        video.addEventListener('canplay', playNow, { once: true });
      } else {
        video.src = stream;
        video.setAttribute('data-ready', '1');
        playNow();
      }
    }).catch(function () {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      playNow();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (card) {
    var button = card.querySelector('[data-play-button]');
    var video = card.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(card);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(card);
        }
      });
      video.addEventListener('play', function () {
        card.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.seeking && video.currentTime === 0) {
          card.classList.remove('playing');
        }
      });
    }
  });
})();
