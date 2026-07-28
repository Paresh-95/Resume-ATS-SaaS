"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ResumeSummary {
  id: string;
  title: string;
  fileName: string | null;
  createdAt: string;
}

interface ResumeSelectorProps {
  value: string | null;
  onChange: (resumeId: string) => void;
}

export function ResumeSelector({ value, onChange }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (res.ok) {
        setResumes(data.resumes);
        if (!value && data.resumes.length > 0) {
          onChange(data.resumes[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const res = await fetch("/api/resumes", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to upload resume");
        return;
      }

      toast.success("Resume uploaded");
      await loadResumes();
      onChange(data.resume.id);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={value ?? undefined} onValueChange={(val) => val && onChange(val)}>
          <SelectTrigger className="w-full sm:flex-1">
            <FileText className="size-4 text-muted-foreground" />
            <SelectValue
              placeholder={loading ? "Loading resumes..." : "Select a resume"}
            />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
          Upload new
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!loading && resumes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No resumes yet — upload a PDF, DOCX, or TXT file to get started.
        </p>
      )}
    </div>
  );
}
