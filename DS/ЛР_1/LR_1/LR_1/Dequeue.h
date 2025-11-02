#include "Node.h"
#pragma once

class Dequeue
{
private:
	Node* _head = nullptr;
	Node* _tail = nullptr;
	int _length = 0;

public:
	void AddFirst(int value)
	{
		Node* node = new Node();

		node->Previous = nullptr;
		node->Next = _head;
		node->Value = value;

		if (_head != nullptr)
		{
			_head->Previous = node;
		}

		_head = node;
		
		if (_tail == nullptr)
		{
			_tail = node;
		}

		_length++;
	}

	void AddLast(int value)
	{
		Node* node = new Node();

		node->Previous = _tail;
		node->Next = nullptr;
		node->Value = value;

		if (_tail != nullptr)
		{
			_tail->Next = node;
		}

		_tail = node;

		if (_head == nullptr)
		{
			_head = node;
		}

		_length++;
	}

	void RemoveFirst()
	{
		if (_head == nullptr)
		{
			return;
		}

		Node* temp = _head;

		_head = _head->Next;
		if (_head == nullptr)
		{
			_tail = _head;
		}
		else
		{
			_head->Previous = nullptr;
		}

		delete temp;

		_length--;
	}

	void RemoveLast()
	{
		if (_tail == nullptr)
		{
			return;
		}

		Node* temp = _tail;

		_tail = _tail->Previous;
		if (_tail == nullptr)
		{
			_head = _tail;
		}
		else
		{
			_tail->Next = nullptr;
		}

		delete temp;

		_length--;
	}

	bool TryGetFirst(int& value)
	{
		if (_head == nullptr)
		{
			return false;
		}

		value = _head->Value;
		return true;
	}

	bool TryGetLast(int& value)
	{
		if (_tail == nullptr)
		{
			return false;
		}

		value = _tail->Value;
		return true;
	}

	void SwapExtremeValues()
	{
		if (_head == nullptr)
		{
			return;
		}

		if (_head == _tail)
		{
			return;
		}

		int temp = _head->Value;
		_head->Value = _tail->Value;
		_tail->Value = temp;
	}

	bool IsEmpty()
	{
		return _head == nullptr;
	}

	int GetLength()
	{
		return _length;
	}

	void Flip()
	{
		if (_head == nullptr)
		{
			return;
		}

		if (_head == _tail)
		{
			return;
		}

		Node* current = _head;

		while (current != nullptr)
		{
			Node* next = current->Next;

			current->Next = current->Previous;
			current->Previous = next;

			current = next;
		}

		Node* temp = _head;
		_head = _tail;
		_tail = temp;
	}

	bool Contains(int value)
	{
		Node* current = _head;

		while (current != nullptr)
		{
			if (current->Value == value)
			{
				return true;
			}

			current = current->Next;
		}

		return false;
	}

	void Clear()
	{
		if (_head == nullptr)
		{
			return;
		}

		Node* current = _head;

		while (current != nullptr)
		{
			Node* next = current->Next;

			delete current;

			current = next;
		}

		_head = nullptr;
		_tail = nullptr;

		_length = 0;
	}

	void Debug()
	{

		Node* current = _head;
		while (current != nullptr)
		{
			std::cout << current->Value << " ";
			current = current->Next;
		}
		std::cout << std::endl;

		current = _tail;
		while (current != nullptr)
		{
			std::cout << current->Value << " ";
			current = current->Previous;
		}
		std::cout << std::endl;
	}
 };

