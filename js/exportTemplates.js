//  #size#
//  #max#

const exportTemplates = [
    {
        name:'MADS Assembler',
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  dta #frames#,#height#,#gap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  dta ', postfix: '\n'
        },
        byte: {
            separator: ', ',
            hexPrefix: '$', addrPrefix: 'a(', addrPostfix: ')'
        }
    },    


    {
        name:'Other Assemblers',
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  dta #frames#,#height#,#gap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  .BYTE ', postfix: '\n'
        },
        byte: {
            separator: ', ',
            hexPrefix: '$'
        }
    },    


    {
        name:'MAC/65',
        block: {
            prefix: '#-1# .BYTE #frames#,#height#,#gap# ;frames,height,gap\n', postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: true,
            prefix: '.BYTE ', postfix: '\n'
        },
        byte: {
            separator: ',',
            hexPrefix: '$'
        }
    },        

    {
        name:'Mad-Pascal',
        block: {
            prefix: 'var\n  spriteFrames: byte = #frames#;\n  spriteGap: byte = #gap#;\n  spriteHeight: byte = #height#;\n\n', postfix: ''
        },
        colors: {
            prefix: "  colors#s#: array [0..#maxframes#] of byte = (\n", postfix: "  );\n"
        },
        sprite: {
            prefix: '\n// sprite #s# data\n', postfix: ''
        },
        frame: {
            prefix: "  frames#s#_#f#: array [0..#maxheight#] of byte = (\n", postfix: "  );\n"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            separator: ', ',
            hexPrefix: '$'
        }
    },

    {
        name:'Action!',
        block: {
            prefix: 'BYTE FRAMES=#frames#,\n     GAP=#gap#,\n     HEIGHT=#height#;\n\n', postfix: ''
        },
        colors: {
            prefix: "BYTE ARRAY COLORS#s# =[\n", postfix: "]\n"
        },
        sprite: {
            prefix: "\n; sprite #s#\n", postfix: ''
        },        
        frame: {
            prefix: "BYTE ARRAY FRAMES#s#_#f# =[\n", postfix: "]\n"
        },
        line: {
            numbers: false, prefix: '  ', postfix: "\n"
        },
        byte: {
            separator: ' ',
            hexPrefix: '$'
        }
    },

    {
        name:'CC65',
        block: {
            prefix: 'unsigned char frames = #frames#;\nunsigned char gap = #gap#,\nunsigned char height = #height#;\n\n', postfix: ''
        },
        colors: {
            prefix: "unsigned char frames#s#_#f#[#height#] = {\n", postfix: "};"
        },
        sprite: {
            prefix: "\n\n//sprite #s#\n", postfix: ''
        },        
        frame: {
            prefix: "unsigned char frames#s#_#f#[#height#] = {\n", postfix: "};\n"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            separator: ', ',
            hexPrefix: '0x'
        }
    },

    {
        name:'FastBasic',
        block: {
            prefix: 'frames = #frames#\ngap = #gap#\nheight = #height#\n\n', postfix: ''
        },
        colors: {
            prefix: "data colors#s#()", postfix: ""
        },
        sprite: {
            prefix: "\n'sprite #s#\n", postfix: ''
        },        
        frame: {
            prefix: "data frame#s#_#f#()", postfix: ""
        },
        line: {
            numbers: false, prefix: ' byte = ', postfix: ",\ndata", lastpostfix: "\n"
        },
        byte: {
            separator: ', ',
            hexPrefix: '$'
        }
    },

    {
        name:'BASIC',
        block: {
            prefix: '#-2# FRAMES=#frames#:HEIGHT=#height#:GAP=#gap#\n#-1# REM *** SPRITE DATA ***\n', postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: true, prefix: 'DATA ', postfix: "\n"
        },
        byte: {
            forceNumeric: 'DEC', 
            separator: ',',
            hexPrefix: ''
        }
    },

    {
        name:'Raw CSV sheet',
        block: {
            prefix: '#frames#,#height#,#gap#\n', postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: false, prefix: '', postfix: "\n"
        },
        byte: {
            separator: ',',
            hexPrefix: '$'
        }
    },   
    
    {
        name:'Raw CSV one liner',
        block: {
            prefix: '#frames#,#height#,#gap#', postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: false, prefix: '', postfix: ""
        },
        byte: {
            separator: ',',
            hexPrefix: '$'
        }
    },


    
]
