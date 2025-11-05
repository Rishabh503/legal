"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import { Send, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface IChatMessage {
  _id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

interface ILawyer {
  _id: string;
  clerkId: string;
  userId: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const { user: clerkUser, isLoaded } = useUser();
  const [lawyer, setLawyer] = useState<ILawyer | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID from Clerk
  const currentUserId = clerkUser?.id;

  const fetchLawyerDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/lawyers/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setLawyer(data.data);
      }
    } catch (error) {
      console.error("Error fetching lawyer:", error);
    }
  }, [params.id]);

  const fetchMessages = useCallback(async () => {
    if (!lawyer?.clerkId) return;

    try {
      const response = await fetch(
        `/api/chat?from=${currentUserId}&to=${lawyer.clerkId}`
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [lawyer?.clerkId, currentUserId]);

  useEffect(() => {
    if (params.id && isLoaded && clerkUser) {
      fetchLawyerDetails();
    }
  }, [params.id, isLoaded, clerkUser, fetchLawyerDetails]);

  useEffect(() => {
    if (lawyer?.clerkId && currentUserId) {
      fetchMessages();
    }
  }, [lawyer?.clerkId, currentUserId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !lawyer?.clerkId) return;

    setSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: currentUserId,
          to: lawyer.clerkId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (!isLoaded || loading || !clerkUser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lawyer not found</h1>
        </div>
      </div>
    );
  }

  const lawyerUser = typeof lawyer.userId === "object" ? lawyer.userId : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href={`/lawyers/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {lawyerUser?.profileImage ? (
                  <Image
                    src={lawyerUser.profileImage}
                    alt={`${lawyerUser.firstName} ${lawyerUser.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-lg font-bold text-gray-600">
                    {lawyerUser?.firstName?.[0]}
                    {lawyerUser?.lastName?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {lawyerUser?.firstName} {lawyerUser?.lastName}
                </h1>
                <p className="text-sm text-gray-500">Lawyer</p>
              </div>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600">
                You (
                {clerkUser.firstName ||
                  clerkUser.primaryEmailAddress?.emailAddress ||
                  "Unknown"}
                )
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm h-96 overflow-y-auto p-4 mb-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Start a conversation with {lawyerUser?.firstName}!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.from === currentUserId;

                return (
                  <div
                    key={message._id}
                    className={`flex items-start space-x-3 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {lawyerUser?.profileImage ? (
                          <Image
                            src={lawyerUser.profileImage}
                            alt={`${lawyerUser.firstName} ${lawyerUser.lastName}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-sm font-bold text-gray-600">
                            {lawyerUser?.firstName?.[0]}
                            {lawyerUser?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-green-100" : "text-blue-100"
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>

                    {isCurrentUser && (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <div className="h-full w-full flex items-center justify-center text-sm font-bold text-gray-600">
                          Y
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}