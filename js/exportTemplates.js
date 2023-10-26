//  #size#
//  #max#

const exportTemplates = [
    {
        name:'MADS Assembler',
        mode: 0, // order by sprites
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  dta #frames#,#height#,#gap01#\n\n',
            prefix23: '; SPRITE DATA\n; frames, height, gap0_1, gap2_3, pair_gap\n  dta #frames#,#height#,#gap01#,#gap23#,#pairgap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n#lp#COL_#s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        missiles: {
            prefix: '\n; MISSILES \n', postfix: ''
        },
        dli: {
            prefix: '\n; DLI #d#\n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n#lp#SPR_#s#_FRM_#f#\n', postfix: ''
        },
        frameNoLabel: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        frameDelays: {
            prefix: '\n; DELAY TIMES \n', postfix: ''
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
        name:'MADS Assembler (.he notation)',
        mode: 0, // order by sprites
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  .he #frames# #height# #gap01#\n\n',
            prefix23: '; SPRITE DATA\n; frames, height, gap0_1, gap2_3, pair_gap\n  .he #frames# #height# #gap01# #gap23# #pairgap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n#lp#COL_#s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        missiles: {
            prefix: '\n; MISSILES \n', postfix: ''
        },
        dli: {
            prefix: '\n; DLI #d#\n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n#lp#SPR_#s#_FRM_#f#\n', postfix: ''
        },
        frameNoLabel: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        frameDelays: {
            prefix: '\n; DELAY TIMES \n', postfix: ''
        },
        line: {
            numbers: false,
            prefix: '  .he ', postfix: '\n'
        },
        byte: {
            separator: ' ',
            binPrefix: '', hexPrefix: '', addrPrefix: 'a(', addrPostfix: ')',
            forceNumeric: 'HEX'
        }
    },      

    {
        name:'Other Assemblers',
        mode: 0, // order by sprites
        block: {
            prefix: '; SPRITE DATA\n; frames, height, gap\n  .BYTE #frames#,#height#,#gap01#\n\n',
            prefix23: '; SPRITE DATA\n; frames, height, gap0_1, gap2_3, pair_gap\n  .BYTE #frames#,#height#,#gap01#,#gap23#,#pairgap#\n\n', postfix: ''
        },
        colors: {
            prefix: '; SPRITE COLORS #s#\n#lp#COL_#s#\n', postfix: ''
        },
        sprite: {
            prefix: '\n; SPRITE #s#\n', postfix: ''
        },
        missiles: {
            prefix: '\n; MISSILES \n', postfix: ''
        },
        dli: {
            prefix: '\n; DLI #d#\n', postfix: ''
        },
        frame: {
            prefix: '; FRAME #f#\n#lp#SPR_#s#_FRM_#f#\n', postfix: ''
        },
        frameNoLabel: {
            prefix: '; FRAME #f#\n', postfix: ''
        },
        frameDelays: {
            prefix: '\n; DELAY TIMES \n', postfix: ''
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
        mode: 0, // order by sprites
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
        dli: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        frameDelays: {
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
        mode: 0, // order by sprites
        block: {
            prefix: 'var\n  spriteFrames: byte = #frames#;\n  spriteHeight: byte = #height#;\n  spriteGap: byte = #gap01#;\n\n',
            prefix23: 'var\n  spriteFrames: byte = #frames#;\n  spriteHeight: byte = #height#;\n  spriteGap01: byte = #gap01#;\n  spriteGap23: byte = #gap23#;\n  pairGap: byte = #pairgap#;\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "  #lp#colors#s#: array [0..#maxframes#] of byte = (\n", postfix: "  );\n"
        },
        sprite: {
            prefix: '\n// sprite #s# data\n', postfix: ''
        },
        missiles: {
            prefix: '\n// missiles\n', postfix: ''
        },
        dli: {
            prefix: '\n// dli #d#\n', postfix: ''
        },
        frame: {
            prefix: "  #lp#frames#d##s#_#f#: array [0..#maxheight#] of byte = (\n", postfix: "  );\n"
        },
        frameDelays: {
            prefix: '\n// delay Times\n', postfix: ''
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
        mode: 0, // order by sprites
        block: {
            prefix: 'BYTE FRAMES=#frames#,\n     HEIGHT=#height#,\n     GAP=#gap01#;\n\n', 
            prefix23: 'BYTE FRAMES=#frames#,\n     HEIGHT=#height#,\n     GAP01=#gap01#,\n     GAP23=#gap23#,\n     PAIRGAP=#pairgap#,\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "BYTE ARRAY #lp#COLORS#s# =[\n", postfix: "]\n"
        },
        sprite: {
            prefix: "\n; sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: '\n; missiles\n', postfix: ''
        },
        dli: {
            prefix: '\n; dli #d#\n', postfix: ''
        },
        frame: {
            prefix: "BYTE ARRAY #lp#FRAMES#d##s#_#f# =[\n", postfix: "]\n"
        },
        frameDelays: {
            prefix: '\n; delay times\n', postfix: ''
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
        mode: 0, // order by sprites
        block: {
            prefix: 'unsigned char frames = #frames#;\nunsigned char height = #height#;\nunsigned char gap = #gap01#,\n\n',
            prefix23: 'unsigned char frames = #frames#;\nunsigned char height = #height#;\nunsigned char gap01 = #gap01#,\nunsigned char gap23 = #gap23#,\nunsigned char pairgap = #pairgap#,\n\n',
            postfix: ''
        },
        colors: {
            prefix: "unsigned char #lp#colors#s#_#f#[#height#] = {\n", postfix: "};"
        },
        sprite: {
            prefix: "\n\n//sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: '\n\n//missiles\n', postfix: ''
        },
        dli: {
            prefix: '\n\n//dli #d#\n', postfix: ''
        },
        frame: {
            prefix: "unsigned char #lp#frames#d##s#_#f#[#height#] = {\n", postfix: "};\n"
        },
        frameDelays: {
            prefix: '\n\n//delay times\n', postfix: ''
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
        mode: 0, // order by sprites
        block: {
            prefix: 'frames = #frames#\nheight = #height#\ngap = #gap01#\n\n', 
            prefix23: 'frames = #frames#\nheight = #height#\ngap01 = #gap01#\ngap23 = #gap23#\npairgap = #pairgap#\n\n', 
            postfix: ''
        },
        colors: {
            prefix: "data #lp#colors#s#()", postfix: ""
        },
        sprite: {
            prefix: "\n'sprite #s#\n", postfix: ''
        },        
        missiles: {
            prefix: "\n'missiles\n", postfix: ''
        },
        dli: {
            prefix: "\n'dli #d#\n", postfix: ''
        },
        frame: {
            prefix: "data #lp#frame#d##s#_#f#()", postfix: ""
        },
        frameDelays: {
            prefix: "\n'delay times\n", postfix: ''
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
        mode: 0, // order by sprites
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
        dli: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        frameDelays: {
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
        mode: 0, // order by sprites
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
        dli: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        frameDelays: {
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
        mode: 0, // order by sprites
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
        dli: {
            prefix: '', postfix: ''
        },
        frame: {
            prefix: '', postfix: ''
        },
        frameDelays: {
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
