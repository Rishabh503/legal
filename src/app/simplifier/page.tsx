'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import VakilChat from '../components/VakilChat';

// --- Type Definitions ---
interface SimplifiedPoint {
    title: string;
    text: string;
}
interface ApiResponse {
    summary_points?: SimplifiedPoint[];
    error?: string;
}

export default function DocumentSimplifierPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
    const [result, setResult] = useState<SimplifiedPoint[]>([]);
    const [text, setText] = useState<string>('');
    const [error, setError] = useState<string>('');

    // --- 2. ADD NEW STATE FOR THE CHAT ---
    const [showChat, setShowChat] = useState<boolean>(false);
    // We store the text separately for the chat, so user can clear the textarea
    const [chatDocumentText, setChatDocumentText] = useState<string>('');

    const handleSimplify = async () => {
        if (!text.trim()) {
            setError('Please enter some text or upload a PDF to simplify.');
            return;
        }
        setIsLoading(true);
        setResult([]);
        setError('');
        setShowChat(false); // Close chat on new simplification
        
        const documentToSimplify = text.trim();

        try {
            // const response = await fetch('https://legalmate-a36k.onrender.com/api/simplify', {
            const response = await fetch('https://legalmate-a36k.onrender.com/api/simplify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: documentToSimplify })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data: ApiResponse = await response.json();
            
            if (data.error) throw new Error(data.error);
            
            if (data.summary_points) { 
                setResult(data.summary_points);
                // --- 3. ON SUCCESS, SHOW THE CHAT ---
                setChatDocumentText(documentToSimplify); // Save the doc for the chat
                setShowChat(true); // Open the chat window
            }
            else { throw new Error('Invalid response format'); }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please select a PDF file.');
            return;
        }

        setIsProcessingPdf(true);
        setError('');
        setResult([]);
        setText('');
        setShowChat(false); // Close chat on new upload

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            // NOTE: You still need to create this /api/extract-pdf endpoint!
            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract text from PDF.');
            }

            setText(data.text);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during PDF processing.');
        } finally {
            setIsProcessingPdf(false);
            if (event.target) event.target.value = '';
        }
    };

    const clearError = () => setError('');

    return (
        <main className="flex flex-col items-center min-h-screen p-4 bg-slate-900 text-white">
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center mb-6 text-sky-400 hover:underline">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white">Legal Document Simplifier</h1>
                    <p className="text-lg text-slate-300 mt-2">Paste your complex legal text or upload a PDF to get a simple summary.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-red-300">Error</h3>
                            <p className="text-red-200">{error}</p>
                        </div>
                        <button onClick={clearError} className="p-1 -m-1 text-red-400 hover:text-red-300 transition-colors">
                            <span className="text-2xl font-bold">&times;</span>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* --- Original Document Column --- */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col">
                        <h2 className="text-2xl font-semibold text-white mb-4">Original Document</h2>
                        <div className="flex-grow flex flex-col">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-80 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow resize-none"
                                placeholder="Paste your legal text here, or upload a PDF below..."
                            ></textarea>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-slate-700"></div><span className="flex-shrink mx-4 text-slate-500">OR</span><div className="flex-grow border-t border-slate-700"></div>
                            </div>
                            <label className="w-full flex justify-center items-center gap-3 bg-slate-700 text-sky-300 font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                                {isProcessingPdf ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Processing PDF...</>
                                ) : (
                                    <><UploadCloud className="w-6 h-6" />Upload PDF</>
                                )}
                                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isProcessingPdf} />
                            </label>
                        </div>
                        <button onClick={handleSimplify} disabled={isLoading || isProcessingPdf || !text.trim()} className="mt-6 w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? (<div className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Simplifying...</div>) : ('Simplify Text')}
                        </button>
                    </div>

                    {/* --- Simplified Summary Column --- */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                        <h2 className="text-2xl font-semibold text-white mb-4">Simplified Summary</h2>
                        <div className="w-full h-[30rem] bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 overflow-y-auto">
                            {isLoading && (
                                <div className="flex flex-col justify-center items-center h-full gap-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                                    <p className="text-slate-400">Analyzing and simplifying your document...</p>
                                </div>
                            )}
                            {!isLoading && result.length > 0 && (
                                <div className="space-y-4">
                                    <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg"><p className="text-green-300 text-sm">✓ Successfully simplified {result.length} key point{result.length !== 1 ? 's' : ''} from your document</p></div>
                                    {result.map((item, index) => (
                                        <div key={index} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/70 flex items-start gap-4 hover:bg-slate-800/80 transition-colors">
                                            <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">{index + 1}</div>
                                            <div className="flex-grow"><h4 className="font-bold text-white mb-2">{item.title}</h4><p className="text-slate-300 leading-relaxed">{item.text}</p></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isLoading && result.length === 0 && !error && (
                                <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-3">
                                    <div className="w-16 h-16 border-2 border-slate-600 rounded-full flex items-center justify-center"><CheckCircle className="w-8 h-8 text-slate-600" /></div>
                                    <p className="text-center">Your simplified summary will appear here.</p><p className="text-sm text-slate-600 text-center">Enter some legal text and click &quot;Simplify Text&quot; to get started.</p>
m                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 4. RENDER THE CHAT COMPONENT --- */}
            {showChat && (
                <VakilChat 
                    documentText={chatDocumentText} 
                />
            )}
        </main>
    );
}