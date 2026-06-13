const WIDTH = 500, HEIGHT = 1346;
let currentTimer = 0;
let selectedTemplate = null;

// set frame window size and position
const FRAME_WINDOW = {x: 50, y: 50, w: 400, h: 400};

document.addEventListener('DOMContentLoaded', async function() {
    await preloadFrames();

    const params = new URLSearchParams(window.location.search);
    selectedTemplate = params.get('template');

    if (!selectedTemplate) {
        window.location.href = 'photostripFrameSel.html';
        return;
    }

    const frameImg = document.getElementById('photostripDefaultTemp');
    const preloaded = FRAME_DATA[selectedTemplate];

    if (preloaded) {
        frameImg.src = preloaded.src;
    }
    else {
        frameImg.src = 'assets/photostripFrames/' + selectedTemplate;
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
    } catch (error) {
        console.warn('Camera access not available', error);
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

    
}