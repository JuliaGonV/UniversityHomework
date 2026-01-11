using GasSupplySystem.Models;
using Microsoft.Data.SqlClient;

namespace GasSupplySystem.Services;

internal class CustomerService
{
    public static List<GasCustomer> GetAll()
    {
        var list = new List<GasCustomer>();
        using var conn = new SqlConnection(Db.ConnectionString);
        conn.Open();

        var cmd = new SqlCommand("SELECT * FROM GasCustomers", conn);
        using var r = cmd.ExecuteReader();

        while (r.Read())
        {
            list.Add(new GasCustomer
            {
                CustomerId = (int)r["CustomerId"],
                CompanyName = r["CompanyName"].ToString()!,
                ContactPerson = r["ContactPerson"].ToString()!,
                Phone = r["Phone"].ToString()!,
                Address = r["Address"].ToString()!
            });
        }

        return list;
    }
}
