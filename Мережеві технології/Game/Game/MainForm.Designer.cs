namespace Game
{
    partial class MainForm
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            SuspendLayout();
            // 
            // MainForm
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Name = "MainForm";
            Text = "MainForm";
            ResumeLayout(false);

            this.Text = "Солитер - Мережева Гра";
            this.Size = new Size(900, 800);
            this.StartPosition = FormStartPosition.CenterScreen;

            grpConnection = new GroupBox
            {
                Text = "Мережеве Підключення",
                Location = new Point(10, 10),
                Size = new Size(860, 80)
            };

            Label lblName = new Label { Text = "Ваше ім'я:", Location = new Point(10, 25), AutoSize = true };
            txtPlayerName = new TextBox { Location = new Point(80, 22), Width = 100, Text = $"Гравець_{new Random().Next(9999)}" };

            Label lblIP = new Label { Text = "IP Сервера:", Location = new Point(190, 25), AutoSize = true };
            txtServerIP = new TextBox { Location = new Point(270, 22), Width = 100, Text = "127.0.0.1" };

            Label lblPort = new Label { Text = "Порт:", Location = new Point(380, 25), AutoSize = true };
            numPort = new NumericUpDown { Location = new Point(420, 22), Width = 70, Minimum = 1000, Maximum = 65535, Value = 5000 };

            btnStartServer = new Button { Text = "Запустити Сервер", Location = new Point(500, 20), Size = new Size(130, 25) };
            btnStartServer.Click += BtnStartServer_Click;

            btnConnectClient = new Button { Text = "Підключитись", Location = new Point(640, 20), Size = new Size(100, 25) };
            btnConnectClient.Click += BtnConnectClient_Click;

            grpConnection.Controls.AddRange(new Control[] { lblName, txtPlayerName, lblIP, txtServerIP, lblPort, numPort, btnStartServer, btnConnectClient });

            lblStatus = new Label { Location = new Point(20, 100), Size = new Size(400, 25), Font = new Font("Arial", 10, FontStyle.Bold), ForeColor = Color.Blue };
            lblMoves = new Label { Location = new Point(20, 130), Size = new Size(200, 20), Text = "Ходів: 0" };
            lblPieces = new Label { Location = new Point(20, 150), Size = new Size(200, 20), Text = "Фішок: 0" };
            lblTime = new Label { Location = new Point(20, 170), Size = new Size(200, 20), Text = "Час: 00:00" };
            lblTurn = new Label { Location = new Point(20, 190), Size = new Size(400, 25), Font = new Font("Arial", 10, FontStyle.Bold), ForeColor = Color.Green };

            btnNewGame = new Button { Text = "Нова Гра (Рівень 1)", Location = new Point(250, 130), Size = new Size(150, 30) };
            btnNewGame.Click += BtnNewGame_Click;

            btnNewTournament = new Button { Text = "Новий турнір (Рівень 1)", Location = new Point(250, 160), Size = new Size(150, 30) };
            btnNewTournament.Click += BtnNewTournament_Click;

            btnStats = new Button { Text = "Статистика Ходів", Location = new Point(410, 130), Size = new Size(120, 30) };
            btnStats.Click += BtnStats_Click;

            btnRating = new Button { Text = "Рейтинг Гравців", Location = new Point(540, 130), Size = new Size(120, 30) };
            btnRating.Click += BtnRating_Click;

            boardPanel = new Panel { Location = new Point(20, 230), Size = new Size(640, 520), BorderStyle = BorderStyle.FixedSingle };

            gameTimer = new System.Windows.Forms.Timer { Interval = 1000 };
            gameTimer.Tick += GameTimer_Tick;

            this.Controls.AddRange(new Control[] { grpConnection, lblStatus, lblMoves, lblPieces, lblTime, lblTurn, btnNewGame, btnNewTournament, btnStats, btnRating, boardPanel });
        }

        private Label lblStatus;
        private Label lblMoves;
        private Label lblPieces;
        private Label lblTime;
        private Label lblTurn;
        private Panel boardPanel;
        private Button btnNewGame;
        private Button btnNewTournament;
        private Button btnStats;
        private Button btnRating;
        private TextBox txtPlayerName;
        private System.Windows.Forms.Timer gameTimer;
        private GroupBox grpConnection;
        private Button btnStartServer;
        private Button btnConnectClient;
        private TextBox txtServerIP;
        private NumericUpDown numPort;

        #endregion
    }
}
