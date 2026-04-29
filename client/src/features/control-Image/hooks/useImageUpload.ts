import { useState, useRef, useCallback } from 'react';

export const useImageUpload = (onFileChange?: (file: File | null) => void) => {
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview); // 기존 메모리 해제
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileChange?.(file);
    }
  }, [preview, onFileChange]);

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    onFileChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview, onFileChange]);

  const triggerUpload = () => fileInputRef.current?.click();

  return { preview, fileInputRef, handleFileChange, clearFile, triggerUpload };
};