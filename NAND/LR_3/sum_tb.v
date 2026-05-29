`timescale 1ns / 1ns
`include "sum.v"

module sum_tb;
    reg A;
    reg B;
    reg Cin;
    wire Sum;
    wire Cout;
    sum uut_inst (.A(A), .B(B), .Cin(Cin), .Sum(Sum), .Cout(Cout));

    initial begin
        $dumpfile("sum_tb.vcd");
        $dumpvars(0, sum_tb);
        A = 0; B = 0; Cin = 0; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 0; B = 0; Cin = 1; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 0; B = 1; Cin = 0; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 0; B = 1; Cin = 1; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 1; B = 0; Cin = 0; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 1; B = 0; Cin = 1; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 1; B = 1; Cin = 0; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        A = 1; B = 1; Cin = 1; #10;
        $display("%0t\t%b %b %b = %b %b", $time, A, B, Cin, Sum, Cout);
        $display("test complete");
    end
endmodule