namespace GasSupplySystem.Models;

public class ActionLogEntry
{
    public int LogId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; }
    public string TableName { get; set; }
    public int? RecordId { get; set; }
    public DateTime ActionDate { get; set; }
}
