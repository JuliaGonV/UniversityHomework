`timescale 1ns / 1ns
`include "cntSygnal.v"

module cntSygnal_tb;
    reg X1, X2, X3, X4;
    wire [2:0] Y;

    cntSygnal uut(.X1(X1), .X2(X2), .X3(X3), .X4(X4), .Y(Y));

    initial begin
        $dumpfile("cntSygnal_tb.vcd");
        $dumpvars(0, cntSygnal_tb);

        $display("X1 X2 X3 X4 | Y2 Y1 Y0");

        X1=0; X2=0; X3=0; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=0; X3=0; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=0; X3=1; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=0; X3=1; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=1; X3=0; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=1; X3=0; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=1; X3=1; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=0; X2=1; X3=1; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=0; X3=0; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=0; X3=0; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=0; X3=1; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=0; X3=1; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=1; X3=0; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=1; X3=0; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=1; X3=1; X4=0; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        X1=1; X2=1; X3=1; X4=1; #10;
        $display("%b  %b  %b  %b  | %b %b %b", X1,X2,X3,X4,Y[2],Y[1],Y[0]);

        $display("Test complete");
    end
endmodule