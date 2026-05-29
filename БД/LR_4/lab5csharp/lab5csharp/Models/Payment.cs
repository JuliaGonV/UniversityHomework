namespace lab5csharp.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Purpose { get; set; }

        public User? User { get; set; }
    }

}
