module multiplexer(X0, X1, Y0, Y1, Out);
    input [7:0] X0, X1;
    input Y0, Y1;
    output [7:0] Out;

    wire selector;

    assign selector = Y0 ^ Y1;
    assign Out = selector ? X0 : X1;
endmodule