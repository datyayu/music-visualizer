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


// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw


// load the sound
setupAudioNodes(audioCtx);
loadSound(AUDIO_FILE, audioCtx);


function setupAudioNodes(context) {
    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(context.destination);
}

// load the specified sound
function loadSound(url, context) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {
        // decode the data
        context.decodeAudioData(request.response, playSound, function(error) {
            console.log(error)
        });
    }

    request.send();
}


function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}


javascriptNode.onaudioprocess = function() {
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

    console.log(array.map(item => CANVAS_HEIGHT-item))

    // Draw new spectrum
    array.forEach(function(value, index) {
        if (index % SKIPPED_VALUES !==0) return

        var x = (index / SKIPPED_VALUES) * 7
        var y = CANVAS_HEIGHT - ( value / 6 )

        canvasCtx.fillRect(x, y, 5, CANVAS_HEIGHT)
    })
}

