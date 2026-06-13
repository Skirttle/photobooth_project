const FRAME_DATA = {};

const FRAME_DATA_CONFIG = {
    polaroid: {
        folder: 'polaroidFrames',
        frames: [
            'polaroidDefaultTemp.png',
            'naganoFrame.png',
            'jungleFrame.png',
            'gigiFrame.png',
            'miniIdleFrame.png',
            'blackpinkFrame.png'
        ]
    },
    photostrip: {
        folder: 'photostripFrames',
        frames: [
            'photostripDefaultTemp.png',
            'photostripMusicTemp.png',
            'photostripChiikawaTemp.png'
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
