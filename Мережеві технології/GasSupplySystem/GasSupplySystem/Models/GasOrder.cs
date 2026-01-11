namespace GasSupplySystem.Models;

public class GasOrder
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public decimal GasVolume { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string Status { get; set; }
}
