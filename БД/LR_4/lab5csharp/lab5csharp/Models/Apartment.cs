namespace lab5csharp.Models
{
    public class Apartment
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string Number { get; set; }
        public int Floor { get; set; }
        public decimal Area { get; set; }

        public Building? Building { get; set; }
        public ICollection<User>? Users { get; set; }
        public ICollection<ServiceRequest>? ServiceRequests { get; set; }
    }

}
