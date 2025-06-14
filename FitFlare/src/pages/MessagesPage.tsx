import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSearch,
  faTrash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
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
  firstMatchedMessageId?: string;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  const { profile, fetchUser } = useProfileStore();
  const authUserId = useAuthStore((state) => state.userId); // Get auth user ID

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [messageToScrollToId, setMessageToScrollToId] = useState<string | null>(
    null
  );
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  // Debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        searchMessages(searchQuery.trim());
      } else {
        setSearchResults([]); // Clear search results if query is empty
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, authUserId]); // Depend on authUserId for mapping search results

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to scroll to a specific message if messageToScrollToId is set
  useEffect(() => {
    if (messageToScrollToId && messages.length > 0) {
      const messageElement = document.getElementById(
        `message-${messageToScrollToId}`
      );
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedMessageId(messageToScrollToId); // Set highlight
        const timer = setTimeout(() => {
          setHighlightedMessageId(null); // Remove highlight after 2 seconds
        }, 2000);
        setMessageToScrollToId(null); // Clear the ID after scrolling
        return () => clearTimeout(timer); // Cleanup timeout
      }
    }
  }, [messageToScrollToId, messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
  };

  const searchMessages = async (text: string) => {
    if (!text) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7014/api/message?searchText=${encodeURIComponent(
          text
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search messages");
      }

      const data = await response.json();
      // Map search results to Conversation-like objects
      const mappedResults: Conversation[] = data.map((result: any) => {
        // Determine the other user's ID in the conversation
        const otherUserId =
          result.senderId === authUserId ? result.receiverId : result.senderId;

        return {
          id: otherUserId, // Use the other user's ID as conversation ID
          userId: otherUserId,
          username: result.chatName,
          profilePicture:
            result.chatPictureSasUri || "/default-profile-picture.jpg",
          lastMessage: "Message matched in search", // Placeholder, as content is not returned
          lastMessageTime: "", // Placeholder, as time is not returned
          unreadCount: 0, // Placeholder
          isOnline: onlineUsers.has(otherUserId), // Check if the user is online from existing state
          firstMatchedMessageId: result.messageId, // Store the specific message ID
        };
      });

      // Filter out duplicate conversations by userId/id to avoid showing the same chat multiple times if multiple messages match
      const uniqueResults = Array.from(
        new Map(mappedResults.map((item) => [item["id"], item])).values()
      );

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error("Error searching messages:", error);
      setSearchResults([]); // Clear results on error
    }
  };

  const fetchChatMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7014/api/chat/with/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat messages");
      }

      const data = await response.json();
      const mappedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.encryptedContent,
        timestamp: msg.sentAt,
        isRead: true,
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

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
    if (selectedConversation) {
      fetchChatMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      startConnection(token, {
        onReceiveMessage: (message) => {
          if (
            message.senderId === selectedConversation ||
            message.senderId === profile?.id
          ) {
            const fullMessage: Message = {
              ...message,
              id: crypto.randomUUID(), // generate a unique ID
              isRead: false,
              timestamp: new Date(message.timestamp).toISOString(),
            };

            setMessages((prev) => {
              const alreadyExists = prev.some(
                (msg) =>
                  msg.content === fullMessage.content &&
                  msg.timestamp === fullMessage.timestamp &&
                  msg.senderId === fullMessage.senderId
              );

              if (alreadyExists) return prev;

              return [...prev, fullMessage];
            });

            // Update last message in conversations
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === message.senderId
                  ? {
                      ...conv,
                      lastMessage: message.content,
                      lastMessageTime: formatTimestamp(
                        message.timestamp.toString()
                      ),
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

  const handleDeleteMessage = async (messageId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7014/api/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        console.log("Message deleted successfully");
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const mainMargin = isMessagesPage ? "md:ml-20" : "md:ml-72";

  const displayedConversations =
    searchQuery.trim() !== "" ? searchResults : conversations;

  return (
    <section
      className={`min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E] pt-20 pb-24 md:pt-12 md:pb-0 transition-all duration-300 ${mainMargin}`}
    >
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C1E] ${
            selectedConversation ? "hidden md:block" : "block"
          }`}
        >
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            {displayedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedConversation === conversation.id
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  if (conversation.firstMatchedMessageId) {
                    setMessageToScrollToId(conversation.firstMatchedMessageId);
                  }
                }}
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
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                  </button>
                  <div className="relative">
                    <img
                      src={
                        conversations.find((c) => c.id === selectedConversation)
                          ?.profilePicture
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {conversations.find((c) => c.id === selectedConversation)
                      ?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {
                        conversations.find((c) => c.id === selectedConversation)
                          ?.username
                      }
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {conversations.find((c) => c.id === selectedConversation)
                        ?.isOnline
                        ? "Active now"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    id={`message-${message.id}`}
                    className={`flex items-center ${
                      message.senderId === profile?.id
                        ? "justify-end"
                        : "justify-start"
                    } ${
                      highlightedMessageId === message.id
                        ? "bg-yellow-200 dark:bg-yellow-700/50 transition-colors duration-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`group relative max-w-[70%] rounded-lg p-3 ${
                        message.senderId === profile?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.senderId === profile?.id && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="absolute top-1 right-1 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity duration-200 focus:outline-none  border-none focus:ring-opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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
