"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Timestamp } from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { Upload, Loader2 } from "lucide-react";
import { ProjectAsset } from "@/types/database";

interface FileUploadProps {
    projectId: string;
    onUploadComplete: (asset: ProjectAsset) => void;
}

export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const storageRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (error) => {
                console.error("Upload failed", error);
                setUploading(false);
                alert("Upload failed.");
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const asset: ProjectAsset = {
                    id: uploadTask.snapshot.ref.name,
                    name: file.name,
                    url: downloadURL,
                    type: file.type.startsWith("image/") ? "photo" : "document",
                    uploadedAt: Timestamp.fromDate(new Date())
                };
                onUploadComplete(asset);
                setUploading(false);
                setProgress(0);
            }
        );
    };

    return (
        <div className="relative">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
            />
            <label
                htmlFor="file-upload"
                className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                ) : (
                    <Upload className="w-5 h-5 opacity-50" />
                )}
                <span className="text-sm font-medium">
                    {uploading ? `Uploaden (${Math.round(progress)}%)` : "Nieuwe asset uploaden"}
                </span>
            </label>
        </div>
    );
}
