import Link from "next/link";
import { Wand2 } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 px-6 border-t border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                        <Wand2 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-white">
                        PDF Magic
                    </span>
                </div>

                <div className="flex gap-8 text-sm font-medium">
                    <Link href="/image-converter" className="hover:text-white transition-colors">Image Converter</Link>
                    <Link href="/resize-tool" className="hover:text-white transition-colors">Resize Tool</Link>
                    <Link href="/pdf-to-word" className="hover:text-white transition-colors">PDF to Word</Link>
                </div>

                <div className="text-xs text-slate-500">
                    © 2026 PDF Magic. Local Browser Processing.
                </div>
            </div>
        </footer>
    );
}
