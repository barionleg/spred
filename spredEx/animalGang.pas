program animalGang;
{$librarypath '../blibs/'}
uses atari, crt, rmt, b_pmg; // b_utils;

const
 HEIGHT = 20;
 FRAMES = 16;
 TOP = 34;
 LEFT = 50;
 RIGHT = 126;
 
{$i const.inc}
{$r resourcesGang.rc}
{$i interruptsGang.inc}

var
	colors: array[0..1, 0..FRAMES-1] of byte absolute SPRITE;
	sprites: array[0..2, 0..HEIGHT * FRAMES -1] of byte absolute SPRITE + 2 * FRAMES;
	pram: word;
	off: word;
	yoff: byte;
	i,f: byte;

begin
	color2 := 2;
	colbaks := 0;
	color1 := $8;
	lmargin:=0;
	ClrScr;
	CursorOff;
	PMG_Init(Hi(PMG),PMG_sdmctl_default or PMG_sdmctl_oneline);
	PMG_Clear();
	FillByte(PMG_sizep,8,0);
	Move(colors,PMG_pcolr_S,4);
	PMG_gprior_S := PMG_overlap + 1;
	PMG_hpos[0] := LEFT;
	PMG_hpos[1] := LEFT;
	PMG_hposm[0] := LEFT+8;
	PMG_hposm[1] := LEFT+8;
	PMG_hpos[2] := RIGHT;
	PMG_hpos[3] := RIGHT;
	PMG_hposm[2] := RIGHT+8;
	PMG_hposm[3] := RIGHT+8;
	
	poke(sdlstl+1,$f0);
    pause;
    vdslst := word(@dli);
    nmien := $c0; 

	yoff :=0;
	off := 0;
	for f:=0 to ((FRAMES div 2) - 1) do begin
		pram := PMG + 1024 - 256 + TOP + yoff;
		for i:=0 to HEIGHT-1 do
		   poke(pram+i,sprites[2,off+i] or (sprites[2,off+i+8*HEIGHT] shl 4));
		pram := pram + 256;
		move(sprites[0,off], pointer(pram), HEIGHT);
		pram := pram + 256;
		move(sprites[1,off], pointer(pram), HEIGHT);
		pram := pram + 256;
		move(sprites[0,off+8*HEIGHT], pointer(pram), HEIGHT);
		pram := pram + 256;
		move(sprites[1,off+8*HEIGHT], pointer(pram), HEIGHT);
		off := off + HEIGHT;
		yoff := yoff + 24;
	end;

	Writeln;
	Writeln ('    Fiodor             Stella');
	Writeln;
	Writeln;
	Writeln ('    Albin              Roger');
	Writeln;
	Writeln;
	Writeln ('    Kurt               Pascal');
	Writeln;
	Writeln;
	Writeln ('    Henry              Steward');
	Writeln;
	Writeln;
	Writeln ('    Esmeralda          Robin');
	Writeln;
	Writeln;
	Writeln ('    Anthony            Lena');
	Writeln;
	Writeln;
	Writeln ('    Hugo               Jerome');
	Writeln;
	Writeln;
	Writeln ('    Bruce              Dolores');

	repeat until false;

end.
