using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;

namespace GasSupplySystem.Services;

public class AuthService
{
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

        return new User
        {
            UserId = (int)r["UserId"],
            Login = r["Login"].ToString(),
            Role = r["Role"].ToString()
        };
    }
}
