
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
        'dliOn',
        'frameDelayMode',
        'commonPalette'
    ];
    const toLoad = libraryContents.data[item];
    for (let opt of optToLoad) {
        options[opt] = toLoad.spriteOptions[opt] !== undefined ? toLoad.spriteOptions[opt] : defaultOptions[opt];
    }
    undos = [];
    redos = [];
    options.showBackground = 0;
    if (workspace.backgroundImage) {
        delete(workspace.backgroundImage);
    }
    storeUndos();
    storeOptions();
    workspace.backgroundColor = toLoad.spriteData.backgroundColor;
    workspace.frames = _.cloneDeep(toLoad.spriteData.frames);
    fixWorkspace();
    storeWorkspace();
    stopPlayer();
    newCanvas();
    library.lastLoaded = toLoad._id ? toLoad._id : '';
    library.authorName = toLoad.authorName ? toLoad.authorName : '';
    library.spriteName = toLoad.spriteName ? toLoad.spriteName : '';
    library.description = toLoad.description ? toLoad.description : '';
    closeLibrary();
}

const librarySearch = () => {
    updateOptions();
    libraryPage = 0;
    getLibraryData(libraryPage);
}

const libraryReset = () => {
    options.libSearchQuery = '';
    libraryPage = 0;
    refreshOptions();
    updateOptions();
    getLibraryData(libraryPage);
}


const libraryClick = e => {
    const itemNum = Number(_.last(_.split(e.currentTarget.id, '_')));
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
    const filter = options.libSearchQuery;
    const sort = options.libSearchSort;
    const dir = options.libSearchDir == 'asc' ? 1 : -1
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://spred-c23d.restdb.io/rest/sprites?totals=true&filter=${filter}&sort=${sort}&dir=${dir}&skip=${skip}&max=${LIBRARY_SPR_PER_PAGE}`,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": restDBKey,
            "cache-control": "no-cache"
        }
    }
    //console.log(settings)
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

    const settings = {
        "async": false,
        "crossDomain": true,
        "url": `https://spred-c23d.restdb.io/rest/sprites?q=${JSON.stringify(keys)}`,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": restDBKey,
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

const updateItem = () => {
    const updateDataHandler = blob => {
        const reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            const preview = reader.result;
            const jsondata = _.assign({
                "spriteData": workspace,
                "spriteOptions": options,
                "frames": workspace.frames.length,
                "spritePreview": preview
            },library);
            const settings = {
                "async": true,
                "crossDomain": true,
                "url": `https://spred-c23d.restdb.io/rest/sprites/${library.lastLoaded}`,
                "method": "PUT",
                "headers": {
                    "content-type": "application/json",
                    "x-apikey": restDBKey,
                    "cache-control": "no-cache"
                },
                "processData": false,
                "data": JSON.stringify(jsondata)
            }

            $.ajax(settings)
                .done(function (response) {
                    libError('The file was successfully updated', '#5b5');
                    getLibraryData(libraryPage);
                })
                .fail(function (response) {

                    if (response.status == 400) {
                        console.log(response);
                        libError('Error!');
                        $('#lib_spinner').addClass('none');
                        return false;
                    }
                    libError('Unexpected error during upload.')
                    $('#lib_spinner').addClass('none');
                });
        }
    }
    gifExporter(2, updateDataHandler);    
}

const postData = data => {

    $('#lib_spinner').removeClass('none');

    const postDataHandler = blob => {
        const reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            const preview = reader.result;
            const jsondata = _.assign({
                "uploaderId": library.uploaderId,
                "authorName": "",
                "uploadDate": new Date().toISOString(),
                "spriteName": "",
                "description": "",
                "spriteData": _.cloneDeep(workspace),
                "spriteOptions": options,
                "frames": workspace.frames.length,
                "spritePreview": preview
            }, data);
            if (jsondata.spriteData.backgroundImage) {
                delete(jsondata.spriteData.backgroundImage);
            }
            if (jsondata.spriteData.clipBoard) {
                delete(jsondata.spriteData.clipBoard);
            }
            
            const settings = {
                "async": true,
                "crossDomain": true,
                "url": "https://spred-c23d.restdb.io/rest/sprites",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "x-apikey": restDBKey,
                    "cache-control": "no-cache"
                },
                "processData": false,
                "data": JSON.stringify(jsondata)
            }
            $.ajax(settings)
                .done(function (response) {
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
    }
    gifExporter(2, postDataHandler);
}