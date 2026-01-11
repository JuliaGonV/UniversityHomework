using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;

namespace DairySupplySystem
{
    public static class Database
    {
        // ВАЖНО: Для работы по сети используем SQL-аутентификацию (teacher/123),
        // так как Integrated Security (Windows-авторизация) между разными ноутбуками часто не работает.
        public static string ConnectionString = @"Data Source=192.168.31.226,1433;Initial Catalog=DairyDB;User ID=teacher;Password=123";

        // Хранение данных текущей сессии
        public static string CurrentRole = "";
        public static int CurrentUserId = 0;

        // Храним логин текущего пользователя (admin/manager) для журнала
        public static string CurrentUser = "";

        // Метод для записи событий в журнал
        // Принимает описание (что сделали) и тип действия (Login, Create, Update, Delete)
        public static void LogAction(string actionDescription, string actionType)
        {
            using (SqlConnection conn = new SqlConnection(ConnectionString))
            {
                try
                {
                    conn.Open();

                    // Запрос вставляет запись в EventLog
                    // Вложенный SELECT находит ID пользователя по его логину (CurrentUser)
                    string sql = @"INSERT INTO EventLog (EventDate, ActionType, Description, UserID) 
                                   VALUES (@date, @type, @desc, (SELECT UserID FROM Users WHERE Login = @login))";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@date", DateTime.Now);
                    cmd.Parameters.AddWithValue("@type", actionType);
                    cmd.Parameters.AddWithValue("@desc", actionDescription);

                    // Если вдруг CurrentUser пустой (например, при тестах), подставим 'admin', чтобы не упало
                    string login = string.IsNullOrEmpty(CurrentUser) ? "admin" : CurrentUser;
                    cmd.Parameters.AddWithValue("@login", login);

                    cmd.ExecuteNonQuery();
                }
                catch
                {
                    // Если лог не записался (сбой сети), программа не должна падать, поэтому catch пустой
                }
            }
        }
    }
}