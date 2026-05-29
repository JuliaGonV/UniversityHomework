`timescale 1ns / 1ns
`include "AND.v"

module AND_tb;
    reg X0;
    reg X1;
    wire Y;
    AND uut_inst (.X0(X0), .X1(X1), .Y(Y));

    initial begin
        $dumpfile("AND_tb.vcd");
        $dumpvars(0, AND_tb);
        X0 = 0; X1 = 0; #10;
        $display("%0t\t%b %b | %b", $time, X0, X1, Y);
        X0 = 0; X1 = 1; #10;
        $display("%0t\t%b %b | %b", $time, X0, X1, Y);
        X0 = 1; X1 = 0; #10;
        $display("%0t\t%b %b | %b", $time, X0, X1, Y);
        X0 = 1; X1 = 1; #10;
        $display("%0t\t%b %b | %b", $time, X0, X1, Y);
        $display("test complete");
    end
endmodule