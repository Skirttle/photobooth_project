const FRAME_DATA = {};

const FRAME_DATA_CONFIG = {
    polaroid: {
        folder: 'polaroidFrames',
        frames: [
            'polaroidDefaultTemp.webp',
            'naganoFrame.webp',
            'jungleFrame.webp',
            'gigiFrame.webp',
            'miniIdleFrame.webp',
            'blackpinkFrame.webp'
        ]
    },
    photostrip: {
        folder: 'photostripFrames',
        frames: [
            'photostripDefaultTemp.webp',
            'photostripMusicTemp.webp',
            'photostripChiikawaFrame.webp',
            'photostripJmjTemp.webp'
        ]
    }
};

// preloads all frames for both polaroid and photostrip from the config
function preloadFrames() {
    const allFrames = [];
    
    // collect frames from both polaroid and photostrip
    Object.entries(FRAME_DATA_CONFIG).forEach(([type, config]) => {
        config.frames.forEach(filename => {
            allFrames.push({ filename, folder: config.folder });
        });
    });

    return Promise.all(allFrames.map(({ filename, folder }) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                // to store the image element itself
                FRAME_DATA[filename] = img;
                resolve();
            };
            img.onerror = () => {
                console.warn(`Could not preload frame: ${filename}`);
                resolve(); // skip missing frames
            };
            img.src = `assets/${folder}/${filename}`;
        });
    }));
}
