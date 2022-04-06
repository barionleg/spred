// ************************************ KEY BINDINGS

const keyPressed = e => {               // always working
    if (!libraryOpened) {
        switch (e.code) {
            case 'KeyE':
                if (e.ctrlKey) {
                    e.preventDefault();
                    toggleExport();
                };
                break;
        }
    }
    if (($('.dialog:visible').length == 0) && (!libraryOpened)) { // editor only
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
                if (libraryOpened) {
                    saveOptions();
                    librarySearch();
                }
                break;


            default:
                break;
        }
    }
    //console.log(e.code);
}
