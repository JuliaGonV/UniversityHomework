module calculator(input [3:0] A, input [3:0] B, output [4:0] SUM, output [6:0] SEG);
    assign SUM = A + B;
    seven_segment display(.num(SUM[3:0]), .seg(SEG));
endmodule