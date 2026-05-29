using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;

namespace GasSupplySystem.Services;

public class OrderQueryService
{
    public static DataTable SearchOrders(
        string company,
        DateTime? from,
        DateTime? to,
        decimal? minVolume,
        decimal? maxVolume)
    {
        var table = new DataTable();
        var sql = new StringBuilder(@"
            SELECT
                o.OrderId,
                c.CompanyName,
                o.OrderDate,
                o.GasVolume,
                o.DeliveryDate
            FROM GasOrders o
            JOIN GasCustomers c ON c.CustomerId = o.CustomerId
            WHERE 1=1
        ");

        using var conn = new SqlConnection(Db.ConnectionString);
        using var cmd = new SqlCommand();
        cmd.Connection = conn;

        if (!string.IsNullOrWhiteSpace(company))
        {
            sql.Append(" AND c.CompanyName LIKE @company");
            cmd.Parameters.AddWithValue("@company", $"%{company}%");
        }

        if (from.HasValue)
        {
            sql.Append(" AND o.OrderDate >= @from");
            cmd.Parameters.AddWithValue("@from", from.Value);
        }

        if (to.HasValue)
        {
            sql.Append(" AND o.OrderDate <= @to");
            cmd.Parameters.AddWithValue("@to", to.Value);
        }

        if (minVolume.HasValue)
        {
            sql.Append(" AND o.GasVolume >= @minVolume");
            cmd.Parameters.AddWithValue("@minVolume", minVolume.Value);
        }

        if (maxVolume.HasValue)
        {
            sql.Append(" AND o.GasVolume <= @maxVolume");
            cmd.Parameters.AddWithValue("@maxVolume", maxVolume.Value);
        }

        cmd.CommandText = sql.ToString();
        conn.Open();

        using var reader = cmd.ExecuteReader();
        table.Load(reader);

        return table;
    }
}
