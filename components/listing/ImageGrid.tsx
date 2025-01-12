import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ImageThumbnail } from './ImageThumbnail';

interface Image {
  id: string;
  url: string;
  displayOrder: number;
}

interface ImageGridProps {
  images: Image[];
  onReorder: (startIndex: number, endIndex: number) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ImageGrid({ images, onReorder, onDelete, isLoading }: ImageGridProps) {
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    try {
      await onReorder(sourceIndex, destinationIndex);
    } catch (error) {
      console.error('[ImageGrid] Error reordering images:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((image, index) => (
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