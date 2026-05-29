`timescale 1ns / 1ns
`include "multiplexer.v"

module multiplexer_tb;
    reg [7:0] X0;
    reg [7:0] X1;
    reg Y0;
    reg Y1;
    wire [7:0] Out;

    multiplexer uut_inst (
        .X0(X0),
        .X1(X1),
        .Y0(Y0),
        .Y1(Y1),
        .Out(Out)
    );

    initial begin
        $dumpfile("multiplexer_tb.vcd");
        $dumpvars(0, multiplexer_tb);

        X0 = 8'b11110000; X1 = 8'b00001111; Y0 = 0; Y1 = 0; #10;

        $display(
            "%0t\tX0=%b X1=%b Y0=%b Y1=%b Out=%b",
            $time, X0, X1, Y0, Y1, Out
        );

        Y0 = 0; Y1 = 1; #10;

        $display(
            "%0t\tX0=%b X1=%b Y0=%b Y1=%b Out=%b",
            $time, X0, X1, Y0, Y1, Out
        );

        Y0 = 1; Y1 = 0; #10;

        $display(
            "%0t\tX0=%b X1=%b Y0=%b Y1=%b Out=%b",
            $time, X0, X1, Y0, Y1, Out
        );

        Y0 = 1; Y1 = 1; #10;

        $display(
            "%0t\tX0=%b X1=%b Y0=%b Y1=%b Out=%b",
            $time, X0, X1, Y0, Y1, Out
        );

        $display("Test complete");
    end

endmodule