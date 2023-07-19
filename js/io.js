
const saveFile = () => {
    const name = prompt('set filename of saved file:', 'mysprites.spr');
    let binList = [];
    binList.push(sprHeader);
    binList.push(workspace.selectedFrame, workspace.selectedColor, workspace.backgroundColor);
    binList.push(options.animationSpeed, options.palette == 'PAL' ? 0 : 1, options.lineResolution);
    binList.push(options.mergeMode);
    binList.push(options.spriteGap01);
    binList.push(options.spriteGap23);
    binList.push(options.pairGap);
    const flags = options.dliOn + (options.commonPalette << 1);
    binList.push(flags);
    binList.push(options.frameDelayMode);
    binList.push(0); // 1 unused byte
    binList.push(workspace.frames.length, options.spriteHeight);
    for (let p = 0; p < playerCount(); p++) {
        binList.push(_.map(workspace.frames, f => f.colors[p]));
    }
    for (let p = 0; p < playerCount(); p++) {
        _.each(workspace.frames, f => { f.player[p].length = options.spriteHeight; binList.push(f.player[p]) });
    }
    if (isMissileMode()) {
        for (let p = 0; p < playerCount(); p++) {
            _.each(workspace.frames, f => { f.missile[p].length = options.spriteHeight; binList.push(f.missile[p]) });
        }
    }

    if (options.dliOn) {
        for (let tdli of dliMap) {
            _.each(workspace.frames, f => {
                f.dli[tdli].length = options.spriteHeight;
                binList.push(f.dli[tdli]);
            });
        }
    }

    if (options.frameDelayMode) {
        _.each(workspace.frames, f => {
            binList.push(f.delayTime);
        });
    }

    binList = _.flatMap(binList);
    var a = document.createElement('a');
    document.body.appendChild(a);
    var file = new Blob([new Uint8Array(binList)]);
    a.href = URL.createObjectURL(file);
    if (name) {
        a.download = name;
        a.click();
        setTimeout(() => { $(a).remove(); }, 100);
    }
};

const openFile = function (event) {
    var input = event.target;
    var file = input.files[0];
    dropFile(file);
    $("#fdialog0").blur();
    closeLibrary();
};

const openBackgroundFile = function (event) {
    var input = event.target;
    var file = input.files[0];
    loadBackground(file);
    $("#fdialogx").blur();
};

const map2bpp = (data, colors) => {
    outdata = [];
    data.forEach(b=>{
        c = (b & 0b11000000) >> 6;
        outdata.push(colors[c])
        c = (b & 0b00110000) >> 4;
        outdata.push(colors[c])
        c = (b & 0b00001100) >> 2;
        outdata.push(colors[c])
        c = (b & 0b00000011) ;
        outdata.push(colors[c])
    })
    return outdata;
}

const parseBackImage = (binData) => {
    const binSize = binData.length;
    const colorPtr = binSize-4;
    const colors = Array.from(binData.subarray(colorPtr,colorPtr+4));
    const image = Array.from(binData.subarray(0,colorPtr));
    return map2bpp(image,colors);
}

const parseBinary = (binData) => {

    const areEqual = (a1, a2) => {
        if (a1.length != a2.length) {
            return false;
        }
        for (let i = 0; i < a1.length; i++) {
            if (a1[i] != a2[i]) {
                return false;
            }
        }
        return true;
    }

    const binSize = binData.length;
    let binPtr = 0;
    let id = 0;

    const parseAPL = fsize => {
        fsize = fsize || 48;
        const wrkspc = _.clone(defaultWorkspace);
        wrkspc.frames = [];
        binPtr = 4;
        const aplFrames = binData[binPtr++];
        options.spriteHeight = binData[binPtr++];
        options.spriteGap01 = binData[binPtr++];
        for (let f = 0; f < 17; f++) {
            const frame = getEmptyFrame();
            frame.colors[0] = binData[binPtr++]
            wrkspc.frames.push(frame);
        }
        for (let f = 0; f < 17; f++) {
            wrkspc.frames[f].colors[1] = binData[binPtr++];
        }
        wrkspc.backgroundColor = binData[binPtr++];
        for (let f = 0; f < 17; f++) {
            wrkspc.frames[f].player[0] = Array.from(binData.subarray(binPtr, binPtr + fsize));
            binPtr += fsize;
        }
        for (let f = 0; f < 17; f++) {
            wrkspc.frames[f].player[1] = Array.from(binData.subarray(binPtr, binPtr + fsize));
            binPtr += fsize;
        }
        wrkspc.selectedFrame = binData[binPtr++];
        wrkspc.selectedColor = binData[binPtr++];
        options.animationSpeed = binData[binPtr++];
        options.palette = (binData[binPtr++] == 1) ? 'NTSC' : 'PAL';
        wrkspc.frames.length = aplFrames;
        options.mergeMode = MODE_P0P1;
        options.dliOn = 0;
        options.lineResolution = 2;
        options.frameDelayMode = 0;
        return wrkspc;
    }

    if (areEqual(aplHeader, binData.subarray(0, 4))) {               // PARSE APL 
        return parseAPL();
    } else if (areEqual(apl2Header, binData.subarray(0, 4))) {    // PARSE APL+ (52 rows)
        return parseAPL(52);
    } else if (areEqual(sprHeader, binData.subarray(0, 4))) {            // PARSE SPR 

        const wrkspc = _.clone(defaultWorkspace);
        wrkspc.frames = [];
        binPtr = 4;
        wrkspc.selectedFrame = binData[binPtr++];
        wrkspc.selectedColor = binData[binPtr++];
        wrkspc.backgroundColor = binData[binPtr++];
        options.animationSpeed = binData[binPtr++];
        options.palette = (binData[binPtr++] == 1) ? 'NTSC' : 'PAL';
        options.lineResolution = binData[binPtr++];
        options.mergeMode = binData[binPtr++];
        options.spriteGap01 = binData[binPtr++];
        options.spriteGap23 = binData[binPtr++];
        options.pairGap = binData[binPtr++];
        const flags = binData[binPtr++];
        options.dliOn = flags & 1;
        options.commonPalette = (flags & 2) >> 1;
        options.frameDelayMode = binData[binPtr++];
        let frameCount = binData[binPtr++];

        if (frameCount != 0) {                       // P0-P1 old format - preserved for compatibility
            options.spriteHeight = binData[binPtr++];
            options.spriteGap01 = binData[binPtr++];
        } else {                                      // all other modes
            frameCount = binData[binPtr++];
            options.spriteHeight = binData[binPtr++];
        }

        for (let f = 0; f < frameCount; f++) {
            const frame = getEmptyFrame();
            frame.colors[0] = binData[binPtr++]
            frame.dli = getFreshDli(frame.colors);
            wrkspc.frames.push(frame);
        }

        for (let p = 1; p < playerCount(); p++) {
            for (let f = 0; f < frameCount; f++) {
                wrkspc.frames[f].colors[p] = binData[binPtr++];
            }
        }

        for (let p = 0; p < playerCount(); p++) {
            for (let f = 0; f < frameCount; f++) {
                wrkspc.frames[f].player[p] = Array.from(binData.subarray(binPtr, binPtr + options.spriteHeight));
                binPtr += options.spriteHeight;
            }
        }

        if (isMissileMode()) {
            for (let p = 0; p < playerCount(); p++) {
                for (let f = 0; f < frameCount; f++) {
                    wrkspc.frames[f].missile[p] = Array.from(binData.subarray(binPtr, binPtr + options.spriteHeight));
                    binPtr += options.spriteHeight;
                }
            }
        }

        if (options.dliOn) {
            const dliList = ['back', 'c0', 'c1', 'c2', 'c3'];
            for (let tdli of dliList) {
                for (let f = 0; f < frameCount; f++) {
                    wrkspc.frames[f].dli[tdli] = Array.from(binData.subarray(binPtr, binPtr + options.spriteHeight));
                    binPtr += options.spriteHeight;
                }
            }
        }

        if (options.frameDelayMode) {
            for (let f = 0; f < frameCount; f++) {
                wrkspc.frames[f].delayTime = binData[binPtr++];
            }
        }

        wrkspc.frames.length = frameCount;
        return wrkspc;

    } else {
        parseError('unknown format!')
        return false;
    }
}

const loadBackground = function (file) {
    if (file) {
        var reader = new FileReader();
        reader.onload = function () {
            var arrayBuffer = reader.result;
            if (file.size > MAX_FILESIZE) {
                alert(`ERROR!!!\n\nFile size limit exceeded. Size: ${file.size} B - limit: ${MAX_FILESIZE} kB`);
                return false;
            }
            const binFileName = file.name;
            const binFileData = new Uint8Array(arrayBuffer);
            workspace.backgroundImage = parseBackImage(binFileData);
            options.showBackground = true;
            file.name = '';
            updateScreen();
        };
        reader.readAsArrayBuffer(file);
    }
}

const dropFile = function (file) {
    if (file) {
        var reader = new FileReader();
        reader.onload = function () {
            var arrayBuffer = reader.result;
            if (file.size > MAX_FILESIZE) {
                alert(`ERROR!!!\n\nFile size limit exceeded. Size: ${file.size} B - limit: ${MAX_FILESIZE} kB`);
                return false;
            }
            const binFileName = file.name;
            const binFileData = new Uint8Array(arrayBuffer);
            newWorkspace = parseBinary(binFileData);
            if (newWorkspace) {
                newCanvas();
                workspace = newWorkspace;
                options.showBackground = 0;
                if (workspace.backgroundImage) {
                    delete(workspace.backgroundImage);
                }
                refreshOptions();
                updateOptions();
                updateScreen();
                undos = [];
                redos = [];
                storeUndos();
            }
            file.name = '';
        };
        reader.readAsArrayBuffer(file);
    }
}
