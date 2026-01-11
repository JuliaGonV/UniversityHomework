using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace GasSupplySystem.Services;

public class OrderService
{
    public static List<GasOrder> GetAll()
    {
        var list = new List<GasOrder>();
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand("SELECT * FROM GasOrders", conn);
        using var r = cmd.ExecuteReader();

        while (r.Read())
        {
            list.Add(new GasOrder
            {
                OrderId = (int)r["OrderId"],
                CustomerId = (int)r["CustomerId"],
                GasVolume = (decimal)r["GasVolume"],
                OrderDate = (DateTime)r["OrderDate"],
                DeliveryDate = (DateTime)r["DeliveryDate"],
                Status = r["Status"].ToString()!
            });
        }
        return list;
    }

    public static void Add(GasOrder order, int userId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();
        var tran = conn.BeginTransaction(IsolationLevel.Serializable);

        try
        {
            var cmd = new SqlCommand(
                @"INSERT INTO GasOrders(CustomerId,GasVolume,DeliveryDate,Status,CreatedBy)
                  VALUES(@c,@v,@d,'Created',@u)",
                conn, tran);

            cmd.Parameters.AddWithValue("@c", order.CustomerId);
            cmd.Parameters.AddWithValue("@v", order.GasVolume);
            cmd.Parameters.AddWithValue("@d", order.DeliveryDate);
            cmd.Parameters.AddWithValue("@u", userId);
            cmd.ExecuteNonQuery();

            LogService.Add(userId, "INSERT", "GasOrders", null, conn, tran);
            tran.Commit();
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }
}
