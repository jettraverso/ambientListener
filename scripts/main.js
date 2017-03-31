/*main.js*/
window.onload = function () {
    var canvasCtx = $("#canvas").get()[0].getContext("2d"),
        audioCtx = new window.AudioContext(),
        noiseOp = 0;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.onresize = resize();
    
    if (!navigator.getUserMedia) {
        console.log("getUserMedia is not supported.");
    } else {
        var constraints = {audio: true};
        
        var onSuccess = function (stream) {
            var mediaRecorder = new MediaRecorder(stream);
            
            visualize(stream);
        };
        
        var onError = function (err) {
            console.log("The following error occurred: " + err);
        };
        
        navigator.getUserMedia(constraints, onSuccess, onError);
    }
    
    function visualize(stream) {
        var src = audioCtx.createMediaStreamSource(stream),
            analyser = audioCtx.createAnalyser();
        
        analyser.smoothingTimeConstant = 0.85;
        analyser.fftSize = 256;
        
        var bufferLength = analyser.frequencyBinCount,
            dataArray = new Uint8Array(bufferLength);
        
        src.connect(analyser);
        
        WIDTH = canvas.width;
        HEIGHT = canvas.height;
        
        draw();
        
        function draw() {
            requestAnimationFrame(draw);
        
            analyser.getByteTimeDomainData(dataArray);
            var volumeFactor = getAverageVolume(dataArray) - 127.0;
            
            var noiseFreq = volumeFactor * 128.0;
            if (noiseFreq > 65) {
                noiseOp++;
            } else {
                noiseOp--;
                if (noiseOp < 0) {
                    noiseOp = 0;
                }
            }

            console.log(noiseFreq + " " + noiseOp);

            noise(canvasCtx, noiseOp);
        }
        
        function noise(ctx, noiseOp) {
            var w = ctx.canvas.width,
                h = ctx.canvas.height,
                idata = ctx.createImageData(w, h),
                buffer32 = new Uint32Array(idata.data.buffer),
                len = buffer32.length,
                i = 0;
            
            for (; i < len;) {
                buffer32[i++] = ((noiseOp * Math.random())|0) << 24;
            }
            
            ctx.putImageData(idata, 0, 0);
        }
        
        function getAverageVolume(array) {
            var values = 0,
                average,
                length = array.length;
            
            for (var i = 0; i < length; i++) {
                values += array[i];
            }
            
            average = values / length;
            return average;
        }
    }
}