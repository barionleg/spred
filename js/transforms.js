
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
        const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
        for (let f = first; f <= last; f++) {
            for (k in workspace.clipBoard.frame.player) {
                if (isPlayerActive(k) && workspace.clipBoard.frame.player[k]) {
                    workspace.frames[f].player[k] = _.cloneDeep(workspace.clipBoard.frame.player[k]);
                    workspace.frames[f].missile[k] = _.cloneDeep(workspace.clipBoard.frame.missile[k]);
                    workspace.frames[f].colors[k] = workspace.clipBoard.frame.colors[k];
                }
            };
        }
        updateScreen();
        storeWorkspace();
    }
    return true;
}

const clearFrame = frame => {
    if (animationOn) { return false };
    let [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    if (frame != undefined) { [first, last] = [frame, frame] }
    for (let f = first; f <= last; f++) {
        for (let r = 0; r < options.spriteHeight; r++) {
            for (p = 0; p < 4; p++) {
                if (isPlayerActive(p)) {
                    workspace.frames[f].player[p][r] = 0;
                    workspace.frames[f].missile[p][r] = 0;
                }
            }
        }
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const swapPairs = () => {
    if (animationOn) { return false };

    if (isPlayer23Mode()) {
        const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
        for (let f = first; f <= last; f++) {
            const cframe = workspace.frames[f];
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
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = first; f <= last; f++) {

        const cf = workspace.frames[f];
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
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const flipVFrame = () => {
    if (animationOn) { return false };
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {

        let first = 0;
        let last = options.spriteHeight - 1;
        while (first < last) {
            for (p = 0; p < playerCount(); p++) {
                if (isPlayerActive(p)) {
                    let last0 = workspace.frames[f].player[p][last];
                    workspace.frames[f].player[p][last] = workspace.frames[f].player[p][first];
                    workspace.frames[f].player[p][first] = last0;

                    last0 = workspace.frames[f].missile[p][last];
                    workspace.frames[f].missile[p][last] = workspace.frames[f].missile[p][first];
                    workspace.frames[f].missile[p][first] = last0;
                }
            }
            if (options.dliOn) {
                const cframe = workspace.frames[f];
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
    const tempframeNum = workspace.frames.length;
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {
        workspace.frames[tempframeNum] = _.cloneDeep(workspace.frames[f]);
        clearFrame(f);
        for (let row = 0; row < options.spriteHeight; row++) {
            for (let col = 0; col < editorWindow.columnsActive; col++) {
                let target = col + dir;
                let clear = false;
                if (target < 0) {
                    if (!options.wrapEditor) { clear = true }
                    target = editorWindow.columnsActive - 1;
                };
                if (target == editorWindow.columnsActive) {
                    if (!options.wrapEditor) { clear = true }
                    target = 0;
                };
                setColorOn(f, target, row, clear ? 0 : moveColor(getColorOn(tempframeNum, col + options.backOffsetH, row + options.backOffsetV), col, target));
            }
        }
        workspace.frames.pop();
    }
    updateScreen();
    storeWorkspace();
    options.ORDrawsOutside = prevOrState;
    return true;
}

const moveFrameContentsLeft = () => {
    return moveFrame(-1);
}

const moveFrameContentsRight = () => {
    return moveFrame(1)
}

const moveFrameContentsUp = () => {
    if (animationOn) { return false };
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {
        for (p = 0; p < playerCount(); p++) {
            if (isPlayerActive(p)) {
                workspace.frames[f].player[p].length = options.spriteHeight;
                let b0 = workspace.frames[f].player[p].shift();
                workspace.frames[f].player[p].push(options.wrapEditor ? b0 : 0);

                workspace.frames[f].missile[p].length = options.spriteHeight;
                b0 = workspace.frames[f].missile[p].shift();
                workspace.frames[f].missile[p].push(options.wrapEditor ? b0 : 0);
            }
        }
        if (options.dliOn) {
            const cframe = workspace.frames[f];
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
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const moveFrameContentsDown = () => {
    if (animationOn) { return false };
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {
        for (p = 0; p < playerCount(); p++) {
            if (isPlayerActive(p)) {
                workspace.frames[f].player[p].length = options.spriteHeight;
                workspace.frames[f].missile[p].length = options.spriteHeight;
                let b0 = workspace.frames[f].player[p].pop();
                workspace.frames[f].player[p].unshift(options.wrapEditor ? b0 : 0);
                b0 = workspace.frames[f].missile[p].pop();
                workspace.frames[f].missile[p].unshift(options.wrapEditor ? b0 : 0);
            }
        }
        if (options.dliOn) {
            const cframe = workspace.frames[f];
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
    }

    updateScreen();
    storeWorkspace();
    return true;
}

const heightDown = () => {
    if (animationOn) { return false };
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {
        for (p = 0; p < playerCount(); p++) {
            if (isPlayerActive(p)) {
                let s0 = workspace.frames[f].player[p]
                workspace.frames[f].player[p] = _.filter(s0, (v, k) => (k % 2 == 0));
                s0 = workspace.frames[f].missile[p]
                workspace.frames[f].missile[p] = _.filter(s0, (v, k) => (k % 2 == 0));
            }
        }
    }
    updateScreen();
    storeWorkspace();
    return true;
}

const heightUp = () => {
    if (animationOn) { return false };
    const [rfirst, rlast] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    for (let f = rfirst; f <= rlast; f++) {
        for (p = 0; p < playerCount(); p++) {
            if (isPlayerActive(p)) {
                let s0 = workspace.frames[f].player[p]
                workspace.frames[f].player[p] = _.flatMap(s0, v => [v, v]);
                s0 = workspace.frames[f].missile[p]
                workspace.frames[f].missile[p] = _.flatMap(s0, v => [v, v]);
            }
        }
    }
    updateScreen();
    storeWorkspace();
    return true;
}
