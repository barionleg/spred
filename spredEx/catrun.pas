program catrun;
{$librarypath '../blibs/'}
uses atari, crt, rmt, b_pmg; // b_utils;

const
 HEIGHT = 16;
 FRAMES = 8;
 TOP = 52;
{$i const.inc}
{$r resources.rc}
{$i interrupts.inc}

var
	colors: array[0..3] of byte absolute SPRITE;
	sprites: array[0..3, 0..HEIGHT * FRAMES -1] of byte absolute SPRITE + 4;
	pram: word;
	off: byte;
	f,p: byte;
	left: byte = 0;
	dlioffset: array [0..7] of byte = (52,51,51,52,53,54,54,53);

procedure moveRight;
begin
	PMG_hpos[0] := left;
	PMG_hpos[1] := left;
	PMG_hpos[2] := left+8;
	PMG_hpos[3] := left+8;
	inc(left);
	Pause;
end;

begin
	color2 := $98;
	colbaks := $98;
	color1:=$f;
	lmargin:=0;
	ClrScr;
	CursorOff;
	PMG_Init(Hi(PMG));
	PMG_Clear();
	FillByte(PMG_sizep,8,0);
	Move(colors,PMG_pcolr_S,4);
	PMG_gprior_S := PMG_overlap + 1;
	poke(sdlstl+8,$82);
    pause;
    vdslst := word(@dli);
    nmien := $c0; 

	Writeln;
	Writeln;
	Writeln;
	Writeln;
	Writeln;
	Writeln('   This animation was made with SprEd');
	Writeln;
	Writeln(' The best sprite editor for 8-bit Atari');
	Writeln;
	Writeln;
	Writeln;
	Writeln;
	Writeln;
	Writeln;
	Writeln('    https://bocianu.gitlab.io/spred/');

	repeat
		off := 0;
		for f:=0 to FRAMES - 1 do begin
			MoveRight;
			pram := PMG + 512 - 128 + TOP;
			for p:=0 to 3 do begin
				pram := pram + 128;
				move(sprites[p,off], pointer(pram), HEIGHT);
			end;
			off := off + HEIGHT;
			MoveRight;
		end;
	until false;

end.
