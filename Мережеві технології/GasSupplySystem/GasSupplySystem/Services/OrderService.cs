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

        var cmd = new SqlCommand("SELECT *, GasCustomers.CompanyName FROM GasOrders LEFT JOIN GasCustomers ON GasOrders.CustomerId = GasCustomers.CustomerId", conn);
        using var r = cmd.ExecuteReader();

        while (r.Read())
        {
            list.Add(new GasOrder
            {
                OrderId = (int)r["OrderId"],
                CustomerId = (int)r["CustomerId"],
                CustomerName = r["CompanyName"].ToString()!,
                GasVolume = (decimal)r["GasVolume"],
                OrderDate = (DateTime)r["OrderDate"],
                DeliveryDate = (DateTime)r["DeliveryDate"]
            });
        }
        return list;
    }

    public static void Delete(int orderId, int userId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        using var transaction = conn.BeginTransaction();

        try
        {
            // Delete deliveries first (FK)
            var cmd1 = new SqlCommand(
                "DELETE FROM GasDeliveries WHERE OrderId = @id",
                conn, transaction);
            cmd1.Parameters.AddWithValue("@id", orderId);
            cmd1.ExecuteNonQuery();

            // Delete order
            var cmd2 = new SqlCommand(
                "DELETE FROM GasOrders WHERE OrderId = @id",
                conn, transaction);
            cmd2.Parameters.AddWithValue("@id", orderId);
            cmd2.ExecuteNonQuery();

            // Log action
            var log = new SqlCommand(
                @"INSERT INTO ActionLog (UserId, Action, TableName, RecordId)
              VALUES (@u, 'DELETE', 'GasOrders', @id)",
                conn, transaction);
            log.Parameters.AddWithValue("@u", userId);
            log.Parameters.AddWithValue("@id", orderId);
            log.ExecuteNonQuery();

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
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

    public static void Edit(GasOrder order, int userId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        using var tran = conn.BeginTransaction(IsolationLevel.Serializable);

        try
        {
            var cmd = new SqlCommand(
                @"UPDATE GasOrders
              SET CustomerId = @c,
                  GasVolume = @v,
                  DeliveryDate = @d
              WHERE OrderId = @id",
                conn, tran);

            cmd.Parameters.AddWithValue("@id", order.OrderId);
            cmd.Parameters.AddWithValue("@c", order.CustomerId);
            cmd.Parameters.AddWithValue("@v", order.GasVolume);
            cmd.Parameters.AddWithValue("@d", order.DeliveryDate);

            cmd.ExecuteNonQuery();

            // Log action
            LogService.Add(
                userId,
                "UPDATE",
                "GasOrders",
                order.OrderId,
                conn,
                tran);

            tran.Commit();
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }
}
