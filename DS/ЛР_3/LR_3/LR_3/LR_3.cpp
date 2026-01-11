﻿#include <iostream>
#include <vector>

struct MatrixElement
{
    int value;
    int rowIdx;
    int colIdx;
    MatrixElement* nextRow;
    MatrixElement* nextCol;

    MatrixElement(int val, int row, int col) : value(val), rowIdx(row), colIdx(col), nextRow(nullptr), nextCol(nullptr)
    {
	    
    }
};

class SparseMatrix {
private:
    int rows, cols;
    std::vector<MatrixElement*> rowHeads;
    std::vector<MatrixElement*> colHeads;

public:
    SparseMatrix(int n, int m) : rows(n), cols(m), rowHeads(n, nullptr), colHeads(m, nullptr)
    {
	    
    }

    void addElement(int row, int col, int value)
	{
        if (value == 0)
        {
	        return;
        }

        MatrixElement* newElement = new MatrixElement(value, row, col);


        if (!rowHeads[row] || col < rowHeads[row]->colIdx) 
        {
            newElement->nextRow = rowHeads[row];
            rowHeads[row] = newElement;
        }
        else 
        {
            MatrixElement* temp = rowHeads[row];
            while (temp->nextRow && temp->nextRow->colIdx < col) 
            {
                temp = temp->nextRow;
            }
            newElement->nextRow = temp->nextRow;
            temp->nextRow = newElement;
        }


        if (!colHeads[col] || row < colHeads[col]->rowIdx) 
        {
            newElement->nextCol = colHeads[col];
            colHeads[col] = newElement;
        }
        else 
        {
            MatrixElement* temp = colHeads[col];
            while (temp->nextCol && temp->nextCol->rowIdx < row) 
            {
                temp = temp->nextCol;
            }
            newElement->nextCol = temp->nextCol;
            temp->nextCol = newElement;
        }
    }

    SparseMatrix transpose()
	{
        SparseMatrix transposed(cols, rows);
        for (int i = 0; i < rows; i++) 
        {
            MatrixElement* current = rowHeads[i];
            while (current) 
            {
                transposed.addElement(current->colIdx, current->rowIdx, current->value);
                current = current->nextRow;
            }
        }

        return transposed;
    }

    SparseMatrix add(const SparseMatrix& other)
	{
        SparseMatrix result(rows, cols);

        for (int i = 0; i < rows; i++) 
        {
            MatrixElement* current1 = rowHeads[i];
            MatrixElement* current2 = other.rowHeads[i];

            while (current1 || current2) 
            {
                if (!current1) 
                {
                    result.addElement(current2->rowIdx, current2->colIdx, current2->value);
                    current2 = current2->nextRow;
                }
                else if (!current2) 
                {
                    result.addElement(current1->rowIdx, current1->colIdx, current1->value);
                    current1 = current1->nextRow;
                }
                else if (current1->colIdx < current2->colIdx) 
                {
                    result.addElement(current1->rowIdx, current1->colIdx, current1->value);
                    current1 = current1->nextRow;
                }
                else if (current1->colIdx > current2->colIdx) 
                {
                    result.addElement(current2->rowIdx, current2->colIdx, current2->value);
                    current2 = current2->nextRow;
                }
                else 
                {
                    int sum = current1->value + current2->value;

                    if (sum != 0) 
                    {
                        result.addElement(current1->rowIdx, current1->colIdx, sum);
                    }

                    current1 = current1->nextRow;
                    current2 = current2->nextRow;
                }
            }
        }
        return result;
    }

    void multiplyByScalar(int scalar)
	{
        for (int i = 0; i < rows; i++) 
        {
            MatrixElement* current = rowHeads[i];

            while (current) 
            {
                current->value *= scalar;
                current = current->nextRow;
            }
        }
    }

    void print() const
	{
        for (int i = 0; i < rows; i++) 
        {
            MatrixElement* current = rowHeads[i];

            for (int j = 0; j < cols; j++) 
            {
                if (current && current->colIdx == j) 
                {
                    std::cout << current->value << " ";
                    current = current->nextRow;
                }
                else 
                {
                    std::cout << "0 ";
                }
            }

            std::cout << std::endl;
        }
    }
};

int main()
{
    int n, m;
    std::cout << "Enter matrix dimensions (n x m): ";
    std::cin >> n >> m;

    SparseMatrix mat1(n, m);
    SparseMatrix mat2(n, m);
    bool secondMatrixAdded = false;

    int choice;
    do 
    {
        std::cout << "Menu\n";
        std::cout << "1. Add Element to Matrix 1\n";
        std::cout << "2. Multiply Matrix 1 by Scalar\n";
        std::cout << "3. Transpose Matrix 1\n";
        std::cout << "4. Add Second Matrix (Matrix 2)\n";
        std::cout << "5. Sum Matrix 1 and Matrix 2\n";
        std::cout << "6. Print Matrix 1\n";
        std::cout << "7. Print Matrix 2\n";
        std::cout << "0. Exit\n";
        std::cout << ">>;
        std::cin >> choice;

        switch (choice)
    	{
        case 1: 
        {
            int row, col, value;
            std::cout << "Enter row, column, and value: ";
            std::cin >> row >> col >> value;
            mat1.addElement(row, col, value);

            break;
        }
        case 2: 
        {
            int scalar;
            std::cout << "Enter scalar value: ";
            std::cin >> scalar;
            mat1.multiplyByScalar(scalar);
            std::cout << "Matrix 1 multiplied by " << scalar << ":\n";
            mat1.print();

            break;
        }
        case 3: 
        {
            SparseMatrix transposed = mat1.transpose();
            std::cout << "Transposed Matrix 1:\n";
            transposed.print();

            break;
        }
        case 4: 
        {
            std::cout << "Enter elements for Matrix 2 (non-zero values only):\n";

            int row, col, value;
            char addMore;

            do {
                std::cout << "Enter row, column, and value: ";
                std::cin >> row >> col >> value;
                mat2.addElement(row, col, value);
                std::cout << "Add another element to Matrix 2? (y/n): ";
                std::cin >> addMore;
            } while (addMore == 'y' || addMore == 'Y');

            secondMatrixAdded = true;
            break;
        }
        case 5: 
        {
            if (!secondMatrixAdded) 
            {
                std::cout << "Matrix 2 has not been added yet.\n";
                break;
            }

            SparseMatrix result = mat1.add(mat2);
            std::cout << "Sum of Matrix 1 and Matrix 2:\n";
            result.print();

            break;
        }
        case 6:
        {
            std::cout << "Matrix 1:\n";
            mat1.print();

            break;
        }
        case 7: 
        {
            if (!secondMatrixAdded) 
            {
                std::cout << "Matrix 2 has not been added yet.\n";
                break;
            }

            std::cout << "Matrix 2:\n";
            mat2.print();

            break;
        }
        case 0: 
        {
            std::cout << "Exiting\n";
            break;
        }
        default:
            std::cout << "Invalid choice. Please try again.\n";
        }
    } while (choice != 0);

    return 0;
}
