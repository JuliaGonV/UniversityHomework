using Microsoft.Data.SqlClient;

namespace GasSupplySystem.Services;

public class ReportService
{
    public static List<(DateTime Date, decimal Volume)>
        GetCustomerDynamics(int customerId)
    {
        var result = new List<(DateTime, decimal)>();

        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(
            @"SELECT CAST(OrderDate AS DATE), SUM(GasVolume)
              FROM GasOrders
              WHERE CustomerId=@c
              GROUP BY CAST(OrderDate AS DATE)",
            conn);

        cmd.Parameters.AddWithValue("@c", customerId);

        using var r = cmd.ExecuteReader();
        while (r.Read())
            result.Add((r.GetDateTime(0), r.GetDecimal(1)));

        return result;
    }
}
