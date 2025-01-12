import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ImageThumbnail } from './ImageThumbnail';
import { Loader2 } from 'lucide-react';

export interface Image {
  id: string;
  url: string;
  display_order: number;
}

interface ImageGridProps {
  images: Image[];
  isLoading?: boolean;
  onDelete: (id: string) => Promise<void>;
  onReorder: (startIndex: number, endIndex: number) => Promise<void>;
}

export function ImageGrid({ images, isLoading, onDelete, onReorder }: ImageGridProps) {
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    await onReorder(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No images uploaded yet
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="images" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {images.map((image, index) => (
              <ImageThumbnail
                key={image.id}
                id={image.id}
                url={image.url}
                index={index}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 