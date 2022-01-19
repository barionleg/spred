const defaultOptions = {
    version: '0.11',
    storageName: 'SprEdStore001',
    aspect: 2,
    spriteHeight: 16,
    spriteGap: 4,
    showGrid: 1,
    cellSize: 24,
    palette: 'PAL',
    bytesExport: 'HEX',
    bytesPerLine: 10
}
let options = {};
let editor = null;
const dontSave = ['version', 'storageName'];

const state = {
    selectedColor:1,
    backgroundColor:0
}

const sprite = {
    data0: [],
    data1: [],
    colors: [0x24,0xba]
}


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

// *********************************** COLORS

const getColors = () => {
    return [
        state.backgroundColor,
        sprite.colors[0],
        sprite.colors[1],
        sprite.colors[0] | sprite.colors[1]
    ];
}

const updateColors = colors => {
    if (colors==undefined) {
        colors = getColors();
    }
    for (let i=0;i<4;i++) {
        $(`#color${i}`).css('background-color',getByteRGB(colors[i]))
    }
    colorClicked(state.selectedColor);
}

const colorClicked = (c) => {
    state.selectedColor = c;
    $('.colorbox').removeClass('colorSelected');
    $(`#color${c}`).addClass('colorSelected');
}

const getColorRGB = c => {
    const colors = getColors();
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

const getColorOn = (col,row) => {
    const b0 = sprite.data0[row];
    const b1 = sprite.data1[row];
    const m0 = 0b10000000 >> col;
    const m1offset = col - options.spriteGap;
    const m1 = m1offset<0?0:0b10000000 >> m1offset;
    const c0 = (b0 & m0)?1:0;
    const c2 = (b1 & m1)?2:0;
    const c = c0 | c2;
    return getColorRGB(c);
}

const setColorOn = (col,row,color) => {
        const c0 = (color & 1);
        const c1 = (color & 2);
        let c = 0;
        const m0 = 0b10000000 >> col;
        const m1offset = col - options.spriteGap;
        const m1 = m1offset<0?0:0b10000000 >> m1offset;
        if (m0) {
            sprite.data0[row] = sprite.data0[row] & (~m0 & 0xff) 
            if (c0) {
                sprite.data0[row] = sprite.data0[row] | m0
                c |= c0;
            }
        }
        if (m1) {
            sprite.data1[row] = sprite.data1[row] & (~m1 & 0xff) 
            if (c1) {
                sprite.data1[row] = sprite.data1[row] | m1
                c |= c1;
            }
        }
        drawBlock(col,row,getColorRGB(c));
}

const setNewColor = (c, cval) => {
    switch (c) {
        case 0:
            state.backgroundColor = cval;
            break;
        case 1:
            sprite.colors[0] = cval;
            break;
        case 2:
            sprite.colors[1] = cval;
            break;
    }
}

const colorCellClicked = e => {
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
        while (cval<256) {
            const c = getByteRGB(cval);
            const cell = $("<div/>")
            .addClass('colorCell')
            .attr('id',`col_${cval}`)
            .attr('title',`${cval}`)
            .css('background-color', c)
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
    const newCell = locateCell(event);
    if (!sameCell(currentCell,newCell)) {
        if (event.buttons > 0) {
            clickLeftOnCanvas(event);
        }
    }
}

const clickLeftOnCanvas = (event) => {
    let color = state.selectedColor;
    if (event.buttons == 2) { // right
            color = 0;
    }
    currentCell = locateCell(event);
    //console.log(`x: ${currentCell.col} y: ${currentCell.row} c: ${color}`);
    setColorOn(currentCell.col,currentCell.row,color);
}

const clickRightOnCanvas = (event) => {
    event.preventDefault();
    return false;
}

const onMouseOut = (e) => {
    if (e.buttons > 0) {
        drawEditor();
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
    .bind('mouseup',drawEditor)
    .bind('mouseleave',onMouseOut)

    $('#editor_box').append(cnv);
    editor = cnv[0].getContext('2d');
    //editor.translate(0.5, 0.5);
    //editor.imageSmoothingEnabled = false;
}

const clearSprites = () => {
    sprite.data0 = [];
    sprite.data1 = [];
    for (let i=0; i<options.spriteHeight; i++) {
        sprite.data0[i] = 0; 
        sprite.data1[i] = 0; 
    }
}



const drawBlock = (x,y,crgb) => {
    editor.fillStyle = crgb;
    editor.lineWidth = 0;
    editor.fillRect(x * editorWindow.cxoffset - options.showGrid, y * editorWindow.cyoffset - options.showGrid, editorWindow.cwidth, editorWindow.cheight);
}

const drawGridLine = (x1,y1,x2,y2) => {
    editor.beginPath();
    editor.moveTo(x1, y1);
    editor.lineTo(x2, y2);
    editor.lineWidth = options.showGrid;
    editor.strokeStyle = 'rgba(200,200,200,0.3)';
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

const drawEditor = () => {
    editor.clearRect(0,0,editorWindow.swidth,editorWindow.sheight);
    for (let row=0;row<options.spriteHeight;row++) {
        for (let col=0;col<editorWindow.columns;col++) {
            drawBlock(col, row, getColorOn(col, row));
        }
    }

    if(options.showGrid>0) {
        drawGrid();
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
    uint = userIntParse($(`#${inputId}`).val());
    if (_.isNaN(uint)) {
        $(`#${inputId}`).addClass('warn').focus();
        return false;
    };
    $(`#${inputId}`).val(uint);
    return true;
}

const validateOptions = () => {
    $('.dialog_text_input').removeClass('warn');
    //if (!valIntInput('bytes_per_line')) return false;
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

// const storeDisplay = () => {
//     localStorage.setItem(`${defaultOptions.storageName}_DL`, JSON.stringify(display));
// }

const loadOptions = () => {
    if (!localStorage.getItem(defaultOptions.storageName)) {
        options = _.assignIn({}, defaultOptions);
        storeOptions();
    } else {
        options = _.assignIn({}, defaultOptions, JSON.parse(localStorage.getItem(defaultOptions.storageName)));
    }
}

// const loadDisplay = () => {
//     if (!localStorage.getItem(`${defaultOptions.storageName}_DL`)) {
//         display = _.assignIn({}, _.clone(defaultDisplay));
//         storeDisplay();
//     } else {
//         display = _.assignIn({}, _.clone(defaultDisplay), JSON.parse(localStorage.getItem(`${defaultOptions.storageName}_DL`)));

//     }
// }

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
    // const {error, warnings} = parseAndValidate(template);
    // if (error) {
    //     $('#export_frame').html(warnings.replace(/<br>/g,"\n"));
    //     return null;
    // }
    // const body = parseTemplate(template);
    // $('#export_frame').html(body);
}

const parseTemplateVars = (template, size) => {
    return template
        .replace(/#size#/g, size)
        .replace(/#max#/g, size - 1);
}

const parseTemplate = (template) => {
   
    let templateLines = '';
    let listByte = 0;
    let byteInRow = 0;
    let lineCount = 0;
    let lineBody = '';
    const pushLine = line => {
        const num = (template.line.numbers) ? `${template.line.numbers.start + template.line.numbers.step * lineCount} `:'';
        templateLines += `${num}${template.line.prefix}${line}${listByte == display.bytecode.length? template.line.lastpostfix || template.line.postfix : template.line.postfix}`;
        lineCount++;
    }
    const stepByte = () => {
        byteInRow++;
        if (byteInRow == options.bytesPerLine || listByte == display.bytecode.length) {
            byteInRow = 0;
            pushLine(lineBody);
            lineBody = '';
        } else lineBody += template.byte.separator;
    }
    const pushByte = b => {
        if (options.bytesExport == 'HEX') {
            lineBody += `${template.byte.hexPrefix}${decimalToHex(userIntParse(b))}`;
        } else {
            lineBody += b;
        }
        stepByte();
    }
    const pushAddress = a => {
        let addr = isDecOrHexInteger(a) ? userIntParse(a) : a;
        if (options.bytesExport == 'HEX' && isDecOrHexInteger(addr)) {
            addr = `${template.byte.hexPrefix}${decimalToHex(userIntParse(a),4)}`;
        }
        lineBody += `${template.byte.addrPrefix}${addr}${template.byte.addrPostfix}`
        stepByte();
    }

    while (listByte<display.bytecode.length) {
        let cbyte = display.bytecode[listByte++];
        if (cbyte == '#') {
            let caddr = display.bytecode[listByte];
            if (template.byte.forceNumeric) {
                let address = Number(userIntParse(caddr));
                pushByte(address & 0xFF);
                listByte++;
                pushByte((address & 0xFF00)>>8);
            } else {
                listByte++;
                pushAddress(caddr);
            }
        } else {
            pushByte(cbyte);
        }
    }

    if (byteInRow > 0) pushLine(lineBody);

    return parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`, display.bytecode.length);
}

const saveFile = () => {
    bintmp = {
        name:'Binary Export',
        block: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '', postfix: ','
        },
        byte: {
            forceNumeric: true, separator: ',',
            hexPrefix: '$'
        }
    };
    const {error, warnings} = parseAndValidate(bintmp);
    if (error) {
        alert(warnings.replace('<br>',''));
        return null;
    }

    if (display.bytecode.length == 0) {
        alert('Saving empty file is pointless...');
        return null;
    }

    const name = prompt('set filename of saved file:', 'display_list.bin');

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


// ************************************************  ON START INIT 

$(document).ready(function () {

    loadOptions();
    const app = gui(options, dropFile);
    refreshOptions();
    $('title').append(` v.${options.version}`);
    app.addMenuFileOpen('Load', openFile, 'listmenu', 'Loads Display List binary file');
    app.addMenuItem('Save', saveFile, 'listmenu', 'Saves Display List as a binary file');
    app.addMenuItem('Export', toggleExport, 'listmenu', 'Exports Display List to various formats');
    app.addSeparator('listmenu');
    // app.addMenuItem('Button', drawEditor, 'listmenu', 'does smth');
    // app.addSeparator('listmenu');
    app.addMenuItem('Options', toggleOptions, 'listmenu', 'Shows Options');
    app.addSeparator('listmenu');
    const ver = $('<div/>').attr('id','ver').html(`SprEd v.${options.version}`);
    $('#listmenu').append(ver);

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

    clearSprites();
    newCanvas();
    drawEditor();
    updateColors();


});
