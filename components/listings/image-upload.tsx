"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase-client";
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
      console.log('[ImageUpload] Starting upload for files:', acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

      const supabase = getSupabaseClient();

      for (const file of acceptedFiles) {
        try {
          // Ensure we only use supported extensions
          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            throw new Error('Unsupported file type. Please use JPG, PNG, or GIF images.');
          }

          // Create a clean filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 10);
          const cleanFileName = `${timestamp}-${randomId}.${fileExt}`;

          console.log('[ImageUpload] Processing file:', {
            originalName: file.name,
            newName: cleanFileName,
            size: file.size,
            type: file.type
          });

          // Upload the file
          const { error: uploadError, data } = await supabase.storage
            .from('listings')
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: true // Changed to true to handle potential duplicates
            });

          if (uploadError) {
            console.error('[ImageUpload] Upload error:', {
              error: uploadError,
              file: cleanFileName,
              message: uploadError.message
            });
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          console.log('[ImageUpload] Upload successful:', {
            data,
            file: cleanFileName
          });

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(cleanFileName);

          console.log('[ImageUpload] Public URL generated:', {
            url: publicUrl,
            file: cleanFileName
          });

          newUrls.push(publicUrl);
        } catch (error) {
          console.error('[ImageUpload] Error processing file:', {
            file: file.name,
            error: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
              name: error.name
            } : error
          });
          
          toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : 'Failed to upload image',
            variant: "destructive"
          });
        }
      }

      if (newUrls.length > 0) {
        console.log('[ImageUpload] Successfully uploaded files:', newUrls);
        onChange([...value, ...newUrls]);
        toast({
          title: "Success",
          description: `Successfully uploaded ${newUrls.length} image${newUrls.length === 1 ? '' : 's'}`,
        });
      }
    } catch (error) {
      console.error('[ImageUpload] Fatal error during upload:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
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