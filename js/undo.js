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
            if (undos.length > 50) {
                undos.shift();
            }
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
