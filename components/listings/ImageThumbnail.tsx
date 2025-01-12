import { useState } from 'react';
import Image from 'next/image';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageThumbnailProps {
  id: string;
  url: string;
  index: number;
  onDelete: (id: string) => Promise<void>;
  isDraggable?: boolean;
}

export function ImageThumbnail({ id, url, index, onDelete, isDraggable = true }: ImageThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  const content = (
    <div 
      className="relative aspect-square w-full overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={url}
        alt="Listing image"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {isHovered && !isDeleting && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 opacity-90 hover:opacity-100"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );

  if (!isDraggable) {
    return content;
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
} 