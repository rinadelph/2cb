import React, { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Label } from '@/components/ui/label';
import { ListingBase, ListingImage } from '@/types/listing';

interface ImagesProps {
  form: UseFormReturn<ListingBase>;
}

export const Images: React.FC<ImagesProps> = ({ form }) => {
  const { setValue, watch } = form;
  const images = watch('images') || [];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ListingImage[] = acceptedFiles.map((file, index) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      width: 0, // Will be set after image loads
      height: 0, // Will be set after image loads
      size: file.size,
      type: file.type,
      is_featured: index === 0 && images.length === 0,
      order: images.length + index,
      meta_data: {
        originalName: file.name,
      },
    }));

    setValue('images', [...images, ...newImages]);
  }, [images, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
  });

  const removeImage = (id: string) => {
    setValue(
      'images',
      images.filter((img) => img.id !== id)
    );
  };

  const setFeatured = (id: string) => {
    setValue(
      'images',
      images.map((img) => ({
        ...img,
        is_featured: img.id === id,
      }))
    );
  };

  const reorderImages = (startIndex: number, endIndex: number) => {
    const result = Array.from(images);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setValue(
      'images',
      result.map((img, index) => ({
        ...img,
        order: index,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Property Images</Label>
        <div
          {...getRootProps()}
          className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag and drop images here, or click to select files</p>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group"
            >
              <img
                src={image.url}
                alt={`Property image ${index + 1}`}
                className={`w-full h-48 object-cover rounded-lg
                  ${image.is_featured ? 'ring-2 ring-blue-500' : ''}`}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setFeatured(image.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                  >
                    {image.is_featured ? 'Featured' : 'Set Featured'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 