"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/use-toast";

export interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (const file of acceptedFiles) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `listings/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('listings')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(filePath);

          newUrls.push(publicUrl);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast({
          title: "Success",
          description: `Successfully uploaded ${newUrls.length} image${newUrls.length === 1 ? '' : 's'}`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, value, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 transition cursor-pointer",
          isDragActive && "border-primary/50 bg-primary/5",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-primary/10">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="text-lg font-semibold text-white">
            {isUploading ? "Uploading..." : isDragActive ? "Drop images here" : "Drag & drop images"}
          </div>
          <div className="text-sm text-gray-400">
            {isUploading ? (
              "Please wait while we process your images"
            ) : (
              "or click to select files"
            )}
          </div>
        </div>
      </div>

      {value?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden">
              <Image
                src={url}
                alt={`Property image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                  Featured Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 