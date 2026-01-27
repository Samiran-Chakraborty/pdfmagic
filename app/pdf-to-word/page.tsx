"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, UploadCloud, BrainCircuit, Download, Check, Loader2, X, AlertTriangle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// Removed top-level pdfjs-dist import to prevent SSR errors
// import * as pdfjsLib from 'pdfjs-dist';
// pdfjsLib.GlobalWorkerOptions.workerSrc = ...

export default function PdfToWord() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [showResult, setShowResult] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // --- File Handling ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setExtractedText('');
        setShowResult(false);
        setProgress(0);

        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } else if (selectedFile.type === 'application/pdf') {
            // For PDF we might show a generic icon or render the first page?
            // For simplicity, let's just show a PDF icon placehoder for now in preview
            setPreviewUrl(null);
        } else {
            alert('Unsupported file type. Please upload Image or PDF.');
            setFile(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setExtractedText('');
        setShowResult(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- OCR Logic ---

    const processImage = async (imageUrl: string) => {
        const worker = await createWorker('eng');

        const ret = await worker.recognize(imageUrl);
        await worker.terminate();
        return ret.data.text;
    };

    const processPdf = async (file: File) => {
        // Dynamically import pdfjs-dist to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
            setStatusText(`Processing page ${i} of ${totalPages}...`);
            setProgress(Math.round((i / totalPages) * 100));

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) continue;

            // @ts-ignore - The type definitions for pdfjs-dist can be tricky with canvasContext
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const imageUrl = canvas.toDataURL('image/png');
            const text = await processImage(imageUrl);
            fullText += text + '\n\n';
        }
        return fullText;
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setExtractedText('');
        setShowResult(false);

        try {
            let text = '';
            if (file.type.startsWith('image/')) {
                setStatusText('Scanning image with AI...');
                setProgress(30);
                // For image, we can just use the preview URL or file object
                // tesseract accepts File objects directy
                const worker = await createWorker('eng', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                });
                const ret = await worker.recognize(file);
                text = ret.data.text;
                await worker.terminate();

            } else if (file.type === 'application/pdf') {
                text = await processPdf(file);
            }

            setExtractedText(text);
            setShowResult(true);
            setStatusText('Done!');

        } catch (e: any) {
            console.error(e);
            alert(`Error processing file: ${e.message}`);
        }
        setIsProcessing(false);
    };

    // --- Word Generation ---

    const downloadWordDoc = async () => {
        if (!extractedText) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: extractedText.split('\n').map(line =>
                    new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 120 } // slight spacing
                    })
                ),
            }],
        });

        const blob = await Packer.toBlob(doc);

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name.split('.')[0] || 'document'}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        <span className="font-bold text-xl text-indigo-600 flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6" /> PDF to Word AI
                        </span>
                        <div className="w-20"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">

                    <div className="mb-8">
                        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI PDF & Image to Word</h1>
                        <p className="text-slate-500 max-w-lg mx-auto">
                            Convert scanned PDFs, images, and handwritten notes into editable Word documents using browser-based AI.
                        </p>
                    </div>

                    {/* Upload Zone */}
                    {!file && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-2xl p-10 cursor-pointer mb-8 group hover:bg-indigo-50/50 border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*, application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="pointer-events-none">
                                <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-indigo-500 transition-colors" />
                                <p className="text-lg font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-400">Supports: Scanned PDFs, Images (PNG/JPG), Handwriting</p>
                            </div>
                        </div>
                    )}

                    {/* Editor / Processing Area */}
                    {file && (
                        <div className="text-left animate-fade-in">

                            {/* File Header */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-12 h-12 rounded object-cover border border-indigo-200" />
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-indigo-200">
                                            <FileText className="text-indigo-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Processing File</p>
                                        <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 hover:border-red-200 transition-all"
                                    title="Remove File"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">

                                {/* Control Panel */}
                                <div className="w-full md:w-1/3 space-y-4">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Controls
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6">
                                            The AI will scan your document for text. Handwriting support is experimental but included!
                                        </p>

                                        {!showResult && (
                                            <button
                                                onClick={handleConvert}
                                                disabled={isProcessing}
                                                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Start AI Scan'}
                                            </button>
                                        )}

                                        {isProcessing && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                                    <span>{statusText}</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-full transition-all duration-300"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Result Area */}
                                <div className="w-full md:w-2/3">
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-full min-h-[400px] flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-slate-900">Extracted Text Preview</h3>
                                            {showResult && (
                                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    Scan Complete
                                                </span>
                                            )}
                                        </div>

                                        {!showResult && !isProcessing && (
                                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                                <FileText className="w-12 h-12 mb-2 opacity-20" />
                                                <p>Click "Start AI Scan" to extract text.</p>
                                            </div>
                                        )}

                                        {isProcessing && (
                                            <div className="flex-1 flex flex-col items-center justify-center text-indigo-400">
                                                <BrainCircuit className="w-16 h-16 mb-4 animate-pulse" />
                                                <p className="animate-pulse">AI is reading your document...</p>
                                            </div>
                                        )}

                                        {showResult && (
                                            <>
                                                <textarea
                                                    value={extractedText}
                                                    onChange={(e) => setExtractedText(e.target.value)}
                                                    className="w-full flex-1 p-4 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-0 font-mono text-sm resize-none mb-4"
                                                    placeholder="Extracted text will appear here..."
                                                />

                                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2 text-yellow-800 text-xs mb-4">
                                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                                    <p>Please review the text above. Handwriting OCR can be imperfect. You can edit errors directly before downloading.</p>
                                                </div>

                                                <button
                                                    onClick={downloadWordDoc}
                                                    className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                                >
                                                    <Download className="w-5 h-5" /> Download as Word (.docx)
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
