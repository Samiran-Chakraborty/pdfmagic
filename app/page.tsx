"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Minimize2, FileText, Wand2, Shield, Zap, Layout } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen font-sans bg-slate-50 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-indigo-200/40 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-pink-200/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center z-10 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8 shadow-sm animate-fade-in-up">
                        <Wand2 className="w-4 h-4" />
                        <span className="tracking-wide uppercase text-xs">The Ultimate PDF Toolkit</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Master Your Documents <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                            with Zero Hassle.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Transform, resize, and optimize your files instantly. <br />
                        <span className="font-semibold text-slate-800">100% Client-Side.</span> No uploads. No waiting.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link href="#tools" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
                            Get Started
                        </Link>
                        <Link href="https://github.com/Samiran-Chakraborty/Google-Antigravity" target="_blank" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
                            View on GitHub
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div id="tools" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Image Converter */}
                    <Link href="/image-converter" className="group relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-200/50 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-pink-600 transition-colors">Image Converter</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">Convert between PNG, JPG, and WebP formats instantly with high quality preservation.</p>
                            <div className="inline-flex items-center text-pink-600 font-bold group-hover:translate-x-2 transition-transform">
                                Try Converter <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* Resize Tool */}
                    <Link href="/resize-tool" className="group relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-200/50 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                <Minimize2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">Resize Tool</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">Compress huge images and PDF files to your exact target size without losing quality.</p>
                            <div className="inline-flex items-center text-cyan-600 font-bold group-hover:translate-x-2 transition-transform">
                                Resize Now <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </Link>

                    {/* PDF to Word */}
                    <Link href="/pdf-to-word" className="group relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200/50 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">PDF to Word</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">Extract text and layout from PDF documents to editable Word files using modern AI.</p>
                            <div className="inline-flex items-center text-orange-600 font-bold group-hover:translate-x-2 transition-transform">
                                Convert PDF <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* Features / Why Choose Us */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 text-white relative overflow-hidden">
                    {/* Abstract shapes */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why use our tools?</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">We prioritize your privacy and speed. Unlike other tools, we don't send your files to a cloud server.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Privacy First</h3>
                                <p className="text-slate-400 leading-relaxed">Your files never leave your device. All processing happens locally in your browser for maximum security.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Blazing Fast</h3>
                                <p className="text-slate-400 leading-relaxed">No upload times, no download queues. Instant processing powered by WebAssembly technology.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-400">
                                    <Layout className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Simple Design</h3>
                                <p className="text-slate-400 leading-relaxed">Clean, distraction-free interface designed to help you get your work done efficiently.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
