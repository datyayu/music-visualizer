// Create audio context
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

var CANVAS_HEIGHT = 100
var SKIPPED_VALUES = 3
var AUDIO_FILE = 'https://s3-us-west-1.amazonaws.com/raji-demo/audio/kyousogiga_op/01.lite.mp3'
var audioCtx = new AudioContext();

// get the context from the canvas to draw on
var $canvas = document.getElementById('canvas')
var canvasCtx = $canvas.getContext('2d')
var javascriptNode;
var sourceNode;
var analyser;

var ongaku = new Ongaku({
    onPlaybackPause: clearSpectrum
})

setupAnalyser(ongaku.getContext());
ongaku.playAudio(AUDIO_FILE)


function setupAnalyser(context) {
    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;

    // create a buffer source node
    ongaku.connectNode(analyser);
    analyser.connect(javascriptNode);
}



javascriptNode.onaudioprocess = function() {
    if (!ongaku.isPlaying()) return;

    // get the average for the first channel
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    // Draw the spectrum
    drawSpectrum(array);
}


function drawSpectrum(array) {
    // clear the current state
    canvasCtx.clearRect(0, 0, 1000, CANVAS_HEIGHT)
    canvasCtx.fillStyle = '#ffffff'

    // Draw new spectrum
    array.forEach(function(value, index) {
        if (index % SKIPPED_VALUES !==0) return

        var x = (index / SKIPPED_VALUES) * 7
        var y = CANVAS_HEIGHT - ( value / 10 )

        canvasCtx.fillRect(x, y, 5, CANVAS_HEIGHT)
    })
}

function clearSpectrum() {
    canvasCtx.clearRect(0, 0, 1000, CANVAS_HEIGHT)
    canvasCtx.fillStyle = '#ffffff'

    var array = new Array(256).fill(0)

    array.forEach(function(_, index) {
        if (index % SKIPPED_VALUES !==0) return

        var x = (index / SKIPPED_VALUES) * 7

        canvasCtx.fillRect(x, CANVAS_HEIGHT, 5, CANVAS_HEIGHT)
    })
}
