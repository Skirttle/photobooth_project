const WIDTH = 825, HEIGHT = 1150;
let currentTimer = 0;
let selectedTemplate = null;

// set frame window size and position
const FRAME_WINDOW = { x: 60, y: 83, w: 705, h: 875 };

document.addEventListener('DOMContentLoaded', async function() {
    await preloadFrames();

    const params = new URLSearchParams(window.location.search);
    selectedTemplate = params.get('template');

    if (!selectedTemplate) {
        window.location.href = 'polaroidFrameSel.html';
        return;
    }

    const frameImg = document.getElementById('polaroidDefaultTemp');
    const preloaded = FRAME_DATA[selectedTemplate];

    if (preloaded) {
        frameImg.src = preloaded.src;
    }
    else {
        frameImg.src = 'assets/polaroidFrames/' + selectedTemplate;
        console.warn('Frame not in FRAME_DATA, using direct src:', selectedTemplate);
    }
});

// to start camera immediately when page is loaded
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        const video = document.getElementById('cameraView');
        video.srcObject = stream;
        await video.play().catch(() => {});
        window._cameraStream = stream;
    } catch (e) {
        console.warn('Camera access not available', e);
    }
}

// to stop camera when it leaves the page
function stopCamera() {
    if (window._cameraStream) {
        window._cameraStream.getTracks().forEach(t => t.stop());
        window._cameraStream = null;
    }
}

startCamera();
window.addEventListener('beforeunload', stopCamera);

// timer menu
const timerButton  = document.getElementById('timerButton');
const timerMenu    = document.getElementById('timerMenu');
const timerOptions = document.querySelectorAll('.timer-option');

timerButton.addEventListener('click', (e) => {
    e.stopPropagation();
    timerMenu.classList.toggle('active');
});

timerOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTimer = parseInt(option.getAttribute('data-timer'));
        timerOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        timerMenu.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!timerMenu.contains(e.target) && !timerButton.contains(e.target)) {
        timerMenu.classList.remove('active');
    }
});

// countdown overlay
const countdownOverlay = document.createElement('div');
countdownOverlay.id = 'countdownOverlay';
document.getElementById('app').appendChild(countdownOverlay);

// capture button
document.getElementById('captureButton').addEventListener('click', () => {
    if (currentTimer > 0) {
        countdownOverlay.style.display = 'block';
        let count = currentTimer;
        countdownOverlay.textContent = count;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.textContent = count;
            } 
            else {
                clearInterval(interval);
                countdownOverlay.style.display = 'none';
                triggerCapture();
            }
        }, 1000);
    } 
    else {
        triggerCapture();
    }
});

function triggerCapture() {
    const video = document.getElementById('cameraView');
    const preloaded = FRAME_DATA[selectedTemplate];

    function doCapture(frameImage) {
        const canvas = document.createElement('canvas');
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext('2d');

        const win = FRAME_WINDOW;
        console.log('Using hardcoded window:', win);

        const destW = win.w;
        const destH = win.h;
        const destX = win.x;
        const destY = win.y;

        // crop video to match frame window aspect ratio
        const destAspect = destW / destH;
        
        const srcW = video.videoWidth;
        const srcH = video.videoHeight;
        const srcAspect = srcW / srcH;

        let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;
        
        if (srcAspect > destAspect) {
            cropW = Math.round(srcH * destAspect);
            cropX = Math.round((srcW - cropW) / 2);
        } 
        else {
            cropH = Math.round(srcW / destAspect);
            cropY = Math.round((srcH - cropH) / 2);
        }

        // draw mirrored video to a temp canvas first
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = destW;
        tempCanvas.height = destH;
        const tempCtx = tempCanvas.getContext('2d');

        // mirror the video
        tempCtx.save();
        tempCtx.translate(destW, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, destW, destH);
        tempCtx.restore();

        // draw temp canvas to main canvas at correct position
        ctx.drawImage(tempCanvas, destX, destY);

        // set frame on top of captured image
        ctx.drawImage(frameImage, 0, 0, WIDTH, HEIGHT);

        saveCapture(canvas);
    }

    if (preloaded) {
        doCapture(preloaded);
    } 
    else {
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.onload = () => doCapture(fallback);
        fallback.onerror = () => {
            const canvas = document.createElement('canvas');
            canvas.width = WIDTH; canvas.height = HEIGHT;
            canvas.getContext('2d').drawImage(video, 0, 0, WIDTH, HEIGHT);
            saveCapture(canvas);
        };
        fallback.src = 'assets/polaroidFrames/' + selectedTemplate;
    }
}

// save captured picture and go to final result page
function saveCapture(canvas) {
    let dataURL;
    try {
        dataURL = canvas.toDataURL('image/png');
    } catch (e) {
        console.error('toDataURL failed — canvas may be tainted:', e);
        alert('Could not save photo. Please run via a local server (e.g. VS Code Live Server).');
        return;
    }
    sessionStorage.setItem('capturedPhoto', dataURL);
    window.location.href = 'finalResult.html';
}

// redo button
document.getElementById('redoButton').addEventListener('click', () => {
    document.getElementById('redoButton').style.display    = 'none';
    document.getElementById('captureButton').style.display = 'block';
    startCamera();
});