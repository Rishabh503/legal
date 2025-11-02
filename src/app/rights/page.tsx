'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Search,
  Mic,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// --- Type Definitions ---
interface RightsResult {
  explanation: string;
  relevantLaws: { title: string; text: string }[];
  guidance: string;
  disclaimer: string;
}

interface ApiResponse {
  explanation?: string;
  relevantLaws?: { title: string; text: string }[];
  guidance?: string;
  disclaimer?: string;
  error?: string;
}

// --- Speech Recognition Types ---
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

// --- Sample Questions for better UX ---
const sampleQuestions: string[] = [
  "What are my rights if my employer doesn't pay my salary?",
  "Can my landlord evict me without notice?",
  "What are my rights as a consumer?",
  "What can I do if I'm discriminated against at work?",
  "What are my rights during police questioning?",
];

const KnowYourRightsPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RightsResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) {
      setError('Please enter a question to get started.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('https://legalmate-a36k.onrender.com/api/know-your-rights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.explanation && data.relevantLaws && data.guidance && data.disclaimer) {
        setResult({
          explanation: data.explanation,
          relevantLaws: data.relevantLaws,
          guidance: data.guidance,
          disclaimer: data.disclaimer,
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error calling know-your-rights API:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get rights information. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  const handleSampleQuestion = (question: string): void => {
    setQuery(question);
    setError('');
    setResult(null);
  };

  const handleVoiceSearch = (): void => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setError('Speech recognition failed. Please try typing your question.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setError('Speech recognition is not supported in your browser.');
    }
  };

  const clearError = (): void => setError('');

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-slate-900 text-white">
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center mb-8 text-sky-400 hover:underline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">Know Your Rights</h1>
          <p className="text-lg text-slate-300 mt-2">
            Ask a general question to understand your legal rights in any situation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-300">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question like: 'What are my rights as a tenant?'"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 pl-12 text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            </div>
            <button
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-4 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title="Voice search"
            >
              <Mic className={`w-6 h-6 ${isListening ? 'text-white animate-pulse' : 'text-sky-300'}`} />
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-sky-600 text-white font-semibold py-4 px-8 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </div>
              ) : (
                'Ask'
              )}
            </button>
          </div>
        </div>

        {/* Sample Questions */}
        {!result && !isLoading && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleQuestions.map((question: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuestion(question)}
                  className="text-left p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-sky-300"
                >
                  <span className="text-sky-400 mr-2">Q:</span>
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Researching your rights and analyzing relevant laws...</p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <p className="text-green-300">
                ✓ Found relevant rights information and legal guidance for your question
              </p>
            </div>

            {/* Main Explanation */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">?</span>
                </div>
                <h3 className="text-2xl font-semibold text-white">Your Rights Explained</h3>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Relevant Laws */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-7 h-7 text-sky-400" />
                <h3 className="text-2xl font-semibold text-white">Relevant Rights & Laws</h3>
              </div>
              <div className="space-y-4">
                {result.relevantLaws.map((law, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-800/60 p-5 rounded-lg border border-slate-700/70 hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sky-300 mb-2">{law.title}</h4>
                        <p className="text-slate-300 leading-relaxed">{law.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidance */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-7 h-7 text-amber-400" />
                <h3 className="text-2xl font-semibold text-white">What You Can Do</h3>
              </div>
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                <p className="text-slate-300 leading-relaxed">{result.guidance}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-amber-300 mb-2">Important Disclaimer</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.disclaimer}</p>
                </div>
              </div>
            </div>

            {/* Ask Another Question */}
            <div className="text-center pt-6">
              <button
                onClick={() => {
                  setQuery('');
                  setResult(null);
                  setError('');
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ask Another Question
              </button>
            </div>
          </div>
        )}

        {/* No Results Empty State */}
        {!result && !isLoading && !error && query && (
          <div className="text-center p-12">
            <div className="w-16 h-16 border-2 border-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500">
              Enter your question above and click &quot;Ask&quot; to get started.
            </p>
          </div>
        )}

        {/* Voice Search Status */}
        {isListening && (
          <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Listening...
          </div>
        )}
      </div>
    </main>
  );
};

export default KnowYourRightsPage;
