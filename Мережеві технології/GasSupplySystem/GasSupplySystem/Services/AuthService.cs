using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace GasSupplySystem.Services;

public class AuthService
{
    public static DataTable GetAll()
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var da = new SqlDataAdapter(
            "SELECT UserId, Login, PasswordHash, Role, IsActive FROM Users",
            conn);

        var table = new DataTable();
        da.Fill(table);
        return table;
    }

    public static void Save(DataTable table)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        using var tran = conn.BeginTransaction(IsolationLevel.Serializable);

        try
        {
            foreach (DataRow row in table.Rows)
            {
                if (row.RowState == DataRowState.Added)
                {
                    var cmd = new SqlCommand(@"
                        INSERT INTO Users(Login, PasswordHash, Role, IsActive)
                        VALUES(@l,@p,@r,@a)", conn, tran);

                    cmd.Parameters.AddWithValue("@l", row["Login"]);
                    cmd.Parameters.AddWithValue("@p", row["PasswordHash"]);
                    cmd.Parameters.AddWithValue("@r", row["Role"]);
                    cmd.Parameters.AddWithValue("@a", row["IsActive"]);

                    cmd.ExecuteNonQuery();
                }
                else if (row.RowState == DataRowState.Modified)
                {
                    var cmd = new SqlCommand(@"
                        UPDATE Users SET
                            Login=@l,
                            PasswordHash=@p,
                            Role=@r,
                            IsActive=@a
                        WHERE UserId=@id", conn, tran);

                    cmd.Parameters.AddWithValue("@id", row["UserId"]);
                    cmd.Parameters.AddWithValue("@l", row["Login"]);
                    cmd.Parameters.AddWithValue("@p", row["PasswordHash"]);
                    cmd.Parameters.AddWithValue("@r", row["Role"]);
                    cmd.Parameters.AddWithValue("@a", row["IsActive"]);

                    cmd.ExecuteNonQuery();
                }
            }

            tran.Commit();
            table.AcceptChanges();
        }
        catch
        {
            tran.Rollback();
            throw;
        }
    }

    public static void Delete(int userId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(
            "DELETE FROM Users WHERE UserId=@id",
            conn);

        cmd.Parameters.AddWithValue("@id", userId);
        cmd.ExecuteNonQuery();
    }

    public static User Login(string login, string password)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(
            "SELECT UserId, Login, Role FROM Users WHERE Login=@l AND PasswordHash=@p",
            conn);

        cmd.Parameters.AddWithValue("@l", login);
        cmd.Parameters.AddWithValue("@p", password);

        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;

        var user = new User
        {
            UserId = (int)r["UserId"],
            Login = r["Login"].ToString(),
            Role = r["Role"].ToString()
        };

        return user;
    }
}
