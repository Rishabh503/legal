'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import Navbar from '@/components/layout/Navbar';
// --- Type Definitions ---
type FeaturePage = '/simplifier' | '/rights' | '/advisor' | '/lawyers'; // <-- ADDED /lawyers

// --- SVG Icons ---
// (ScaleIcon, FileTextIcon, ShieldCheckIcon, MessageCircleIcon... all remain the same)
const ScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16.5l-4-4-4 4"></path><path d="M12 3v9"></path><path d="M4 12H2"></path><path d="M22 12h-2"></path><path d="M21 12a9 9 0 0 1-18 0"></path><path d="M3 12a9 9 0 0 1 18 0"></path><path d="M3 21h18"></path>
    </svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);
const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>
    </svg>
);
const MessageCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

// --- NEW ICON FOR LAWYERS ---
const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

// --- 3D STARFIELD COMPONENT ---
function Starfield() {
    const ref = useRef<THREE.Group>(null);
    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });
    return (
        <group ref={ref}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

// --- Main Home Page Component ---
export default function HomePage() {
    const features = [
        {
            icon: <FileTextIcon className="w-10 h-10 mb-4 text-sky-400" />,
            title: 'Document Simplifier',
            description: 'Upload or paste dense legal contracts and get a clear, simple summary in seconds.',
            page: '/simplifier' as FeaturePage
        },
        {
            icon: <ShieldCheckIcon className="w-10 h-10 mb-4 text-sky-400" />,
            title: 'Know Your Rights',
            description: 'Ask general questions about your legal rights to get simple, educational answers and learn about key laws.',
            page: '/rights' as FeaturePage
        },

        {
            icon: <MessageCircleIcon className="w-10 h-10 mb-4 text-sky-400" />,
            title: 'AI Legal Advisor',
            description: 'Describe your personal story or case to receive personalized guidance mapping your situation to relevant laws.',
            page: '/advisor' as FeaturePage
        },
        // --- NEW FEATURE CARD ADDED ---
        {
            icon: <UsersIcon className="w-10 h-10 mb-4 text-sky-400" />,
            title: 'Find a Lawyer',
            description: 'Get a second opinion. Find, book, and consult with verified legal professionals from all over India.',
            page: '/lawyers' as FeaturePage
        }
        // Note: I moved "Know Your Rights" as the "AI Legal Advisor" is more comprehensive,
        // but you can re-order or keep all four as you like.
    ];

    return (
        <div className="relative w-full min-h-screen bg-slate-900">
            {/* --- 3D CANVAS BACKGROUND --- */}
            <div className="fixed top-0 left-0 w-full h-full z-0">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <Suspense fallback={null}>
                        <Starfield />
                    </Suspense>
                </Canvas>
            </div>

            {/* --- YOUR ORIGINAL CONTENT --- */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-white">
                <Navbar/>
                <div className="w-full max-w-5xl mx-auto py-12 md:py-20 text-center">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <ScaleIcon className="w-12 h-12 text-sky-400" />
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">AI LegalMate</h1>
                    </div>
                    <p className="text-lg md:text-xl text-slate-300 mb-12">Accessible Legal Guidance for All. Making complex law simple.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-lg hover:border-sky-500/50 hover:bg-slate-800 transition-all duration-300 flex flex-col items-center">
                                {feature.icon}
                                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 flex-grow mb-6">{feature.description}</p>
                                <a href={feature.page} className="w-full mt-auto bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-500 transition-colors block">
                                    Get Started
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}