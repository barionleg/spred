(* declare your interrupt routines here *)

procedure dli;assembler;interrupt;
asm {
    phr ; store registers

    ldx #0
    lda #14 ; wait this number of lines
@   cmp vcount
    bpl @-
	
cloop
 	
	lda adr.colors,x
	tay 
	lda adr.colors+16,x
    sta wsync
    sta atari.colpm1 ; change backgroung color to white
	sty atari.colpm0
	lda adr.colors+8,x
	sta atari.colpm2
	lda adr.colors+8+16,x
	sta atari.colpm3
    :23 sta wsync
    
	inx
	cpx #8
	bne cloop
	
    plr ; restore registers
};
end;


