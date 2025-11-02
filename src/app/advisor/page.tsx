// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Gavel,
//   AlertTriangle,
//   AlertCircle,
//   CheckCircle,
//   Scale
// } from "lucide-react";

// // --- Type Definitions ---
// interface CaseAnalysisPoint {
//   type: 'point' | 'recommendation';
//   title: string;
//   text: string;
// }

// interface ApiResponse {
//   analysis_points?: CaseAnalysisPoint[];
//   error?: string;
// }

// // --- Sample Data ---
// const sampleCaseText = `My landlord is trying to evict me from my apartment. He gave me a notice that says I have to leave in 7 days, but my lease agreement says he needs to give 30 days' notice. He also shut off the water to my apartment yesterday to try and force me out. I have always paid my rent on time. What can I do?`;

// const sampleCases = [
//     "My boss fired me without notice or paying my last month's salary. I worked there for 3 years and never had any performance issues.",
//     "My landlord is trying to evict me without proper notice and has shut off utilities to force me out.",
//     "I was injured at work but my employer is refusing to file a workers' compensation claim.",
//     "A company sold me a defective product and won't provide a refund despite their warranty.",
//     "My neighbor's construction is damaging my property and they refuse to take responsibility."
// ];

// export default function AIAdvisorPage() {
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [result, setResult] = useState<CaseAnalysisPoint[]>([]);
//     const [caseText, setCaseText] = useState<string>(sampleCaseText);
//     const [error, setError] = useState<string>('');

//     const handleAnalyze = async () => {
//         if (!caseText.trim()) {
//             setError('Please describe your case to get legal analysis.');
//             return;
//         }

//         setIsLoading(true);
//         setResult([]);
//         setError('');

//         try {
//             const response = await fetch('https://legalmate-a36k.onrender.com/api/advise', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ case_text: caseText.trim() })
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data: ApiResponse = await response.json();

//             if (data.error) {
//                 throw new Error(data.error);
//             }

//             if (data.analysis_points && Array.isArray(data.analysis_points)) {
//                 setResult(data.analysis_points);
//             } else {
//                 throw new Error('Invalid response format from server');
//             }

//         } catch (err) {
//             console.error('Error calling advise API:', err);
//             setError(err instanceof Error ? err.message : 'Failed to analyze your case. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSampleCase = (caseExample: string) => {
//         setCaseText(caseExample);
//         setError('');
//         setResult([]);
//     };

//     const clearError = () => setError('');

//     const getAnalysisStats = () => {
//         const points = result.filter(item => item.type === 'point').length;
//         const recommendations = result.filter(item => item.type === 'recommendation').length;
//         return { points, recommendations };
//     };

//     return (
//         <main className="flex flex-col items-center min-h-screen p-4 bg-slate-900 text-white">
//             <div className="w-full max-w-6xl mx-auto px-4 py-12">
//                 <Link href="/" className="inline-flex items-center mb-6 text-sky-400 hover:underline">
//                     <ArrowLeft className="w-5 h-5 mr-2" />
//                     Back to Home
//                 </Link>

//                 <div className="text-center mb-12">
//                     <h1 className="text-4xl font-bold text-white">AI Legal Advisor</h1>
//                     <p className="text-lg text-slate-300 mt-2">Describe your personal situation, and our AI will highlight relevant legal points for your specific case.</p>
//                 </div>

//                 {/* Error Alert */}
//                 {error && (
//                     <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-start gap-3">
//                         <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
//                         <div className="flex-grow">
//                             <h3 className="font-semibold text-red-300">Error</h3>
//                             <p className="text-red-200">{error}</p>
//                         </div>
//                         <button 
//                             onClick={clearError}
//                             className="text-red-400 hover:text-red-300 transition-colors"
//                         >
//                             ×
//                         </button>
//                     </div>
//                 )}

//                 {/* Sample Cases Section */}
//                 {!result.length && !isLoading && (
//                     <div className="mb-8">
//                         <h3 className="text-lg font-semibold text-white mb-4">Example Cases</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {sampleCases.map((caseExample, index) => (
//                                 <button
//                                     key={index}
//                                     onClick={() => handleSampleCase(caseExample)}
//                                     className="text-left p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-sky-300"
//                                 >
//                                     <span className="text-sky-400 mr-2">📋</span>
//                                     {caseExample}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col">
//                         <h2 className="text-2xl font-semibold text-white mb-4">Your Case/Story</h2>
//                         <div className="flex-grow flex flex-col">
//                             <textarea
//                                 value={caseText}
//                                 onChange={(e) => setCaseText(e.target.value)}
//                                 className="w-full flex-grow h-80 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow resize-none"
//                                 placeholder="Describe your situation in detail here. For example: 'My boss fired me without notice or paying my last month's salary. I worked there for 3 years and never had any performance issues...'"
//                             ></textarea>
                            
//                             <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
//                                 <span>Be as specific as possible for better analysis</span>
//                                 <span>{caseText.length} characters</span>
//                             </div>
//                         </div>
                        
//                         <button 
//                             onClick={handleAnalyze} 
//                             disabled={isLoading || !caseText.trim()} 
//                             className="mt-6 w-full bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
//                         >
//                             {isLoading ? (
//                                 <div className="flex items-center justify-center gap-2">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                     Analyzing Your Case...
//                                 </div>
//                             ) : (
//                                 'Analyze My Case'
//                             )}
//                         </button>
//                     </div>

//                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
//                         <h2 className="text-2xl font-semibold text-white mb-4">Legal Analysis</h2>
//                         <div className="w-full h-[26rem] bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 overflow-y-auto">
//                             {isLoading && (
//                                 <div className="flex flex-col justify-center items-center h-full gap-4">
//                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
//                                     <p className="text-slate-400">Analyzing legal aspects of your case...</p>
//                                 </div>
//                             )}
                            
//                             {!isLoading && result.length > 0 && (
//                                 <div className="space-y-4">
//                                     {/* Success Header */}
//                                     <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
//                                         <div className="flex items-center gap-2">
//                                             <CheckCircle className="w-5 h-5 text-green-400" />
//                                             <p className="text-green-300 text-sm">
//                                                 ✓ Found {getAnalysisStats().points} legal point{getAnalysisStats().points !== 1 ? 's' : ''} and {getAnalysisStats().recommendations} recommendation{getAnalysisStats().recommendations !== 1 ? 's' : ''} for your case
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="space-y-3">
//                                         {result.map((item, index) => (
//                                             <div key={index} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/70 flex items-start gap-4 hover:bg-slate-800/80 transition-colors">
//                                                 <div className="flex-shrink-0">
//                                                     {item.type === 'point' ? (
//                                                         <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
//                                                             <Scale className="w-4 h-4 text-white" />
//                                                         </div>
//                                                     ) : (
//                                                         <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
//                                                             <AlertTriangle className="w-4 h-4 text-white" />
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <div className="flex-grow">
//                                                     <div className="flex items-center gap-2 mb-2">
//                                                         <h4 className="font-bold text-white">{item.title}</h4>
//                                                         <span className={`text-xs px-2 py-1 rounded-full ${
//                                                             item.type === 'point' 
//                                                                 ? 'bg-sky-900/50 text-sky-300' 
//                                                                 : 'bg-amber-900/50 text-amber-300'
//                                                         }`}>
//                                                             {item.type === 'point' ? 'Legal Point' : 'Recommendation'}
//                                                         </span>
//                                                     </div>
//                                                     <p className="text-slate-300 leading-relaxed">{item.text}</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {!isLoading && result.length === 0 && !error && (
//                                 <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-3">
//                                     <div className="w-16 h-16 border-2 border-slate-600 rounded-full flex items-center justify-center">
//                                         <Gavel className="w-8 h-8 text-slate-600" />
//                                     </div>
//                                     <p className="text-center">Your legal analysis will appear here.</p>
//                                     <p className="text-sm text-slate-600 text-center">Describe your situation and click &apos;Analyze My Case&apos; to get started.</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Analysis Results Summary */}
//                 {result.length > 0 && !isLoading && (
//                     <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
//                             <h3 className="text-lg font-semibold text-white mb-2">Legal Points Identified</h3>
//                             <div className="text-3xl font-bold text-sky-400 mb-2">{getAnalysisStats().points}</div>
//                             <p className="text-slate-400 text-sm">Relevant legal aspects found in your case</p>
//                         </div>
                        
//                         <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
//                             <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
//                             <div className="text-3xl font-bold text-amber-400 mb-2">{getAnalysisStats().recommendations}</div>
//                             <p className="text-slate-400 text-sm">Actionable steps for your situation</p>
//                         </div>
                        
//                         <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
//                             <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
//                             <div className="text-2xl font-bold text-green-400 mb-2">
//                                 {result.some(item => item.type === 'recommendation') ? '✓' : '→'}
//                             </div>
//                             <p className="text-slate-400 text-sm">
//                                 {result.some(item => item.type === 'recommendation') 
//                                     ? 'Review recommendations above' 
//                                     : 'Consider consulting a legal professional'
//                                 }
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Disclaimer */}
//                 {result.length > 0 && (
//                     <div className="mt-8 bg-amber-900/20 border border-amber-700/30 rounded-lg p-6">
//                         <div className="flex items-start gap-3">
//                             <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
//                             <div>
//                                 <h4 className="font-semibold text-amber-300 mb-2">Important Legal Disclaimer</h4>
//                                 <p className="text-amber-200 text-sm leading-relaxed">
//                                     This analysis is for informational purposes only and does not constitute legal advice. 
//                                     The AI&apos;s assessment is based on general legal principles and may not account for all 
//                                     relevant factors in your specific jurisdiction. For personalized legal advice, please 
//                                     consult with a qualified attorney who can review all the facts of your case.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </main>
//     );
// }


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Gavel,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Scale
} from "lucide-react";
// --- 1. IMPORT THE VAKILCHAT COMPONENT ---
import VakilChat from '../components/VakilChat';

// --- Type Definitions ---
interface CaseAnalysisPoint {
    type: 'point' | 'recommendation';
    title: string;
    text: string;
}

interface ApiResponse {
    analysis_points?: CaseAnalysisPoint[];
    error?: string;
}

// --- Sample Data ---
const sampleCaseText = `My landlord is trying to evict me from my apartment. He gave me a notice that says I have to leave in 7 days, but my lease agreement says he needs to give 30 days' notice. He also shut off the water to my apartment yesterday to try and force me out. I have always paid my rent on time. What can I do?`;

const sampleCases = [
    "My boss fired me without notice or paying my last month's salary. I worked there for 3 years and never had any performance issues.",
    "My landlord is trying to evict me without proper notice and has shut off utilities to force me out.",
    "I was injured at work but my employer is refusing to file a workers' compensation claim.",
    "A company sold me a defective product and won't provide a refund despite their warranty.",
    "My neighbor's construction is damaging my property and they refuse to take responsibility."
];

export default function AIAdvisorPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<CaseAnalysisPoint[]>([]);
    const [caseText, setCaseText] = useState<string>(sampleCaseText);
    const [error, setError] = useState<string>('');

    // --- 2. ADD NEW STATE FOR THE CHAT ---
    const [showChat, setShowChat] = useState<boolean>(false);
    const [chatCaseText, setChatCaseText] = useState<string>('');

    const handleAnalyze = async () => {
        if (!caseText.trim()) {
            setError('Please describe your case to get legal analysis.');
            return;
        }

        setIsLoading(true);
        setResult([]);
        setError('');
        setShowChat(false); // Hide chat on new analysis

        const caseToAnalyze = caseText.trim();

        try {
            // Using local API endpoint for consistency
            const response = await fetch('https://legalmate-a36k.onrender.com/api/advise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ case_text: caseToAnalyze })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.analysis_points && Array.isArray(data.analysis_points)) {
                setResult(data.analysis_points);
                // --- 3. ON SUCCESS, SHOW THE CHAT ---
                setChatCaseText(caseToAnalyze); // Save the case text for the chat
                setShowChat(true); // Open the chat window
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (err) {
            console.error('Error calling advise API:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze your case. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleCase = (caseExample: string) => {
        setCaseText(caseExample);
        setError('');
        setResult([]);
        setShowChat(false); // Hide chat when a sample is clicked
    };

    const clearError = () => setError('');

    const getAnalysisStats = () => {
        const points = result.filter(item => item.type === 'point').length;
        const recommendations = result.filter(item => item.type === 'recommendation').length;
        return { points, recommendations };
    };

    return (
        <main className="flex flex-col items-center min-h-screen p-4 bg-slate-900 text-white">
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center mb-6 text-sky-400 hover:underline">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white">AI Legal Advisor</h1>
                    <p className="text-lg text-slate-300 mt-2">Describe your personal situation, and our AI will highlight relevant legal points for your specific case.</p>
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

                {/* Sample Cases Section */}
                {!result.length && !isLoading && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Example Cases</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sampleCases.map((caseExample, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSampleCase(caseExample)}
                                    className="text-left p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-sky-300"
                                >
                                    <span className="text-sky-400 mr-2">📋</span>
                                    {caseExample}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* --- Your Case Column --- */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col">
                        <h2 className="text-2xl font-semibold text-white mb-4">Your Case/Story</h2>
                        <div className="flex-grow flex flex-col">
                            <textarea
                                value={caseText}
                                onChange={(e) => setCaseText(e.target.value)}
                                className="w-full flex-grow h-80 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow resize-none"
                                placeholder="Describe your situation in detail here. For example: 'My boss fired me without notice or paying my last month's salary. I worked there for 3 years and never had any performance issues...'"
                            ></textarea>
                            
                            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                                <span>Be as specific as possible for better analysis</span>
                                <span>{caseText.length} characters</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !caseText.trim()} 
                            className="mt-6 w-full bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Analyzing Your Case...
                                </div>
                            ) : (
                                'Analyze My Case'
                            )}
                        </button>
                    </div>

                    {/* --- Legal Analysis Column --- */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                        <h2 className="text-2xl font-semibold text-white mb-4">Legal Analysis</h2>
                        <div className="w-full h-[26rem] bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 overflow-y-auto">
                            {isLoading && (
                                <div className="flex flex-col justify-center items-center h-full gap-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                                    <p className="text-slate-400">Analyzing legal aspects of your case...</p>
                                </div>
                            )}
                            
                            {!isLoading && result.length > 0 && (
                                <div className="space-y-4">
                                    {/* Success Header */}
                                    <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                            <p className="text-green-300 text-sm">
                                                ✓ Found {getAnalysisStats().points} legal point{getAnalysisStats().points !== 1 ? 's' : ''} and {getAnalysisStats().recommendations} recommendation{getAnalysisStats().recommendations !== 1 ? 's' : ''} for your case
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {result.map((item, index) => (
                                            <div key={index} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/70 flex items-start gap-4 hover:bg-slate-800/80 transition-colors">
                                                <div className="flex-shrink-0">
                                                    {item.type === 'point' ? (
                                                        <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                                                            <Scale className="w-4 h-4 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                                                            <AlertTriangle className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-white">{item.title}</h4>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            item.type === 'point' 
                                                                ? 'bg-sky-900/50 text-sky-300' 
                                                                : 'bg-amber-900/50 text-amber-300'
                                                        }`}>
                                                            {item.type === 'point' ? 'Legal Point' : 'Recommendation'}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed">{item.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isLoading && result.length === 0 && !error && (
                                <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-3">
                                    <div className="w-16 h-16 border-2 border-slate-600 rounded-full flex items-center justify-center">
                                        <Gavel className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-center">Your legal analysis will appear here.</p>
                                    <p className="text-sm text-slate-600 text-center">Describe your situation and click &apos;Analyze My Case&apos; to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis Results Summary */}
                {result.length > 0 && !isLoading && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Legal Points Identified</h3>
                            <div className="text-3xl font-bold text-sky-400 mb-2">{getAnalysisStats().points}</div>
                            <p className="text-slate-400 text-sm">Relevant legal aspects found in your case</p>
                        </div>
                        
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
                            <div className="text-3xl font-bold text-amber-400 mb-2">{getAnalysisStats().recommendations}</div>
                            <p className="text-slate-400 text-sm">Actionable steps for your situation</p>
                        </div>
                        
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
                            <div className="text-2xl font-bold text-green-400 mb-2">
                                {result.some(item => item.type === 'recommendation') ? '✓' : '→'}
                            </div>
                            <p className="text-slate-400 text-sm">
                                {result.some(item => item.type === 'recommendation') 
                                    ? 'Review recommendations above' 
                                    : 'Consider consulting a legal professional'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                {result.length > 0 && (
                    <div className="mt-8 bg-amber-900/20 border border-amber-700/30 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-amber-300 mb-2">Important Legal Disclaimer</h4>
                                <p className="text-amber-200 text-sm leading-relaxed">
                                    This analysis is for informational purposes only and does not constitute legal advice. 
                                    The AI&apos;s assessment is based on general legal principles and may not account for all 
                                    relevant factors in your specific jurisdiction. For personalized legal advice, please 
                                    consult with a qualified attorney who can review all the facts of your case.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- 4. RENDER THE CHAT COMPONENT --- */}
            {showChat && (
                <VakilChat 
                    documentText={chatCaseText}
                />
            )}
        </main>
    );
}