using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;

namespace GasSupplySystem.Services;

public class LogService
{
    public static void Add(int userId, string action, string table,
        int? recordId, SqlConnection conn, SqlTransaction tran)
    {
        var cmd = new SqlCommand(
            @"INSERT INTO ActionLog(UserId,Action,TableName,RecordId)
              VALUES(@u,@a,@t,@r)",
            conn, tran);

        cmd.Parameters.AddWithValue("@u", userId);
        cmd.Parameters.AddWithValue("@a", action);
        cmd.Parameters.AddWithValue("@t", table);
        cmd.Parameters.AddWithValue("@r", (object)recordId ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public static List<ActionLogEntry> GetAll()
    {
        var list = new List<ActionLogEntry>();
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand("SELECT * FROM ActionLog", conn);
        using var r = cmd.ExecuteReader();

        while (r.Read())
        {
            list.Add(new ActionLogEntry
            {
                LogId = (int)r["LogId"],
                UserId = (int)r["UserId"],
                Action = r["Action"].ToString()!,
                TableName = r["TableName"].ToString()!,
                RecordId = r["RecordId"] as int?,
                ActionDate = (DateTime)r["ActionDate"]
            });
        }
        return list;
    }
}
