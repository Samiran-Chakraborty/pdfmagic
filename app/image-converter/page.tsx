"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, UploadCloud, RefreshCw, X } from 'lucide-react';

export default function ImageConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.9);
    const [isConverting, setIsConverting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const convertImage = async () => {
        if (!file || !previewUrl) return;

        setIsConverting(true);

        try {
            const img = new Image();
            img.src = previewUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('Conversion failed.');
                    setIsConverting(false);
                    return;
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                let ext = 'jpg';
                if (format === 'image/png') ext = 'png';
                if (format === 'image/webp') ext = 'webp';

                const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                link.download = `${originalName}-converted.${ext}`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setIsConverting(false);
            }, format, quality);

        } catch (error) {
            console.error(error);
            alert('Error converting image');
            setIsConverting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        <span className="font-bold text-xl text-pink-600">Image Converter</span>
                        <div className="w-20"></div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">

                    <div className="mb-8">
                        <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600">
                            <ImageIcon className="h-10 w-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Convert Images</h1>
                        <p className="text-slate-500">Convert between PNG, JPG, and WebP formats instantly.</p>
                    </div>

                    {/* Upload Zone */}
                    {!file && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="rounded-2xl p-10 cursor-pointer mb-8 group hover:bg-pink-50/50 border-2 border-dashed border-slate-200 hover:border-pink-300 transition-all"
                        >
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <div className="pointer-events-none">
                                <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4 group-hover:text-pink-500 transition-colors" />
                                <p className="text-lg font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-400">Supported formats: PNG, JPG, WebP</p>
                            </div>
                        </div>
                    )}

                    {/* Editor Section */}
                    {file && previewUrl && (
                        <div className="text-left max-w-2xl mx-auto anime-fade-in">
                            <div className="flex flex-col md:flex-row gap-8 items-start">

                                {/* Preview Image */}
                                <div className="w-full md:w-1/2">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-medium text-sm text-slate-500">Preview</p>
                                        <button
                                            onClick={removeFile}
                                            className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                                        >
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                    <div className="border rounded-lg p-2 bg-slate-100 relative group">
                                        <img src={previewUrl} alt="Preview" className="w-full h-auto rounded" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-center truncate">{file.name}</p>
                                </div>

                                {/* Controls */}
                                <div className="w-full md:w-1/2 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Format</label>
                                        <select
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                            className="w-full border-slate-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2.5 bg-white border outline-none font-medium text-slate-700"
                                        >
                                            <option value="image/jpeg">JPEG (.jpg)</option>
                                            <option value="image/png">PNG (.png)</option>
                                            <option value="image/webp">WebP (.webp)</option>
                                        </select>
                                    </div>



                                    <button
                                        onClick={convertImage}
                                        disabled={isConverting}
                                        className="w-full bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isConverting ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
                                        {isConverting ? 'Converting...' : 'Convert & Download'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
