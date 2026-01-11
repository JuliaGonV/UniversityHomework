#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <iomanip>
#include<windows.h>

struct Node
{
    std::vector<double> point;
    Node* left;
    Node* right;

    Node(const std::vector<double>& point) : point(point), left(nullptr), right(nullptr)
    {
	    
    }
};

class KDTree
{
private:
    Node* root;
    int k;

    Node* insertRec(Node* root, const std::vector<double>& point, int depth)
	{
        if (root == nullptr) 
        {
            return new Node(point);
        }

        int cd = depth % k;
        if (point[cd] < root->point[cd]) 
        {
            root->left = insertRec(root->left, point, depth + 1);
        }
        else 
        {
            root->right = insertRec(root->right, point, depth + 1);
        }

        return root;
    }

    Node* deleteRec(Node* root, const std::vector<double>& point, int depth)
	{
        if (root == nullptr) 
        {
            return nullptr;
        }

        int cd = depth % k;
        if (arePointsSame(root->point, point)) 
        {
            if (root->right != nullptr) 
            {
                Node* min = findMin(root->right, cd, depth + 1);
                root->point = min->point;
                root->right = deleteRec(root->right, min->point, depth + 1);
            }
            else if (root->left != nullptr) 
            {
                Node* min = findMin(root->left, cd, depth + 1);
                root->point = min->point;
                root->right = deleteRec(root->left, min->point, depth + 1);
                root->left = nullptr;
            }
            else 
            {
                delete root;
                return nullptr;
            }

            return root;
        }

        if (point[cd] < root->point[cd]) 
        {
            root->left = deleteRec(root->left, point, depth + 1);
        }
        else 
        {
            root->right = deleteRec(root->right, point, depth + 1);
        }

        return root;
    }

    Node* findMin(Node* root, int d, int depth)
	{
        if (root == nullptr) 
        {
            return nullptr;
        }

        int cd = depth % k;

        if (cd == d) {
            if (root->left == nullptr) 
            {
                return root;
            }

            return findMin(root->left, d, depth + 1);
        }

        Node* leftMin = findMin(root->left, d, depth + 1);
        Node* rightMin = findMin(root->right, d, depth + 1);

        Node* min = root;
        if (leftMin != nullptr && leftMin->point[d] < min->point[d]) 
        {
            min = leftMin;
        }
        if (rightMin != nullptr && rightMin->point[d] < min->point[d]) 
        {
            min = rightMin;
        }
        return min;
    }

    bool arePointsSame(const std::vector<double>& point1, const std::vector<double>& point2)
	{
        for (int i = 0; i < k; i++) 
        {
            if (point1[i] != point2[i]) 
            {
                return false;
            }
        }
        return true;
    }

    double distanceSquared(const std::vector<double>& point1, const std::vector<double>& point2)
	{
        double dist = 0;

        for (int i = 0; i < k; i++) 
        {
            dist += (point1[i] - point2[i]) * (point1[i] - point2[i]);
        }

        return dist;
    }

    std::vector<double> findNearestRec(Node* root, const std::vector<double>& target, int depth, std::vector<double> best)
	{
        if (root == nullptr) 
        {
            return best;
        }

        double bestDist = distanceSquared(target, best);
        double rootDist = distanceSquared(target, root->point);

        if (rootDist < bestDist) 
        {
            best = root->point;
        }

        int cd = depth % k;
        Node* nextBranch = target[cd] < root->point[cd] ? root->left : root->right;
        Node* oppositeBranch = target[cd] < root->point[cd] ? root->right : root->left;

        best = findNearestRec(nextBranch, target, depth + 1, best);

        if (abs(root->point[cd] - target[cd]) < sqrt(bestDist)) 
        {
            best = findNearestRec(oppositeBranch, target, depth + 1, best);
        }

        return best;
    }

    void printRec(Node* root, int depth)
	{
        if (root != nullptr) 
        {
            printRec(root->left, depth + 1);
            std::cout << std::string(depth * 4, ' ') << "(" << root->point[0] << ", " << root->point[1] << ")\n";
            printRec(root->right, depth + 1);
        }
    }

public:
    KDTree(int dimension = 2) : root(nullptr), k(dimension)
    {
	    
    }

    void insert(const std::vector<double>& point)
	{
        root = insertRec(root, point, 0);
    }

    void remove(const std::vector<double>& point)
	{
        root = deleteRec(root, point, 0);
    }

    std::vector<double> findNearest(const std::vector<double>& target)
	{
        if (root == nullptr) 
        {
            return {};
        }

        return findNearestRec(root, target, 0, root->point);
    }

    void printTree()
	{
        printRec(root, 0);
    }
};

int main()
{
    SetConsoleOutputCP(1251);
    KDTree tree;
    int choice;

    do 
    {
        std::cout << "Меню:" << std::endl;
        std::cout << "1. Додати точку" << std::endl;
        std::cout << "2. Видалити точку" << std::endl;
        std::cout << "3. Знайти найближчого сусіда" << std::endl;
        std::cout << "4. Вивести дерево" << std::endl;
        std::cout << "0. Вийти" << std::endl;
        std::cout << ">>: ";
        std::cin >> choice;

        switch (choice)
    	{
        case 1: 
        {
            std::vector<double> point(2);

            std::cout << "Введіть координату x: ";
            std::cin >> point[0];
            std::cout << "Введіть координату y: ";
            std::cin >> point[1];
            tree.insert(point);
            std::cout << "Точка додана." << std::endl;

            break;
        }
        case 2: 
        {
            std::vector<double> point(2);

            std::cout << "Введіть координату x: ";
            std::cin >> point[0];
            std::cout << "Введіть координату y: ";
            std::cin >> point[1];
            tree.remove(point);
            std::cout << "Точка видалена (якщо існувала)." << std::endl;

            break;
        }
        case 3: 
        {
            std::vector<double> target(2);

            std::cout << "Введіть координату x цільової точки: ";
            std::cin >> target[0];
            std::cout << "Введіть координату y цільової точки: ";
            std::cin >> target[1];

            std::vector<double> nearest = tree.findNearest(target);

            if (!nearest.empty()) 
            {
                std::cout << "Найближчий сусід: (" << nearest[0] << ", " << nearest[1] << ")" << std::endl;
            }
            else 
            {
                std::cout << "Дерево порожнє." << std::endl;
            }

            break;
        }
        case 4:
            std::cout << "KD-дерево:" << std::endl;
            tree.printTree();

            break;

        case 0:
            std::cout << "Вихід з програми." << std::endl;
            break;
        default:
            std::cout << "Неправильний вибір. Спробуйте ще раз." << std::endl;
        }
    } while (choice != 0);

    return 0;
}