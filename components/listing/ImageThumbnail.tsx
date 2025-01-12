import { useState } from 'react';
import Image from 'next/image';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';

interface ImageThumbnailProps {
  id: string;
  url: string;
  index: number;
  onDelete: (id: string) => Promise<void>;
}

export function ImageThumbnail({ id, url, index, onDelete }: ImageThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (error) {
      console.error('[ImageThumbnail] Error deleting image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
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
          
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="absolute top-2 left-2 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="icon"
            className={`absolute top-2 right-2 p-1 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Loading Overlay */}
          {isDeleting && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Drag Overlay */}
          {snapshot.isDragging && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg" />
          )}
        </div>
      )}
    </Draggable>
  );
} 