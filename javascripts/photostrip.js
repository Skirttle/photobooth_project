const WIDTH = 500, HEIGHT = 1346;
let currentTimer = 0;
let selectedTemplate = null;
let currentSlot = 0;
let capturedPhotos = [null, null, null];
let tempShot = null;

const FRAME_WINDOWS = [
    { x: 25, y: 42,  w: 450, h: 300 },
    { x: 25, y: 372, w: 450, h: 300 },
    { x: 25, y: 702, w: 450, h: 300 }
];

const ORDINALS = ['1st', '2nd', '3rd'];

document.addEventListener('DOMContentLoaded', async function() {
    await preloadFrames();

    const params = new URLSearchParams(window.location.search);
    selectedTemplate = params.get('template');

    if (!selectedTemplate) {
        window.location.href = 'photostripFrameSel.html';
        return;
    }

    updateSlotUI();
});

function updateSlotUI() {
    const win = FRAME_WINDOWS[currentSlot];
    document.getElementById('captureBox').style.aspectRatio = `${win.w} / ${win.h}`;

    positionFrameCrop();
}

function positionFrameCrop() {
    const container = document.getElementById('captureBox');
    const frameCrop = document.getElementById('frameCrop');
    const win = FRAME_WINDOWS[currentSlot];

    const preloaded = FRAME_DATA[selectedTemplate];
    const frameSrc = preloaded ? preloaded.src : 'assets/photostripFrames/' + selectedTemplate;

    const rect = container.getBoundingClientRect();
    const scale = rect.width / win.w; // source px -> displayed px

    frameCrop.style.backgroundImage = `url('${frameSrc}')`;
    frameCrop.style.backgroundSize = `${WIDTH * scale}px ${HEIGHT * scale}px`;
    frameCrop.style.backgroundPosition = `-${win.x * scale}px -${win.y * scale}px`;
}

window.addEventListener('resize', () => {
    if (selectedTemplate) positionFrameCrop();
});

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        const video = document.getElementById('cameraViewPhotostrip');
        video.srcObject = stream;
        await video.play().catch(() => {});
        window._cameraStream = stream;
    } catch (error) {
        console.warn('Camera access not available', error);
    }
}

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

const countdownOverlay = document.createElement('div');
countdownOverlay.id = 'countdownOverlay';
document.getElementById('app').appendChild(countdownOverlay);

document.getElementById('captureButton').addEventListener('click', () => {
    if (currentTimer > 0) {
        countdownOverlay.style.display = 'block';
        let count = currentTimer;
        countdownOverlay.textContent = count;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.textContent = count;
            } else {
                clearInterval(interval);
                countdownOverlay.style.display = 'none';
                captureSlot();
            }
        }, 1000);
    } else {
        captureSlot();
    }
});

function captureSlot() {
    const video = document.getElementById('cameraViewPhotostrip');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    tempShot = canvas;

    const preview = document.getElementById('capturedPreview');
    preview.src = canvas.toDataURL('image/png');
    preview.style.display = 'block';
    video.style.display = 'none';

    document.getElementById('captureButton').style.display = 'none';
    document.getElementById('redoButton').style.display = 'block';
    document.getElementById('nextButton').style.display = 'block';
}

document.getElementById('redoButton').addEventListener('click', () => {
    tempShot = null;
    document.getElementById('capturedPreview').style.display = 'none';
    document.getElementById('cameraViewPhotostrip').style.display = 'block';
    document.getElementById('captureButton').style.display = 'block';
    document.getElementById('redoButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'none';
});

document.getElementById('nextButton').addEventListener('click', () => {
    capturedPhotos[currentSlot] = tempShot;
    tempShot = null;
    currentSlot++;

    if (currentSlot < FRAME_WINDOWS.length) {
        document.getElementById('capturedPreview').style.display = 'none';
        document.getElementById('cameraViewPhotostrip').style.display = 'block';
        document.getElementById('captureButton').style.display = 'block';
        document.getElementById('redoButton').style.display = 'none';
        document.getElementById('nextButton').style.display = 'none';
        updateSlotUI();
    } else {
        finalizePhotostrip();
    }
});

function finalizePhotostrip() {
    const preloaded = FRAME_DATA[selectedTemplate];

    function doComposite(frameImage) {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext('2d');

        FRAME_WINDOWS.forEach((win, i) => {
            const shot = capturedPhotos[i];
            const destAspect = win.w / win.h;
            const srcW = shot.width, srcH = shot.height;
            const srcAspect = srcW / srcH;

            let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;
            if (srcAspect > destAspect) {
                cropW = Math.round(srcH * destAspect);
                cropX = Math.round((srcW - cropW) / 2);
            } else {
                cropH = Math.round(srcW / destAspect);
                cropY = Math.round((srcH - cropH) / 2);
            }

            ctx.drawImage(shot, cropX, cropY, cropW, cropH, win.x, win.y, win.w, win.h);
        });

        ctx.drawImage(frameImage, 0, 0, WIDTH, HEIGHT);
        saveCapture(canvas);
    }

    if (preloaded) {
        doComposite(preloaded);
    } else {
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.onload = () => doComposite(fallback);
        fallback.src = 'assets/photostripFrames/' + selectedTemplate;
    }
}

function saveCapture(canvas) {
    let dataURL;
    try {
        dataURL = canvas.toDataURL('image/png');
    } catch (e) {
        console.error('toDataURL failed:', e);
        alert('Could not save photo. Please run via a local server.');
        return;
    }
    sessionStorage.setItem('capturedPhoto', dataURL);
    window.location.href = 'finalResult.html';
}