const GRID_COLOR = 'rgba(200,200,200,0.3)';
const MAX_FILESIZE = 64 * 1024;
const aplHeader = [0x9a, 0xf8, 0x39, 0x21];
const apl2Header = [0x45, 0x64, 0x52, 0x32];
const sprHeader = [0x53, 0x70, 0x72, 0x21];

const MODE_P0P1 = 0;
const MODE_PM0PM1 = 1;
const MODE_MP0MP1 = 2;
const MODE_P0P1P2P3 = 4;
const MODE_PM0PM1PM2PM3 = 5;
const MODE_MP0MP1MP2MP3 = 6;

const LIBRARY_SPR_PER_PAGE = 8;

const spriteWidthPerMode = [
    8, 10, 10, 10, 8, 10, 10, 10
];

const zoomCellSize = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

const dliMap = ['back', 'c0', 'c1', 'c2', 'c3'];
const dliColorMap = ['back', 'c0', 'c1', null, null, 'c2', 'c3'];


const defaultOptions = {
    version: '1.0.1',
    storageName: 'SprEdStore100',
    undoLevels: 128,
    lineResolution: 1,
    spriteHeight: 16,
    spriteGap01: 0,
    spriteGap23: 0,
    pairGap: 8,
    markActiveRegion: 1,
    showGrid: 1,
    cellSize: 5,
    wrapEditor: 1,
    animationSpeed: 5,
    palette: 'PAL',
    commonPalette: 0,
    bytesExport: 'HEX',
    bytesPerLine: 16,
    lastTemplate: 0,
    startingLine: 10000,
    lineStep: 10,
    ORDrawsOutside: 1,
    squarePixel: 1,
    mergeMode: MODE_P0P1,
    dliOn: 0
}
let options = {};
const dontSave = ['version', 'storageName'];
const editorWindow = {}
let currentCell = {}
let editorCtx = null;
let animationOn = 0;
let playerInterval = null;
let undos = [];
let redos = [];
let beforeDrawingState = null;
let layer01visible = 1;
let layer23visible = 1;
let libraryOpened = 0;
let libraryPage = 0;

const defaultWorkspace = {
    selectedColor: 1,
    selectedFrame: 0,
    backgroundColor: 0,
    selectedDli: 0,
    clipBoard: {},
    frames: []
}

const defaultLibrary = {
    uploaderId: '',
    spriteName: '',
    authorName: '',
    description: ''
}

let library = {};
let libraryContents = null;
let workspace = {};
let movieLoop = null;
let dliRange = null;

const reversedBytes = [
    0x00, 0x80, 0x40, 0xC0, 0x20, 0xA0, 0x60, 0xE0, 0x10, 0x90, 0x50, 0xD0, 0x30, 0xB0, 0x70, 0xF0,
    0x08, 0x88, 0x48, 0xC8, 0x28, 0xA8, 0x68, 0xE8, 0x18, 0x98, 0x58, 0xD8, 0x38, 0xB8, 0x78, 0xF8,
    0x04, 0x84, 0x44, 0xC4, 0x24, 0xA4, 0x64, 0xE4, 0x14, 0x94, 0x54, 0xD4, 0x34, 0xB4, 0x74, 0xF4,
    0x0C, 0x8C, 0x4C, 0xCC, 0x2C, 0xAC, 0x6C, 0xEC, 0x1C, 0x9C, 0x5C, 0xDC, 0x3C, 0xBC, 0x7C, 0xFC,
    0x02, 0x82, 0x42, 0xC2, 0x22, 0xA2, 0x62, 0xE2, 0x12, 0x92, 0x52, 0xD2, 0x32, 0xB2, 0x72, 0xF2,
    0x0A, 0x8A, 0x4A, 0xCA, 0x2A, 0xAA, 0x6A, 0xEA, 0x1A, 0x9A, 0x5A, 0xDA, 0x3A, 0xBA, 0x7A, 0xFA,
    0x06, 0x86, 0x46, 0xC6, 0x26, 0xA6, 0x66, 0xE6, 0x16, 0x96, 0x56, 0xD6, 0x36, 0xB6, 0x76, 0xF6,
    0x0E, 0x8E, 0x4E, 0xCE, 0x2E, 0xAE, 0x6E, 0xEE, 0x1E, 0x9E, 0x5E, 0xDE, 0x3E, 0xBE, 0x7E, 0xFE,
    0x01, 0x81, 0x41, 0xC1, 0x21, 0xA1, 0x61, 0xE1, 0x11, 0x91, 0x51, 0xD1, 0x31, 0xB1, 0x71, 0xF1,
    0x09, 0x89, 0x49, 0xC9, 0x29, 0xA9, 0x69, 0xE9, 0x19, 0x99, 0x59, 0xD9, 0x39, 0xB9, 0x79, 0xF9,
    0x05, 0x85, 0x45, 0xC5, 0x25, 0xA5, 0x65, 0xE5, 0x15, 0x95, 0x55, 0xD5, 0x35, 0xB5, 0x75, 0xF5,
    0x0D, 0x8D, 0x4D, 0xCD, 0x2D, 0xAD, 0x6D, 0xED, 0x1D, 0x9D, 0x5D, 0xDD, 0x3D, 0xBD, 0x7D, 0xFD,
    0x03, 0x83, 0x43, 0xC3, 0x23, 0xA3, 0x63, 0xE3, 0x13, 0x93, 0x53, 0xD3, 0x33, 0xB3, 0x73, 0xF3,
    0x0B, 0x8B, 0x4B, 0xCB, 0x2B, 0xAB, 0x6B, 0xEB, 0x1B, 0x9B, 0x5B, 0xDB, 0x3B, 0xBB, 0x7B, 0xFB,
    0x07, 0x87, 0x47, 0xC7, 0x27, 0xA7, 0x67, 0xE7, 0x17, 0x97, 0x57, 0xD7, 0x37, 0xB7, 0x77, 0xF7,
    0x0F, 0x8F, 0x4F, 0xCF, 0x2F, 0xAF, 0x6F, 0xEF, 0x1F, 0x9F, 0x5F, 0xDF, 0x3F, 0xBF, 0x7F, 0xFF,
];

const reversed2bits = [
    0x00, 0x02, 0x01, 0x03
]

// ******************************* HELPERS

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
    }
    if (workspace.selectedFrame >= workspace.frames.length) {
        workspace.selectedFrame = 0;
    }
    if (workspace.selectedDli >= options.spriteHeight) {
        workspace.selectedDli = 0;
    }
}

const getEmptyFrame = () => {
    const frame = {
        player: [[], [], [], []],
        missile: [[], [], [], []],
        colors: [0x24, 0xc8, 0x86, 0xea],
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

// *********************************** UNDO

const pushUndo = (name, undoData) => {
    while (undos.length >= options.undoLevels) {
        undos.shift();
    }
    undos.push({ name, data: undoData });
    _.remove(redos);
    storeUndos();
}

const saveUndo = (name, modifier) => {
    return () => {
        const undoData = _.cloneDeep(workspace);
        const result = modifier ? modifier() : true;
        if (result) {
            pushUndo(name, undoData);
        }
    }
}

const undo = () => {
    if (undos.length > 0) {
        const undo = undos.pop();
        const redo = { name: undo.name, data: _.cloneDeep(workspace) };
        redos.push(redo);
        workspace = _.cloneDeep(undo.data);
        storeWorkspace();
        storeUndos();
        updateScreen();
    }
}

const redo = () => {
    if (redos.length > 0) {
        const redo = redos.pop();
        const undo = { name: redo.name, data: _.cloneDeep(workspace) };
        undos.push(undo);
        workspace = _.cloneDeep(redo.data);
        storeWorkspace();
        storeUndos();
        updateScreen();
    }
}

// *********************************** COLOR OPERATIONS

const getColors = (frame, row) => {
    if (options.commonPalette) {
        frame = 0;
    }
    if (options.dliOn) {
        const dli = workspace.frames[frame].dli;
        return [
            dli.back[row],
            dli.c0[row],
            dli.c1[row],
            dli.c0[row] | dli.c1[row],
            0,
            dli.c2[row],
            dli.c3[row],
            dli.c2[row] | dli.c3[row]
        ];
    } else {
        return [
            workspace.backgroundColor,
            workspace.frames[frame].colors[0],
            workspace.frames[frame].colors[1],
            workspace.frames[frame].colors[0] | workspace.frames[frame].colors[1],
            0,
            workspace.frames[frame].colors[2],
            workspace.frames[frame].colors[3],
            workspace.frames[frame].colors[2] | workspace.frames[frame].colors[3]
        ];
    }
}

const isColorActive = c => {
    if (!layer01visible && c > 0 && c < 4) { return false };
    if (!layer23visible && c > 3) { return false };
    if (!isPlayer23Mode() && workspace.selectedColor > 3) { return false };
    return true;
}

const updateColors = colors => {
    if (colors == undefined) {
        colors = getColors(workspace.selectedFrame, workspace.selectedDli);
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
    const fakeColors = getColors(workspace.selectedFrame, workspace.selectedDli);
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
    if (animationOn) { return false };
    if (!layer01visible && c > 0 && c < 4) { return false };
    if (!layer23visible && c > 3) { return false };
    workspace.selectedColor = c;
    $('.colorbox').removeClass('colorSelected');
    $(`#color${c}`).addClass('colorSelected');
    storeWorkspace();
    removeMarker();
    if (options.markActiveRegion) {
        showMarker(workspace.selectedColor);
    }
}

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

const getRGBOn = (frame, col, row) => {
    return getColorRGB(frame, getColorOn(frame, col, row), row);
}

const setColorOn = (col, row, color) => {
    let c = getColorOn(workspace.selectedFrame, col, row);
    let c01 = c < 4 ? c : 0;
    let c23 = c > 3 ? c : 0;
    const [mp0, mp1, mm0, mm1, mp2, mp3, mm2, mm3] = getMasks(col);
    const currentFrame = workspace.frames[workspace.selectedFrame];
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

    drawBlock(col, row, getColorRGB(workspace.selectedFrame, c, row));
}

const setNewColor = (c, cval) => {
    if (options.dliOn) {
        const frameDli = workspace.frames[workspace.selectedFrame].dli[dliColorMap[c]];
        if (dliRange) {
            for (let r = dliRange[0]; r <= dliRange[1]; r++) {
                frameDli[r] = cval;
            }
        } else {
            frameDli[workspace.selectedDli] = cval;
        }
    } else {
        const frame = (options.commonPalette) ? 0 : workspace.selectedFrame;
        const colorMap = [null, 0, 1, null, null, 2, 3];
        if (colorMap[c] == null) {
            workspace.backgroundColor = cval;
        } else {
            workspace.frames[frame].colors[colorMap[c]] = cval;
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
        const colors = getColors(workspace.selectedFrame, workspace.selectedDli);

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
    //console.log(c);
}

const updateLayers = () => {
    $('.layer').removeClass('layer_hidden');
    if (isPlayer23Mode()) {
        $('.layer').addClass('layer_default')
        if (!layer01visible) { $('.p01only').addClass('layer_hidden') }
        if (!layer23visible) { $('.p23only').addClass('layer_hidden') }
        $('.layer_switch').removeClass('none');
    } else {
        $('.layer').removeClass('layer_default');
        $('.layer_switch').addClass('none');
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

// *********************************** EDITOR OPERATIONS

const sameCell = (c, n) => {
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

const locateCell = (event) => {
    const cell = {};
    const x = event.offsetX;
    const y = event.offsetY;
    cell.row = Math.floor(y / editorWindow.cyoffset);
    cell.col = Math.floor(x / editorWindow.cxoffset);
    return cell;
}

const onCanvasMove = (event) => {
    if (animationOn) { return false };
    const newCell = locateCell(event);
    if (!sameCell(currentCell, newCell)) {
        if (event.buttons > 0) {
            clickOnCanvas(event);
        }
    }
}

const clickOnCanvas = (event) => {
    if (animationOn) { return false };
    let color = workspace.selectedColor;
    if (event.buttons == 2) { // right button
        color = 0;
    }
    currentCell = locateCell(event);
    //console.log(`x: ${currentCell.col} y: ${currentCell.row} c: ${color}`);
    setColorOn(currentCell.col, currentCell.row, color);
}

const stopMenu = (event) => {
    if (animationOn) { return false };
    event.preventDefault();
    return false;
}

const drawingEnded = () => {
    pushUndo('drawing', beforeDrawingState);
    beforeDrawingState = null;
    drawEditor();
    storeWorkspace();
}

const onMouseOut = (e) => {
    if (animationOn) { return false };
    if (e.buttons > 0) {
        drawingEnded();
    }
}

const getWidthMultiplier = () => options.squarePixel ? 1 : 1.2;

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
    return [cell, width];
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
        const [cell, width] = getMarkerPosition(color);

        drawMarker(0, cell);
        drawMarker(cell + width, editorWindow.columns - width - cell);
    }
}

const newCanvas = () => {
    editorWindow.columns01 = spriteWidthPerMode[options.mergeMode] + options.spriteGap01;
    editorWindow.columns23 = spriteWidthPerMode[options.mergeMode] + options.spriteGap23;
    editorWindow.columns = isPlayer23Mode() ? Math.max(editorWindow.columns01, editorWindow.columns23 + options.pairGap) : editorWindow.columns01;
    editorWindow.cwidth = getWidthMultiplier() * zoomCellSize[options.cellSize];
    editorWindow.cxoffset = editorWindow.cwidth + options.showGrid;
    editorWindow.cheight = Math.floor(zoomCellSize[options.cellSize] / options.lineResolution);
    editorWindow.cyoffset = editorWindow.cheight + options.showGrid;
    editorWindow.swidth = editorWindow.columns * editorWindow.cxoffset - options.showGrid;
    editorWindow.sheight = options.spriteHeight * editorWindow.cyoffset - options.showGrid;

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
            .append(cells);
    } else {
        $('#dli_box')
            .addClass('none')
    }

    // editorCtx.translate(0.5, 0.5);
    // editorCtx.imageSmoothingEnabled = false;
}

const getFrameImage = (frame, scalex, scaley) => {
    scalex *= getWidthMultiplier();
    const w = Math.floor((editorWindow.columns) * scalex);
    const h = Math.floor(options.spriteHeight * scaley);
    const cnv = $('<canvas/>')
        .addClass('framepreview')
        .attr('width', w)
        .attr('height', h)
    const ctx = cnv[0].getContext('2d');
    //ctx.translate(0.5, 0.5);
    //ctx.imageSmoothingEnabled = false;
    const imageData = ctx.createImageData(w, h);
    for (let row = 0; row < options.spriteHeight; row++) {
        for (let col = 0; col < editorWindow.columns; col++) {
            const crgb = getRGBOn(frame, col, row);
            ctx.fillStyle = crgb;
            ctx.lineWidth = 2;
            ctx.fillRect(Math.ceil(col * scalex), row * scaley, Math.ceil(scalex), Math.ceil(scaley));
        }
    }
    return cnv
}

const drawBlock = (x, y, crgb) => {
    editorCtx.fillStyle = crgb;
    editorCtx.lineWidth = 0;
    editorCtx.fillRect(x * editorWindow.cxoffset - options.showGrid, y * editorWindow.cyoffset - options.showGrid, editorWindow.cwidth, editorWindow.cheight);
}

const drawEditor = () => {
    editorCtx.clearRect(0, 0, editorWindow.swidth, editorWindow.sheight);
    for (let row = 0; row < options.spriteHeight; row++) {
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

const isInMovieLoop = f => {
    if (!movieLoop) { return false }
    return (f >= movieLoop[0]) && (f <= movieLoop[1])
}

const drawTimeline = () => {
    $('#framelist').empty();
    if (workspace.selectedFrame >= workspace.frames) {
        workspace.selectedFrame = workspace.frames - 1;
    }
    _.each(workspace.frames, (frame, f) => {
        const cnv = getFrameImage(f, 4, 4 / options.lineResolution)
        const framebox = $("<div/>")
            .addClass('framebox')
            .attr('id', `fbox_${f}`)
            .append(`<div>$${decimalToHex(f)}</div>`)
            .bind('mousedown', frameboxClicked)
            .contextmenu(stopMenu)
            .append(cnv)

        if (isInMovieLoop(f)) {
            framebox.addClass('inLoop');
        }
        if (f == workspace.selectedFrame) {
            framebox.addClass('currentFrame');
        }
        $('#framelist').append(framebox);
    });
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

const drawGridLine = (x1, y1, x2, y2) => {
    editorCtx.beginPath();
    editorCtx.moveTo(x1, y1);
    editorCtx.lineTo(x2, y2);
    editorCtx.lineWidth = options.showGrid;
    editorCtx.strokeStyle = GRID_COLOR;
    editorCtx.stroke();
};

const drawGrid = () => {
    for (let row = 1; row < options.spriteHeight; row++) {
        const y = (editorWindow.cyoffset * row) - options.showGrid;
        drawGridLine(0, y, editorWindow.swidth, y);
    }
    for (let col = 1; col < editorWindow.columns; col++) {
        const x = (editorWindow.cxoffset * col) - options.showGrid;
        drawGridLine(x, 0, x, editorWindow.sheight);
    }
}

// ***************************************************** DIALOGS

const closeAllDialogs = () => {
    $('div.dialog:visible').slideUp();
}

const templateChange = () => {
    updateOptions();
    exportData();
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

// *********************************** OPTIONS

const valIntInput = (inputId) => {
    const idiv = $(`#opt_${inputId}_i`);
    const uint = userIntParse(idiv.val());
    if (_.isNaN(uint)) {
        idiv.addClass('warn').focus();
        return false;
    };
    idiv.val(uint);
    return true;
}

const getCheckBox = (inputId) => {
    return $(`#opt_${inputId}_b`).prop('checked');
}

const setCheckBox = (inputId, uint) => {
    $(`#opt_${inputId}_b`).prop('checked', uint);
}

const toggleOpt = name => {
    options[name] = options[name] ? 0 : 1;
    refreshOptions();
    updateOptions();
    newCanvas();
    updateScreen();
}

const clampOption = (inputId, min, max) => {
    const idiv = $(`#opt_${inputId}_i`);
    const uint = userIntParse(idiv.val());
    idiv.val(uint.clamp(min, max));
}

const refreshOptions = () => {
    const opts = _.filter($("select, input"), opt => {
        return _.startsWith($(opt).attr('id'), 'opt_');
    });
    const newopts = {};
    _.each(opts, opt => {
        const opt_id = $(opt).attr('id');
        const opt_name = _.split(opt_id, '_');
        const opt_type = opt_name[2];
        const opt_val = options[opt_name[1]];
        $(`#${opt_id}`).val(opt_val);
        if (opt_type == 'b') {
            $(`#${opt_id}`).prop('checked', opt_val);
        }
    });
}

const validateOptions = () => {
    $('.dialog_text_input').removeClass('warn');
    if (!valIntInput('bytesPerLine')) return false;
    if (!valIntInput('spriteHeight')) return false;
    if (!valIntInput('spriteGap01')) return false;
    if (!valIntInput('spriteGap23')) return false;
    if (!valIntInput('pairGap')) return false;
    if (!valIntInput('animationSpeed')) return false;
    if (!valIntInput('lineStep')) return false;
    if (!valIntInput('startingLine')) return false;
    if (!valIntInput('cellSize')) return false;
    if (getCheckBox('dliOn') && getCheckBox('commonPalette')) {
        alert('Cannot use DLI with common palette!');
        setCheckBox('dliOn', false);
        return false;
    }
    return true;
}

const clampOptions = () => {
    clampOption('bytesPerLine', 1, 100000);
    clampOption('spriteHeight', 1, 128);
    clampOption('spriteGap01', 0, isMissileMode() ? 10 : 8);
    clampOption('spriteGap23', 0, isMissileMode() ? 10 : 8);
    clampOption('pairGap', 0, isMissileMode() ? 20 : 16);
    clampOption('animationSpeed', 1, 100);
    clampOption('cellSize', 0, zoomCellSize.length - 1);
}

const storeOptions = () => {
    localStorage.setItem(defaultOptions.storageName, JSON.stringify(_.omit(options, dontSave)));
}

const loadOptions = () => {
    if (!localStorage.getItem(defaultOptions.storageName)) {
        options = _.assignIn({}, defaultOptions);
        storeOptions();
    } else {
        options = _.assignIn({}, defaultOptions, JSON.parse(localStorage.getItem(defaultOptions.storageName)));
    }
}

const updateOptions = () => {
    const opts = _.filter($("select, input"), opt => {
        return _.startsWith($(opt).attr('id'), 'opt_');
    });
    const newopts = {};
    _.each(opts, opt => {
        const opt_id = $(opt).attr('id');
        const opt_name = _.split(opt_id, '_');
        let opt_value = $(`#${opt_id}`).val();
        const opt_type = opt_name[2];
        if (opt_type == 'i') {
            newopts[opt_name[1]] = Number(opt_value);
        };
        if (opt_type == 's') {
            newopts[opt_name[1]] = `${opt_value}`;
        };
        if (opt_type == 'b') {
            newopts[opt_name[1]] = $(`#${opt_id}`).prop('checked');
        };
    })
    _.assignIn(options, newopts);
    storeOptions();
}

const saveOptions = () => {
    if (validateOptions()) {
        updateOptions();
        clampOptions();
        updateOptions();
        closeAllDialogs();
    }
    newCanvas();
    if (animationOn) {
        stopPlayer();
        startPlayer();
    }
    updateScreen();
}

// ************************************ WORKSPACE STORAGE

const storeWorkspace = () => {
    localStorage.setItem(`${defaultOptions.storageName}_WS`, JSON.stringify(workspace));
}

const storeLibrary = () => {
    localStorage.setItem(`${defaultOptions.storageName}_LIB`, JSON.stringify(library));
}

const storeUndos = () => {
    localStorage.setItem(`${defaultOptions.storageName}_UNDO`, JSON.stringify(undos));
    localStorage.setItem(`${defaultOptions.storageName}_REDO`, JSON.stringify(redos));
}

const loadUndos = () => {
    undos = [];
    redos = [];
    if (!localStorage.getItem(`${defaultOptions.storageName}_UNDO`)) {
        storeUndos();
    } else {
        try {
            undos = JSON.parse(localStorage.getItem(`${defaultOptions.storageName}_UNDO`));
            redos = JSON.parse(localStorage.getItem(`${defaultOptions.storageName}_REDO`));
        } catch (e) {
            console.log(e);
        }
    }
}

const loadWorkspace = () => {
    if (!localStorage.getItem(`${defaultOptions.storageName}_WS`)) {
        workspace = _.assignIn({}, _.clone(defaultWorkspace));
        workspace.frames.push(getEmptyFrame());
        storeWorkspace();
    } else {
        workspace = _.assignIn({}, _.clone(defaultWorkspace), JSON.parse(localStorage.getItem(`${defaultOptions.storageName}_WS`)));
    }
}

const loadLibrary = () => {
    if (!localStorage.getItem(`${defaultOptions.storageName}_LIB`)) {
        library = _.assignIn({}, _.clone(defaultLibrary));
        library.uploaderId = new Date().valueOf();
        storeLibrary();
    } else {
        library = _.assignIn({}, _.clone(defaultLibrary), JSON.parse(localStorage.getItem(`${defaultOptions.storageName}_LIB`)));
    }
}


// *********************************** EXPORT / LOAD / SAVE

const exportData = () => {
    const template = exportTemplates[$('#opt_lastTemplate_i').val()];
    const body = parseTemplate(template);
    $('#export_frame').html(body);
}

const parseTemplate = (template) => {

    let templateLines = '';
    let byteInRow = 0;
    let lineCount = 0;
    let lineBody = '';
    let tframe = 0;
    let tsprite = 0;
    let tdli = '';
    let lines = '';

    const formatByte = b => {
        let optFormat = options.bytesExport;
        if (template.byte.forceNumeric == 'DEC') {
            optFormat = 'DEC';
        }
        if (template.byte.forceNumeric == 'HEX') {
            optFormat = 'HEX';
        }
        if (template.byte.forceNumeric == 'BIN') {
            optFormat = 'BIN';
        }
        if (optFormat == 'HEX') {
            return `${template.byte.hexPrefix ? template.byte.hexPrefix : ''}${decimalToHex(userIntParse(b))}`;
        }
        if (optFormat == 'BIN') {
            return `${template.byte.binPrefix ? template.byte.binPrefix : ''}${decimalToBin(userIntParse(b))}`;
        }
        return b;
    }

    const parseTemplateVars = (template) => {
        return template
            .replace(/#height#/g, formatByte(options.spriteHeight))
            .replace(/#gap01#/g, formatByte(options.spriteGap01))
            .replace(/#gap23#/g, formatByte(options.spriteGap23))
            .replace(/#pairgap#/g, formatByte(options.pairGap))
            .replace(/#frames#/g, formatByte(workspace.frames.length))
            .replace(/#maxheight#/g, formatByte(options.spriteHeight - 1))
            .replace(/#maxframes#/g, formatByte(workspace.frames.length - 1))
            .replace(/#-1#/g, options.startingLine - 1)
            .replace(/#-2#/g, options.startingLine - 2)
    }

    const getBlock = (block, blockTemp) => {
        let blockLines = `${blockTemp.prefix}${block}${blockTemp.postfix}`;
        blockLines = blockLines.replace(/#f#/g, tframe).replace(/#s#/g, tsprite).replace(/#d#/g, tdli.toUpperCase());
        //lineCount+= blockLines.split(/\r\n|\r|\n/).length + 1;
        return blockLines
    }

    const pushBlock = (block, blockTemp) => {
        templateLines += getBlock(block, blockTemp);
    }

    const pushLine = (line, last) => {
        const num = (template.line.numbers) ? `${options.startingLine + options.lineStep * lineCount} ` : '';
        lineCount++;
        lines += `${num}${template.line.prefix}${line}${last ? template.line.lastpostfix || template.line.postfix : template.line.postfix}`;
        byteInRow = 0;
        lineBody = '';
    }

    const stepByte = (last) => {
        byteInRow++;
        if (byteInRow == options.bytesPerLine || last) {
            if (template.line.preserveLastSeparator) {
                lineBody += template.byte.separator
            }
            byteInRow = 0;
            pushLine(lineBody, last);
            lineBody = '';
        } else lineBody += template.byte.separator;
    }

    const pushByte = (b, last) => {
        lineBody += formatByte(b);
        stepByte(last);
    }

    const pushSpriteColors = s => {
        lines = '';
        tsprite = s;
        pushArray(_.map(workspace.frames, f => f.colors[s]));
        pushBlock(lines, template.colors);
    }

    const pushArray = a => {
        _.each(a, (v, i) => { pushByte(v & 0xFF, i == a.length - 1) });
        if (byteInRow > 0) {
            pushLine(lineBody, true);
        }
    }

    const pushSpriteData = s => {
        let sprite = '';
        tsprite = s;
        _.each(workspace.frames, (frame, f) => {
            const merged = new Array(options.spriteHeight).fill(0);
            lines = '';
            tframe = f;
            frame.player[s].length = options.spriteHeight;
            frame.missile[s].length = options.spriteHeight;
            _.each(frame.player[s], (p, row) => {
                if (isMissileOnLeft()) {
                    merged[row] = (p << 2) | frame.missile[s][row];
                } else {
                    merged[row] = p;
                }
            });
            pushArray(merged);
            sprite += getBlock(lines, template.frame);
        });
        pushBlock(sprite, template.sprite);
    }

    const pushMissileData = () => {
        let missiles = '';
        _.each(workspace.frames, (frame, f) => {
            const merged = new Array(options.spriteHeight).fill(0);
            lines = '';
            tframe = f;
            for (let p = 0; p < playerCount(); p++) {
                _.each(frame.missile[p], (m, row) => {
                    if (isMissileOnLeft()) {
                        merged[row] |= (frame.player[p][row] >> 6) << (p * 2);
                    } else {
                        merged[row] |= m << (p * 2);
                    }
                });
            };
            pushArray(merged);
            missiles += getBlock(lines, template.frame);
        });
        pushBlock(missiles, template.missiles);
    }

    const pushDliData = () => {
        tsprite = '';
        for (tdli of dliMap) {
            let dli = '';
            _.each(workspace.frames, (frame, f) => {
                lines = '';
                tframe = f;
                pushArray(frame.dli[tdli]);
                dli += getBlock(lines, template.frame);
            });
            pushBlock(dli, template.dli);
        }
    }

    for (let p = 0; p < playerCount(); p++) { pushSpriteColors(p) };

    for (let p = 0; p < playerCount(); p++) { pushSpriteData(p) };

    if (isMissileMode()) { pushMissileData() };

    if (options.dliOn) { pushDliData() };

    const parsed = isPlayer23Mode() ?
        parseTemplateVars(`${template.block.prefix23 || template.block.prefix}${templateLines}${template.block.postfix}`) :
        parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`);

    return parsed;
}

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
    binList.push(options.dliOn);
    binList.push([0, 0]); // 3 unused bytes
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

const parseBinary = (binData) => {

    const parseError = msg => { alert(msg); }

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
            const frame = {
                player: [[], [], [], []],
                missile: [[], [], [], []],
                colors: [binData[binPtr++]]
            }
            wrkspc.frames.push(frame);
        }
        for (let f = 0; f < 17; f++) {
            wrkspc.frames[f].colors.push(binData[binPtr++]);
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
        return wrkspc;
    }

    if (areEqual(aplHeader, binData.subarray(0, 4))) {               // PARSE APL 
        return parseAPL();

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
        options.dliOn = binData[binPtr++];
        binPtr += 1; // unused bytes
        let frameCount = binData[binPtr++];

        if (frameCount != 0) {                       // P0-P1 old format - preserved for compatibility
            options.spriteHeight = binData[binPtr++];
            options.spriteGap01 = binData[binPtr++];
        } else {                                      // all other modes
            frameCount = binData[binPtr++];
            options.spriteHeight = binData[binPtr++];
        }

        for (let f = 0; f < frameCount; f++) {
            const frame = {
                player: [[], [], [], []],
                missile: [[], [], [], []],
                colors: [binData[binPtr++]]
            }
            frame.dli = getFreshDli(frame.colors);
            wrkspc.frames.push(frame);
        }

        for (let p = 1; p < playerCount(); p++) {
            for (let f = 0; f < frameCount; f++) {
                wrkspc.frames[f].colors.push(binData[binPtr++]);
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

        wrkspc.frames.length = frameCount;
        return wrkspc;

    } else if (areEqual(apl2Header, binData.subarray(0, 4))) {    // PARSE APL+ (52 rows)
        return parseAPL(52);
    } else {
        parseError('unknown format!')
        return false;
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

// ************************************ TIMELINE OPERATIONS

const jumpToFrame = f => {
    if (workspace.frames[f]) {
        workspace.selectedFrame = f;
        updateScreen();
    }
}

const jumpToNextMovieFrame = () => {
    if (!movieLoop) {
        jumpToNextFrame();
    } else {
        workspace.selectedFrame++;
        if (workspace.selectedFrame > movieLoop[1]) {
            workspace.selectedFrame = movieLoop[0];
        }
    }
    updateScreen();
}

const jumpToNextFrame = () => {
    workspace.selectedFrame++;
    if (workspace.selectedFrame >= workspace.frames.length) {
        workspace.selectedFrame = 0;
    }
    updateScreen();
}

const jumpToPrevFrame = () => {
    workspace.selectedFrame--;
    if (workspace.selectedFrame < 0) {
        workspace.selectedFrame = workspace.frames.length - 1;
    }
    updateScreen();
}

const deleteAll = () => {
    if (animationOn) { return false };
    if (confirm('Do you really want to delete and erase all frames?  NO UNDO!')) {
        workspace.frames.length = 1;
        workspace.selectedFrame = 0;
        clearFrame();
        storeWorkspace();
        _.remove(undos);
        _.remove(redos);
        storeUndos();
        updateScreen();
    }
    return true;
}

const clearFrame = () => {
    if (animationOn) { return false };
    for (let r = 0; r < options.spriteHeight; r++) {
        for (p = 0; p < 4; p++) {
            if (isPlayerActive(p)) {
                workspace.frames[workspace.selectedFrame].player[p][r] = 0;
                workspace.frames[workspace.selectedFrame].missile[p][r] = 0;
            }
        }
    }
    drawEditor();
    storeWorkspace();
    return true;
}

const startPlayer = () => {
    if ((animationOn == 0) && !playerInterval && (workspace.frames.length > 1)) {
        animationOn = 1;
        playerInterval = setInterval(jumpToNextMovieFrame, options.animationSpeed * 20);
        $("#timeline li").first().addClass('red');
    }
}

const stopPlayer = () => {
    animationOn = 0;
    clearInterval(playerInterval);
    $("#timeline li").first().removeClass('red');
    playerInterval = null;
}

const cloneFrame = () => {
    if (animationOn) { return false };
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame, 0, newframe);
    jumpToFrame(workspace.selectedFrame + 1);
    storeWorkspace();
    return true;
}

const animFrameLeft = () => {
    if (animationOn) { return false };
    if (workspace.selectedFrame == 0) { return false }
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame, 1);
    workspace.frames.splice(workspace.selectedFrame - 1, 0, newframe);
    jumpToFrame(workspace.selectedFrame - 1);
    storeWorkspace();
}

const animFrameRight = () => {
    if (animationOn) { return false };
    if (workspace.selectedFrame == workspace.frames.length - 1) { return false }
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame, 1);
    workspace.frames.splice(workspace.selectedFrame + 1, 0, newframe);
    jumpToFrame(workspace.selectedFrame + 1);
    storeWorkspace();
}

const addFrame = () => {
    if (animationOn) { return false };
    const newframe = getEmptyFrame();
    workspace.frames.splice(workspace.selectedFrame + 1, 0, newframe);
    jumpToFrame(workspace.selectedFrame + 1);
    storeWorkspace();
    return true;
}

const delFrame = () => {
    if (animationOn) { return false };
    if (workspace.frames.length > 1) {
        workspace.frames.splice(workspace.selectedFrame, 1);
        if (!workspace.frames[workspace.selectedFrame]) {
            workspace.selectedFrame--;
        }
        jumpToFrame(workspace.selectedFrame);
    }
    storeWorkspace();
    return true;
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

// ************************************ FRAME OPERATION

const copyDli = () => {
    if (animationOn || options.commonPalette || !options.dliOn) { return false };
    workspace.clipBoard.dli = {}
    workspace.clipBoard.dli.back = workspace.frames[workspace.selectedFrame].dli.back;
    if (isPlayerActive(0)) {
        workspace.clipBoard.dli.c0 = workspace.frames[workspace.selectedFrame].dli.c0;
        workspace.clipBoard.dli.c1 = workspace.frames[workspace.selectedFrame].dli.c1;
    }
    if (isPlayerActive(2)) {
        workspace.clipBoard.dli.c2 = workspace.frames[workspace.selectedFrame].dli.c2;
        workspace.clipBoard.dli.c3 = workspace.frames[workspace.selectedFrame].dli.c3;
    }
}

const pasteDli = () => {
    if (animationOn || options.commonPalette || !options.dliOn) { return false };
    if (workspace.clipBoard.dli) {
        workspace.frames[workspace.selectedFrame].dli.back = _.cloneDeep(workspace.clipBoard.dli.back);
        if (isPlayerActive(0)) {
            workspace.frames[workspace.selectedFrame].dli.c0 = _.cloneDeep(workspace.clipBoard.dli.c0);
            workspace.frames[workspace.selectedFrame].dli.c1 = _.cloneDeep(workspace.clipBoard.dli.c1);
        }
        if (isPlayerActive(2)) {
            workspace.frames[workspace.selectedFrame].dli.c2 = _.cloneDeep(workspace.clipBoard.dli.c2);
            workspace.frames[workspace.selectedFrame].dli.c3 = _.cloneDeep(workspace.clipBoard.dli.c3);
        }
    }
    updateScreen();
    storeWorkspace();
    return true;
}



const copyColors = () => {
    if (animationOn || options.commonPalette) { return false };
    workspace.clipBoard.colors = [];
    if (options.dliOn) {
        workspace.clipBoard.colors[5] = workspace.frames[workspace.selectedFrame].dli.back[workspace.selectedDli];
        if (isPlayerActive(0)) {
            workspace.clipBoard.colors[0] = workspace.frames[workspace.selectedFrame].dli.c0[workspace.selectedDli];
            workspace.clipBoard.colors[1] = workspace.frames[workspace.selectedFrame].dli.c1[workspace.selectedDli];
        }
        if (isPlayerActive(2)) {
            workspace.clipBoard.colors[2] = workspace.frames[workspace.selectedFrame].dli.c2[workspace.selectedDli];
            workspace.clipBoard.colors[3] = workspace.frames[workspace.selectedFrame].dli.c3[workspace.selectedDli];
        }
    } else {
        for (k in workspace.frames[workspace.selectedFrame].colors) {
            if (isPlayerActive(k)) {
                workspace.clipBoard.colors[k] = workspace.frames[workspace.selectedFrame].colors[k];
            }
        };
    }

}

const pasteColors = () => {
    if (animationOn || options.commonPalette) { return false };
    if (workspace.clipBoard.colors) {

        if (options.dliOn) {
            workspace.frames[workspace.selectedFrame].dli.back[workspace.selectedDli] = workspace.clipBoard.colors[5];
            if (isPlayerActive(0)) {
                workspace.frames[workspace.selectedFrame].dli.c0[workspace.selectedDli] = workspace.clipBoard.colors[0];
                workspace.frames[workspace.selectedFrame].dli.c1[workspace.selectedDli] = workspace.clipBoard.colors[1];
            }
            if (isPlayerActive(2)) {
                workspace.frames[workspace.selectedFrame].dli.c2[workspace.selectedDli] = workspace.clipBoard.colors[2];
                workspace.frames[workspace.selectedFrame].dli.c3[workspace.selectedDli] = workspace.clipBoard.colors[3];
            }
        } else {
            for (k in workspace.clipBoard.colors) {
                if (isPlayerActive(k)) {
                    workspace.frames[workspace.selectedFrame].colors[k] = workspace.clipBoard.colors[k];
                }
            };
        }
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const copyFrame = () => {
    if (animationOn) { return false };
    workspace.clipBoard.frame = getEmptyFrame();
    for (k in workspace.frames[workspace.selectedFrame].player) {
        if (isPlayerActive(k)) {
            workspace.clipBoard.frame.player[k] = _.cloneDeep(workspace.frames[workspace.selectedFrame].player[k]);
            workspace.clipBoard.frame.missile[k] = _.cloneDeep(workspace.frames[workspace.selectedFrame].missile[k]);
            workspace.clipBoard.frame.colors[k] = workspace.frames[workspace.selectedFrame].colors[k];
        }
    };
}

const pasteFrame = () => {
    if (animationOn) { return false };
    if (workspace.clipBoard.frame) {
        for (k in workspace.clipBoard.frame.player) {
            if (isPlayerActive(k) && workspace.clipBoard.frame.player[k]) {
                workspace.frames[workspace.selectedFrame].player[k] = _.cloneDeep(workspace.clipBoard.frame.player[k]);
                workspace.frames[workspace.selectedFrame].missile[k] = _.cloneDeep(workspace.clipBoard.frame.missile[k]);
                workspace.frames[workspace.selectedFrame].colors[k] = workspace.clipBoard.frame.colors[k];
            }
        };
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const swapPairs = () => {
    if (animationOn) { return false };
    const cframe = workspace.frames[workspace.selectedFrame];
    if (isPlayer23Mode()) {
        for (let p of [0, 1]) {
            let temp = cframe.player[p];
            cframe.player[p] = cframe.player[p + 2]
            cframe.player[p + 2] = temp
            temp = cframe.missile[p];
            cframe.missile[p] = cframe.missile[p + 2]
            cframe.missile[p + 2] = temp
            if (!options.dliOn) {
                let temp = cframe.colors[p];
                cframe.colors[p] = cframe.colors[p + 2]
                cframe.colors[p + 2] = temp
            }
        }
        if (options.dliOn) {
            let temp = cframe.dli.c1;
            cframe.dli.c1 = cframe.dli.c3;
            cframe.dli.c3 = temp;
            temp = cframe.dli.c2;
            cframe.dli.c2 = cframe.dli.c0;
            cframe.dli.c0 = temp;
        }
        updateScreen();
        storeWorkspace();
        return true;
    }
    return false;
}

const flip8Bits = b => reversedBytes[b];

const flipHFrame = () => {
    if (animationOn) { return false };
    const cf = workspace.frames[workspace.selectedFrame];
    for (let row = 0; row < options.spriteHeight; row++) {
        if (!isMissileMode()) {
            const b = _.map(cf.player, r => { return reversedBytes[r[row]] })

            if (options.spriteGap01 > 0) {
                cf.player[0][row] = b[1];
                cf.player[1][row] = b[0];
            } else {
                cf.player[0][row] = b[0];
                cf.player[1][row] = b[1];
            }

            if (options.spriteGap23 > 0) {
                cf.player[2][row] = b[3];
                cf.player[3][row] = b[2];
            } else {
                cf.player[2][row] = b[2];
                cf.player[3][row] = b[3];
            }

        }
        if (isMissileMode()) {
            const p0 = reversedBytes[(cf.player[0][row] << 2) & 0xff] | reversedBytes[cf.missile[0][row]];
            const p1 = reversedBytes[(cf.player[1][row] << 2) & 0xff] | reversedBytes[cf.missile[1][row]];
            const m0 = reversed2bits[cf.player[0][row] >> 6];
            const m1 = reversed2bits[cf.player[1][row] >> 6];
            const p2 = reversedBytes[(cf.player[2][row] << 2) & 0xff] | reversedBytes[cf.missile[2][row]];
            const p3 = reversedBytes[(cf.player[3][row] << 2) & 0xff] | reversedBytes[cf.missile[3][row]];
            const m2 = reversed2bits[cf.player[2][row] >> 6];
            const m3 = reversed2bits[cf.player[3][row] >> 6];

            if (options.spriteGap01 > 0) {
                cf.player[0][row] = p1;
                cf.player[1][row] = p0;
                cf.missile[0][row] = m1;
                cf.missile[1][row] = m0;
            } else {
                cf.player[0][row] = p0;
                cf.player[1][row] = p1;
                cf.missile[0][row] = m0;
                cf.missile[1][row] = m1;
            }

            if (options.spriteGap23 > 0) {
                cf.player[2][row] = p3;
                cf.player[3][row] = p2;
                cf.missile[2][row] = m3;
                cf.missile[3][row] = m2;
            } else {
                cf.player[2][row] = p2;
                cf.player[3][row] = p3;
                cf.missile[2][row] = m2;
                cf.missile[3][row] = m3;
            }
        }
    }

    if (options.spriteGap01 > 0) {
        const c = cf.colors[0];
        cf.colors[0] = cf.colors[1];
        cf.colors[1] = c;
    }

    if (options.spriteGap23 > 0) {
        const c = cf.colors[2];
        cf.colors[2] = cf.colors[3];
        cf.colors[3] = c;
    }

    if (isPlayer23Mode() && (options.pairGap > 0) && layer01visible && layer23visible) {
        let p = cf.player[0]
        cf.player[0] = cf.player[2];
        cf.player[2] = p;
        p = cf.player[1]
        cf.player[1] = cf.player[3];
        cf.player[3] = p;
        if (isMissileMode()) {
            let m = cf.missile[0]
            cf.missile[0] = cf.missile[2];
            cf.missile[2] = m;
            m = cf.missile[1]
            cf.missile[1] = cf.missile[3];
            cf.missile[3] = m;
        }

        if (options.dliOn) {
            let temp = cf.dli.c1;
            cf.dli.c1 = cf.dli.c3;
            cf.dli.c3 = temp;
            temp = cf.dli.c2;
            cf.dli.c2 = cf.dli.c0;
            cf.dli.c0 = temp;
        } else {
            let c = cf.colors[0];
            cf.colors[0] = cf.colors[2];
            cf.colors[2] = c;
            c = cf.colors[1];
            cf.colors[1] = cf.colors[3];
            cf.colors[3] = c;
        }
    }

    updateColors();
    drawEditor();
    storeWorkspace();
    return true;
}

const flipVFrame = () => {
    if (animationOn) { return false };
    let first = 0;
    let last = options.spriteHeight - 1;
    while (first < last) {
        for (p = 0; p < playerCount(); p++) {
            if (isPlayerActive(p)) {
                let last0 = workspace.frames[workspace.selectedFrame].player[p][last];
                workspace.frames[workspace.selectedFrame].player[p][last] = workspace.frames[workspace.selectedFrame].player[p][first];
                workspace.frames[workspace.selectedFrame].player[p][first] = last0;

                last0 = workspace.frames[workspace.selectedFrame].missile[p][last];
                workspace.frames[workspace.selectedFrame].missile[p][last] = workspace.frames[workspace.selectedFrame].missile[p][first];
                workspace.frames[workspace.selectedFrame].missile[p][first] = last0;
            }
        }
        if (options.dliOn) {
            const cframe = workspace.frames[workspace.selectedFrame];
            let temp = cframe.dli.c0[last];
            cframe.dli.c0[last] = cframe.dli.c0[first];
            cframe.dli.c0[first] = temp;
            temp = cframe.dli.c1[last];
            cframe.dli.c1[last] = cframe.dli.c1[first];
            cframe.dli.c1[first] = temp;
            temp = cframe.dli.c2[last];
            cframe.dli.c2[last] = cframe.dli.c2[first];
            cframe.dli.c2[first] = temp;
            temp = cframe.dli.c3[last];
            cframe.dli.c3[last] = cframe.dli.c3[first];
            cframe.dli.c3[first] = temp;
        }
        last--;
        first++;
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const moveColor = (c, source, target) => {
    if (c == 0) { return 0 }
    let [mp0, mp1, mm0, mm1, mp2, mp3, mm2, mm3] = getMasks(source);
    const s0 = mp0 | mm0;
    const s1 = mp1 | mm1;
    const s2 = mp2 | mm2;
    const s3 = mp3 | mm3;
    [mp0, mp1, mm0, mm1, mp2, mp3, mm2, mm3] = getMasks(target);
    const t0 = mp0 | mm0;
    const t1 = mp1 | mm1;
    const t2 = mp2 | mm2;
    const t3 = mp3 | mm3;
    let cout = c;

    if (((s1 && !t1) || (s0 && !t0)) && (t2 || t3) && !(c & 4)) {
        cout = c | 4;
    }
    if (((s3 && !t3) || (s2 && !t2)) && (t0 || t1) && (c & 4)) {
        cout = c - 4;
    }
    c = cout;
    if (((s2 && !t2) || (s0 && !t0)) && (t1 || t3) && !(c & 2)) {
        cout = c | 2;
    }
    c = cout;
    if (((s3 && !t3) || (s1 && !t1)) && (t0 || t2) && !(c & 1)) {
        cout = c | 1;
    }

    return cout;
}

const moveFrame = dir => {
    if (animationOn) { return false };
    const prevOrState = options.ORDrawsOutside;
    options.ORDrawsOutside = 1;
    const sframeNum = workspace.frames.length;
    workspace.frames[sframeNum] = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    clearFrame();
    for (let row = 0; row < options.spriteHeight; row++) {
        for (let col = 0; col < editorWindow.columns; col++) {
            let target = col + dir;
            let clear = false;
            if (target < 0) {
                if (!options.wrapEditor) { clear = true }
                target = editorWindow.columns - 1
            };
            if (target == editorWindow.columns) {
                if (!options.wrapEditor) { clear = true }
                target = 0;
            };
            setColorOn(target, row, clear ? 0 : moveColor(getColorOn(sframeNum, col, row), col, target));
        }
    }
    workspace.frames.pop();
    updateScreen();
    storeWorkspace();
    options.ORDrawsOutside = prevOrState;
    return true;
}

const moveFrameLeft = () => {
    return moveFrame(-1);
}

const moveFrameRight = () => {
    return moveFrame(1)
}

const moveFrameUp = () => {
    if (animationOn) { return false };
    for (p = 0; p < playerCount(); p++) {
        if (isPlayerActive(p)) {
            workspace.frames[workspace.selectedFrame].player[p].length = options.spriteHeight;
            let b0 = workspace.frames[workspace.selectedFrame].player[p].shift();
            workspace.frames[workspace.selectedFrame].player[p].push(options.wrapEditor ? b0 : 0);

            workspace.frames[workspace.selectedFrame].missile[p].length = options.spriteHeight;
            b0 = workspace.frames[workspace.selectedFrame].missile[p].shift();
            workspace.frames[workspace.selectedFrame].missile[p].push(options.wrapEditor ? b0 : 0);
        }
    }
    if (options.dliOn) {
        const cframe = workspace.frames[workspace.selectedFrame];
        cframe.dli.c0.length = options.spriteHeight;
        let temp = cframe.dli.c0.shift();
        cframe.dli.c0.push(options.wrapEditor ? temp : cframe.dli.c0[0]);

        cframe.dli.c1.length = options.spriteHeight;
        temp = cframe.dli.c1.shift();
        cframe.dli.c1.push(options.wrapEditor ? temp : cframe.dli.c1[0]);

        cframe.dli.c2.length = options.spriteHeight;
        temp = cframe.dli.c2.shift();
        cframe.dli.c2.push(options.wrapEditor ? temp : cframe.dli.c2[0]);

        cframe.dli.c3.length = options.spriteHeight;
        temp = cframe.dli.c3.shift();
        cframe.dli.c3.push(options.wrapEditor ? temp : cframe.dli.c3[0]);

        cframe.dli.back.length = options.spriteHeight;
        temp = cframe.dli.back.shift();
        cframe.dli.back.push(options.wrapEditor ? temp : cframe.dli.back[0]);
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const moveFrameDown = () => {
    if (animationOn) { return false };
    for (p = 0; p < playerCount(); p++) {
        if (isPlayerActive(p)) {
            workspace.frames[workspace.selectedFrame].player[p].length = options.spriteHeight;
            workspace.frames[workspace.selectedFrame].missile[p].length = options.spriteHeight;
            let b0 = workspace.frames[workspace.selectedFrame].player[p].pop();
            workspace.frames[workspace.selectedFrame].player[p].unshift(options.wrapEditor ? b0 : 0);
            b0 = workspace.frames[workspace.selectedFrame].missile[p].pop();
            workspace.frames[workspace.selectedFrame].missile[p].unshift(options.wrapEditor ? b0 : 0);
        }
    }
    if (options.dliOn) {
        const cframe = workspace.frames[workspace.selectedFrame];
        cframe.dli.c0.length = options.spriteHeight;
        let temp = cframe.dli.c0.pop();
        cframe.dli.c0.unshift(options.wrapEditor ? temp : cframe.dli.c0[0]);

        cframe.dli.c1.length = options.spriteHeight;
        temp = cframe.dli.c1.pop();
        cframe.dli.c1.unshift(options.wrapEditor ? temp : cframe.dli.c1[cframe.dli.c1.length - 1]);

        cframe.dli.c2.length = options.spriteHeight;
        temp = cframe.dli.c2.pop();
        cframe.dli.c2.unshift(options.wrapEditor ? temp : cframe.dli.c2[cframe.dli.c2.length - 1]);

        cframe.dli.c3.length = options.spriteHeight;
        temp = cframe.dli.c3.pop();
        cframe.dli.c3.unshift(options.wrapEditor ? temp : cframe.dli.c3[cframe.dli.c3.length - 1]);

        cframe.dli.back.length = options.spriteHeight;
        temp = cframe.dli.back.pop();
        cframe.dli.back.unshift(options.wrapEditor ? temp : cframe.dli.back[cframe.dli.back.length - 1]);
    }


    drawEditor();
    storeWorkspace();
    return true;
}

const heightDown = () => {
    if (animationOn) { return false };
    for (p = 0; p < playerCount(); p++) {
        if (isPlayerActive(p)) {
            let s0 = workspace.frames[workspace.selectedFrame].player[p]
            workspace.frames[workspace.selectedFrame].player[p] = _.filter(s0, (v, k) => (k % 2 == 0));
            s0 = workspace.frames[workspace.selectedFrame].missile[p]
            workspace.frames[workspace.selectedFrame].missile[p] = _.filter(s0, (v, k) => (k % 2 == 0));
        }
    }
    drawEditor();
    storeWorkspace();
    return true;
}

const heightUp = () => {
    if (animationOn) { return false };
    for (p = 0; p < playerCount(); p++) {
        if (isPlayerActive(p)) {
            let s0 = workspace.frames[workspace.selectedFrame].player[p]
            workspace.frames[workspace.selectedFrame].player[p] = _.flatMap(s0, v => [v, v]);
            s0 = workspace.frames[workspace.selectedFrame].missile[p]
            workspace.frames[workspace.selectedFrame].missile[p] = _.flatMap(s0, v => [v, v]);
        }
    }
    drawEditor();
    storeWorkspace();
    return true;
}

// ************************************ KEY BINDINGS

const keyPressed = e => {               // always working
    switch (e.code) {
        case 'KeyE':
            if (e.ctrlKey) {
                e.preventDefault();
                toggleExport();
            };
            break;
        case 'KeyO':
            if (!e.ctrlKey) {
                toggleOpt('ORDrawsOutside');
            }
            break;
        case 'KeyM':
            toggleOpt('markActiveRegion');
            break;
        case 'KeyW':
            toggleOpt('wrapEditor');
            break;
        case 'KeyG':
            toggleOpt('showGrid');
            break;
    }
    if ($('.dialog:visible').length == 0) { // editor only
        switch (e.code) {
            case 'Minus':
                zoomOut();
                updateScreen();
                break;
            case 'Equal':
                zoomIn();
                updateScreen();
                break;
            case 'Digit1':
                colorClicked(1);
                break;
            case 'Digit2':
                colorClicked(2);
                break;
            case 'Digit3':
                colorClicked(3);
                break;
            case 'Digit4':
                colorClicked(5);
                break;
            case 'Digit5':
                colorClicked(6);
                break;
            case 'Digit6':
                colorClicked(7);
                break;
            case 'Digit0':
            case 'Backquote':
                colorClicked(0);
                break;
            case 'Space':
                if (animationOn) {
                    stopPlayer();
                } else {
                    startPlayer();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (!animationOn) {
                    movieLoop = null;
                    jumpToNextFrame();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (!animationOn) {
                    movieLoop = null;
                    jumpToPrevFrame();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (options.dliOn) {
                    workspace.selectedDli--;
                    if (workspace.selectedDli < 0) {
                        workspace.selectedDli = options.spriteHeight - 1;
                    }
                    dliRange = null;
                    updateColors();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (options.dliOn) {
                    workspace.selectedDli++;
                    if (workspace.selectedDli == options.spriteHeight) {
                        workspace.selectedDli = 0;
                    }
                    dliRange = null;
                    updateColors();
                }
                break;
            case 'Home':
                workspace.selectedFrame = 0;
                updateScreen()
                break;
            case 'End':
                workspace.selectedFrame = workspace.frames.length - 1;
                updateScreen();
                break;
            case 'BracketLeft':
                if (e.shiftKey) {
                    copyDli();
                } else {
                    copyColors();
                }
                break;
            case 'BracketRight':
                if (e.shiftKey) {
                    if (saveUndo('paste dli', pasteDli)()) {
                    };
                } else {
                    if (saveUndo('paste colors', pasteColors)()) {
                    };
                }
                break;
            case 'Delete':
                if (saveUndo('delete frame', delFrame)()) {
                    updateScreen();
                };
                break;
            case 'Insert':
                if (saveUndo('add frame', addFrame)()) {
                    updateScreen();
                };
                break;
            case 'KeyZ':
                if (e.ctrlKey) {
                    undo()
                };
                break;
            case 'KeyY':
                if (e.ctrlKey) {
                    redo()
                };
                break;
            case 'KeyS':
                if (e.ctrlKey) {
                    e.preventDefault();
                    saveFile();
                };
                break;
            case 'KeyO':
                if (e.ctrlKey) {
                    e.preventDefault();
                    $("#fdialog0").trigger('click');
                };
                break;
            case 'KeyC':
                if (e.ctrlKey) {
                    copyFrame();
                }
                break;
            case 'KeyV':
                if (e.ctrlKey) {
                    saveUndo('paste frame', pasteFrame)();
                }
                break;

            default:
                break;
        }

    } else {  /// dialogs
        switch (e.code) {
            case 'Escape':
                closeAllDialogs();
                break;
            case 'Enter':
                if ($('#options_dialog').is(':visible')) {
                    saveOptions();
                }
                break;

            default:
                break;
        }
    }
    //console.log(e.code);
}

// ************************************************  Library functions 

const libraryLoad = item => {
    const optToLoad = [
        'lineResolution',
        'spriteHeight',
        'spriteGap01',
        'spriteGap23',
        'pairGap',
        'animationSpeed',
        'palette',
        'mergeMode',
        'dliOn'
    ];
    const toLoad = libraryContents.data[item];
    for (let opt of optToLoad) {
        options[opt] = toLoad.spriteOptions[opt] !== undefined ? toLoad.spriteOptions[opt] : defaultOptions[opt];
        //console.log(opt);
    }
    storeOptions();
    workspace.frames = _.cloneDeep(toLoad.spriteData.frames);
    fixWorkspace();
    storeWorkspace();
    stopPlayer();
    newCanvas();
    library.authorName = toLoad.authorName ? toLoad.authorName : '';
    library.spriteName = toLoad.spriteName ? toLoad.spriteName : '';
    library.description = toLoad.description ? toLoad.description : '';
    closeLibrary();
}

const libraryClick = e => {
    const itemNum = Number(_.last(_.split(e.currentTarget.id, '_')));
    //console.log(e);
    const sprite = libraryContents.data[itemNum];
    if (confirm(`Do you really want to load a new sprite?`)) {
        libraryLoad(itemNum);
    }
}

const validateUpload = () => {
    if ($("#lib_spriteName_s").val() == '') {
        libError('Sprite name must not be empty!');
        return false;
    }
    if ($("#lib_authorName_s").val() == '') {
        libError('Author must not be empty!');
        return false;
    }
    return true;
}

const libraryUpload = () => {
    if (validateUpload()) {
        updateLibrary();
        if (confirm('Are you sure you want to upload your project?')) {
            postData(library);
        }
    }
};

const showLibContents = () => {
    if (libraryContents) {
        $('#library_list').empty();
        _.each(libraryContents.data, (spr, i) => {
            const li = $("<li/>").attr('id', `lib_${i}`);
            li.bind('mousedown', libraryClick);
            const name = $("<div/>").addClass('lib lib_name').html(spr.spriteName).attr('title', spr.description);
            const frameCount = spr.spriteData.frames.length;
            const fc = $("<span/>").addClass('lib_framecount').append(` (${frameCount} frame${frameCount == 1 ? '' : 's'})`);
            name.append(fc);
            const author = $("<div/>").addClass('lib lib_author').html(spr.authorName);
            const sprdate = new Date(spr.uploadDate);
            const date = $("<div/>").addClass('lib lib_date').attr('title', spr.uploadDate).html(sprdate.toDateString());
            const img = $('<img/>').addClass('lib').attr('src', spr.spritePreview);
            const imgbox = $("<div/>").addClass('lib lib_img').append(img);
            li.append(imgbox, name, author, date);
            $('#library_list').append(li);
        });
        //console.log(libraryContents.totals)
        //const last = (LIBRARY_SPR_PER_PAGE * libraryPage) + libraryContents.totals.count;
        const pages = Math.ceil(libraryContents.totals.total / LIBRARY_SPR_PER_PAGE);

        const pager = $('<div/>').addClass('pager')

        const prev = $('<div/>').html('<<')
            .addClass('menuitem')
            .toggleClass('none', libraryPage == 0)
            .bind('mousedown', () => { swapPage(-1) });
        const pos = $('<div/>').html(` Page ${libraryPage + 1} of ${pages} `);

        const next = $('<div/>').html('>>')
            .addClass('menuitem')
            .toggleClass('none', libraryPage == pages - 1)
            .bind('mousedown', () => { swapPage(1) });

        pager.append(prev, pos, next);

        $('#library_list').append(pager);

    }
}

const swapPage = dir => {
    const newPage = libraryPage + dir;
    const pages = Math.ceil(libraryContents.totals.total / LIBRARY_SPR_PER_PAGE);
    if ((newPage > -1) && (newPage < pages)) {
        getLibraryData(newPage);
    }
}

const updateLibrary = () => {
    const libs = _.filter($("textarea, input"), inp => {
        return _.startsWith($(inp).attr('id'), 'lib_');
    });
    const newopts = {};
    _.each(libs, inp => {
        const lib_id = $(inp).attr('id');
        const lib_name = _.split(lib_id, '_');
        let lib_value = $(`#${lib_id}`).val();
        const lib_type = lib_name[2];
        if (lib_type == 's') {
            newopts[lib_name[1]] = `${lib_value}`;
        };
    })
    _.assignIn(library, newopts);
    storeLibrary();
}

const updateLibraryTab = () => {
    getLibraryData(libraryPage);
    const libs = _.filter($("textarea, input"), inp => {
        return _.startsWith($(inp).attr('id'), 'lib_');
    });
    _.each(libs, inp => {
        const lib_id = $(inp).attr('id');
        const lib_name = _.split(lib_id, '_');
        const lib_type = lib_name[2];
        const lib_val = library[lib_name[1]];
        $(`#${lib_id}`).val(lib_val);
    });

    $('#libpreview').remove();
    const preview = getFrameImage(0, 4, 4 / options.lineResolution).attr('id', 'libpreview');
    $('#upload_form').prepend(preview);
}

const libError = (msg, col) => {
    col = col || '#c66';
    $('#lib_error').empty().html(msg).css('color', col).removeClass('none');
    setTimeout(() => {
        $('#lib_error').addClass('none');
    }, 5000);
}

const getLibraryData = page => {
    $('#lib_spinner').removeClass('none');
    const skip = LIBRARY_SPR_PER_PAGE * page;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://spred-c23d.restdb.io/rest/sprites?totals=true&sort=uploadDate&dir=-1&skip=${skip}&max=${LIBRARY_SPR_PER_PAGE}`,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": "61ffef5b6a79155501021860",
            "cache-control": "no-cache"
        }
    }
    $.ajax(settings)
        .done(function (response) {
            libraryContents = response;
            libraryPage = page;
            showLibContents();
            //libError('List Succesfully Loaded');
            $('#lib_spinner').addClass('none');
        })
        .fail(function (response) {
            console.log(response);
            libError('Error loading list from database');
            $('#lib_spinner').addClass('none');
        })
}

const getSpriteByKeys = keys => {
    //$('#lib_spinner').removeClass('none');
    //const skip = LIBRARY_SPR_PER_PAGE * page;

    var settings = {
        "async": false,
        "crossDomain": true,
        "url": `https://spred-c23d.restdb.io/rest/sprites?q=${JSON.stringify(keys)}`,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": "61ffef5b6a79155501021860",
            "cache-control": "no-cache"
        }
    }
    $.ajax(settings)
        .done(function (response) {
            libraryContents = response;
            libraryPage = page;
            showLibContents();
            //libError('List Succesfully Loaded');
            $('#lib_spinner').addClass('none');
        })
        .fail(function (response) {
            console.log(response);
            libError('Error loading list from database');
            $('#lib_spinner').addClass('none');
        })
}


const postData = data => {
    $('#lib_spinner').removeClass('none');
    const preview = getFrameImage(0, 2, 2 / options.lineResolution);
    var jsondata = _.assign({
        "uploaderId": library.uploaderId,
        "authorName": "",
        "uploadDate": new Date().toISOString(),
        "spriteName": "",
        "description": "",
        "spriteData": workspace,
        "spriteOptions": options,
        "spritePreview": preview[0].toDataURL()
    }, data);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://spred-c23d.restdb.io/rest/sprites",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "x-apikey": "61ffef5b6a79155501021860",
            "cache-control": "no-cache"
        },
        "processData": false,
        "data": JSON.stringify(jsondata)
    }

    $.ajax(settings)
        .done(function (response) {
            //console.log(response);
            libError('The file was successfully uploaded', '#5b5');
            getLibraryData(0);
        })
        .fail(function (response) {

            if (response.status == 400) {
                console.log(response);
                libError('A sprite with this name already exists.');
                $('#lib_spinner').addClass('none');
                return false;
            }
            libError('Unexpected error during upload.')
            $('#lib_spinner').addClass('none');
        });
}


// ************************************************  ON START INIT 

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
    app.addMenuItem('🡄', saveUndo('move left', moveFrameLeft), 'framemenu', 'Moves frame contents left');
    app.addMenuItem('🡆', saveUndo('move right', moveFrameRight), 'framemenu', 'Moves frame contents right');
    app.addMenuItem('🡅', saveUndo('move up', moveFrameUp), 'framemenu', 'Moves frame contents up');
    app.addMenuItem('🡇', saveUndo('move down', moveFrameDown), 'framemenu', 'Moves frame contents down');
    app.addSeparator('framemenu');
    app.addMenuItem('≡+', saveUndo('double lines', heightUp), 'framemenu', 'Expand by doubling lines');
    app.addMenuItem('≡−', saveUndo('tighten', heightDown), 'framemenu', 'Remove every second line');
    app.addSeparator('framemenu');
    app.addMenuItem('⮬⮯', saveUndo('swap pairs', swapPairs), 'framemenu', 'Swap pairs', 'pairOnly');

    app.addSeparator('framemenu');
    app.addMenuItem('Library', toggleLibrary, 'framemenu', 'Toggle Library', 'libButton');

    //    app.addMenuItem('Upload current project', saveUndo('upload', postData), 'libmenu', 'Upload');
    app.addMenuItem('Reload Library', () => { getLibraryData(0) }, 'libmenu', 'Reload Library', 'libButton');
    app.addSeparator('libmenu');
    app.addMenuItem('Close Library', toggleLibrary, 'libmenu', 'Toggle Library', 'libButton');
    const err = $('<div/>').attr('id', 'lib_error');
    $('#libmenu').append(err);

    app.addMenuItem('▶', startPlayer, 'timemenu', 'Starts Animation [Space]');
    app.addMenuItem('⏹︎', stopPlayer, 'timemenu', 'Stops Animation [Space]');
    app.addSeparator('timemenu');
    app.addMenuItem('Add', saveUndo('add frame', addFrame), 'timemenu', 'Adds new empty frame');
    app.addMenuItem('Clone', saveUndo('clone frame', cloneFrame), 'timemenu', 'Adds copy of frame');
    app.addMenuItem('Delete', saveUndo('delete frame', delFrame), 'timemenu', 'Deletes current frame');
    app.addSeparator('timemenu');
    app.addMenuItem('🡄🞑', animFrameLeft, 'timemenu', 'Moves current frame left');
    app.addMenuItem('🞑🡆', animFrameRight, 'timemenu', 'Moves current frame right');
    app.addSeparator('timemenu');
    app.addMenuItem('Delete All', deleteAll, 'timemenu', 'Clears and deletes all frames');

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
    $('.layer_switch').bind('mousedown', layerSwitchClicked);
    $('#upload').bind('mousedown', libraryUpload);

    $("#app").bind('mousedown', () => { closePalette(); closeAllDialogs() });
    document.addEventListener('keydown', keyPressed);
    $('html').on('dragover', e => { e.preventDefault() });

    loadWorkspace();
    loadLibrary();
    loadUndos();
    newCanvas();
    updateScreen();


});
