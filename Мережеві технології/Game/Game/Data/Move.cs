namespace Game.Data
{
    internal class Move
    {
        public int FromRow { get; set; }
        public int FromCol { get; set; }
        public int ToRow { get; set; }
        public int ToCol { get; set; }
        public DateTime Timestamp { get; set; }
        public string PlayerName { get; set; }
    }
}
