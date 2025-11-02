#include <iostream>
#include "Dequeue.h"

Dequeue dequeue;

void run();
int inputValue();


int main()
{
	while (true)
	{
		run();
	}
}

void run()
{
	int action;
	std::cin >> action;

	switch (action)
	{
	case 0:
		dequeue.Debug();
		break;
	case 1:
	{
		int value = inputValue();
		dequeue.AddFirst(value);
		dequeue.Debug();
		break;
	}
	case 2:
	{
		int value = inputValue();
		dequeue.AddLast(value);
		dequeue.Debug();
		break;
	}
	case 3:
		dequeue.RemoveFirst();
		dequeue.Debug();
		break;
	case 4:
		dequeue.RemoveLast();
		dequeue.Debug();
		break;
	case 5:
	{
		int value;
		if (dequeue.TryGetFirst(value))
		{
			std::cout << value << std::endl;
		}
		break;
	}
	case 6:
	{
		int value;
		if (dequeue.TryGetLast(value))
		{
			std::cout << value << std::endl;
		}
		break;
	}
	case 7:
		dequeue.SwapExtremeValues();
		dequeue.Debug();
		break;
	case 8:
	{
		bool empty = dequeue.IsEmpty();
		std::cout << (empty ? "Empty" : "Not empty") << std::endl;
		break;
	}
	case 9:
	{
		int length = dequeue.GetLength();
		std::cout << length << std::endl;
		break;
	}
	case 10:
		dequeue.Flip();
		dequeue.Debug();
		break;
	case 11:
	{
		int value = inputValue();
		bool contains = dequeue.Contains(value);
		std::cout << (contains ? "Contains" : "Does not contain") << std::endl;
		break;
	}
	case 12:
		dequeue.Clear();
		break;
	}
}

int inputValue()
{
	int value;
	std::cin >> value;

	return value;
}