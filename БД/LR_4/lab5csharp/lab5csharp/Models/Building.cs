using System.ComponentModel.DataAnnotations;

namespace lab5csharp.Models
{
    public class Building
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; }

        [Range(1, 100, ErrorMessage = "Number of floors must be between 1 and 100")]
        public int NumberOfFloors { get; set; }

        public ICollection<Apartment>? Apartments { get; set; }
    }
}
