const GRID_COLOR = 'rgba(200,200,200,0.3)';
const defaultOptions = {
    version: '0.51',
    storageName: 'SprEdStore049',
    aspect: 1,
    spriteHeight: 16,
    spriteGap: 0,
    showGrid: 1,
    cellSize: 16,
    wrapEditor: 1,
    animationSpeed: 5,
    palette: 'PAL',
    bytesExport: 'HEX',
    bytesPerLine: 10,
    lastTemplate: 0
}
let options = {};
const dontSave = ['version', 'storageName'];

let editor = null;
let player = 0;
let playerInterval = null;

const defaultWorkspace = {
    selectedColor: 1,
    selectedFrame: 0,
    backgroundColor: 0,
    clipboard: null,
    frames: []
}

let workspace = {};

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

// ******************************* HELPERS

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
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
            udata = binFile.data.length - udata;
        }
        return udata;
    } else {
        return NaN;
    }
}

const getEmptyFrame = () => {
    const frame = {
        data: [[],[]],
        colors: [0x24, 0xc8]
    }
    for (let r=0;r<options.spriteHeight;r++) {
        frame.data[0][r] = 0;
        frame.data[1][r] = 0;
    }
    return frame;
}

// *********************************** COLORS

const getColors = (frame) => {
    return [
        workspace.backgroundColor,
        workspace.frames[frame].colors[0],
        workspace.frames[frame].colors[1],
        workspace.frames[frame].colors[0] | workspace.frames[frame].colors[1]
    ];
}

const updateColors = colors => {
    if (colors==undefined) {
        colors = getColors(workspace.selectedFrame);
    }
    for (let i=0;i<4;i++) {
        $(`#color${i}`)
        .css('background-color',getByteRGB(colors[i]))
        .attr('title',`${colors[i]} ($${decimalToHex(colors[i]).toUpperCase()})`)
    }
    colorClicked(workspace.selectedColor);
}

const colorClicked = (c) => {
    if (player) { return false };
    workspace.selectedColor = c;
    $('.colorbox').removeClass('colorSelected');
    $(`#color${c}`).addClass('colorSelected');
    storeWorkspace();
}

const getColorRGB = (frame,c) => {
    const colors = getColors(frame);
    return getByteRGB(colors[c]);
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
}

const getByteRGB = (cval) => {

    const cr = (cval >> 4) & 15;
    const lm = cval & 15;
    const crlv = cr ? 50 : 0;

    const phase = (options.palette == 'PAL')?((cr - 1) * 25.7 - 15) * (2 * 3.14159 / 360): ((cr-1)*25 - 58) * (2 * 3.14159 / 360);

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

const currentFrame = () => {
    return  workspace.frames[workspace.selectedFrame];
};

const getColorOn = (frame,col,row) => {
    const b0 = workspace.frames[frame].data[0][row];
    const b1 = workspace.frames[frame].data[1][row];
    const m0 = 0b10000000 >> col;
    const m1offset = col - options.spriteGap;
    const m1 = m1offset<0?0:0b10000000 >> m1offset;
    const c0 = (b0 & m0)?1:0;
    const c2 = (b1 & m1)?2:0;
    const c = c0 | c2;
    return getColorRGB(frame,c);
}

const setColorOn = (col,row,color) => {
        const c0 = (color & 1);
        const c1 = (color & 2);
        let c = 0;
        const m0 = 0b10000000 >> col;
        const m1offset = col - options.spriteGap;
        const m1 = m1offset<0?0:0b10000000 >> m1offset;
        if (m0) {
            currentFrame().data[0][row] = currentFrame().data[0][row] & (~m0 & 0xff) 
            if (c0) {
                currentFrame().data[0][row] = currentFrame().data[0][row] | m0
                c |= c0;
            }
        }
        if (m1) {
            currentFrame().data[1][row] = currentFrame().data[1][row] & (~m1 & 0xff) 
            if (c1) {
                currentFrame().data[1][row] = currentFrame().data[1][row] | m1
                c |= c1;
            }
        }
        drawBlock(col,row,getColorRGB(workspace.selectedFrame,c));
}

const setNewColor = (c, cval) => {
    switch (c) {
        case 0:
            workspace.backgroundColor = cval;
            break;
        case 1:
            currentFrame().colors[0] = cval;
            break;
        case 2:
            currentFrame().colors[1] = cval;
            break;
    }
    storeWorkspace();
}

const colorCellClicked = e => {
    if (player) { return false };
    cval = Number(_.last(_.split(e.target.id,'_')));
    c = Number(_.last($(e.target).parent()[0].id));
    setNewColor(c,cval);
    updateColors();
    drawEditor();
    $(".palette").remove();

}

const showPalette = c => {
    if ($(`#pal${c}`).length) {
        $(".palette").remove();
    } else {
        $(".palette").remove();
        const pal = $("<div/>")
        .attr('id',`pal${c}`)
        .addClass('palette');
        let cval = 0;
        const colors = getColors(workspace.selectedFrame);

        while (cval<256) {
            const rgb = getByteRGB(cval);
            const cellClass = (cval == colors[c])?'cellSelected':'';
            const cell = $("<div/>")
            .addClass('colorCell')
            .addClass(cellClass)
            .attr('id',`col_${cval}`)
            .attr('title',`${cval} ($${decimalToHex(cval).toUpperCase()})`)
            .css('background-color', rgb)
            .bind('mousedown',colorCellClicked)
            if (cval % 16 == 0) cell.addClass('palette_firstinrow');
    
            pal.append(cell);
            cval += 2;
        }
        $("#main").append(pal);

    }
}

const pickerClicked = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const c = Number(_.last(e.target.id));
    showPalette(c);
    //console.log(c);
}

// *********************************** EDITOR

const editorWindow = {}

let currentCell = {}

const sameCell = (c,n) => {
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
    //rect = $('#editor_canvas')[0].getBoundingClientRect();
    const x = event.offsetX; //event.clientX - rect.left;
    const y = event.offsetY; //event.clientY - rect.top;
    cell.row = Math.floor(y/editorWindow.cyoffset);
    cell.col = Math.floor(x/editorWindow.cxoffset);
    return cell;
}

const onCanvasMove = (event) => {
    if (player) { return false };
    const newCell = locateCell(event);
    if (!sameCell(currentCell,newCell)) {
        if (event.buttons > 0) {
            clickLeftOnCanvas(event);
        }
    }
}

const clickLeftOnCanvas = (event) => {
    if (player) { return false };
    let color = workspace.selectedColor;
    if (event.buttons == 2) { // right
            color = 0;
    }
    currentCell = locateCell(event);
    //console.log(`x: ${currentCell.col} y: ${currentCell.row} c: ${color}`);
    setColorOn(currentCell.col,currentCell.row,color);
}

const clickRightOnCanvas = (event) => {
    if (player) { return false };
    event.preventDefault();
    return false;
}

const drawingEnded = () => {
    drawEditor();
    storeWorkspace();
}

const onMouseOut = (e) => {
    if (player) { return false };
    if (e.buttons > 0) {
        drawingEnded();
    }
}

const newCanvas = () => {
    editorWindow.columns = 8 + options.spriteGap;
    editorWindow.cwidth = options.cellSize;
    editorWindow.cxoffset = editorWindow.cwidth + options.showGrid;
    editorWindow.cheight = Math.floor(options.cellSize / options.aspect);
    editorWindow.cyoffset = editorWindow.cheight + options.showGrid;
    editorWindow.swidth =  editorWindow.columns * editorWindow.cxoffset - options.showGrid;
    editorWindow.sheight = options.spriteHeight * editorWindow.cyoffset - options.showGrid;

    $('#editor_box').empty();
    const cnv = $('<canvas/>')
    .attr('id','editor_canvas')
    .attr('width',editorWindow.swidth)
    .attr('height',editorWindow.sheight)
    .contextmenu(clickRightOnCanvas)
    .bind('mousedown',clickLeftOnCanvas)
    .bind('mousemove',onCanvasMove)
    .bind('mouseup',drawingEnded)
    .bind('mouseleave',onMouseOut)

    $('#editor_box').append(cnv);
    editor = cnv[0].getContext('2d');
    //editor.translate(0.5, 0.5);
    //editor.imageSmoothingEnabled = false;
}

const getFrameImage = (frame, scalex, scaley) => {
    const w = (8 + options.spriteGap) * scalex;
    const h = options.spriteHeight * scaley;
    const cnv = $('<canvas/>')
    .addClass('framepreview')
    .attr('width', w)
    .attr('height', h)
    const ctx = cnv[0].getContext('2d');
    const imageData = ctx.createImageData(w, h);
    for (let row=0;row<h;row++) {
        for (let col=0;col<w;col++) {
            const crgb = getColorOn(frame, col, row);
            ctx.fillStyle = crgb;
            ctx.lineWidth = 0;
            ctx.fillRect(col*scalex,row*scaley,scalex,scaley);
        }
    }
    return cnv
}

const clearSprites = () => {
    sprite.data[0] = [];
    sprite.data[1] = [];
    for (let i=0; i<options.spriteHeight; i++) {
        sprite.data[0][i] = 0; 
        sprite.data[1][i] = 0; 
    }
}

const drawBlock = (x,y,crgb) => {
    editor.fillStyle = crgb;
    editor.lineWidth = 0;
    editor.fillRect(x * editorWindow.cxoffset - options.showGrid, y * editorWindow.cyoffset - options.showGrid, editorWindow.cwidth, editorWindow.cheight);
}

const drawEditor = () => {
    editor.clearRect(0,0,editorWindow.swidth,editorWindow.sheight);
    for (let row=0;row<options.spriteHeight;row++) {
        for (let col=0;col<editorWindow.columns;col++) {
            drawBlock(col, row, getColorOn(workspace.selectedFrame, col, row));
        }
    }
    if(options.showGrid>0) {
        drawGrid();
    }

    $("#framepreview").empty();
    $("#framepreview").append(getFrameImage(workspace.selectedFrame,2,2));
    $("#framepreview").append(getFrameImage(workspace.selectedFrame,4,2));
    $("#framepreview").append(getFrameImage(workspace.selectedFrame,8,2).addClass('clear_left'));

    $(`#fbox_${workspace.selectedFrame}`).children().last().remove();
    $(`#fbox_${workspace.selectedFrame}`).append(getFrameImage(workspace.selectedFrame,3,3));

}

const jumpToFrame = f => {
    if (workspace.frames[f]) {
        workspace.selectedFrame = f;
        drawTimeline();
        drawingEnded();
        updateColors();
    }
}

const jumpToNextFrame = () => {
    workspace.selectedFrame++;
    if (workspace.selectedFrame >= workspace.frames.length) {
        workspace.selectedFrame = 0;    
    }
    drawTimeline();
    drawingEnded();
    updateColors();
}

const jumpToPrevFrame = () => {
    workspace.selectedFrame--;
    if (workspace.selectedFrame < 0) {
        workspace.selectedFrame = workspace.frames.length - 1;    
    }
    drawTimeline();
    drawingEnded();
    updateColors();
}


const startPlayer = () => {
    if ((player == 0) && !playerInterval) {
        player = 1;
        playerInterval = setInterval(jumpToNextFrame,options.animationSpeed*20);
    }
}

const stopPlayer = () => {
    player = 0;
    clearInterval(playerInterval);
    playerInterval = null;
}

const cloneFrame = () => {
    if (player) { return false };    
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame,0,newframe);
    jumpToFrame(workspace.selectedFrame+1);
}

const animFrameLeft = () => {
    if (player) { return false };    
    if (workspace.selectedFrame == 0) {return false}
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame,1);
    workspace.frames.splice(workspace.selectedFrame-1,0,newframe);
    jumpToFrame(workspace.selectedFrame-1);
}

const animFrameRight = () => {
    if (player) { return false };    
    if (workspace.selectedFrame == workspace.frames.length-1) {return false}
    const newframe = _.cloneDeep(workspace.frames[workspace.selectedFrame]);
    workspace.frames.splice(workspace.selectedFrame,1);
    workspace.frames.splice(workspace.selectedFrame+1,0,newframe);
    jumpToFrame(workspace.selectedFrame+1);
}

const addFrame = () => {
    if (player) { return false };    
    const newframe = getEmptyFrame();
    workspace.frames.splice(workspace.selectedFrame+1,0,newframe);
    jumpToFrame(workspace.selectedFrame+1);
}

const delFrame = () => {
    if (player) { return false };    
    if (workspace.frames.length>1) {
        workspace.frames.splice(workspace.selectedFrame,1);
        if (!workspace.frames[workspace.selectedFrame]) {
            workspace.selectedFrame--;
        }
        jumpToFrame(workspace.selectedFrame);
    }
}

const frameboxClicked = e => {
    if (player) { return false };
    const f = Number(_.last(_.split(e.target.id,'_')));
    //console.log(e.target);
    jumpToFrame(f);
}

const drawTimeline = () => {
    $('#framelist').empty();
    _.each(workspace.frames, (frame,f) => {
        const cnv = getFrameImage(f,3,3)
        const framebox = $("<div/>")
        .addClass('framebox')
        .attr('id',`fbox_${f}`)
        .append(`<div>$${decimalToHex(f)}</div>`)
        .bind('mousedown',frameboxClicked)
        .append(cnv)

        if (f==workspace.selectedFrame) {
            framebox.addClass('currentFrame');
        }

        $('#framelist').append(framebox);
        //console.log(f,frame);
    });
}

const drawGridLine = (x1,y1,x2,y2) => {
    editor.beginPath();
    editor.moveTo(x1, y1);
    editor.lineTo(x2, y2);
    editor.lineWidth = options.showGrid;
    editor.strokeStyle = GRID_COLOR;
    editor.stroke();
};

const drawGrid = () => {
    for (let row=1;row<options.spriteHeight;row++) {
        const y = (editorWindow.cyoffset * row) - options.showGrid;
        drawGridLine(0,y,editorWindow.swidth,y);
    }
    for (let col=1;col<editorWindow.columns;col++) {
        const x = (editorWindow.cxoffset) * col - options.showGrid;
        drawGridLine(x,0,x,editorWindow.sheight);
    }
}

// *********************************** OPTIONS

const refreshOptions = () => {

    const opts = _.filter($("select, input"), opt => {
        return _.startsWith($(opt).attr('id'),'opt_');
    });
    const newopts = {};
    _.each(opts, opt => {
        const opt_id = $(opt).attr('id');
        const opt_name = _.split(opt_id ,'_');
        const opt_type = opt_name[2];
        const opt_val = options[opt_name[1]];
        $(`#${opt_id}`).val(opt_val);
        if (opt_type == 'b') {
            $(`#${opt_id}`).prop('checked', opt_val);
        }
    });
}

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

const clampOption = (inputId,min,max) => {
    const idiv = $(`#opt_${inputId}_i`);
    const uint = userIntParse(idiv.val());
    idiv.val(uint.clamp(min,max));
}

const validateOptions = () => {
    $('.dialog_text_input').removeClass('warn');
    if (!valIntInput('bytesPerLine')) return false;
    if (!valIntInput('spriteHeight')) return false;
    if (!valIntInput('spriteGap')) return false;
    if (!valIntInput('animationSpeed')) return false;

    clampOption('bytesPerLine',1,100000);
    clampOption('spriteHeight',1,128);
    clampOption('spriteGap',0,8);
    clampOption('animationSpeed',1,100);
    
    return true;
}

const toggleOptions = () => {
    if ($('#options_dialog').is(':visible')) {
        $('#options_dialog').slideUp();
    } else {
        refreshOptions();
        $('#options_dialog').slideDown();
    }
}

const storeOptions = () => {
    localStorage.setItem(defaultOptions.storageName, JSON.stringify(_.omit(options, dontSave)));
}

const storeWorkspace = () => {
     localStorage.setItem(`${defaultOptions.storageName}_WS`, JSON.stringify(workspace));
}

const loadOptions = () => {
    if (!localStorage.getItem(defaultOptions.storageName)) {
        options = _.assignIn({}, defaultOptions);
        storeOptions();
    } else {
        options = _.assignIn({}, defaultOptions, JSON.parse(localStorage.getItem(defaultOptions.storageName)));
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

const updateOptions = () => {
    const opts = _.filter($("select, input"), opt => {
        return _.startsWith($(opt).attr('id'),'opt_');
    });
    const newopts = {};
    _.each(opts, opt => {
        const opt_id = $(opt).attr('id');
        const opt_name = _.split(opt_id ,'_');
        let opt_value =  $(`#${opt_id}`).val();
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
        toggleOptions();
    }
    newCanvas();
    drawEditor();
    updateColors();
    if (player) {
        stopPlayer();
        startPlayer();
    }
    drawTimeline();
}


// *********************************** EXPORT


const templateChange = () => {
    updateOptions();
    exportData();
}

const toggleExport = () => {
    if ($('#export_dialog').is(':visible')) {
        $('#export_dialog').slideUp();
    } else {
        refreshOptions();
        exportData();
        $('#export_dialog').slideDown();
    }
}

const exportData = () => {
    const template = exportTemplates[$('#opt_lastTemplate_i').val()];

    //try {
        const body = parseTemplate(template);
        $('#export_frame').html(body);
        
    //} catch (error) {
//        $('#export_frame').html('Error parsing template');
//        console.log(error);
    //}
    
}



const parseTemplate = (template) => {
   
    let templateLines = '';
    let listByte = 0;
    let byteInRow = 0;
    let lineCount = 0;
    let lineBody = '';
    let tframe = 0;
    let tsprite = 0;
    let lines = '';

    const formatByte = b => {
        if (options.bytesExport == 'HEX') {
            return `${template.byte.hexPrefix}${decimalToHex(userIntParse(b))}`;
        } else {
            return b;
        }
    }

    const parseTemplateVars = (template) => {
        return template
        .replace(/#height#/g, formatByte(options.spriteHeight))
        .replace(/#gap#/g, formatByte(options.spriteGap))
        .replace(/#frames#/g, formatByte(workspace.frames.length))
        .replace(/#maxheight#/g, formatByte(options.spriteHeight-1))
        .replace(/#maxframes#/g, formatByte(workspace.frames.length-1));
            
    }

    const getBlock = (block, blockTemp) => {
        let blockLines = `${blockTemp.prefix}${block}${blockTemp.postfix}`;
        blockLines = blockLines.replace(/#f#/g, tframe).replace(/#s#/g, tsprite);
        lineCount+= blockLines.split(/\r\n|\r|\n/).length + 1;
        return blockLines
    }

    const pushBlock = (block, blockTemp) => {
        templateLines += getBlock(block, blockTemp);
    }    
    
    const pushLine = (line, last) => {
        const num = (template.line.numbers) ? `${template.line.numbers.start + template.line.numbers.step * lineCount} `:'';
        lineCount++;
        lines += `${num}${template.line.prefix}${line}${last?template.line.lastpostfix || template.line.postfix:template.line.postfix}`;
        byteInRow = 0;
        lineBody = '';
    }

    const stepByte = (last) => {
        byteInRow++;
        if (byteInRow == options.bytesPerLine || last) {
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
        pushArray(_.map(workspace.frames,f=>f.colors[s]));
        pushBlock(lines, template.colors);
    }

    const pushArray = a => {
        _.each(a,(v,i) => {pushByte(v & 0xFF, i==a.length-1)});
        if (byteInRow > 0) {
            pushLine(lineBody, true);
        }
    }

    const pushSpriteData = s => {
        let sprite = '';
        tsprite = s;
        _.each(workspace.frames, (frame,f) => {
            lines = '';
            tframe = f;
            pushArray(frame.data[s])
            sprite += getBlock(lines, template.frame);
        });   
        pushBlock(sprite, template.sprite);
    }

    pushSpriteColors(0);
    pushSpriteColors(1);
    pushSpriteData(0);
    pushSpriteData(1);

    return parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`);
}

const saveFile = () => {

    const name = prompt('set filename of saved file:', 'mysprites.spr');

    let binList = [];
    let listByte = 0;
    while (listByte<display.bytecode.length) {
        let cbyte = display.bytecode[listByte++];
        if (cbyte == '#') {
            let caddr = display.bytecode[listByte];
            let address = Number(userIntParse(caddr));
            binList.push(address & 0xFF);
            listByte++;
            binList.push((address & 0xFF00)>>8);
        } else {
            binList.push(Number(userIntParse(cbyte)) & 0xFF);
        }
    }
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
    dropFile(file)
};


const parseBinary = (binData) => {

    const parseError = msg => {
        alert(msg);
    }
    const list = [];
    const binSize = binData.length;
    let binPtr = 0;
    let id = 0;
    while(binPtr < binSize) {
        let newRow = true;
        const opcode = binData[binPtr++];
        const remains = binSize - binPtr;
        const row = {
            hex: decimalToHex(opcode),
            opcode: opcode,
            antic: opcode,
            DLI: opcode & 128,
            id: id,
            address: null
        };
        if (isJump(row)) {
            row.mode = getModeFromAntic(opcode & 0x41);
        }
        if (isBlank(row)) {
            row.mode = getModeFromAntic(opcode & 0x70);
        }
        if (isScreenLine(row)) {
            row.LMS = opcode & 64;
            row.vscroll = opcode & 32;
            row.hscroll = opcode & 16;
            row.mode = getModeFromAntic(opcode & 0x0f);
        }
        if (!row.mode) {
            parseError(`Parsing error. Unknown mode: ${opcode}`);
            return false;
        }
        _.assignIn(row, DLmodes[row.mode]);

        if (needsAddress(row)) {
            if (remains < 2) {
                parseError('Parsing error. File ended on expected address');
                return false;
            }
            const lbyte = binData[binPtr++];
            const hbyte = binData[binPtr++];
            row.address = (hbyte * 256) + lbyte;
            if (options.bytesExport == 'HEX') row.address = `$${decimalToHex(row.address)}`;
        }
        row.count = 1;
        row.step = '0';

        if (list.length > 0) {                     
            const last = _.last(list);

            // check for repeats
            if (last.opcode == row.opcode) {
                if (last.address == row.address) {
                    last.count++;
                    newRow = false;
                } else {
                    let laststep = Number(last.step) * last.count;
                    let curstep = userIntParse(row.address) - userIntParse(last.address);
                    if (laststep == 0) {
                        last.count++;
                        last.step = curstep;
                        newRow = false;
                    } else {
                        if (laststep == curstep) {
                            last.count++;
                            newRow = false;
                        }
                    }
                }
            }
        } 
        
        if (newRow) {
            list.push(updateModeParams(row));
            id++;
        }

        if (options.stopAtJump && isJump(row)) {
            binPtr = binSize;
        }
    }
    return list;
}

const dropFile = function (file) {
    if (file) {
        var reader = new FileReader();
        reader.onload = function () {
            var arrayBuffer = reader.result;
            if (file.size > (options.fileSizeLimit * 1024)) {
                alert(`ERROR!!!\n\nFile size limit exceeded. Size: ${file.size} B - limit: ${options.fileSizeLimit} kB`);
                return false;
            }
            const binFileName = file.name;
            const binFileData = new Uint8Array(arrayBuffer);
            newList = parseBinary(binFileData);
            if (newList) {
                display.list = newList;
                redrawList();
                updateListStatus();
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

const closeAllDialogs = () => {
    $('div.dialog:visible').slideUp();
}

const clearFrame = () => {
    if (player) { return false };
    for (let r=0;r<options.spriteHeight;r++) {
        currentFrame().data[0][r] = 0;
        currentFrame().data[1][r] = 0;
    }
    drawingEnded();
}

const copyFrame = () => {
    if (player) { return false };
    workspace.clipBoard = _.cloneDeep(currentFrame());
}

const pasteFrame = () => {
    if (player) { return false };
    if (workspace.clipBoard) {
        workspace.frames[workspace.selectedFrame] = _.cloneDeep(workspace.clipBoard);
    }
    drawingEnded();
}

const keyPressed = e => {
    switch (e.code) {
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
        case 'Digit0':
        case 'Backquote':
                colorClicked(0);
        break;
        case 'Space':
            if (player) {
                stopPlayer();
            } else {
                startPlayer();
            }
        break;
        case 'ArrowRight': 
            if (!player) {
                jumpToNextFrame();
            }
        break;
        case 'ArrowLeft': 
            if (!player) {
                jumpToPrevFrame();
            }
        break;
        case 'Escape':
            closeAllDialogs();
        break;

        default:
            break;
    }
    console.log(e.code);
}

const flip8Bits = (b) => {
    return reversedBytes[b];
}


const flipHFrame = () => {
    if (player) { return false };
    for (let row=0;row<options.spriteHeight;row++){
        const b0 = reversedBytes[workspace.frames[workspace.selectedFrame].data[0][row]];
        const b1 = reversedBytes[workspace.frames[workspace.selectedFrame].data[1][row]];
        if (options.spriteGap > 0) {
            workspace.frames[workspace.selectedFrame].data[0][row] = b1;
            workspace.frames[workspace.selectedFrame].data[1][row] = b0;
            const c = workspace.frames[workspace.selectedFrame].colors[0];
            workspace.frames[workspace.selectedFrame].colors[0] = workspace.frames[workspace.selectedFrame].colors[1];
            workspace.frames[workspace.selectedFrame].colors[1] = c;
            updateColors();
        } else {
            workspace.frames[workspace.selectedFrame].data[0][row] = b0;
            workspace.frames[workspace.selectedFrame].data[1][row] = b1;
        }
   }
    drawingEnded();
}

const flipVFrame = () => {
    if (player) { return false };
    let first = 0;
    let last = options.spriteHeight - 1;
    while (first<last) {
        const last0 = workspace.frames[workspace.selectedFrame].data[0][last];
        const last1 = workspace.frames[workspace.selectedFrame].data[1][last];
        workspace.frames[workspace.selectedFrame].data[0][last] = workspace.frames[workspace.selectedFrame].data[0][first];
        workspace.frames[workspace.selectedFrame].data[1][last] = workspace.frames[workspace.selectedFrame].data[1][first];
        workspace.frames[workspace.selectedFrame].data[0][first] = last0;
        workspace.frames[workspace.selectedFrame].data[1][first] = last1;
        last--;
        first++;
    }
    drawingEnded();
}

const moveFrameLeft = () => {
    if (player) { return false };
    for (let row=0;row<options.spriteHeight;row++){
        const b0 = (workspace.frames[workspace.selectedFrame].data[0][row] << 1) & 0xff;
        const b1 = (workspace.frames[workspace.selectedFrame].data[1][row] << 1) & 0xff;
        workspace.frames[workspace.selectedFrame].data[0][row] = b0;
        workspace.frames[workspace.selectedFrame].data[1][row] = b1;
    }
    drawingEnded();
}

const moveFrameRight = () => {
    if (player) { return false };
    for (let row=0;row<options.spriteHeight;row++){
        const b0 = (workspace.frames[workspace.selectedFrame].data[0][row] >> 1) & 0xff;
        const b1 = (workspace.frames[workspace.selectedFrame].data[1][row] >> 1) & 0xff;
        workspace.frames[workspace.selectedFrame].data[0][row] = b0;
        workspace.frames[workspace.selectedFrame].data[1][row] = b1;
    }
    drawingEnded();
}
const moveFrameUp = () => {
    if (player) { return false };
    workspace.frames[workspace.selectedFrame].data[0].length = options.spriteHeight;
    workspace.frames[workspace.selectedFrame].data[1].length = options.spriteHeight;
    const b0 = workspace.frames[workspace.selectedFrame].data[0].shift();
    const b1 = workspace.frames[workspace.selectedFrame].data[1].shift();
    workspace.frames[workspace.selectedFrame].data[0].push(options.wrapEditor?b0:0);
    workspace.frames[workspace.selectedFrame].data[1].push(options.wrapEditor?b1:0);
    drawingEnded();
}
const moveFrameDown = () => {
    if (player) { return false };
    workspace.frames[workspace.selectedFrame].data[0].length = options.spriteHeight;
    workspace.frames[workspace.selectedFrame].data[1].length = options.spriteHeight;
    const b0 = workspace.frames[workspace.selectedFrame].data[0].pop();
    const b1 = workspace.frames[workspace.selectedFrame].data[1].pop();
    workspace.frames[workspace.selectedFrame].data[0].unshift(options.wrapEditor?b0:0);
    workspace.frames[workspace.selectedFrame].data[1].unshift(options.wrapEditor?b1:0);
    drawingEnded();
}


// ************************************************  ON START INIT 

$(document).ready(function () {

    loadOptions();
    const app = gui(options, dropFile);
    refreshOptions();
    $('title').append(` v.${options.version}`);
    app.addMenuFileOpen('Load', openFile, 'appmenu', 'Loads Display List binary file');
    app.addMenuItem('Save', saveFile, 'appmenu', 'Saves Display List as a binary file');
    app.addMenuItem('Export', toggleExport, 'appmenu', 'Exports Display List to various formats');
    app.addSeparator('appmenu');
    // app.addMenuItem('Button', drawEditor, 'appmenu', 'does smth');
    // app.addSeparator('appmenu');
    app.addMenuItem('Options', toggleOptions, 'appmenu', 'Shows Options');
    app.addSeparator('appmenu');
    const ver = $('<div/>').attr('id','ver').html(`SprEd v.${options.version}`);
    $('#appmenu').append(ver);

    app.addMenuItem('Clear', clearFrame, 'framemenu', 'Clears current frame');
    app.addMenuItem('Copy', copyFrame, 'framemenu', 'Copies from current frame');
    app.addMenuItem('Paste', pasteFrame, 'framemenu', 'Pastes into current frame');
    app.addSeparator('framemenu');
    app.addMenuItem('Flip-H', flipHFrame, 'framemenu', 'Flips frame horizontally');
    app.addMenuItem('Flip-V', flipVFrame, 'framemenu', 'Flips frame vertically');
    app.addSeparator('framemenu');
    app.addMenuItem('🡄', moveFrameLeft, 'framemenu', 'Moves frame contents left');
    app.addMenuItem('🡆', moveFrameRight, 'framemenu', 'Moves frame contents right');
    app.addMenuItem('🡅', moveFrameUp, 'framemenu', 'Moves frame contents up');
    app.addMenuItem('🡇', moveFrameDown, 'framemenu', 'Moves frame contents down');

    app.addMenuItem('⏵︎', startPlayer, 'timemenu', 'Starts Animation [Space]');
    app.addMenuItem('⏹︎', stopPlayer, 'timemenu', 'Stops Animation [Space]');
    // app.addMenuItem('-', null, 'timemenu', 'Adds new empty frame');
    // app.addMenuItem('+', null, 'timemenu', 'Adds new empty frame');
    app.addSeparator('timemenu');
    app.addMenuItem('Add', addFrame, 'timemenu', 'Adds new empty frame');
    app.addMenuItem('Clone', cloneFrame, 'timemenu', 'Adds copy of frame');
    app.addMenuItem('Delete', delFrame, 'timemenu', 'Deletes current frame');
    app.addSeparator('timemenu');
    app.addMenuItem('🡄', animFrameLeft, 'timemenu', 'Moves current frame left');
    app.addMenuItem('🡆', animFrameRight, 'timemenu', 'Moves current frame right');
    

    $('.colorbox').bind('mousedown',(e)=> {
        colorClicked(Number(_.last(e.target.id)));
    })

    for (let c=0;c<3;c++) {
        const picker = $("<div/>");
        picker.attr('id',`picker${c}`)
        .addClass('picker')
        .bind('mousedown',pickerClicked);
        $(`#color${c}`).append(picker);
    }

    $("#main").bind('mousedown',()=>{$(".palette").remove()})

    loadWorkspace();
    newCanvas();
    drawEditor();
    updateColors();
    
    drawTimeline();

    document.addEventListener('keydown', keyPressed);

});
