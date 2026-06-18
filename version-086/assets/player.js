(function () {
  function load(video, source) {
    if (video.getAttribute("data-ready") === "yes") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "yes");
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsObject = hls;
      video.setAttribute("data-ready", "yes");
      return;
    }
    video.src = source;
    video.setAttribute("data-ready", "yes");
  }

  window.StaticMoviePlayer = {
    init: function (videoId, overlayId, source) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !overlay || !source) {
        return;
      }
      function start() {
        load(video, source);
        overlay.classList.add("is-hidden");
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };
})();
