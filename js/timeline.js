const jumpToFrame = f => {
    if (workspace.frames[f]) {
        workspace.selectedFrame = f;
        updateScreen();
    }
}

const jumpToNextMovieFrame = () => {
    workspace.selectedFrame++;
    if (!movieLoop) {
        if (workspace.selectedFrame >= workspace.frames.length) {
            workspace.selectedFrame = 0;
        }
        if (penDown) {
            drawPix(workspace.selectedFrame, currentCell.col, currentCell.row, currentCell.color);
        }
    } else {
        if (workspace.selectedFrame > movieLoop[1]) {
            workspace.selectedFrame = movieLoop[0];
        }
    }
    drawEditor();
    updateColors();
    updateLayers();
    updateMovieCursor();
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
        clearFrame(0);
        fixWorkspace();
        storeWorkspace();
        _.remove(undos);
        _.remove(redos);
        storeUndos();
        updateScreen();
    }
    return true;
}


const playerRunner = () => {
    jumpToNextMovieFrame();
    const frameDelay = options.frameDelayMode ? workspace.frames[workspace.selectedFrame].delayTime : options.animationSpeed;
    playerTimeout = setTimeout(playerRunner, frameDelay * 20);
}

const startPlayer = () => {
    if ((animationOn == 0) && !playerTimeout && (workspace.frames.length > 1)) {
        animationOn = 1;
        $("#timeline li").first().addClass('red');
        const frameDelay = options.frameDelayMode ? workspace.frames[workspace.selectedFrame].delayTime : options.animationSpeed;
        playerTimeout = setTimeout(playerRunner, frameDelay * 20);
    }
}

const stopPlayer = () => {
    animationOn = 0;
    clearTimeout(playerTimeout);
    $("#timeline li").first().removeClass('red');
    playerTimeout = null;
}

const cloneFrame = () => {
    if (animationOn) { return false };
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    const len = last - first + 1;
    for (let f = first; f <= last; f++) {
        const newframe = _.cloneDeep(workspace.frames[f]);
        workspace.frames.splice(f + len, 0, newframe);
    }
    if (options.multiFrameEdit && movieLoop) {
        movieLoop[0] += len;
        movieLoop[1] += len;
    }
    jumpToFrame(workspace.selectedFrame + len);
    storeWorkspace();
    return true;
}

const animFrameLeft = () => {
    if (animationOn) { return false };
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    if (first == 0) { return false }
    const frame = _.cloneDeep(workspace.frames[first - 1]);
    workspace.frames.splice(first - 1, 1);
    workspace.frames.splice(last, 0, frame);
    if (options.multiFrameEdit && movieLoop) {
        movieLoop[0]--;
        movieLoop[1]--;
    }
    jumpToFrame(workspace.selectedFrame - 1);
    storeWorkspace();
}

const animFrameRight = () => {
    if (animationOn) { return false };
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    if (last == workspace.frames.length - 1) { return false }
    const frame = _.cloneDeep(workspace.frames[last + 1]);
    workspace.frames.splice(last + 1, 1);
    workspace.frames.splice(first, 0, frame);
    if (options.multiFrameEdit && movieLoop) {
        movieLoop[0]++;
        movieLoop[1]++;
    }
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
    const [first, last] = (options.multiFrameEdit && movieLoop) ? movieLoop : [workspace.selectedFrame, workspace.selectedFrame];
    const len = last - first + 1;
    if (workspace.frames.length > len) {
        workspace.frames.splice(first, len);
        workspace.selectedFrame = first;
        if (!workspace.frames[first]) {
            workspace.selectedFrame--;
        }
        jumpToFrame(workspace.selectedFrame);
    }
    storeWorkspace();
    return true;
}
