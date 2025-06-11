import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  // Mock data - replace with actual data from your backend
  const conversations: Conversation[] = [
    {
      id: "1",
      userId: "user1",
      username: "john_doe",
      profilePicture: "/default-profile-picture.jpg",
      lastMessage: "Hey, how are you?",
      lastMessageTime: "2m",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "2",
      userId: "user2",
      username: "jane_smith",
      profilePicture: "/default-profile-picture.jpg",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "1h",
      unreadCount: 0,
      isOnline: false,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      senderId: "user1",
      content: "Hey, how are you?",
      timestamp: "2:30 PM",
      isRead: true,
    },
    {
      id: "2",
      senderId: "currentUser",
      content: "I'm good, thanks! How about you?",
      timestamp: "2:31 PM",
      isRead: true,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add message sending logic here
      setMessageInput("");
    }
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
                      message.senderId === "currentUser"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === "currentUser"
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
