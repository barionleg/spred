
const saveGifHandler = blob => {
    let a = document.createElement("a")
    let blobURL = URL.createObjectURL(blob)
    const name = prompt('set filename of saved file:', 'mysprite.gif');
    a.download = name;
    a.href = blobURL;
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const gifExporter = (scale, handler) => {
    const gif = new GIF({ workerScript: "js/gif.worker.js", quality: 1 });
    _.each(workspace.frames, (f, i) => {
        const delayTime = (options.frameDelayMode == 1) ? f.delayTime : options.animationSpeed;
        gif.addFrame(getFrameImage(i, scale, scale / options.lineResolution)[0], { delay: delayTime * 20 });
    });
    gif.on('finished', handler);
    gif.render();
}

const exportGif = () => {
    gifExporter(options.gifExportScale, saveGifHandler);
}