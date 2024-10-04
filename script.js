window.onload = function () {
  let params = new URLSearchParams(window.location.search);
  if (!params.get("name")) {
    const overlay = document.getElementById("popupOverlay");
    overlay.classList.toggle("show");
  } else {
    document.title = params.get("name") || "HPBD";
    document.getElementById("name").innerHTML = params.get("name");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  let varTimesBlow = Number(urlParams.get("timesblow")) || 3;
  let varAudioProcessor = Number(urlParams.get("audioprocessor")) || 120;
  let varDurationConfetti = Number(urlParams.get("durationconfetti")) || 5;

  let times = 0;
  let process = false;
  var info = document.getElementById("info");

  const canvas = document.getElementById("candleCanvas");
  const canvas2 = document.getElementById("candleCanvas2");
  const canvas3 = document.getElementById("candleCanvas3");
  const ctx = canvas.getContext("2d");
  const ctx2 = canvas2.getContext("2d");
  const ctx3 = canvas3.getContext("2d");

  const CANDLE_COLOR = "#FFDF8F";
  const FLAME_COLOR = "#FF4500";

  const candle = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 300,
    width: 40,
    height: 300,
    flameHeight: 50,
    flameIntensity: 1.5,
  };

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      microphone.connect(analyser);
      analyser.connect(audioContext.destination);

      scriptProcessor.connect(audioContext.destination);
      scriptProcessor.onaudioprocess = function () {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const arraySum = array.reduce((a, value) => a + value, 0);
        const average = arraySum / array.length;

        if (average >= varAudioProcessor && !process) {
          info.innerHTML += Math.round(average) + " ";

          process = true;
          setTimeout(() => {
            times += 1;
            process = false;
            if (times >= varTimesBlow) {
              var duration = varDurationConfetti * 1000;
              var end = Date.now() + duration;
              (function frame() {
                confetti({
                  particleCount: 5,
                  angle: 60,
                  spread: 55,
                  startVelocity: 45,
                  origin: { x: 0 },
                });
                // and launch a few from the right edge
                confetti({
                  particleCount: 5,
                  angle: 120,
                  spread: 55,
                  startVelocity: 45,
                  origin: { x: 1 },
                });

                // keep going until we are out of time
                if (Date.now() < end) {
                  requestAnimationFrame(frame);
                }
              })();
              setTimeout(() => {
                var myAudio = document.getElementById("myAudio");
                myAudio.play();
                times = 0;
              }, varDurationConfetti * 1000);
            }
          }, 1000);
        }
      };

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function drawCandle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = CANDLE_COLOR;
        ctx.fillRect(candle.x, candle.y, candle.width, candle.height);
        ctx.fillStyle = FLAME_COLOR;
        ctx.fillRect(
          candle.x,
          candle.y - candle.flameHeight,
          candle.width,
          candle.flameHeight
        );

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        ctx2.fillStyle = CANDLE_COLOR;
        ctx2.fillRect(candle.x, candle.y, candle.width, candle.height);
        ctx2.fillStyle = FLAME_COLOR;
        ctx2.fillRect(
          candle.x,
          candle.y - candle.flameHeight,
          candle.width,
          candle.flameHeight
        );

        ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
        ctx3.fillStyle = CANDLE_COLOR;
        ctx3.fillRect(candle.x, candle.y, candle.width, candle.height);
        ctx3.fillStyle = FLAME_COLOR;
        ctx3.fillRect(
          candle.x,
          candle.y - candle.flameHeight,
          candle.width,
          candle.flameHeight
        );
      }

      function updateFlameHeight() {
        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude from frequency data
        const sum = dataArray.reduce((acc, value) => acc + value, 0);
        const averageAmplitude = sum / bufferLength;

        // Adjust flame height based on the average amplitude
        candle.flameHeight = Math.floor(
          candle.flameIntensity * averageAmplitude
        );

        // Draw the candle with the updated flame height
        drawCandle();

        // Request animation frame for continuous updates
        requestAnimationFrame(updateFlameHeight);
      }
      // Start updating flame height
      updateFlameHeight();
    })
    .catch((err) => {
      console.error("Error accessing microphone:", err);
    });
});

document
  .getElementById("popupOverlay")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    var formData = new FormData(document.getElementById("popupForm"));
    // output as an object
    console.log(Object.fromEntries(formData));

    let params = new URLSearchParams(window.location.search);

    // ...or iterate through the name-value pairs
    for (var pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
      params.set(pair[0], pair[1]);
    }

    window.location.search = params.toString();
  });
