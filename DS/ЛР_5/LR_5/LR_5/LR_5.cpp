#include <iostream>
#include <string>
#include <iomanip>
#include <Windows.h>
#include <bitset>

struct BinomialNode
{
    int key;
    int degree;
    BinomialNode* parent;
    BinomialNode* child;
    BinomialNode* sibling;

    BinomialNode(int k)
	{
        key = k;
        degree = 0;
        parent = nullptr;
        child = nullptr;
        sibling = nullptr;
    }
};

class BinomialHeap
{
private:
    BinomialNode* head;

public:
    BinomialHeap()
	{
        head = nullptr;
    }

    void insert(int key)
	{
        BinomialNode* node = new BinomialNode(key);
        BinomialHeap tempHeap;
        tempHeap.head = node;
        head = unionHeaps(head, tempHeap.head);
    }

    void deleteKey(int key)
	{
        decreaseKey(key, INT_MIN);
        extractMin();
    }

    int getTotalNodes()
	{
        return countNodes(head);
    }

    int getNumberOfBinomialTrees()
	{
        return countBinomialTrees(head);
    }

    void displayHeap()
	{
        std::cout << "Біноміальна купа:" << std::endl;
        printBinomialHeap(head);
    }

private:
    void linkTrees(BinomialNode* y, BinomialNode* z)
	{
        y->parent = z;
        y->sibling = z->child;
        z->child = y;
        z->degree++;
    }

    BinomialNode* mergeHeaps(BinomialNode* h1, BinomialNode* h2) {
        BinomialNode* newHead = nullptr;
        BinomialNode* tail = nullptr;
        BinomialNode* a = h1;
        BinomialNode* b = h2;

        if (a == nullptr)
        {
	        return b;
        }
        if (b == nullptr)
        {
	        return a;
        }

        if (a->degree <= b->degree) 
        {
            newHead = a;
            a = a->sibling;
        }
        else 
        {
            newHead = b;
            b = b->sibling;
        }

        tail = newHead;

        while (a != nullptr && b != nullptr) 
        {
            if (a->degree <= b->degree) 
            {
                tail->sibling = a;
                a = a->sibling;
            }
            else 
            {
                tail->sibling = b;
                b = b->sibling;
            }

            tail = tail->sibling;
        }

        tail->sibling = a != nullptr ? a : b;

        return newHead;
    }

    BinomialNode* unionHeaps(BinomialNode* h1, BinomialNode* h2)
	{
        BinomialNode* newHead = mergeHeaps(h1, h2);

        if (!newHead)
        {
	        return nullptr;
        }

        BinomialNode* prev = nullptr;
        BinomialNode* curr = newHead;
        BinomialNode* next = curr->sibling;

        while (next)
        {
            if (curr->degree != next->degree ||
                (next->sibling != nullptr && next->sibling->degree == curr->degree)) {
                prev = curr;
                curr = next;
            }
            else 
            {
                if (curr->key <= next->key) 
                {
                    curr->sibling = next->sibling;
                    linkTrees(next, curr);
                }
                else 
                {
                    if (prev == nullptr)
                    {
	                    newHead = next;
                    }
                    else
                    {
	                    prev->sibling = next;
                    }

                    linkTrees(curr, next);
                    curr = next;
                }
            }
            next = curr->sibling;
        }
        return newHead;
    }

    void decreaseKey(int key, int newKey)
	{
        BinomialNode* node = findNode(head, key);

        if (!node) 
        {
            std::cout << "Ключ не знайдено." << std::endl;
            return;
        }

        if (newKey > node->key) 
        {
            std::cout << "Новий ключ більший за поточний ключ." << std::endl;
            return;
        }

        node->key = newKey;
        BinomialNode* y = node;
        BinomialNode* z = y->parent;

        while (z && y->key < z->key) 
        {
            std::swap(y->key, z->key);
            y = z;
            z = y->parent;
        }
    }

    BinomialNode* extractMin()
	{
        if (!head)
        {
	        return nullptr;
        }

        BinomialNode* prevMin = nullptr;
        BinomialNode* minNode = head;
        BinomialNode* prevTemp = nullptr;
        BinomialNode* temp = head;

        int minKey = head->key;     
        while (temp->sibling) 
        {
            if (temp->sibling->key < minKey) 
            {
                minKey = temp->sibling->key;
                prevMin = temp;
                minNode = temp->sibling;
            }

            temp = temp->sibling;
        }

        if (prevMin && minNode) 
        {
            prevMin->sibling = minNode->sibling;
        }
        else if (!prevMin && minNode) 
        {
            head = minNode->sibling;
        }

        if (minNode->child) 
        {
            BinomialNode* child = minNode->child;
            BinomialNode* revChild = nullptr;

            while (child) {
                BinomialNode* nextChild = child->sibling;
                child->sibling = revChild;
                child->parent = nullptr;
                revChild = child;
                child = nextChild;
            }

            head = unionHeaps(head, revChild);
        }

        return minNode;
    }

    BinomialNode* findNode(BinomialNode* h, int key)
	{
        if (h == nullptr)
        {
	        return nullptr;
        }
        if (h->key == key)
        {
	        return h;
        }

        BinomialNode* res = findNode(h->child, key);

        if (res)
        {
	        return res;
        }

        return findNode(h->sibling, key);
    }

    int countNodes(BinomialNode* h)
	{
        if (h == nullptr)
        {
	        return 0;
        }

        return 1 + countNodes(h->child) + countNodes(h->sibling);
    }

    int countBinomialTrees(BinomialNode* h)
	{
        int count = 0;
        BinomialNode* temp = h;

        while (temp) 
        {
            count++;
            temp = temp->sibling;
        }

        return count;
    }

    void printBinomialHeap(BinomialNode* h)
	{
        if (h == nullptr)
        {
	        return;
        }

        BinomialNode* temp = h;
        while (temp != nullptr) 
        {
            printBinomialTree(temp);
            temp = temp->sibling;
        }
    }

    void printBinomialTree(BinomialNode* node)
	{
        std::cout << "Ступінь " << node->degree << " :" << std::endl;
        printTree(node, 0);
        std::cout << std::endl;
    }

    void printTree(BinomialNode* node, int indent)
	{
        if (node == nullptr)
        {
	        return;
        }

        for (int i = 0; i < indent; i++)
        {
	        std::cout << "  ";
        }

        std::cout << node->key << std::endl;

        printTree(node->child, indent + 1);
        printTree(node->sibling, indent);
    }
};

int main() {
    SetConsoleCP(1251);
    SetConsoleOutputCP(1251);

    BinomialHeap heap;

    std::string command;
    std::cout << "Меню:" << std::endl;
    std::cout << "1. Вставити" << std::endl;
    std::cout << "2. Видалити" << std::endl;
    std::cout << "3. Усього вузлів" << std::endl;
    std::cout << "4. Кількість дерев" << std::endl;
    std::cout << "5. Вивести дерево" << std::endl;
    std::cout << "6. Вийти" << std::endl;

    while (true) 
    {
        std::cout << ">> ";
        std::cin >> command;

        if (command == "1") 
        {
            int value;
            std::cout << "Введіть значення для вставки: ";
            std::cin >> value;

            heap.insert(value);
            std::cout << "Вставлено " << value << " в біноміальну купу." << std::endl;
        }
        else if (command == "2") 
        {
            int value;
            std::cout << "Введіть значення для видалення: ";
            std::cin >> value;

            heap.deleteKey(value);
            std::cout << "Видалено " << value << " з біноміальної купи." << std::endl;
        }
        else if (command == "3") 
        {
            int totalNodes = heap.getTotalNodes();

            std::cout << "Загальна кількість вузлів: " << totalNodes << std::endl;
            std::cout << "Десяткове: " << totalNodes << std::endl;
            std::cout << "Бінарне: ";

            for (int i = sizeof(int) * 8 - 1; i >= 0; i--) 
            {
                std::cout << (totalNodes >> i & 1);
            }
            std::cout << std::endl;
        }
        else if (command == "4") 
        {
            int numTrees = heap.getNumberOfBinomialTrees(); 
            std::cout << "Кількість біноміальних дерев: " << numTrees << std::endl;
        }
        else if (command == "5") 
        {
            heap.displayHeap();
        }
        else if (command == "6") 
        {
            std::cout << "Вихід з програми." << std::endl;
            break;
        }
        else 
        {
            std::cout << "Невідома команда. Спробуйте ще раз." << std::endl;
        }
    }

    return 0;
}