
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
    if (!valIntInput('gifExportScale')) return false;
    if (!valIntInput('backOffsetH')) return false;
    if (!valIntInput('backOffsetV')) return false;
    if (!valIntInput('backOffset')) return false;
    if (!valIntInput('backImageWidth')) return false;
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
    clampOption('gifExportScale', 1, 32);
    clampOption('backOffsetH', 0, 4);
    clampOption('backOffsetV', 0, 4);
    clampOption('backOffset', 0, MAX_FILESIZE);
    clampOption('backImageWidth', 0, 40);

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
        if (!isPlayer23Mode()) {
            options.linkColors = 0;
        };
        closeAllDialogs();
    }
    newCanvas();
    if (animationOn) {
        stopPlayer();
        startPlayer();
    }
    updateScreen();
}
