(function () {
  function initializePlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play]");
    var stream = shell.getAttribute("data-video");
    var hls = null;
    var prepared = false;

    function prepare() {
      return new Promise(function (resolve, reject) {
        if (!video || !stream) {
          reject(new Error("missing"));
          return;
        }
        if (prepared) {
          resolve();
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            resolve();
          }, { once: true });
          video.addEventListener("error", function () {
            reject(new Error("video"));
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                reject(new Error("fatal"));
              }
            }
          });
        } else {
          video.src = stream;
          resolve();
        }
      });
    }

    function play() {
      if (button) {
        button.classList.add("is-hidden");
      }
      prepare().then(function () {
        return video.play();
      }).catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
          button.querySelector("strong").textContent = "重新播放";
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initializePlayer);
  });
}());
