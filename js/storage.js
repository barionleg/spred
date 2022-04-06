
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