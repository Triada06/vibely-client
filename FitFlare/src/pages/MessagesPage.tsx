import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  startConnection,
  sendMessage,
  checkUsersOnline,
} from "../helpers/chatHub";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  username: string;
  profilePicture: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  const { profile, fetchUser } = useProfileStore();

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7014/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      const mappedConversations: Conversation[] = data.map((chat: any) => ({
        id: chat.id,
        userId: chat.id,
        username: chat.fullNameOrUserName,
        profilePicture: chat.chatPicture || "/default-profile-picture.jpg",
        lastMessage: chat.lastMessage || "",
        lastMessageTime: chat.lastMessageTime || "",
        unreadCount: 0,
        isOnline: false,
      }));

      setConversations(mappedConversations);

      // Check online status for all users
      const userIds = mappedConversations.map((conv) => conv.userId);
      const onlineUserIds = await checkUsersOnline(userIds);
      setOnlineUsers(new Set(onlineUserIds));

      // Update online status in conversations
      setConversations((prev) =>
        prev.map((conv) => ({
          ...conv,
          isOnline: onlineUserIds.includes(conv.userId),
        }))
      );
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchChats();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      startConnection(token, {
        onReceiveMessage: (message) => {
          if (
            message.senderId === selectedConversation ||
            message.senderId === profile?.id
          ) {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                senderId: message.senderId,
                content: message.content,
                timestamp: message.timestamp.toLocaleTimeString(),
                isRead: true,
              },
            ]);

            // Update last message in conversations
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === message.senderId
                  ? {
                      ...conv,
                      lastMessage: message.content,
                      lastMessageTime: message.timestamp.toLocaleTimeString(),
                    }
                  : conv
              )
            );
          }
        },
        onUserConnected: (userId) => {
          setOnlineUsers((prev) => new Set([...prev, userId]));
          setConversations((prev) =>
            prev.map((conv) =>
              conv.userId === userId ? { ...conv, isOnline: true } : conv
            )
          );
        },
        onUserDisconnected: (userId) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          setConversations((prev) =>
            prev.map((conv) =>
              conv.userId === userId ? { ...conv, isOnline: false } : conv
            )
          );
        },
      });
    }
  }, [selectedConversation, profile?.id]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessage(selectedConversation, messageInput);
    setMessageInput("");
  };

  const mainMargin = isMessagesPage ? "md:ml-20" : "md:ml-72";

  return (
    <section
      className={`min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E] pt-20 pb-24 md:pt-12 md:pb-0 transition-all duration-300 ${mainMargin}`}
    >
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C1E]">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-10 pr-4 py-2 bg-[#F5F7FA] text-[#2E2E2E] rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DD0E1] dark:bg-[#2A2A2D] dark:text-[#EAEAEA] dark:placeholder-gray-400"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedConversation === conversation.id
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conversation.profilePicture}
                      alt={conversation.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.username}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex-col bg-white dark:bg-[#1C1C1E] ${
            selectedConversation ? "flex" : "hidden"
          } md:flex`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      conversations.find((c) => c.id === selectedConversation)
                        ?.profilePicture
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {
                        conversations.find((c) => c.id === selectedConversation)
                          ?.username
                      }
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active now
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === profile?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === profile?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 p-2 bg-[#F5F7FA] text-[#2E2E2E] rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4DD0E1] dark:bg-[#2A2A2D] dark:text-[#EAEAEA] dark:placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`p-2 rounded-lg ${
                      messageInput.trim()
                        ? "text-blue-500 hover:text-blue-600"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
