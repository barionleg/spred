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
        blockLines = blockLines.replace(/#f#/g, tframe).replace(/#s#/g, tsprite).replace(/#d#/g, tdli.toUpperCase()).replace(/#lp#/g, options.labelPrefix);
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
        tsprite = 'MIS';
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
        const dliList = isPlayer23Mode()?dliMap:dliMap.slice(0,3);
        for (tdli of dliList) {
            let dli = '';
            _.each(workspace.frames, (frame, f) => {
                lines = '';
                tframe = f;
                pushArray(frame.dli[tdli]);
                dli += getBlock(lines, template.frameNoLabel || template.frame);
            });
            pushBlock(dli, template.dli);
        }
    }

    const pushFrameDelayData = () => {
        lines = '';
        pushArray(_.map(workspace.frames, f => f.delayTime));
        pushBlock(lines, template.frameDelays);
    }

    let parsed = null;

    if (template.mode==0) { // order by sprite
        for (let p = 0; p < playerCount(); p++) { pushSpriteColors(p) };

        for (let p = 0; p < playerCount(); p++) { pushSpriteData(p) };
    
        if (isMissileMode()) { pushMissileData() };
    
        if (options.dliOn) { pushDliData() };
    
        if (options.frameDelayMode) { pushFrameDelayData() };
    
        parsed = isPlayer23Mode() ?
            parseTemplateVars(`${template.block.prefix23 || template.block.prefix}${templateLines}${template.block.postfix}`) :
            parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`);
    }

    if (template.mode==1) { // order by frame
        _.each(workspace.frames, (frame, f) => {
            tframe = f;
            lines = '';
            frame.player[0].length = options.spriteHeight;
            frame.missile[0].length = options.spriteHeight;
            const data = [
                ...frame.player[0],
                ...frame.player[1],
                ...frame.missile[0].map((m0,r)=>(m0 | (frame.missile[1][r]<<2))),
                frame.colors[0],frame.colors[1]
            ]
            pushArray(data);
            const sprite = getBlock(lines, template.sprite);
            pushBlock(sprite, template.frame);
        });

        parsed = isPlayer23Mode() ?
            parseTemplateVars(`${template.block.prefix23 || template.block.prefix}${templateLines}${template.block.postfix}`) :
            parseTemplateVars(`${template.block.prefix}${templateLines}${template.block.postfix}`);


    }

    return parsed;
}

const getFrameImage = (frame, scalex, scaley) => {
    scalex *= getWidthMultiplier();
    const w = Math.floor(editorWindow.columns * scalex);
    const h = Math.floor(editorWindow.rows * scaley);
    const cnv = $('<canvas/>')
        .addClass('framepreview')
        .attr('width', w)
        .attr('height', h)
    const ctx = cnv[0].getContext('2d');
    //ctx.translate(0.5, 0.5);
    //ctx.imageSmoothingEnabled = false;
    const imageData = ctx.createImageData(w, h);
    for (let row = 0; row < editorWindow.rows; row++) {
        for (let col = 0; col < editorWindow.columns; col++) {
            const crgb = getRGBOn(frame, col, row);
            ctx.fillStyle = crgb;
            ctx.lineWidth = 0;
            ctx.fillRect(Math.ceil(col * scalex), row * scaley, Math.ceil(scalex), Math.ceil(scaley));
        }
    }
    return cnv
}
