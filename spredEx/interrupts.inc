(* declare your interrupt routines here *)

procedure dli;assembler;interrupt;
asm {
    phr ; store registers

	ldy #$18
	ldx f
	lda adr.dlioffset,x
@   cmp vcount
    bpl @-
	sta wsync
	sta wsync
	sty atari.colpm2
	sta wsync
	sta wsync
     
	sta wsync
	ldy #$94
	sta wsync
	sty atari.colpm2
	sta wsync
	lda #$38
	sta wsync
	sta atari.colpm2
	sta wsync
	lda #$16
	sta wsync
	sta atari.colpm2

	ldx #$c6
	ldy #$c2
    lda #62 ; wait this number of lines
@   cmp vcount
    bpl @-
    sta wsync
    lda #$c4
    :18 nop
	sty atari.colpm0
	sty atari.colpm2
    sta wsync
    stx atari.colbk ; change backgroung color to white
    stx atari.colpf2
	sta atari.colpm1
	sta atari.colpm3
    plr ; restore registers
};
end;


