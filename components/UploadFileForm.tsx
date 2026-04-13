"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  studentId: string;
  fileId?: string;
  defaultTitle?: string;
  buttonLabel: string;
};

export default function UploadFileForm({ studentId, fileId, defaultTitle, buttonLabel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedFile = formData.get("file") as File | null;
    const title = formData.get("title")?.toString().trim();

    if (!selectedFile) {
      setError("Choose a file first.");
      setLoading(false);
      return;
    }

    if (!fileId && !title) {
      setError("Title is required for a new file.");
      setLoading(false);
      return;
    }

    const presignResponse = await fetch("/api/files/presign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
      }),
    });

    if (!presignResponse.ok) {
      const payload = await presignResponse.json().catch(() => null);
      setError(payload?.error || "Failed to prepare upload.");
      setLoading(false);
      return;
    }

    const presignData = await presignResponse.json();

    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": selectedFile.type || "application/octet-stream",
      },
      body: selectedFile,
    });

    if (!uploadResponse.ok) {
      setError("Upload failed.");
      setLoading(false);
      return;
    }

    const commitResponse = await fetch("/api/files/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        fileId,
        title,
        originalName: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
        s3Key: presignData.s3Key,
      }),
    });

    if (!commitResponse.ok) {
      const payload = await commitResponse.json().catch(() => null);
      setError(payload?.error || "Failed to save file metadata.");
      setLoading(false);
      return;
    }

    form.reset();
    setLoading(false);
    router.refresh();
  };

  return (
    <form className="form-grid compact-form" onSubmit={handleSubmit}>
      {!fileId ? <input name="title" defaultValue={defaultTitle} placeholder="File title" required /> : null}
      <input name="file" type="file" accept="application/pdf,image/*" required />
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit" className="button" disabled={loading}>
        {loading ? "Uploading..." : buttonLabel}
      </button>
    </form>
  );
}
