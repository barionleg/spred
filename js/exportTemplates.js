//  #size#
//  #max#

const exportTemplates = [
    {
        name:'MADS Assembler',
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  dta #frames#,#height#,#gap01#\n\n',
            prefix23: '; SPRITE DATA\n; frames, height, gap0_1, gap2_3, pair_gap\n  dta #frames#,#height#,#gap01#,#gap23#,#pairgap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        missiles: {
            prefix: '\n; MISSILES \n', postfix: ''
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
            binPrefix: '%', hexPrefix: '$', addrPrefix: 'a(', addrPostfix: ')'
        }
    },    


    {
        name:'Other Assemblers',
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  .BYTE #frames#,#height#,#gap01#\n\n',
            prefix23: '; SPRITE DATA\n; frames, height, gap0_1, gap2_3, pair_gap\n  .BYTE #frames#,#height#,#gap01#,#gap23#,#pairgap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        missiles: {
            prefix: '\n; MISSILES \n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  .BYTE ', postfix: '\n'
        },
        byte: {
            separator: ', ', binPrefix: '%', hexPrefix: '$'
        }
    },    


    {
        name:'MAC/65',
        block: {
            prefix: '#-1# .BYTE #frames#,#height#,#gap01# ;frames, height, gap\n', 
            prefix23: '#-1# .BYTE #frames#,#height#,#gap01#,#gap23#,#pairgap# ;frames, height, gap0_1, gap2_3, pair_gap\n', 
            postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        missiles: {
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
            separator: ',', hexPrefix: '$', binPrefix: '%'
        }
    },        

    {
        name:'Mad-Pascal',
        block: {
            prefix: 'var\n  spriteFrames: byte = #frames#;\n  spriteHeight: byte = #height#;\n  spriteGap: byte = #gap01#;\n\n',
            prefix23: 'var\n  spriteFrames: byte = #frames#;\n  spriteHeight: byte = #height#;\n  spriteGap01: byte = #gap01#;\n  spriteGap23: byte = #gap23#;\n  pairGap: byte = #pairgap#;\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "  colors#s#: array [0..#maxframes#] of byte = (\n", postfix: "  );\n"
        },
        sprite: {
            prefix: '\n// sprite #s# data\n', postfix: ''
        },
        missiles: {
            prefix: '\n// missiles\n', postfix: ''
        },
        frame: {
            prefix: "  frames#s#_#f#: array [0..#maxheight#] of byte = (\n", postfix: "  );\n"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            separator: ', ', hexPrefix: '$', binPrefix: '%', 
        }
    },

    {
        name:'Action!',
        block: {
            prefix: 'BYTE FRAMES=#frames#,\n     HEIGHT=#height#,\n     GAP=#gap01#;\n\n', 
            prefix23: 'BYTE FRAMES=#frames#,\n     HEIGHT=#height#,\n     GAP01=#gap01#,\n     GAP23=#gap23#,\n     PAIRGAP=#pairgap#,\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "BYTE ARRAY COLORS#s# =[\n", postfix: "]\n"
        },
        sprite: {
            prefix: "\n; sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: '\n; missiles\n', postfix: ''
        },
        frame: {
            prefix: "BYTE ARRAY FRAMES#s#_#f# =[\n", postfix: "]\n"
        },
        line: {
            numbers: false, prefix: '  ', postfix: "\n"
        },
        byte: {
            separator: ' ', hexPrefix: '$'
        }
    },

    {
        name:'CC65',
        block: {
            prefix: 'unsigned char frames = #frames#;\nunsigned char height = #height#;\nunsigned char gap = #gap01#,\n\n',
            prefix23: 'unsigned char frames = #frames#;\nunsigned char height = #height#;\nunsigned char gap01 = #gap01#,\nunsigned char gap23 = #gap23#,\nunsigned char pairgap = #pairgap#,\n\n',
            postfix: ''
        },
        colors: {
            prefix: "unsigned char frames#s#_#f#[#height#] = {\n", postfix: "};"
        },
        sprite: {
            prefix: "\n\n//sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: '\n\n//missiles\n', postfix: ''
        },
        frame: {
            prefix: "unsigned char frames#s#_#f#[#height#] = {\n", postfix: "};\n"
        },
        line: {
            numbers: false, prefix: '    ', postfix: ",\n", lastpostfix: "\n"
        },
        byte: {
            separator: ', ', hexPrefix: '0x', binPrefix: '0b', 
        }
    },

    {
        name:'FastBasic',
        block: {
            prefix: 'frames = #frames#\nheight = #height#\ngap = #gap01#\n\n', 
            prefix23: 'frames = #frames#\nheight = #height#\ngap01 = #gap01#\ngap23 = #gap23#\npairgap = #pairgap#\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "data colors#s#()", postfix: ""
        },
        sprite: {
            prefix: "\n'sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: "\n'missiles\n", postfix: ''
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
            prefix: '#-2# FRAMES=#frames#:HEIGHT=#height#:GAP=#gap01#\n#-1# REM *** SPRITE DATA ***\n', 
            prefix23: '#-2# FRAMES=#frames#:HEIGHT=#height#:GAP01=#gap01#:GAP23=#gap23#:PAIRGAP=#pairgap#\n#-1# REM *** SPRITE DATA ***\n', 
            postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        missiles: {
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
            prefix: '#frames#,#height#,#gap01#\n', 
            prefix23: '#frames#,#height#,#gap01#,#gap23#,#pairgap#\n', 
            postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        missiles: {
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
            prefix: '#frames#,#height#,#gap#,', 
            prefix23: '#frames#,#height#,#gap01#,#gap23#,#pairgap#,', 
            postfix: ''
        },
        colors: {
            prefix: '', postfix: ''
        },
        sprite: {
            prefix: '', postfix: ''
        },
        missiles: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        line: {
            numbers: false, prefix: '', postfix: "", preserveLastSeparator: true
        },
        byte: {
            separator: ',',
            hexPrefix: '$'
        }
    },
    
]
