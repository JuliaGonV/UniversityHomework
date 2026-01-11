#include <iostream>
#include <Windows.h>

const int MAX_VERTICES = 100;

int adjacencyMatrix[MAX_VERTICES][MAX_VERTICES];
int adjacencyList[MAX_VERTICES][MAX_VERTICES];
int adjacencyListSize[MAX_VERTICES];
int numVertices = 0;
int queue[MAX_VERTICES];
int front = 0, rear = -1;
int stack[MAX_VERTICES];
int top = -1;
bool visited[MAX_VERTICES];

void initializeGraph() {
	for (int i = 0; i < MAX_VERTICES; i++) 
	{
		adjacencyListSize[i] = 0;
		visited[i] = false;
		for (int j = 0; j < MAX_VERTICES; j++) 
		{
			adjacencyMatrix[i][j] = 0;
			adjacencyList[i][j] = -1;
		}
	}
}

void addVertex() {
	if (numVertices < MAX_VERTICES) {
		std::cout << "Вершина " << numVertices << " додана.\n";
		numVertices++;
	}
	else {
		std::cout << "Досягнуто максимальну кількість вершин.\n";
	}
}

void addEdge() {
	int u, v;
	std::cout << "Введіть першу вершину: ";
	std::cin >> u;
	std::cout << "Введіть другу вершину: ";
	std::cin >> v;

	if (u >= numVertices || v >= numVertices || u < 0 || v < 0) 
	{
		std::cout << "Неприпустимі вершини.\n";
		return;
	}

	adjacencyMatrix[u][v] = 1;
	adjacencyMatrix[v][u] = 1;
	adjacencyList[u][adjacencyListSize[u]] = v;
	adjacencyListSize[u]++;
	adjacencyList[v][adjacencyListSize[v]] = u;
	adjacencyListSize[v]++;

	std::cout << "Ребро між " << u << " і " << v << " додано.\n";
}

void displayAdjacencyMatrix()
{
	std::cout << "Матриця суміжності:\n";
	for (int i = 0; i < numVertices; i++) 
	{
		for (int j = 0; j < numVertices; j++) 
		{
			std::cout << adjacencyMatrix[i][j] << " ";
		}
		std::cout << "\n";
	}
}

void displayAdjacencyLists()
{
	std::cout << "Списки суміжності:\n";
	for (int i = 0; i < numVertices; i++) 
	{
		std::cout << i << ": ";
		for (int j = 0; j < adjacencyListSize[i]; j++) 
		{
			std::cout << adjacencyList[i][j] << " ";
		}
		std::cout << "\n";
	}
}

void enqueue(int vertex)
{
	if (rear == MAX_VERTICES - 1) 
	{
		std::cout << "Черга повна.\n";
		return;
	}

	rear++;
	queue[rear] = vertex;
}


int dequeue()
{
	if (front > rear) 
	{
		return -1;
	}

	return queue[front++];
}


void bfsTraversal()
{

	for (int i = 0; i < numVertices; i++)
	{
		visited[i] = false;
	}

	int startVertex;
	std::cout << "Введіть початкову вершину для BFS: ";
	std::cin >> startVertex;

	if (startVertex >= numVertices || startVertex < 0) 
	{
		std::cout << "Неприпустима вершина.\n";
		return;
	}

	enqueue(startVertex);
	visited[startVertex] = true;
	std::cout << "BFS порядок відвідування: ";

	while (front <= rear) 
	{
		int currentVertex = dequeue();
		std::cout << currentVertex << " ";


		for (int i = 0; i < adjacencyListSize[currentVertex]; i++) 
		{
			int adjVertex = adjacencyList[currentVertex][i];

			if (!visited[adjVertex]) 
			{
				visited[adjVertex] = true;
				enqueue(adjVertex);
			}
		}
	}

	std::cout << "\n";
	front = 0;
	rear = -1;
}


void push(int vertex)
{
	if (top == MAX_VERTICES - 1) 
	{
		std::cout << "Стек повний.\n";
		return;
	}

	top++;
	stack[top] = vertex;
}


int pop()
{
	if (top == -1) 
	{
		return -1;
	}

	return stack[top--];
}


void dfsTraversal()
{
	for (int i = 0; i < numVertices; i++)
	{
		visited[i] = false;
	}

	int startVertex;
	std::cout << "Введіть початкову вершину для DFS: ";
	std::cin >> startVertex;

	if (startVertex >= numVertices || startVertex < 0) 
	{
		std::cout << "Неприпустима вершина.\n";
		return;
	}

	push(startVertex);
	std::cout << "DFS порядок відвідування: ";

	while (top != -1) 
	{
		int currentVertex = pop();
		if (!visited[currentVertex]) 
		{
			visited[currentVertex] = true;
			std::cout << currentVertex << " ";

			for (int i = adjacencyListSize[currentVertex] - 1; i >= 0; i--) 
			{
				int adjVertex = adjacencyList[currentVertex][i];
				if (!visited[adjVertex]) {
					push(adjVertex);
				}
			}
		}
	}

	std::cout << "\n";
}


void buildSpanningTree()
{
	for (int i = 0; i < numVertices; i++)
	{
		visited[i] = false;
	}

	int parent[MAX_VERTICES];
	for (int i = 0; i < numVertices; i++)
	{
		parent[i] = -1;
	}

	int startVertex;
	std::cout << "Введіть початкову вершину для побудови кістякового дерева: ";
	std::cin >> startVertex;

	if (startVertex >= numVertices || startVertex < 0) 
	{
		std::cout << "Неприпустима вершина.\n";
		return;
	}

	enqueue(startVertex);
	visited[startVertex] = true;

	while (front <= rear) 
	{
		int currentVertex = dequeue();

		for (int i = 0; i < adjacencyListSize[currentVertex]; i++) 
		{
			int adjVertex = adjacencyList[currentVertex][i];
			if (!visited[adjVertex]) 
			{
				visited[adjVertex] = true;
				parent[adjVertex] = currentVertex;
				enqueue(adjVertex);
			}
		}
	}

	std::cout << "Ребра кістякового дерева:\n";
	for (int i = 0; i < numVertices; i++) 
	{
		if (parent[i] != -1) 
		{
			std::cout << parent[i] << " - " << i << "\n";
		}
	}

	front = 0;
	rear = -1;
}

int main()
{
	SetConsoleCP(1251);
	SetConsoleOutputCP(1251);
	initializeGraph();

	int choice;
	do 
	{
		std::cout << "Меню:\n";
		std::cout << "1. Додати вершину\n";
		std::cout << "2. Додати ребро\n";
		std::cout << "3. Вивести матрицю суміжності\n";
		std::cout << "4. Вивести списки суміжності\n";
		std::cout << "5. Виконати пошук в ширину (BFS)\n";
		std::cout << "6. Виконати пошук в глибину (DFS)\n";
		std::cout << "7. Побудувати кістякове дерево\n";
		std::cout << "8. Вихід\n";
		std::cout << ">> ";
		std::cin >> choice;


		switch (choice)
		{
		case 1:
			addVertex();
			break;
		case 2:
			addEdge();
			break;
		case 3:
			displayAdjacencyMatrix();
			break;
		case 4:
			displayAdjacencyLists();
			break;
		case 5:
			bfsTraversal();
			break;
		case 6:
			dfsTraversal();
			break;
		case 7:
			buildSpanningTree();
			break;
		case 8:
			std::cout << "Вихід з програми.\n";
			break;
		default:
			std::cout << "Неприпустимий вибір. Спробуйте ще раз.\n";
		}
	} while (choice != 8);

	return 0;
}