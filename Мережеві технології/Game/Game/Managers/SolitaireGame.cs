using Game.Data;

namespace Game.Managers
{
    internal class SolitaireGame
    {
        public int[,] Board { get; private set; }
        public int Size { get; private set; }
        public List<Move> MoveHistory { get; private set; }
        public DateTime GameStartTime { get; set; }
        public GameState State { get; set; }

        public SolitaireGame(int level)
        {
            Size = 5 + (level - 1) * 2;
            Board = new int[Size, Size];
            MoveHistory = new List<Move>();
            State = new GameState();
            InitializeBoard();
        }

        private void InitializeBoard()
        {
            // Створюємо дошку у формі хреста (як на картинці)
            for (int i = 0; i < Size; i++)
            {
                for (int j = 0; j < Size; j++)
                {
                    Board[i, j] = -1; // -1 = недоступна клітинка
                }
            }

            int third = Size / 3;
            int twoThirds = (Size * 2) / 3;

            // Заповнюємо хрест фішками
            for (int i = 0; i < Size; i++)
            {
                for (int j = 0; j < Size; j++)
                {
                    int y = Math.Abs(Size / 2 - i);
                    int x = Math.Abs(Size / 2 - j);

                    if (y + x < Size - 2)
                    {
                        Board[i, j] = 1;
                    }
                }
            }

            // Видаляємо центральну фішку
            Board[Size / 2, Size / 2] = 0;
        }

        public bool IsCellPlayable(int row, int col)
        {
            if (row < 0 || row >= Size || col < 0 || col >= Size) return false;
            return Board[row, col] != -1;
        }

        public bool IsValidMove(int fromRow, int fromCol, int toRow, int toCol)
        {
            if (!IsCellPlayable(fromRow, fromCol) || !IsCellPlayable(toRow, toCol)) return false;
            if (Board[fromRow, fromCol] != 1 || Board[toRow, toCol] != 0) return false;

            int dRow = toRow - fromRow;
            int dCol = toCol - fromCol;

            if (Math.Abs(dRow) == 2 && dCol == 0)
            {
                int midRow = (fromRow + toRow) / 2;
                return IsCellPlayable(midRow, fromCol) && Board[midRow, fromCol] == 1;
            }

            if (Math.Abs(dCol) == 2 && dRow == 0)
            {
                int midCol = (fromCol + toCol) / 2;
                return IsCellPlayable(fromRow, midCol) && Board[fromRow, midCol] == 1;
            }

            return false;
        }

        public void MakeMove(int fromRow, int fromCol, int toRow, int toCol, string playerName)
        {
            Board[fromRow, fromCol] = 0;
            Board[toRow, toCol] = 1;

            int midRow = (fromRow + toRow) / 2;
            int midCol = (fromCol + toCol) / 2;
            Board[midRow, midCol] = 0;

            MoveHistory.Add(new Move
            {
                FromRow = fromRow,
                FromCol = fromCol,
                ToRow = toRow,
                ToCol = toCol,
                Timestamp = DateTime.Now,
                PlayerName = playerName
            });
        }

        public int CountRemainingPieces()
        {
            int count = 0;
            for (int i = 0; i < Size; i++)
                for (int j = 0; j < Size; j++)
                    if (Board[i, j] == 1) count++;
            return count;
        }

        public bool HasValidMoves()
        {
            for (int i = 0; i < Size; i++)
            {
                for (int j = 0; j < Size; j++)
                {
                    if (Board[i, j] == 1)
                    {
                        if (IsValidMove(i, j, i - 2, j)) return true;
                        if (IsValidMove(i, j, i + 2, j)) return true;
                        if (IsValidMove(i, j, i, j - 2)) return true;
                        if (IsValidMove(i, j, i, j + 2)) return true;
                    }
                }
            }
            return false;
        }
    }
}
