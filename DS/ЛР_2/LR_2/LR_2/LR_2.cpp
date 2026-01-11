﻿#include <iostream>
#include <algorithm>
#include <cstdlib>
#include <ctime>
#include <memory>

template<typename T>
class SkipList 
{
private:
    struct Node 
    {
        int key;
        T value;
        Node** forward;
        Node(int k, T v, int level) : key(k), value(v) 
        {
            forward = new Node * [level + 1];
            for (int i = 0; i <= level; ++i) 
            {
                forward[i] = nullptr;
            }
        }
        ~Node()
    	{
            delete[] forward;
        }
    };

    int maxLevel;
    int capacity;
    Node* header;
    float p;

    int randomLevel()
	{
        int level = 0;
        while ((static_cast<float>(rand()) / RAND_MAX) < p && level < maxLevel) 
        {
            level++;
        }
        return level;
    }

public:
    SkipList(int maxLev, float probability) : maxLevel(maxLev), capacity(0), p(probability)
	{
        header = new Node(-1, T(), maxLevel);
    }

    ~SkipList()
	{
        clear();
        delete header;
    }

    void add(int key, T value)
	{
        Node* current = header;
        Node** update = new Node * [maxLevel + 1];
        for (int i = maxLevel; i >= 0; --i) 
        {
            while (current->forward[i] != nullptr && current->forward[i]->key < key) 
            {
                current = current->forward[i];
            }
            update[i] = current;
        }

        current = current->forward[0];

        if (current == nullptr || current->key != key) 
        {
            int newLevel = randomLevel();
            newLevel = std::min(newLevel, maxLevel);
            Node* newNode = new Node(key, value, newLevel);

            for (int i = 0; i <= newLevel; ++i) 
            {
                newNode->forward[i] = update[i]->forward[i];
                update[i]->forward[i] = newNode;
            }

            capacity++;
        }

        delete[] update;
    }

    Node* search(int key)
	{
        Node* current = header;

        for (int i = maxLevel; i >= 0; --i) 
        {
            while (current->forward[i] != nullptr && current->forward[i]->key < key) 
            {
                current = current->forward[i];
            }
        }

        current = current->forward[0];
        return current != nullptr && current->key == key ? current : nullptr;
    }

    void remove(int key)
	{
        Node* current = header;
        Node** update = new Node * [maxLevel + 1];

        for (int i = maxLevel; i >= 0; --i) 
        {
            while (current->forward[i] != nullptr && current->forward[i]->key < key) 
            {
                current = current->forward[i];
            }

            update[i] = current;
        }

        current = current->forward[0];

        if (current != nullptr && current->key == key) 
        {
            for (int i = 0; i <= maxLevel; ++i) 
            {
                if (update[i]->forward[i] != current) 
                {
                    break;
                }

                update[i]->forward[i] = current->forward[i];
            }

            delete current;
            capacity--;
        }

        delete[] update;
    }

    void clear()
	{
        Node* current = header->forward[0];

        while (current != nullptr) 
        {
            Node* temp = current;
            current = current->forward[0];
            delete temp;
        }

        for (int i = 0; i <= maxLevel; ++i) 
        {
            header->forward[i] = nullptr;
        }

        capacity = 0;
    }

    SkipList* copy()
	{
        SkipList* newList = new SkipList(maxLevel, p);
        Node* current = header->forward[0];

        while (current != nullptr) 
        {
            newList->add(current->key, current->value);
            current = current->forward[0];
        }

        return newList;
    }

    void display()
	{
        for (int i = 0; i <= maxLevel; ++i) 
        {
            Node* current = header->forward[i];
            std::cout << "Level " << i << ": ";

            while (current != nullptr) 
            {
                std::cout << "(" << current->key << ", " << current->value << ") ";
                current = current->forward[i];
            }

            std::cout << std::endl;
        }
    }

    int size() const
	{
        return capacity;
    }
};

int main()
{
    srand(static_cast<unsigned int>(time(0)));
    SkipList<int> list(3, 0.5);

    int choice;
    do 
    {
        std::cout << "Menu:\n";
        std::cout << "1. Add element\n";
        std::cout << "2. Search element\n";
        std::cout << "3. Remove element\n";
        std::cout << "4. Display SkipList\n";
        std::cout << "5. Clear SkipList\n";
        std::cout << "6. Copy SkipList\n";
        std::cout << "7. Exit\n";
        std::cout << ">> ";
        std::cin >> choice;

        switch (choice)
    	{
        case 1: 
        {
            int key, value;
            std::cout << "Enter key: ";
            std::cin >> key;
            std::cout << "Enter value: ";
            std::cin >> value;
            list.add(key, value);
            std::cout << "Element added.\n";
            break;
        }
        case 2: 
        {
            int key;
            std::cout << "Enter key to search: ";
            std::cin >> key;

            auto foundNode = list.search(key);
            if (foundNode) 
            {
                std::cout << "Found: (" << foundNode->key << ", " << foundNode->value << ")\n";
            }
            else 
            {
                std::cout << "Element not found.\n";
            }
            break;
        }
        case 3: 
        {
            int key;
            std::cout << "Enter key to remove: ";
            std::cin >> key;
            list.remove(key);
            std::cout << "Element removed (if it existed).\n";
            break;
        }
        case 4: 
        {
            std::cout << "SkipList contents:\n";
            list.display();
            break;
        }
        case 5: 
        {
            list.clear();
            std::cout << "SkipList cleared.\n";
            break;
        }
        case 6: 
        {
            SkipList<int>* copiedList = list.copy();
            std::cout << "Copied SkipList contents:\n";
            copiedList->display();

            delete copiedList;
            break;
        }
        case 7: 
        {
            std::cout << "Exiting the program.\n";
            break;
        }
        default: 
        {
            std::cout << "Invalid choice, please try again.\n";
            break;
        }
        }
    } while (choice != 7);

    return 0;
}