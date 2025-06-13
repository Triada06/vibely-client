import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

interface Message {
  senderId: string;
  content: string;
  timestamp: Date;
}

interface ChatHubCallbacks {
  onReceiveMessage: (message: Message) => void;
  onUserConnected: (userId: string) => void;
  onUserDisconnected: (userId: string) => void;
}

export const startConnection = (token: string, callbacks: ChatHubCallbacks) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7014/hubs/chat", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  // Set up event handlers
  connection.on(
    "ReceiveMessage",
    (senderId: string, content: string, timestamp: string) => {
      callbacks.onReceiveMessage({
        senderId,
        content,
        timestamp: new Date(timestamp),
      });
    }
  );

  connection.on("UserConnected", (userId: string) => {
    callbacks.onUserConnected(userId);
  });

  connection.on("UserDisconnected", (userId: string) => {
    callbacks.onUserDisconnected(userId);
  });

  connection
    .start()
    .catch((err) => console.error("SignalR Connection Error: ", err));
};

export const sendMessage = (recipientId: string, content: string) => {
  if (connection) {
    connection
      .invoke("SendMessage", recipientId, content)
      .catch((err) => console.error(err));
  }
};

export const checkUsersOnline = async (
  userIds: string[]
): Promise<string[]> => {
  if (connection) {
    try {
      return await connection.invoke("CheckUsersOnline", userIds);
    } catch (err) {
      console.error("Error checking online status:", err);
      return [];
    }
  }
  return [];
};
