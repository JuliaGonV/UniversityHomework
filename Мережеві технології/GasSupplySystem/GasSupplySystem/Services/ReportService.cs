using Microsoft.Data.SqlClient;
using System.Data;

namespace GasSupplySystem.Services;

public class ReportService
{
    public static DataTable GetOrderReport(int orderId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(@"
            SELECT 
                o.OrderId,
                c.CompanyName,
                o.OrderDate,
                o.DeliveryDate,
                o.GasVolume,
                o.Status
            FROM GasOrders o
            JOIN GasCustomers c ON o.CustomerId = c.CustomerId
            WHERE o.OrderId = @id
        ", conn);

        cmd.Parameters.AddWithValue("@id", orderId);

        var table = new DataTable();
        table.Load(cmd.ExecuteReader());
        return table;
    }

    // 2️⃣ Report for recently added orders
    public static DataTable GetRecentlyAddedOrders()
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(@"
            SELECT TOP 20
                o.OrderId,
                c.CompanyName,
                o.OrderDate,
                o.DeliveryDate,
                o.GasVolume,
                o.Status
            FROM GasOrders o
            JOIN GasCustomers c ON o.CustomerId = c.CustomerId
            ORDER BY o.OrderDate DESC
        ", conn);

        var table = new DataTable();
        table.Load(cmd.ExecuteReader());
        return table;
    }

    // 3️⃣ Total gas volume dynamics by period
    public static DataTable GetTotalVolumeDynamics(DateTime from, DateTime to)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(@"
            SELECT 
                CAST(OrderDate AS DATE) AS [Date],
                SUM(GasVolume) AS TotalVolume
            FROM GasOrders
            WHERE OrderDate BETWEEN @from AND @to
            GROUP BY CAST(OrderDate AS DATE)
            ORDER BY [Date]
        ", conn);

        cmd.Parameters.AddWithValue("@from", from);
        cmd.Parameters.AddWithValue("@to", to);

        var table = new DataTable();
        table.Load(cmd.ExecuteReader());
        return table;
    }

    // ✅ already used by your chart
    public static List<(DateTime Date, decimal Volume)> GetCustomerDynamics(int customerId)
    {
        var list = new List<(DateTime, decimal)>();

        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(@"
            SELECT 
                CAST(OrderDate AS DATE) AS [Date],
                SUM(GasVolume) AS Volume
            FROM GasOrders
            WHERE CustomerId = @id
            GROUP BY CAST(OrderDate AS DATE)
            ORDER BY [Date]
        ", conn);

        cmd.Parameters.AddWithValue("@id", customerId);

        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add((r.GetDateTime(0), r.GetDecimal(1)));

        return list;
    }
}
