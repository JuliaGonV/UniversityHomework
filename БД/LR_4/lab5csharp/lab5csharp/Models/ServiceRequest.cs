namespace lab5csharp.Models
{
    public class ServiceRequest
    {
        public int Id { get; set; }
        public int ApartmentId { get; set; }
        public int UserId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        public Apartment Apartment { get; set; }
        public User User { get; set; }
    }
}

