"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Wand2 } from "lucide-react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                        <Wand2 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        PDF Magic
                    </span>
                </Link>

                <div className="hidden md:flex gap-8">
                    <Link href="/image-converter" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        Image Converter
                    </Link>
                    <Link href="/resize-tool" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        Resize Tool
                    </Link>
                    <Link href="/pdf-to-word" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        PDF to Word AI
                    </Link>
                </div>

                <div className="md:hidden">
                    {/* Mobile Menu Button could go here */}
                </div>
            </div>
        </motion.nav>
    );
}
