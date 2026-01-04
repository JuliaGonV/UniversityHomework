using Game.Data;
using Game.Managers;
using Microsoft.VisualBasic.Devices;
using Newtonsoft.Json;
using System.Security.AccessControl;

namespace Game
{
    public partial class MainForm : Form
    {
        private enum GameType
        {
            Simple = 0,
            Tournament = 1
        }

        private NetworkManager network;
        private SolitaireGame game;
        private Button[,] boardButtons;
        private Point? selectedCell;
        private string playerName;
        private string opponentName;
        private int currentLevel = 1;
        private Dictionary<string, PlayerStats> playerStats;
        private bool _server;
        private GameType _gameType;
        private int _gamesLeft = -1;

        public MainForm()
        {
            InitializeComponent();
            playerStats = new();
            network = new NetworkManager();
            network.MessageReceived += OnMessageReceived;
            network.ConnectionStatusChanged += OnConnectionStatusChanged;
        }

        private void BtnStartServer_Click(object sender, EventArgs e)
        {
            playerName = txtPlayerName.Text;
            if (network.StartServer((int)numPort.Value))
            {
                btnStartServer.Enabled = false;
                btnConnectClient.Enabled = false;
                _server = true;
                btnNewGame.Enabled = true;
                btnNewTournament.Enabled = true;
            }
        }

        private void BtnConnectClient_Click(object sender, EventArgs e)
        {
            playerName = txtPlayerName.Text;
            if (network.ConnectToServer(txtServerIP.Text, (int)numPort.Value))
            {
                btnStartServer.Enabled = false;
                btnConnectClient.Enabled = false;
                _server = false;

                network.SendMessage(new GameMessage
                {
                    Type = "PLAYER_NAME",
                    Data = playerName,
                    PlayerName = playerName
                });

                btnNewGame.Enabled = false;
                btnNewTournament.Enabled = false;
            }
        }

        private void OnConnectionStatusChanged(string status)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<string>(OnConnectionStatusChanged), status);
                return;
            }
            lblStatus.Text = status;
            if (status.Contains("підключен"))
            {
                btnNewGame.Enabled = true;
            }
        }

        private void OnMessageReceived(string message)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<string>(OnMessageReceived), message);
                return;
            }

            try
            {
                var gameMessage = JsonConvert.DeserializeObject<GameMessage>(message);

                switch (gameMessage.Type)
                {
                    case "PLAYER_NAME":
                        opponentName = gameMessage.Data;
                        if (network.IsServer)
                        {
                            network.SendMessage(new GameMessage
                            {
                                Type = "PLAYER_NAME_RESPONSE",
                                Data = playerName,
                                PlayerName = playerName
                            });
                        }
                        break;
                    case "PLAYER_NAME_RESPONSE":
                        opponentName = gameMessage.Data;
                        break;
                    case "MOVE":
                        var move = JsonConvert.DeserializeObject<Move>(gameMessage.Data);
                        ApplyMove(move);
                        break;
                    case "NEW_GAME":
                        var gameData = JsonConvert.DeserializeObject<Dictionary<string, string>>(gameMessage.Data);
                        int level = int.Parse(gameData["level"]);
                        string firstPlayer = gameData["firstPlayer"];
                        _gameType = (GameType)int.Parse(gameData["game_type"]);
                        StartNewGame(level, firstPlayer);
                        break;
                    case "GAME_OVER":
                        HandleGameOver(gameMessage.Data);
                        break;
                }
            }
            catch { }
        }

        private void StartNewGame(GameType gameType)
        {
            if (!network.IsConnected)
            {
                MessageBox.Show("Спочатку підключіться до мережі!", "Помилка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (string.IsNullOrEmpty(opponentName))
            {
                MessageBox.Show("Очікування імені суперника...", "Інформація", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var levelDialog = new Form
            {
                Text = "Виберіть Рівень",
                Size = new Size(250, 150),
                StartPosition = FormStartPosition.CenterParent
            };

            var lblLevel = new Label { Text = "Рівень (1-5):", Location = new Point(20, 20), AutoSize = true };
            var numLevel = new NumericUpDown { Location = new Point(100, 18), Width = 50, Minimum = 1, Maximum = 5, Value = currentLevel };
            var btnOk = new Button { Text = "OK", Location = new Point(50, 60), Size = new Size(60, 30), DialogResult = DialogResult.OK };
            var btnCancel = new Button { Text = "Скасувати", Location = new Point(120, 60), Size = new Size(80, 30), DialogResult = DialogResult.Cancel };

            levelDialog.Controls.AddRange(new Control[] { lblLevel, numLevel, btnOk, btnCancel });
            levelDialog.AcceptButton = btnOk;
            levelDialog.CancelButton = btnCancel;
            _gamesLeft = 3;
            _gameType = gameType;

            if (levelDialog.ShowDialog() == DialogResult.OK)
            {
                currentLevel = (int)numLevel.Value;

                Random rnd = new Random();
                string firstPlayer = rnd.Next(2) == 0 ? playerName : opponentName;

                StartNewGame(currentLevel, firstPlayer);

                var gameData = new Dictionary<string, string>
                {
                    { "level", currentLevel.ToString() },
                    { "firstPlayer", firstPlayer },
                    { "game_type", ((int)_gameType).ToString() }
                };

                network.SendMessage(new GameMessage
                {
                    Type = "NEW_GAME",
                    Data = JsonConvert.SerializeObject(gameData),
                    PlayerName = playerName
                });
            }
        }

        private void BtnNewGame_Click(object sender, EventArgs e)
        {
            StartNewGame(GameType.Simple);
        }

        private void BtnNewTournament_Click(object sender, EventArgs e)
        {
            StartNewGame(GameType.Tournament);
        }

        private void StartNewGame(int level, string firstPlayer)
        {
            game = new SolitaireGame(level);
            game.GameStartTime = DateTime.Now;
            game.State.Player1Name = playerName;
            game.State.Player2Name = opponentName;
            game.State.CurrentTurnPlayer = firstPlayer;
            currentLevel = level;
            selectedCell = null;

            CreateBoard();
            UpdateGameInfo();
            UpdateTurnInfo();
            gameTimer.Start();
            btnNewGame.Text = $"Нова Гра (Рівень {level})";
            btnNewTournament.Text = $"Новий турнір (Рівень {level})";
            lblStatus.Text = "Гра розпочата!";
        }

        private void CreateBoard()
        {
            boardPanel.Controls.Clear();
            boardButtons = new Button[game.Size, game.Size];

            int buttonSize = Math.Min(500 / game.Size, 55);
            int boardSize = buttonSize * game.Size;
            boardPanel.Size = new Size(boardSize + 20, boardSize + 20);

            for (int i = 0; i < game.Size; i++)
            {
                for (int j = 0; j < game.Size; j++)
                {
                    if (game.Board[i, j] == -1) continue;

                    var btn = new Button
                    {
                        Size = new Size(buttonSize - 2, buttonSize - 2),
                        Location = new Point(j * buttonSize + 5, i * buttonSize + 5),
                        Tag = new Point(i, j),
                        BackColor = game.Board[i, j] == 1 ? Color.DarkBlue : Color.LightGray
                    };
                    btn.Click += BoardButton_Click;
                    boardButtons[i, j] = btn;
                    boardPanel.Controls.Add(btn);
                }
            }
        }

        private void BoardButton_Click(object sender, EventArgs e)
        {
            if (game == null || !network.IsConnected || boardButtons == null) return;

            if (game.State.CurrentTurnPlayer != playerName)
            {
                MessageBox.Show("Зараз хід суперника! Зачекайте свою чергу.", "Не ваш хід", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            var btn = (Button)sender;
            var pos = (Point)btn.Tag;

            if (!selectedCell.HasValue)
            {
                if (game.Board[pos.X, pos.Y] == 1)
                {
                    selectedCell = pos;
                    btn.BackColor = Color.Yellow;
                }
            }
            else
            {
                if (game.IsValidMove(selectedCell.Value.X, selectedCell.Value.Y, pos.X, pos.Y))
                {
                    game.MakeMove(selectedCell.Value.X, selectedCell.Value.Y, pos.X, pos.Y, playerName);

                    // Зміна ходу
                    game.State.CurrentTurnPlayer = game.State.CurrentTurnPlayer == playerName ? opponentName : playerName;

                    var move = new Move
                    {
                        FromRow = selectedCell.Value.X,
                        FromCol = selectedCell.Value.Y,
                        ToRow = pos.X,
                        ToCol = pos.Y,
                        PlayerName = playerName
                    };

                    network.SendMessage(new GameMessage
                    {
                        Type = "MOVE",
                        Data = JsonConvert.SerializeObject(move),
                        PlayerName = playerName
                    });

                    UpdateBoard();
                    UpdateGameInfo();
                    UpdateTurnInfo();
                    CheckGameOver();
                }

                if (selectedCell != null && selectedCell.Value != null)
                {
                    if (boardButtons[selectedCell.Value.X, selectedCell.Value.Y] != null)
                    {
                        boardButtons[selectedCell.Value.X, selectedCell.Value.Y].BackColor =
                            game.Board[selectedCell.Value.X, selectedCell.Value.Y] == 1 ? Color.DarkBlue : Color.LightGray;
                    }
                }
                selectedCell = null;
            }
        }

        private void ApplyMove(Move move)
        {
            if (game != null)
            {
                game.MakeMove(move.FromRow, move.FromCol, move.ToRow, move.ToCol, move.PlayerName);

                // Зміна ходу
                game.State.CurrentTurnPlayer = game.State.CurrentTurnPlayer == playerName ? opponentName : playerName;

                UpdateBoard();
                UpdateGameInfo();
                UpdateTurnInfo();
                CheckGameOver();
            }
        }

        private void UpdateBoard()
        {
            for (int i = 0; i < game.Size; i++)
            {
                for (int j = 0; j < game.Size; j++)
                {
                    if (boardButtons[i, j] != null)
                    {
                        boardButtons[i, j].BackColor = game.Board[i, j] == 1 ? Color.DarkBlue : Color.LightGray;
                    }
                }
            }
        }

        private void UpdateGameInfo()
        {
            lblMoves.Text = $"Ходів: {game.MoveHistory.Count}";
            lblPieces.Text = $"Фішок: {game.CountRemainingPieces()}";
        }

        private void UpdateTurnInfo()
        {
            if (game.State.CurrentTurnPlayer == playerName)
            {
                lblTurn.Text = "ВАШ ХІД!";
                lblTurn.ForeColor = Color.Green;
            }
            else
            {
                lblTurn.Text = $"Хід суперника: {game.State.CurrentTurnPlayer}";
                lblTurn.ForeColor = Color.Red;
            }
        }

        private void GameTimer_Tick(object sender, EventArgs e)
        {
            if (game != null)
            {
                var elapsed = DateTime.Now - game.GameStartTime;
                lblTime.Text = $"Час: {elapsed:mm\\:ss}";
            }
        }

        private void CheckGameOver()
        {
            int remaining = game.CountRemainingPieces();

            if (remaining == 1 || !game.HasValidMoves())
            {
                gameTimer.Stop();
                string winner = game.MoveHistory.Last().PlayerName;
                string result = remaining == 1 ? $"ПЕРЕМОГА: {winner}!" : $"ГРА ЗАВЕРШЕНА! Останній хід: {winner}";

                UpdatePlayerStats(winner == playerName, playerName);
                UpdatePlayerStats(winner == opponentName, opponentName);

                MessageBox.Show($"{result}\n\nФішок залишилось: {remaining}\nЗроблено ходів: {game.MoveHistory.Count}", "Гра завершена", MessageBoxButtons.OK, MessageBoxIcon.Information);

                HandleGameOver(result);

                gameTimer.Stop();
            }
        }

        private void HandleGameOver(string result)
        {
            if (_gameType == GameType.Simple)
            {
                return;
            }

            _gamesLeft--;
            if (_gamesLeft <= 0)
            {
                return;
            }

            if (_server)
            {
                Random rnd = new Random();
                string firstPlayer = rnd.Next(2) == 0 ? playerName : opponentName;

                StartNewGame(currentLevel, firstPlayer);

                var gameData = new Dictionary<string, string>
                {
                    { "level", currentLevel.ToString() },
                    { "firstPlayer", firstPlayer },
                    { "game_type", ((int)_gameType).ToString() }
                };

                network.SendMessage(new GameMessage
                {
                    Type = "NEW_GAME",
                    Data = JsonConvert.SerializeObject(gameData),
                    PlayerName = playerName
                });
            }
        }

        private void UpdatePlayerStats(bool won, string playerName)
        {
            if (!playerStats.ContainsKey(playerName))
            {
                playerStats[playerName] = new PlayerStats { Name = playerName };
            }

            var stats = playerStats[playerName];
            stats.GamesPlayed++;
            if (won) stats.Wins++;
            stats.TotalMoves += game.MoveHistory.Count;
            stats.TotalPlayTime += DateTime.Now - game.GameStartTime;

            if (won && game.MoveHistory.Count < stats.BestMoves)
            {
                stats.BestMoves = game.MoveHistory.Count;
            }
        }

        private void BtnStats_Click(object sender, EventArgs e)
        {
            if (game == null || game.MoveHistory.Count == 0)
            {
                MessageBox.Show("Спочатку зіграйте гру!", "Інформація", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var statsForm = new Form
            {
                Text = "Статистика Ходів",
                Size = new Size(600, 450),
                StartPosition = FormStartPosition.CenterParent
            };

            var listView = new ListView
            {
                Dock = DockStyle.Fill,
                View = View.Details,
                FullRowSelect = true,
                GridLines = true
            };

            listView.Columns.Add("№", 50);
            listView.Columns.Add("Гравець", 120);
            listView.Columns.Add("З позиції", 100);
            listView.Columns.Add("На позицію", 100);
            listView.Columns.Add("Час", 150);

            int count = 1;
            foreach (var move in game.MoveHistory)
            {
                var item = new ListViewItem(count.ToString());
                item.SubItems.Add(move.PlayerName);
                item.SubItems.Add($"({move.FromRow}, {move.FromCol})");
                item.SubItems.Add($"({move.ToRow}, {move.ToCol})");
                item.SubItems.Add(move.Timestamp.ToString("HH:mm:ss"));
                listView.Items.Add(item);
                count++;
            }

            statsForm.Controls.Add(listView);
            statsForm.ShowDialog();
        }

        private void BtnRating_Click(object sender, EventArgs e)
        {
            var ratingForm = new Form
            {
                Text = "Рейтинг Гравців",
                Size = new Size(700, 450),
                StartPosition = FormStartPosition.CenterParent
            };

            var listView = new ListView
            {
                Dock = DockStyle.Fill,
                View = View.Details,
                FullRowSelect = true,
                GridLines = true
            };

            listView.Columns.Add("Місце", 60);
            listView.Columns.Add("Гравець", 120);
            listView.Columns.Add("Перемог", 80);
            listView.Columns.Add("Ігор", 80);
            listView.Columns.Add("% Перемог", 90);
            listView.Columns.Add("Всього ходів", 100);
            listView.Columns.Add("Кращий результат", 130);

            var sortedPlayers = playerStats.Values
                .OrderByDescending(p => p.Wins)
                .ThenBy(p => p.BestMoves == int.MaxValue ? int.MaxValue : p.BestMoves)
                .ToList();

            int place = 1;
            foreach (var player in sortedPlayers)
            {
                var item = new ListViewItem(place.ToString());
                item.SubItems.Add(player.Name);
                item.SubItems.Add(player.Wins.ToString());
                item.SubItems.Add(player.GamesPlayed.ToString());
                item.SubItems.Add($"{player.WinRate:F1}%");
                item.SubItems.Add(player.TotalMoves.ToString());
                item.SubItems.Add(player.BestMoves == int.MaxValue ? "-" : $"{player.BestMoves} ходів");

                if (player.Name == playerName)
                {
                    item.BackColor = Color.LightYellow;
                }

                listView.Items.Add(item);
                place++;
            }

            ratingForm.Controls.Add(listView);
            ratingForm.ShowDialog();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            gameTimer?.Stop();
            network?.Disconnect();
            base.OnFormClosing(e);
        }
    }
}