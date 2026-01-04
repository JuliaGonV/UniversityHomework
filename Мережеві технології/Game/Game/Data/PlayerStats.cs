namespace Game.Data
{
    internal class PlayerStats
    {
        public string Name { get; set; }
        public int Wins { get; set; }
        public int GamesPlayed { get; set; }
        public int TotalMoves { get; set; }
        public TimeSpan TotalPlayTime { get; set; }
        public int BestMoves { get; set; } = int.MaxValue;

        public double WinRate => GamesPlayed > 0 ? (double)Wins / GamesPlayed * 100 : 0;
    }
}
