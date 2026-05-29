namespace lab5csharp.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } 
        public int? ApartmentId { get; set; }

        public Apartment? Apartment { get; set; }
        public ICollection<Payment>? Payments { get; set; }
        public ICollection<ServiceRequest>? ServiceRequests { get; set; }
    }

}
