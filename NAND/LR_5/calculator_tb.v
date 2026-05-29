`timescale 1ns / 1ns

`include "calculator.v"
`include "seven_segment.v"

module calculator_tb;
    reg [3:0] A;
    reg [3:0] B;

    wire [4:0] SUM;
    wire [6:0] SEG;

    calculator uut (.A(A), .B(B), .SUM(SUM), .SEG(SEG));

    initial begin
        $dumpfile("calculator_tb.vcd");
        $dumpvars(0, calculator_tb);

        A = 4'd2; B = 4'd3; #10;

        $display(
            "%0t A =%d B =%d SUM =%d SEG = %b",
            $time, A, B, SUM, SEG);

        $display(
            "  %b  \n%b   %b\n  %b  \n%b   %b\n  %b",
            SEG[0],
            SEG[5], SEG[1],
            SEG[6],
            SEG[4], SEG[2],
            SEG[3]
        );

        A = 4'd4; B = 4'd5; #10;

        $display(
            "%0t A =%d B =%d SUM =%d SEG = %b",
            $time, A, B, SUM, SEG);

        $display(
            "  %b  \n%b   %b\n  %b  \n%b   %b\n  %b",
            SEG[0],
            SEG[5], SEG[1],
            SEG[6],
            SEG[4], SEG[2],
            SEG[3]
        );

        A = 4'd7; B = 4'd1; #10;

        $display(
            "%0t A =%d B =%d SUM =%d SEG = %b",
            $time, A, B, SUM, SEG);

        $display(
            "  %b  \n%b   %b\n  %b  \n%b   %b\n  %b",
            SEG[0],
            SEG[5], SEG[1],
            SEG[6],
            SEG[4], SEG[2],
            SEG[3]
        );

        $display("Test complete");
    end
endmodule