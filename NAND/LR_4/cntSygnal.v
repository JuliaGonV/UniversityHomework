module cntSygnal(
    input X1,
    input X2,
    input X3,
    input X4,
    output [2:0] Y
);
    assign Y = X1 + X2 + X3 + X4;
endmodule