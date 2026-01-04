using Game.Data;
using Newtonsoft.Json;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Game.Managers
{
    internal class NetworkManager
    {
        private Socket serverSocket;
        private Socket clientSocket;
        private Thread listenerThread;
        public event Action<string> MessageReceived;
        public event Action<string> ConnectionStatusChanged;
        public bool IsServer { get; private set; }
        public bool IsConnected { get; private set; }

        public bool StartServer(int port)
        {
            try
            {
                serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
                serverSocket.Listen(1);
                IsServer = true;

                listenerThread = new Thread(() =>
                {
                    try
                    {
                        ConnectionStatusChanged?.Invoke("Очікування підключення...");
                        clientSocket = serverSocket.Accept();
                        IsConnected = true;
                        ConnectionStatusChanged?.Invoke("Клієнт підключений!");
                        ReceiveMessages();
                    }
                    catch (Exception ex)
                    {
                        ConnectionStatusChanged?.Invoke($"Помилка сервера: {ex.Message}");
                    }
                });
                listenerThread.IsBackground = true;
                listenerThread.Start();

                return true;
            }
            catch (Exception ex)
            {
                ConnectionStatusChanged?.Invoke($"Не вдалося запустити сервер: {ex.Message}");
            }

            return false;
        }

        public bool ConnectToServer(string ip, int port)
        {
            try
            {
                clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                clientSocket.Connect(ip, port);
                IsServer = false;
                IsConnected = true;
                ConnectionStatusChanged?.Invoke("Підключено до сервера!");

                listenerThread = new Thread(ReceiveMessages);
                listenerThread.IsBackground = true;
                listenerThread.Start();

                return true;
            }
            catch (Exception ex)
            {
                ConnectionStatusChanged?.Invoke($"Не вдалося підключитися: {ex.Message}");
            }

            return false;
        }

        private void ReceiveMessages()
        {
            byte[] buffer = new byte[4096];
            while (IsConnected)
            {
                try
                {
                    int received = clientSocket.Receive(buffer);
                    if (received > 0)
                    {
                        string message = Encoding.UTF8.GetString(buffer, 0, received);
                        MessageReceived?.Invoke(message);
                    }
                }
                catch
                {
                    IsConnected = false;
                    ConnectionStatusChanged?.Invoke("З'єднання розірвано!");
                    break;
                }
            }
        }

        public void SendMessage(GameMessage message)
        {
            if (!IsConnected) return;

            try
            {
                string json = JsonConvert.SerializeObject(message);
                byte[] data = Encoding.UTF8.GetBytes(json);
                clientSocket.Send(data);
            }
            catch
            {
                IsConnected = false;
                ConnectionStatusChanged?.Invoke("Помилка відправлення даних!");
            }
        }

        public void Disconnect()
        {
            IsConnected = false;
            clientSocket?.Close();
            serverSocket?.Close();
        }
    }
}
