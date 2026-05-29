using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace GasSupplySystem.Services;

internal class CustomerService
{
    public static DataTable GetAll()
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var da = new SqlDataAdapter(
            @"SELECT CustomerId, CompanyName, ContactPerson, Phone, Address, IsActive
              FROM GasCustomers",
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
                        INSERT INTO GasCustomers
                        (CompanyName, ContactPerson, Phone, Address, IsActive)
                        VALUES(@c,@p,@ph,@a,@i)", conn, tran);

                    cmd.Parameters.AddWithValue("@c", row["CompanyName"]);
                    cmd.Parameters.AddWithValue("@p", row["ContactPerson"]);
                    cmd.Parameters.AddWithValue("@ph", row["Phone"]);
                    cmd.Parameters.AddWithValue("@a", row["Address"]);
                    cmd.Parameters.AddWithValue("@i", row["IsActive"]);

                    cmd.ExecuteNonQuery();
                }
                else if (row.RowState == DataRowState.Modified)
                {
                    var cmd = new SqlCommand(@"
                        UPDATE GasCustomers SET
                            CompanyName=@c,
                            ContactPerson=@p,
                            Phone=@ph,
                            Address=@a,
                            IsActive=@i
                        WHERE CustomerId=@id", conn, tran);

                    cmd.Parameters.AddWithValue("@id", row["CustomerId"]);
                    cmd.Parameters.AddWithValue("@c", row["CompanyName"]);
                    cmd.Parameters.AddWithValue("@p", row["ContactPerson"]);
                    cmd.Parameters.AddWithValue("@ph", row["Phone"]);
                    cmd.Parameters.AddWithValue("@a", row["Address"]);
                    cmd.Parameters.AddWithValue("@i", row["IsActive"]);

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

    public static void Delete(int customerId)
    {
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(
            "DELETE FROM GasCustomers WHERE CustomerId=@id",
            conn);

        cmd.Parameters.AddWithValue("@id", customerId);
        cmd.ExecuteNonQuery();
    }

    // Already used by your other tabs
    public static List<string> GetCompanyNames()
    {
        var list = new List<string>();
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand(
            "SELECT CompanyName FROM GasCustomers WHERE IsActive=1",
            conn);

        using var r = cmd.ExecuteReader();
        while (r.Read())
            list.Add(r.GetString(0));

        return list;
    }
}
