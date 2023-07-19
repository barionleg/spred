
// ******************************* COMMON HELPERS
// ************************************************************************************************

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
}

const isMissileMode = () => {
    return ((options.mergeMode & 1) == 1)
}

const isMissileOnLeft = () => {
    return ((options.mergeMode & 2) == 2)
}

const isPlayer23Mode = () => {
    return ((options.mergeMode & 4) == 4)
}

const playerCount = () => {
    return isPlayer23Mode() ? 4 : 2;
}

const isInMovieLoop = f => {
    if (!movieLoop) { return false }
    return (f >= movieLoop[0]) && (f <= movieLoop[1])
}

const parseError = msg => { alert(msg); }

const getWidthMultiplier = () => options.squarePixel ? 1 : 1.2;

const isPlayerActive = p => {
    if ((p < 2) && !layer01visible) { return false };
    if ((p > 1) && !layer23visible) { return false };
    return true;
}

function decimalToHex(d, padding) {
    let hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}

function decimalToBin(d, padding) {
    let bin = Number(d).toString(2);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 8 : padding;
    bin = bin.substring(-8);
    while (bin.length < padding) {
        bin = "0" + bin;
    }
    return bin;
}

const userIntParse = (udata) => {
    if (_.isNull(udata)) return null;
    udata = _.trim(udata);
    let sign = 1;
    if (_.startsWith(udata, '-')) {
        sign = -1;
        udata = udata.slice(1);
    }
    if (_.startsWith(udata, '$')) {
        udata = parseInt(_.trim(udata, '$'), 16);
    } else {
        udata = parseInt(udata, 10);
    }
    if (!_.isNaN(udata)) {
        if (sign === -1) {
            udata = -udata;
        }
        return udata;
    } else {
        return NaN;
    }
}

const getFreshDli = colors => {
    const dli = { back: [], c0: [], c1: [], c2: [], c3: [] };
    for (let r = 0; r < options.spriteHeight; r++) {
        dli.back[r] = workspace.backgroundColor;
        dli.c0[r] = colors[0];
        dli.c1[r] = colors[1];
        dli.c2[r] = colors[2];
        dli.c3[r] = colors[3];
    }
    return dli;
}

const fixWorkspace = () => {
    for (let f of workspace.frames) {
        if (!f.dli) {
            f.dli = getFreshDli(f.colors);
        }
        if (!f.delayTime) {
            f.delayTime = DEFAULT_DELAY_TIME;
        }
    }
    if (workspace.selectedFrame >= workspace.frames.length) {
        workspace.selectedFrame = 0;
    }
    if (workspace.selectedDli >= options.spriteHeight) {
        workspace.selectedDli = 0;
    }
    workspace.clipBoard = {};
    movieLoop = null;
    dliRange = null;
}

const getEmptyFrame = () => {
    const frame = {
        player: [[], [], [], []],
        missile: [[], [], [], []],
        colors: [0x24, 0xc8, 0x86, 0xea],
        delayTime: DEFAULT_DELAY_TIME
    }
    for (let r = 0; r < options.spriteHeight; r++) {
        for (p = 0; p < 4; p++) {
            frame.player[p][r] = 0;
            frame.missile[p][r] = 0;
        }
    }
    frame.dli = getFreshDli(frame.colors);
    return frame;
}

const stopMenu = (event) => {
    if (animationOn) { return false };
    event.preventDefault();
    return false;
}

// *********************************** EDITOR - COLORS
// ************************************************************************************************

const getColors = (frame, row) => {
    if (options.commonPalette) {
        frame = 0;
    }
    let colors = [
        workspace.backgroundColor,
        workspace.frames[frame].colors[0],
        workspace.frames[frame].colors[1],
        workspace.frames[frame].colors[0] | workspace.frames[frame].colors[1],
        0,
        workspace.frames[frame].colors[2],
        workspace.frames[frame].colors[3],
        workspace.frames[frame].colors[2] | workspace.frames[frame].colors[3]
    ];
    if (options.dliOn) {
        row = row - options.backOffsetV;
        if ((row>=0) && (row<options.spriteHeight)) {
            const dli = workspace.frames[frame].dli;
            colors = [
                dli.back[row],
                dli.c0[row],
                dli.c1[row],
                dli.c0[row] | dli.c1[row],
                0,
                dli.c2[row],
                dli.c3[row],
                dli.c2[row] | dli.c3[row]
            ];
        }
    } 
    return colors
}

const isColorActive = c => {
    if (!layer01visible && c > 0 && c < 4) { return false };
    if (!layer23visible && c > 3) { return false };
    if (!isPlayer23Mode() && workspace.selectedColor > 3) { return false };
    return true;
}

const updateColors = colors => {
    if (colors == undefined) {
        colors = getColors(workspace.selectedFrame, workspace.selectedDli + options.backOffsetV);
    }
    for (let i = 0; i < 8; i++) {
        $(`#color${i}`)
            .css('background-color', getByteRGB(colors[i]))
            .attr('title', `${colors[i]} ($${decimalToHex(colors[i]).toUpperCase()})`)
    }
    colorClicked(workspace.selectedColor);

    if (isPlayer23Mode()) {
        $('.p23only').removeClass('none');
    } else {
        $('.p23only').addClass('none');
    }
    if (!isColorActive(workspace.selectedColor)) {
        workspace.selectedColor = 0;
    }

    if (options.dliOn) {
        if (!workspace.frames[workspace.selectedFrame].dli) {
            workspace.frames[workspace.selectedFrame].dli = getFreshDli(workspace.frames[workspace.selectedFrame].colors);
        }
        $('.dli_row').each((i, dlirow) => {
            const row = Number(_.last(_.split(dlirow.id, '_')));
            const dliLine = workspace.frames[workspace.selectedFrame].dli;
            $(dlirow).children('li').eq(0).css('background-color', getByteRGB(dliLine.back[row]));
            $(dlirow).children('li').eq(1).css('background-color', getByteRGB(dliLine.c0[row]));
            if (isPlayer23Mode()) {
                $(dlirow).children('li').eq(2).css('background-color', getByteRGB(dliLine.c1[row]));
                $(dlirow).children('li').eq(3).css('background-color', getByteRGB(dliLine.c2[row]));
                $(dlirow).children('li').eq(4).css('background-color', getByteRGB(dliLine.c3[row]));
            } else {
                $(dlirow).children('li').eq(2).css('background-color', getByteRGB(dliLine.c0[row]));
                $(dlirow).children('li').eq(3).css('background-color', getByteRGB(dliLine.c1[row]));
                $(dlirow).children('li').eq(4).css('background-color', getByteRGB(dliLine.c1[row]));
            }
        });
        if (workspace.selectedDli >= options.spriteHeight) {
            workspace.selectedDli = 0;
        }
        showDliCursor();
    }
}

const fakeNewColor = (color, cval) => {
    const fakeColors = getColors(workspace.selectedFrame, workspace.selectedDli + options.backOffsetV);
    fakeColors[color] = cval;
    fakeColors[3] = fakeColors[1] | fakeColors[2];
    fakeColors[7] = fakeColors[5] | fakeColors[6];
    for (let i = 0; i < 8; i++) {
        $(`#color${i}`)
            .css('background-color', getByteRGB(fakeColors[i]))
            .attr('title', `${fakeColors[i]} ($${decimalToHex(fakeColors[i]).toUpperCase()})`)
    }
}

const colorClicked = (c) => {
    if (animationOn && !options.drawOnPlay) { return false };
    if (!layer01visible && c > 0 && c < 4) { return false };
    if (!layer23visible && c > 3) { return false };
    workspace.selectedColor = c;
    $('.colorbox').removeClass('colorSelected');
    $(`#color${c}`).addClass('colorSelected');
    if (options.linkColors && (c > 0)) {
        const clink = c < 4 ? c + 4 : c - 4;
        $(`#color${clink}`).addClass('colorSelected');
    }
    storeWorkspace();
    removeMarker();
    if (options.markActiveRegion) {
        showMarker(workspace.selectedColor);
    }
}


const getColorRGB = (frame, c, row) => {
    const colors = getColors(frame, row);
    return getByteRGB(colors[c]);
}

const getByteRGB = (cval) => {

    const cr = (cval >> 4) & 15;
    const lm = cval & 15;
    const crlv = cr ? 50 : 0;

    const phase = (options.palette == 'PAL') ? ((cr - 1) * 25.7 - 15) * (2 * 3.14159 / 360) : ((cr - 1) * 25 - 58) * (2 * 3.14159 / 360);

    const y = 255 * (lm + 1) / 16;
    const i = crlv * Math.cos(phase);
    const q = crlv * Math.sin(phase);

    const r = y + 0.956 * i + 0.621 * q;
    const g = y - 0.272 * i - 0.647 * q;
    const b = y - 1.107 * i + 1.704 * q;

    const rr = (Math.round(r)).clamp(0, 255);
    const gg = (Math.round(g)).clamp(0, 255);
    const bb = (Math.round(b)).clamp(0, 255);

    const rgb = `rgb(${rr},${gg},${bb})`;
    return rgb;
}

const getMasks = col => {
    const mp0 = col > 8 ? 0 : 0b10000000 >> col;
    const mp1offset = col - options.spriteGap01;
    const mp1 = mp1offset < 0 ? 0 : 0b10000000 >> mp1offset;
    const mm0offset = col - 8;
    const mm0 = mm0offset < 0 ? 0 : 0b10 >> mm0offset;
    const mm1offset = col - 8 - options.spriteGap01;
    const mm1 = mm1offset < 0 ? 0 : 0b10 >> mm1offset;

    const mp2offset = col - options.pairGap;
    const mp2 = mp2offset < 0 ? 0 : 0b10000000 >> mp2offset;
    const mp3offset = col - options.pairGap - options.spriteGap23;
    const mp3 = mp3offset < 0 ? 0 : 0b10000000 >> mp3offset;
    const mm2offset = col - options.pairGap - 8;
    const mm2 = mm2offset < 0 ? 0 : 0b10 >> mm2offset;
    const mm3offset = col - options.pairGap - 8 - options.spriteGap23;
    const mm3 = mm3offset < 0 ? 0 : 0b10 >> mm3offset;

    const missile = isMissileMode();
    const p23 = isPlayer23Mode();
    return [
        mp0,
        mp1,
        missile ? mm0 : 0,
        missile ? mm1 : 0,
        p23 ? mp2 : 0,
        p23 ? mp3 : 0,
        p23 ? (missile ? mm2 : 0) : 0,
        p23 ? (missile ? mm3 : 0) : 0
    ]
}

const getColorOn = (frame, col, row) => {
    row = row-options.backOffsetV;
    col = col-options.backOffsetH;
    if (onActiveArea({row,col})) {
        let c0, c1, c2, c3;
        const b0 = workspace.frames[frame].player[0][row];
        const b1 = workspace.frames[frame].player[1][row];
        const bm0 = workspace.frames[frame].missile[0][row];
        const bm1 = workspace.frames[frame].missile[1][row];
        const b2 = workspace.frames[frame].player[2][row];
        const b3 = workspace.frames[frame].player[3][row];
        const bm2 = workspace.frames[frame].missile[2][row];
        const bm3 = workspace.frames[frame].missile[3][row];
        const [mp0, mp1, mm0, mm1, mp2, mp3, mm2, mm3] = getMasks(col);
        c0 = (b0 & mp0) || (bm0 & mm0) ? 1 : 0;
        c1 = (b1 & mp1) || (bm1 & mm1) ? 2 : 0;
        c01 = c0 | c1;
        c2 = (b2 & mp2) || (bm2 & mm2) ? 5 : 0;
        c3 = (b3 & mp3) || (bm3 & mm3) ? 6 : 0;
        c23 = c2 | c3;
        let c = 0;
        if (isPlayer23Mode() && layer23visible) {
            if (c == 0) { c = c23 }
        }
        if (layer01visible) {  // ***************** p01 has higher priority
            c = c01 ? c01 : c;
        };
        return c
    }
    return 0;    
}
const getBackRGB = (col, row) => {
    const backWidth = 4 * (options.backImageWidth?options.backImageWidth:Math.ceil(editorWindow.columns / 4));
    const backOffset = (options.backOffset * 4) + (row * backWidth) + col;
    const color = workspace.backgroundImage[backOffset]?workspace.backgroundImage[backOffset]:0;
    return getByteRGB(color);
}

const getRGBOn = (frame, col, row) => {
    let c = getColorOn(frame, col, row);
    if ((c == 0) && options.showBackground) {
        return getBackRGB(col, row)
    }
    return getColorRGB(frame, c, row);
}

const drawPix = (frame, col, row, color) => {
    setColorOn(frame, col, row, color);
    if (options.linkColors && (color > 0)) {
        const color2 = color < 4 ? color + 4 : color - 4;
        setColorOn(frame, col, row, color2);
    }
}

const setColorOn = (frame, col, row, color) => {
    let c = getColorOn(workspace.selectedFrame, col, row);
    let c01 = c < 4 ? c : 0;
    let c23 = c > 3 ? c : 0;
    const [mp0, mp1, mm0, mm1, mp2, mp3, mm2, mm3] = getMasks(col);
    const currentFrame = workspace.frames[frame];
    if (!beforeDrawingState) { beforeDrawingState = _.cloneDeep(workspace) }
    const clearPixel01 = () => {
        currentFrame.player[0][row] &= (~mp0 & 0xff)
        currentFrame.player[1][row] &= (~mp1 & 0xff)
        currentFrame.missile[0][row] &= (~mm0 & 0xff)
        currentFrame.missile[1][row] &= (~mm1 & 0xff)
    }
    const clearPixel23 = () => {
        currentFrame.player[2][row] &= (~mp2 & 0xff)
        currentFrame.player[3][row] &= (~mp3 & 0xff)
        currentFrame.missile[2][row] &= (~mm2 & 0xff)
        currentFrame.missile[3][row] &= (~mm3 & 0xff)
    }
    if (color == 0) {
        if (layer23visible) {
            clearPixel23()
            c23 = 0;
        };
        if (layer01visible) {
            clearPixel01()
            c01 = 0;

        };
        c = 0;
    }
    if ((mp0 || mm0) && color == 1) {
        clearPixel01();
        currentFrame.player[0][row] |= mp0
        currentFrame.missile[0][row] |= mm0
        c01 = 1;
    }
    if ((mp1 || mm1) && color == 2) {
        clearPixel01();
        currentFrame.player[1][row] |= mp1
        currentFrame.missile[1][row] |= mm1
        c01 = 2;
    }
    if (color == 3) {
        if (options.ORDrawsOutside || ((mp0 || mm0) && (mp1 || mm1))) {
            clearPixel01();
            currentFrame.player[0][row] |= mp0
            currentFrame.player[1][row] |= mp1
            currentFrame.missile[0][row] |= mm0
            currentFrame.missile[1][row] |= mm1
            c01 = (mp0 || mm0 ? 1 : 0) | (mp1 || mm1 ? 2 : 0);
        }
    }
    if ((mp2 || mm2) && color == 5) {
        clearPixel23();
        currentFrame.player[2][row] |= mp2
        currentFrame.missile[2][row] |= mm2
        c23 = 5;
    }
    if ((mp3 || mm3) && color == 6) {
        clearPixel23();
        currentFrame.player[3][row] |= mp3
        currentFrame.missile[3][row] |= mm3
        c23 = 6;
    }
    if (color == 7) {
        if (options.ORDrawsOutside || ((mp2 || mm2) && (mp3 || mm3))) {
            clearPixel23();
            currentFrame.player[2][row] |= mp2
            currentFrame.player[3][row] |= mp3
            currentFrame.missile[2][row] |= mm2
            currentFrame.missile[3][row] |= mm3
            c23 = (mp2 || mm2 ? 5 : 0) | (mp3 || mm3 ? 6 : 0);
        }
    }
    if (isPlayer23Mode() && layer23visible) {
        c = c23 ? c23 : c;
    }
    if (layer01visible) {
        c = c01 ? c01 : c;
    }

    const rgb = ((c == 0) && options.showBackground) ? getBackRGB(col+options.backOffsetH, row+options.backOffsetV) : getColorRGB(workspace.selectedFrame, c, row);
    
    drawBlock(col+options.backOffsetH, row+options.backOffsetV, rgb);
}

const setNewColor = (c, cval) => {
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = first; f <= last; f++) {
        if (options.dliOn) {
            const frameDli = workspace.frames[f].dli[dliColorMap[c]];
            if (dliRange) {
                for (let r = dliRange[0]; r <= dliRange[1]; r++) {
                    frameDli[r] = cval;
                }
            } else {
                frameDli[workspace.selectedDli] = cval;
            }
        } else {
            const frame = (options.commonPalette) ? 0 : f;
            const colorMap = [null, 0, 1, null, null, 2, 3];
            if (colorMap[c] == null) {
                workspace.backgroundColor = cval;
            } else {
                workspace.frames[frame].colors[colorMap[c]] = cval;
            }
        }
    }
    storeWorkspace();
}

const closePalette = () => {
    if ($(".palette").length) {
        $(".palette").remove();
        updateColors();
    }
}

const colorCellClicked = e => {
    if (animationOn) { return false };
    const cval = Number(_.last(_.split(e.target.id, '_')));
    const c = Number(_.last($(e.target).parent()[0].id));
    setNewColor(c, cval);
    if (c==0) {
        options.showBackground = false;
    }
    updateScreen();
    closePalette();
}

const colorCellOver = e => {
    if (animationOn) { return false };
    cval = Number(_.last(_.split(e.target.id, '_')));
    c = Number(_.last($(e.target).parent()[0].id));
    fakeNewColor(c, cval);
}

const showPalette = c => {
    if ($(`#pal${c}`).length) {
        closePalette();
    } else {
        const pal = $("<div/>")
            .attr('id', `pal${c}`)
            .addClass('palette');
        let cval = 0;
        const colors = getColors(workspace.selectedFrame, workspace.selectedDli + options.backOffsetV);

        while (cval < 256) {
            const rgb = getByteRGB(cval);
            const cellClass = (cval == colors[c]) ? 'cellSelected' : '';
            const cell = $("<div/>")
                .addClass('colorCell')
                .addClass(cellClass)
                .attr('id', `col_${cval}`)
                .attr('title', `${cval} ($${decimalToHex(cval).toUpperCase()})`)
                .css('background-color', rgb)
                .bind('mousedown', colorCellClicked)
                .bind('mouseenter ', colorCellOver)
            if (cval % 16 == 0) cell.addClass('palette_firstinrow');

            pal.append(cell);
            cval += 2;
        }
        $("#color_box").append(pal);
    }
}

const pickerClicked = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const c = Number(_.last(e.target.id));
    showPalette(c);
}

const imgPickerClicked = e => {
    if ((workspace.backgroundImage) && (!options.showBackground)) {
        options.showBackground = true;
        updateScreen();
        return false;
    }
    options.showBackground = true;
    $('#fdialogx').trigger('click');
    colorClicked(0);
}

const updateLayers = () => {
    $('.layer').removeClass('layer_hidden');
    if (isPlayer23Mode()) {
        $('.layer').addClass('layer_default')
        if (!layer01visible) { $('.p01only').addClass('layer_hidden') }
        if (!layer23visible) { $('.p23only').addClass('layer_hidden') }
        $('.layer_switch').removeClass('none');
        $('#colorLink').removeClass('none');
        $('#linkImg').toggleClass('linked', options.linkColors == 1);
    } else {
        $('.layer').removeClass('layer_default');
        $('.layer_switch').addClass('none');
        $('#colorLink').addClass('none');
        layer01visible = 1;
        layer23visible = 1;
    }
}

const layerSwitchClicked = e => {
    const c = Number(_.last(e.target.id));
    if (c == 1) {
        layer01visible = layer01visible ? 0 : 1;
        layer23visible = layer01visible ? layer23visible : 1;
    }
    if (c == 3) {
        layer23visible = layer23visible ? 0 : 1;
        layer01visible = layer23visible ? layer01visible : 1;
    }
    updateLayers();
    updateScreen();
}

// *********************************** EDITOR - DLI

const showDliCursor = () => {
    $('.dli_row').removeClass('inRangeDli');
    $('.dli_row').removeClass('selectedDli');
    if (dliRange) {
        for (let r = dliRange[0]; r <= dliRange[1]; r++) {
            $(`#dlirow_${r}`).addClass('inRangeDli');
        }
    }
    $(`#dlirow_${workspace.selectedDli}`).removeClass('inRangeDli').addClass('selectedDli');
}

const dliClicked = c => {
    if (animationOn) { return false };
    workspace.selectedDli = c;
    updateColors();
    storeWorkspace();
}

const dliRowClicked = e => {
    if (animationOn) { return false };
    const r = Number(_.last(_.split(e.currentTarget.id, '_')))
    dliRange = [Math.min(workspace.selectedDli, r), Math.max(workspace.selectedDli, r)];
    if (e.buttons == 2) { // right button
        updateColors();
    } else {
        dliRange = e.shiftKey ? dliRange : null;
        dliClicked(r);
    }
}

// *********************************** EDITOR - WORKSPACE *****************************************
// ************************************************************************************************

const sameCell = (c, n) => {
    if (!c || !n) {
        return false
    }
    if (c.row == undefined) {
        return false;
    }
    if (c.row != n.row) {
        return false;
    }
    if (c.col != n.col) {
        return false;
    }
    return true;
}

const onActiveArea = cell => {
    if (cell.col < 0) return false
    if (cell.col >= editorWindow.columns) return false
    if (cell.row < 0) return false
    if (cell.row >= editorWindow.rows) return false
    return true;
}

const locateCell = (event) => {
    const cell = {};
    const x = event.offsetX;
    const y = event.offsetY;
    cell.row = Math.floor(y / editorWindow.cyoffset) - options.backOffsetV;
    cell.col = Math.floor(x / editorWindow.cxoffset) - options.backOffsetH;
    return onActiveArea(cell)?cell:null;
}

const onCanvasMove = (event) => {
    if (animationOn && !options.drawOnPlay) { return false };
    const newCell = locateCell(event);
    if (!sameCell(currentCell, newCell)) {
        if (event.buttons > 0) {
            clickOnCanvas(event);
        }
    }
}

const clickOnCanvas = (event) => {
    if (animationOn && !options.drawOnPlay) { return false };
    if ($('div.dialog:visible').length>0) {return false};
    currentCell = locateCell(event);
    if (currentCell) {
        penDown = true;
        let color = workspace.selectedColor;
        if (event.buttons == 2) { // right button
            color = 0;
        }
        currentCell.color = color;
        const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
        for (let f = first; f <= last; f++) {
            drawPix(f, currentCell.col, currentCell.row, currentCell.color);
        }
        if (last != first) {
            drawTimeline();
        }
    }
}

const drawingEnded = () => {
    pushUndo('drawing', beforeDrawingState);
    beforeDrawingState = null;
    penDown = false;
    drawEditor();
    storeWorkspace();
}

const onMouseOut = (e) => {
    if (animationOn) { return false };
    if (e.buttons > 0) {
        drawingEnded();
    }
}

const newCanvas = () => {
    editorWindow.columns01 = spriteWidthPerMode[options.mergeMode] + options.spriteGap01;
    editorWindow.columns23 = spriteWidthPerMode[options.mergeMode] + options.spriteGap23;
    editorWindow.columnsActive = (isPlayer23Mode() ? Math.max(editorWindow.columns01, editorWindow.columns23 + options.pairGap) : editorWindow.columns01);
    editorWindow.columns = (options.backOffsetH * 2) + editorWindow.columnsActive
    editorWindow.rows = (options.backOffsetV * 2) + options.spriteHeight;
    editorWindow.cwidth = getWidthMultiplier() * zoomCellSize[options.cellSize];
    editorWindow.cxoffset = editorWindow.cwidth + options.showGrid;
    editorWindow.cheight = Math.floor(zoomCellSize[options.cellSize] / options.lineResolution);
    editorWindow.cyoffset = editorWindow.cheight + options.showGrid;
    editorWindow.swidth = editorWindow.columns * editorWindow.cxoffset - options.showGrid;
    editorWindow.sheight = editorWindow.rows * editorWindow.cyoffset - options.showGrid;

    $('#editor_box').empty();
    const cnv = $('<canvas/>')
        .attr('id', 'editor_canvas')
        .attr('width', editorWindow.swidth)
        .attr('height', editorWindow.sheight)
        .contextmenu(stopMenu)
        .bind('mousedown', clickOnCanvas)
        .bind('mousemove', onCanvasMove)
        .bind('mouseup', drawingEnded)
        .bind('mouseleave', onMouseOut)

    $('#editor_box').append(cnv);
    editorCtx = cnv[0].getContext('2d');
    if (options.dliOn) {
        const spacers = _.times(2, ()=> {
            return _.times(options.backOffsetV, i => {
                return $("<ul/>")
                    .addClass('dli_row spacer')
                    .css('height', editorWindow.cyoffset)
            })
        });

        const cells = _.times(options.spriteHeight, i => {
            return $("<ul/>")
                .addClass('dli_row')
                .css('height', editorWindow.cyoffset)
                .attr('id', `dlirow_${i}`)
                .bind('mousedown', dliRowClicked)
                .contextmenu(stopMenu)
                .append(_.times(5, i => $("<li/>")))
        });
        $('#dli_box')
            .removeClass('none')
            .css('height', editorWindow.sheight)
            .empty()
            .append(spacers[0],cells,spacers[1]);
    } else {
        $('#dli_box')
            .addClass('none')
    }

    // editorCtx.translate(0.5, 0.5);
    // editorCtx.imageSmoothingEnabled = false;
}

const drawBlock = (x, y, crgb) => {
    editorCtx.fillStyle = crgb;
    editorCtx.lineWidth = 0;
    editorCtx.fillRect(x * editorWindow.cxoffset - options.showGrid, y * editorWindow.cyoffset - options.showGrid, editorWindow.cwidth, editorWindow.cheight);
}

const drawEditor = () => {
    editorCtx.clearRect(0, 0, editorWindow.swidth, editorWindow.sheight);
    for (let row = 0; row < editorWindow.rows; row++) {
        for (let col = 0; col < editorWindow.columns; col++) {
            drawBlock(col, row, getRGBOn(workspace.selectedFrame, col, row));
        }
    }
    if (options.showGrid > 0) {
        drawGrid();
    }
    $("#framepreview").empty();
    $("#framepreview").append(getFrameImage(workspace.selectedFrame, 3, 3 / options.lineResolution));
    $("#framepreview").append(getFrameImage(workspace.selectedFrame, 6, 3 / options.lineResolution));
    $("#framepreview").append(getFrameImage(workspace.selectedFrame, 12, 3 / options.lineResolution).addClass('clear_left'));
    $(`#fbox_${workspace.selectedFrame}`).children().last().remove();
    $(`#fbox_${workspace.selectedFrame}`).append(getFrameImage(workspace.selectedFrame, 4, 4 / options.lineResolution));
}

const drawTimeline = () => {
    $('#framelist').empty();
    if (workspace.selectedFrame >= workspace.frames) {
        workspace.selectedFrame = workspace.frames - 1;
    }
    _.each(workspace.frames, (frame, f) => {
        const cnv = getFrameImage(f, 4, 4 / options.lineResolution)
        const frameNum = $("<div/>")
            .addClass('frameNum')
            .append(decimalToHex(f));
        const frameDelay = $("<div/>")
            .addClass('frameDelay')
            .bind('mousedown', frameDelayClicked)
            .append(frame.delayTime);


        const framebox = $("<div/>")
            .addClass('framebox')
            .attr('id', `fbox_${f}`)
            .append(frameNum)
            .bind('mousedown', frameboxClicked)
            .contextmenu(stopMenu)
            .append(cnv)

        if (options.frameDelayMode) {
            framebox.prepend(frameDelay)
        }

        if (isInMovieLoop(f)) {
            framebox.addClass('inLoop');
        }
        if (f == workspace.selectedFrame) {
            framebox.addClass('currentFrame');
        }
        $('#framelist').append(framebox);
    });
}

const updateMovieCursor = () => {
    $('.framebox').removeClass('currentFrame');
    $('#fbox_' + workspace.selectedFrame).addClass('currentFrame');
}

const updateMenu = () => {
    $('.pairOnly').toggleClass('inactive', !isPlayer23Mode());
}

const updateScreen = () => {
    drawTimeline();
    drawEditor();
    updateColors();
    updateLayers();
    updateMenu();
}

const frameboxClicked = e => {
    if (animationOn) { return false };
    const f = Number(_.last(_.split(e.target.id, '_')));
    movieLoop = [Math.min(workspace.selectedFrame, f), Math.max(workspace.selectedFrame, f)];
    if (e.buttons == 2) { // right button
        drawTimeline();
    } else {
        movieLoop = e.shiftKey ? movieLoop : null;
        jumpToFrame(f);
    }
}

const userPromptInt = (msg, def) => {
    const uval = prompt(msg, Number(def));
    const uint = userIntParse(uval);
    if (_.isNaN(uint)) {
        return null;
    };
    return uint ? uint.clamp(1, 255) : null;
}

const frameDelayClicked = e => {
    e.preventDefault();
    if (animationOn) { return false };
    const fclick = Number(_.last(_.split(e.target.parentElement.id, '_')));
    const delay = userPromptInt('Set delay value:', workspace.frames[fclick].delayTime);
    if (delay) {
        const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [fclick, fclick];
        for (let f = first; f <= last; f++) {
            workspace.frames[f].delayTime = delay;
        }
        drawTimeline();
    }
    return false;
}

const drawGridLine = (x1, y1, x2, y2) => {
    editorCtx.beginPath();
    editorCtx.moveTo(x1, y1);
    editorCtx.lineTo(x2, y2);
    editorCtx.lineWidth = options.showGrid;
    editorCtx.strokeStyle = GRID_COLOR;
    editorCtx.stroke();
};

const drawGrid = () => {
    for (let row = 1; row < editorWindow.rows; row++) {
        const y = (editorWindow.cyoffset * row) - options.showGrid;
        drawGridLine(0, y, editorWindow.swidth, y);
    }
    for (let col = 1; col < editorWindow.columns; col++) {
        const x = (editorWindow.cxoffset * col) - options.showGrid;
        drawGridLine(x, 0, x, editorWindow.sheight);
    }
}

const zoomIn = () => {
    if (options.cellSize < zoomCellSize.length - 1) {
        options.cellSize++;
        storeOptions();
        newCanvas();
        updateScreen();
    }
}

const zoomOut = () => {
    if (options.cellSize > 0) {
        options.cellSize--;
        storeOptions();
        newCanvas();
        updateScreen();
    }
}

// ********************************************* EDITOR - MARKERS *********************************
// ************************************************************************************************

const removeMarker = () => {
    $('.marker').remove();
}

const getMarkerPosition = color => {
    let width = spriteWidthPerMode[options.mergeMode];
    let cell = null;
    switch (color) {
        case 1:
            cell = 0;
            break;
        case 2:
            cell = options.spriteGap01;
            break;
        case 3:
            if (options.ORDrawsOutside) {
                width += options.spriteGap01;
                cell = 0;
            } else {
                width -= options.spriteGap01;
                cell = options.spriteGap01;
            }
            break;
        case 5:
            cell = options.pairGap;
            break;
        case 6:
            cell = options.pairGap + options.spriteGap23;
            break;
        case 7:
            if (options.ORDrawsOutside) {
                width += options.spriteGap23;
                cell = options.pairGap;;
            } else {
                width -= options.spriteGap23;
                cell = options.pairGap + options.spriteGap23;
            }
            break;
        default:
            break;
    }
    return [cell + options.backOffsetH, width];
}

const drawMarker = (cell, width) => {
    if ((width == 0) || (cell >= editorWindow.columns)) {
        return;
    }
    $('<div/>').addClass('marker')
        .css('width', editorWindow.cxoffset * width - 1)
        .css('height', editorWindow.sheight)
        .css('left', $('#editor_canvas').position().left + editorWindow.cxoffset * cell)
        .css('top', $('#editor_canvas').position().top)
        .appendTo("#main");
}

const showMarker = color => {
    removeMarker();
    if (_.indexOf([1, 2, 3, 5, 6, 7], color) != -1) {
        if (options.linkColors) {
            const c1 = color < 4 ? color : color - 4;
            const c2 = color > 4 ? color : color + 4;
            const [start1, width1] = getMarkerPosition(c1);
            const [start2, width2] = getMarkerPosition(c2);
            const end1 = start1 + width1;
            const end2 = start2 + width2;
            drawMarker(0, start1);
            if (start2 > end1) {
                drawMarker(end1, start2 - end1);
            }
            drawMarker(end2, editorWindow.columns - end2);
        } else {
            const [cell, width] = getMarkerPosition(color);
            drawMarker(0, cell);
            drawMarker(cell + width, editorWindow.columns - width - cell);
        }
    }
}

// ***************************************************** DIALOGS
// *************************************************************************************************

const closeAllDialogs = () => {
    $('div.dialog:visible').slideUp();
}

const templateChange = () => {
    updateOptions();
    exportData();
}

const loadSpriteTemplate = () => {
    if (options.spriteTemplate!=-1) {
        options = Object.assign(options,spriteTemplates[options.spriteTemplate].opts);
        refreshOptions();
        newCanvas();
        if (animationOn) {
            stopPlayer();
            startPlayer();
        }
        updateScreen();
        updateOptions();
    }
}

const spritetemplateChange = () => {
    updateOptions();
    loadSpriteTemplate();
}


const toggleDiv = (divId) => {
    closeAllDialogs();
    closePalette();
    const isVisible = $(divId).is(':visible');
    if (isVisible) {
        $(divId).slideUp();
    } else {
        $(divId).slideDown();
    }
    return !isVisible;
}

const toggleExport = () => {
    if (toggleDiv('#export_dialog')) {
        refreshOptions();
        exportData();
    }
}

const closeLibrary = () => {
    $("#edit_tab").removeClass('none');
    $("#lib_tab").addClass('none');
    libraryOpened = 0;
    updateLibraryTab();
    storeLibrary();
    updateScreen();
}

const toggleLibrary = () => {
    if (libraryOpened) {
        closeLibrary();
    } else {
        $("#edit_tab").addClass('none');
        $("#lib_tab").removeClass('none');
        libraryOpened = 1;
        updateLibraryTab();
    }
}

const toggleHelp = () => {
    toggleDiv('#help_dialog')
}

const toggleOptions = () => {
    if (toggleDiv('#options_dialog')) {
        refreshOptions();
    }
}

const toggleLink = () => {
    options.linkColors = options.linkColors ? 0 : 1;
    storeOptions();
    updateScreen();
}

// ************************************************  ON START INIT 
// *************************************************************************************************

$(document).ready(function () {

    loadOptions();
    const app = gui(options, dropFile);
    refreshOptions();
    $('title').append(` v.${options.version}`);

    app.addMenuFileOpen('Load', openFile, 'appmenu', 'Loads Display List binary file', '.spr,.apl');
    app.addMenuItem('Save', saveFile, 'appmenu', 'Saves Display List as a binary file');
    app.addMenuItem('Export', toggleExport, 'appmenu', 'Exports Display List to various formats');
    app.addSeparator('appmenu');
    app.addMenuItem('Undo', undo, 'appmenu', 'Undo');
    app.addMenuItem('Redo', redo, 'appmenu', 'Redo');
    app.addSeparator('appmenu');
    app.addMenuItem('Options', toggleOptions, 'appmenu', 'Shows Options');
    app.addSeparator('appmenu');
    app.addMenuItem('Help', toggleHelp, 'appmenu', 'Shows Help');
    app.addSeparator('appmenu');
    const ver = $('<div/>').attr('id', 'ver').html(`SprEd v.${options.version}`);
    $('#appmenu').append(ver);
    const bh = $('<div/>').attr('id', 'bathub').on('mousedown', () => { window.location.href = 'https://bocianu.gitlab.io/bathub/' });
    $('#appmenu').append(bh);

    app.addMenuItem('Clear', saveUndo('clear frame', clearFrame), 'framemenu', 'Clears current frame');
    app.addMenuItem('Copy', copyFrame, 'framemenu', 'Copies from current frame');
    app.addMenuItem('Paste', saveUndo('paste frame', pasteFrame), 'framemenu', 'Pastes into current frame');
    app.addSeparator('framemenu');
    app.addMenuItem('Flip-H', saveUndo('flip h', flipHFrame), 'framemenu', 'Flips frame horizontally');
    app.addMenuItem('Flip-V', saveUndo('flip v', flipVFrame), 'framemenu', 'Flips frame vertically');
    app.addSeparator('framemenu');
    app.addMenuItem('', saveUndo('move left', moveFrameContentsLeft), 'framemenu', 'Moves frame contents left', 'arrow', 'arrLeft');
    app.addMenuItem('', saveUndo('move right', moveFrameContentsRight), 'framemenu', 'Moves frame contents right', 'arrow', 'arrRight');
    app.addMenuItem('', saveUndo('move up', moveFrameContentsUp), 'framemenu', 'Moves frame contents up', 'arrow', 'arrUp');
    app.addMenuItem('', saveUndo('move down', moveFrameContentsDown), 'framemenu', 'Moves frame contents down', 'arrow', 'arrDown');
    app.addSeparator('framemenu');
    app.addMenuItem('', saveUndo('double lines', heightUp), 'framemenu', 'Expand by doubling lines', 'sizeIcon', 'sizeExtend');
    app.addMenuItem('', saveUndo('tighten', heightDown), 'framemenu', 'Remove every second line', 'sizeIcon', 'sizeShrink');
    app.addSeparator('framemenu');
    app.addMenuItem('', saveUndo('swap pairs', swapPairs), 'framemenu', 'Swap pairs', 'pairOnly sizeIcon', 'swapPairs');

    app.addSeparator('framemenu');
    app.addMenuItem('Library', toggleLibrary, 'framemenu', 'Toggle Library', 'libButton');

    //    app.addMenuItem('Upload current project', saveUndo('upload', postData), 'libmenu', 'Upload');
    app.addMenuItem('Reload Library', () => { getLibraryData(0) }, 'libmenu', 'Reload Library', 'libButton');
    app.addSeparator('libmenu');
    app.addMenuItem('Close Library', toggleLibrary, 'libmenu', 'Toggle Library', 'libButton');
    const err = $('<div/>').attr('id', 'lib_error');
    $('#libmenu').append(err);

    app.addMenuItem('', startPlayer, 'timemenu', 'Starts Animation [Space]', 'arrow', 'iconPlay');
    app.addMenuItem('', stopPlayer, 'timemenu', 'Stops Animation [Space]', 'arrow', 'iconStop');
    app.addSeparator('timemenu');
    app.addMenuItem('Add', saveUndo('add frame', addFrame), 'timemenu', 'Adds new empty frame');
    app.addMenuItem('Clone', saveUndo('clone frame', cloneFrame), 'timemenu', 'Adds copy of frame');
    app.addMenuItem('Delete', saveUndo('delete frame', delFrame), 'timemenu', 'Deletes current frame');
    app.addSeparator('timemenu');
    app.addMenuItem('', animFrameLeft, 'timemenu', 'Moves current frame left', 'frameIcon', 'frameLeft');
    app.addMenuItem('', animFrameRight, 'timemenu', 'Moves current frame right', 'frameIcon', 'frameRight');
    app.addSeparator('timemenu');
    app.addMenuItem('Delete All', deleteAll, 'timemenu', 'Clears and deletes all frames');
    app.addSeparator('timemenu');
    app.addMenuItem('Export to Gif', exportGif, 'timemenu', 'Exports gif file');

    $('.colorbox').bind('mousedown', (e) => {
        colorClicked(Number(_.last(e.target.id)));
    })

    for (let c of [0, 1, 2, 5, 6]) {
        const picker = $("<div/>");
        picker.attr('id', `picker${c}`)
            .addClass('picker')
            .bind('mousedown', pickerClicked);
        $(`#color${c}`).append(picker);
    }

    const backImage = $("<label/>");
    backImage.attr('id', `back_img_pick`)
        .addClass('picker imgpicker');
        
    $(`#color0`).append(backImage);

    $('.layer_switch').bind('mousedown', layerSwitchClicked);
    $('#upload').bind('mousedown', libraryUpload);

    $("#app").bind('mousedown', () => { closePalette(); closeAllDialogs() });
    document.addEventListener('keydown', keyPressed);
    $('html').on('dragover', e => { e.preventDefault() });

    $("#libSearch").on('mousedown', librarySearch)
    $("#libSearchReset").on('mousedown', libraryReset)
    $("#colorLink").on('mousedown', toggleLink)


    const inp = $(`<input type='file' id='fdialogx' class='fileinput' onclick='this.value=null'>`);
    //inp.attr('accept','.mic,.raw')
    $('#back_img_pick')
    .attr('title', 'Load background image')
    .bind('mousedown', imgPickerClicked);
    inp.change(openBackgroundFile);
    $(`#color0`).append(inp);


    loadWorkspace();
    loadLibrary();
    loadUndos();
    newCanvas();
    updateScreen();


});
