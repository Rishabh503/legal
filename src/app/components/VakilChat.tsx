'use client';

import React, { useState, useEffect, useRef } from 'react';
// <-- CHANGED: Removed X, since we are removing the close button
import { SendHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

// --- Type Definitions ---
interface Message {
    sender: 'user' | 'vakil';
    text: string;
}

interface VakilChatProps {
    documentText: string;
    // <-- CHANGED: Removed onClose prop
}

export default function VakilChat({ documentText }: VakilChatProps) { // <-- CHANGED: Removed onClose
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isCollapsed) {
            scrollToBottom();
        }
    }, [messages, isCollapsed]);

    // Send the initial "headline" message from Vakil
    useEffect(() => {
        const getIntroMessage = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://127.0.0.1:5000/api/advise', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ case_text: `Briefly (in one sentence) identify this document: ${documentText.substring(0, 500)}...` })
                });

                if (!response.ok) throw new Error('Failed to get intro');

                const data = await response.json();

                let introText = "Hello! I've reviewed your document. Ask me anything about it.";
                if (data.analysis_points && data.analysis_points.length > 0) {
                    introText = `Hello! I've reviewed your document. It looks like it's about "${data.analysis_points[0].title}". You can ask me any questions you have.`;
                }

                setMessages([{ sender: 'vakil', text: introText }]);
            } catch  {
                setMessages([{ sender: 'vakil', text: "Hello! I'm ready to answer questions about your document." }]);
            } finally {
                setIsLoading(false);
            }
        };

        getIntroMessage();
    }, [documentText]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = currentMessage.trim();
        if (!userMessage || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setCurrentMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('https://legalmate-a36k.onrender.com/api/ask-vakil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    document_text: documentText,
                    question: userMessage
                })
            });

            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { sender: 'vakil', text: data.answer }]);
        } catch  {
            setMessages(prev => [...prev, { sender: 'vakil', text: "Sorry, I ran into an error trying to answer that." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- Chat Popup Container ---
        <div className={`fixed bottom-4 right-4 w-full max-w-md bg-slate-900 border border-sky-700/50 rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-[70vh]'
            }`}>

            {/* --- Header --- */}
            {/* <-- CHANGED: justify-between is removed, only the collapsable button remains */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
                <span className="text-lg font-semibold text-white">Vakil ⚖️</span> {/* Title on the left */}

                {/* Collapse/Expand button on the right */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                    aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
                >
                    {isCollapsed ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* --- Message Area --- */}
            <div className={`flex-grow p-4 overflow-y-auto space-y-4 ${isCollapsed ? 'hidden' : 'block'}`}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-sky-600 text-white rounded-br-lg'
                                : 'bg-slate-700 text-slate-200 rounded-bl-lg'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-lg">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* --- Input Footer --- */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t border-slate-700/50 flex-shrink-0 ${isCollapsed ? 'hidden' : 'block'}`}>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Ask a question about your document..."
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-full py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={isLoading && messages.length === 0}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !currentMessage.trim()}
                        className="p-2.5 bg-sky-600 text-white rounded-full hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <SendHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}