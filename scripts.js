var btn = document.getElementById("btn").addEventListener('click', startProcess);
var stopBtn = document.getElementById("stop").addEventListener('click', stopProcess);
var result = document.getElementById("text");
var maxval = document.getElementById("maxval");
var minval = document.getElementById("minval");
var audioContext, analyser, microphone, dataArray, stream, animationFrameId;
var maxDecibels = -Infinity; // Store max value

function startProcess() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(userStream => {
            stream = userStream; // Store the stream to stop it later
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            dataArray = new Uint8Array(analyser.fftSize);
    
            analyser.fftSize = 512; // Adjust for sensitivity
            microphone.connect(analyser);

            function getDecibels() {
                analyser.getByteFrequencyData(dataArray);
                let sum = dataArray.reduce((acc, val) => acc + val * val, 0);
                let rms = Math.sqrt(sum / dataArray.length);
                let decibels = 20 * Math.log10(rms || 1); // Prevent log(0) issues
                console.log(`En este momento estas oyendo ${decibels.toFixed(2)} dB`);
                result.innerHTML = `${decibels.toFixed(2)}`;
                
                // Update max value
                if (decibels > maxDecibels) {
                    maxDecibels = decibels;
                    maxval.innerHTML = `${maxDecibels.toFixed(2)}`;
                }

                animationFrameId = requestAnimationFrame(getDecibels);
            }

            getDecibels();

            // Enable Stop, Disable Start
            document.getElementById("stop").disabled = false;
            document.getElementById("btn").disabled = true;
        })
        .catch(err => console.error('Acceso al micrófono denegado!', err));
}

function stopProcess() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop microphone
    }
    if (audioContext) {
        audioContext.close(); // Close audio processing
    }
    cancelAnimationFrame(animationFrameId); // Stop animation loop
    console.log("Microfono detenido.");
    result.innerHTML = "-";

    // Reset max value
    maxDecibels = -Infinity;

    // Enable Start, Disable Stop
    document.getElementById("stop").disabled = true;
    document.getElementById("btn").disabled = false;
}
