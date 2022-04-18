program madStrap;
{$librarypath '../blibs/'}
uses atari, crt, rmt, b_pmg; // b_utils;

const
 HEIGHT = 20;
 FRAMES = 8;
 TOP = 52;
 LEFT = 124;
{$i const.inc}
{$r resources.rc}
{ $i types.inc}
{ $i interrupts.inc}

var
	frameCount: byte absolute SPRITE;
	spriteHeight: byte absolute SPRITE + 1;
	colors: array[0..3,0..FRAMES-1] of byte absolute SPRITE + 5;
	sprites: array[0..4, 0..HEIGHT * FRAMES -1] of byte absolute SPRITE + 5 + (4*8);

	pram: word;
	off: byte;
	f,p: byte;
	

begin

	PMG_Init(Hi(PMG));
	PMG_Clear();
	FillByte(PMG_sizep,8,0);
	FillByte(PMG_hpos,4, LEFT);
	FillByte(PMG_hposm,4, LEFT+8);
	PMG_pcolr0_S := colors[0,0];
	PMG_pcolr1_S := colors[1,0];
	PMG_pcolr2_S := colors[2,0];
	PMG_pcolr3_S := colors[3,0];
	PMG_gprior_S := PMG_overlap + 1;
		
	//FillByte(pointer(PMG),1024,%01010101);

	repeat
		off := 0;
		for f:=0 to FRAMES - 1 do begin
			pram := PMG + 512 - 128 + TOP;
			Pause(6);
			move(sprites[4,off], pointer(pram), HEIGHT);
			for p:=0 to 3 do begin
				pram := pram + 128;
				move(sprites[p,off], pointer(pram), HEIGHT);
			end;
			off := off + HEIGHT;
		end;
	until false;
        

end.
