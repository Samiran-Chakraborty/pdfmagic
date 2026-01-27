"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minimize2, UploadCloud, Settings2, Download, Check, Loader2, ChevronDown, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ResizeTool() {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);

    // Image State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imgWidth, setImgWidth] = useState<number>(0);
    const [imgHeight, setImgHeight] = useState<number>(0);
    const [originalAspect, setOriginalAspect] = useState<number>(0);
    const [maintainAspect, setMaintainAspect] = useState(true);
    const [targetKb, setTargetKb] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);
    const [finalSizeDisplay, setFinalSizeDisplay] = useState<string>('');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadFilename, setDownloadFilename] = useState<string>('');

    // PDF State
    const [pdfQuality, setPdfQuality] = useState(0.7);
    const [originalPdfBytes, setOriginalPdfBytes] = useState<ArrayBuffer | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
    }, [previewUrl, downloadUrl]);

    // --- File Handling ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setDownloadUrl(null); // Reset previous results

        if (selectedFile.type.startsWith('image/')) {
            setFileType('image');
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);

            const img = new Image();
            img.onload = () => {
                setImgWidth(img.width);
                setImgHeight(img.height);
                setOriginalAspect(img.width / img.height);
                const currentKB = Math.round(selectedFile.size / 1024);
                setTargetKb(currentKB > 100 ? 100 : currentKB);
            };
            img.src = url;

        } else if (selectedFile.type === 'application/pdf') {
            setFileType('pdf');
            const buffer = await selectedFile.arrayBuffer();
            setOriginalPdfBytes(buffer);
        } else {
            alert('Unsupported file type.');
            setFile(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setFileType(null);
        setPreviewUrl(null);
        setDownloadUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Utils ---

    const formatBytes = (bytes: number, decimals = 1) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    };

    // --- Processing ---

    const handleWidthChange = (val: number) => {
        setImgWidth(val);
        if (maintainAspect && originalAspect) {
            setImgHeight(Math.round(val / originalAspect));
        }
    };

    const handleHeightChange = (val: number) => {
        setImgHeight(val);
        if (maintainAspect && originalAspect) {
            setImgWidth(Math.round(val * originalAspect));
        }
    };

    const resizeImage = async () => {
        if (!previewUrl || !file) return;
        setIsProcessing(true);

        try {
            const targetBytes = targetKb * 1024;
            const img = new Image();
            img.src = previewUrl;
            await new Promise(r => { img.onload = r; });

            const canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('No context');

            let quality = 0.9;
            let width = imgWidth;
            let height = imgHeight;
            let blob: Blob | null = null;
            const type = file.type === 'image/png' ? 'image/jpeg' : file.type; // Force jpeg for compression if png

            // Simple iterative compression
            for (let i = 0; i < 10; i++) {
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                blob = await new Promise(r => canvas.toBlob(r, type, quality));
                if (!blob) break;

                if (blob.size <= targetBytes) break;
                quality -= 0.1;
                if (quality < 0.1) break;
            }

            if (!blob) throw new Error('Compression failed');

            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setFinalSizeDisplay(formatBytes(blob.size));

            let ext = file.name.split('.').pop();
            if (type === 'image/jpeg' && ext !== 'jpg' && ext !== 'jpeg') ext = 'jpg';
            setDownloadFilename(`min-${file.name.substring(0, file.name.lastIndexOf('.'))}.${ext}`);

        } catch (e) {
            console.error(e);
            alert('Error processing image');
        }
        setIsProcessing(false);
    };

    const resizePdf = async () => {
        if (!originalPdfBytes || !file) return;
        setIsProcessing(true);

        try {
            // Import pdfjs-dist dynamically
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            // Load original PDF
            const loadingTask = pdfjsLib.getDocument(originalPdfBytes.slice(0));
            const pdf = await loadingTask.promise;

            // Create new PDF with pdf-lib
            const newPdfDoc = await PDFDocument.create();
            const totalPages = pdf.numPages;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);

                // Render to Canvas (High Res for quality, but we compress the output)
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (!context) continue;

                // @ts-ignore - pdfjs-dist types mismatch
                await page.render({ canvasContext: context, viewport: viewport }).promise;

                // Compress to JPEG
                const imgDataUrl = canvas.toDataURL('image/jpeg', pdfQuality);
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

                // Embed in new PDF
                const embeddedImage = await newPdfDoc.embedJpg(imgBytes);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
            }

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setFinalSizeDisplay(formatBytes(blob.size));
            setDownloadFilename(`compressed-${file.name}`);

        } catch (e: any) {
            console.error(e);
            alert(`Error processing PDF: ${e.message || e}`);
        }
        setIsProcessing(false);
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
                        <span className="font-bold text-xl text-cyan-600">Resize Tool</span>
                        <div className="w-20"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">

                    <div className="mb-8">
                        <div className="w-20 h-20 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cyan-600">
                            <Minimize2 className="h-10 w-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Resize Image or PDF</h1>
                        <p className="text-slate-500">Compress huge files to your exact target size.</p>
                    </div>

                    {/* Upload Zone */}
                    {!file && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="rounded-2xl p-10 cursor-pointer mb-8 group hover:bg-cyan-50/50 border-2 border-dashed border-slate-200 hover:border-cyan-300 transition-all"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png, image/jpeg, image/webp, application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="pointer-events-none">
                                <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-cyan-500 transition-colors" />
                                <p className="text-lg font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-400">Supported: PDF, PNG, JPG, WebP</p>
                            </div>
                        </div>
                    )}

                    {/* Editor Area */}
                    {file && (
                        <div className="text-left max-w-2xl mx-auto animate-fade-in">

                            {/* File Header */}
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide mb-1">Original File</p>
                                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-cyan-700">{formatBytes(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={removeFile}
                                        className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 hover:border-red-200 transition-all"
                                        title="Remove File"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Editor Controls */}
                            {fileType === 'image' && previewUrl && (
                                <div className="space-y-6">
                                    <div className="border rounded-lg p-2 bg-slate-100 flex justify-center">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 object-contain" />
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Settings2 className="w-5 h-5 text-cyan-600" /> Compression Settings
                                        </h3>

                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Target File Size (KB)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={targetKb}
                                                    onChange={(e) => setTargetKb(Number(e.target.value))}
                                                    className="w-full pl-4 pr-12 py-3 border-2 border-cyan-100 rounded-xl focus:border-cyan-500 focus:ring-0 text-lg font-medium outline-none"
                                                    placeholder="50"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">KB</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-6">
                                            <details className="cursor-pointer group">
                                                <summary className="flex items-center justify-between list-none text-sm font-medium text-slate-600 hover:text-cyan-600">
                                                    <span>Advanced: Change Dimensions</span>
                                                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Width (px)</label>
                                                        <input
                                                            type="number"
                                                            value={imgWidth}
                                                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                                                            className="w-full border-slate-200 rounded-lg p-2 border text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Height (px)</label>
                                                        <input
                                                            type="number"
                                                            value={imgHeight}
                                                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                                                            className="w-full border-slate-200 rounded-lg p-2 border text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={maintainAspect}
                                                                onChange={(e) => setMaintainAspect(e.target.checked)}
                                                                className="rounded text-cyan-600 focus:ring-cyan-500"
                                                            />
                                                            <span className="text-xs text-slate-600">Maintain aspect ratio</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </details>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resizeImage}
                                        disabled={isProcessing}
                                        className="w-full bg-cyan-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Compress Image'}
                                    </button>
                                </div>
                            )}

                            {/* PDF Editor Controls */}
                            {fileType === 'pdf' && (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-slate-900 mb-4">Compression Level</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.1"
                                            value={pdfQuality}
                                            onChange={(e) => setPdfQuality(parseFloat(e.target.value))}
                                            className="w-full accent-cyan-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                            <span>Max Compression (Low Quality)</span>
                                            <span className="text-cyan-600 font-bold">{Math.round(pdfQuality * 100)}%</span>
                                            <span>Low Compression (High Quality)</span>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-xs text-yellow-800 mb-6">
                                        Note: This will convert PDF pages to images to reduce file size. Text will no longer be selectable.
                                    </div>

                                    <button
                                        onClick={resizePdf}
                                        disabled={isProcessing}
                                        className="w-full bg-cyan-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Compress PDF'}
                                    </button>
                                </div>
                            )}

                            {/* Results */}
                            {downloadUrl && (
                                <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-100 text-center animate-fade-in">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-green-800 text-lg mb-1">Compression Complete!</p>
                                    <p className="text-green-700 mb-4">New Size: <strong>{finalSizeDisplay}</strong></p>
                                    <a
                                        href={downloadUrl}
                                        download={downloadFilename}
                                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> Download File
                                    </a>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
