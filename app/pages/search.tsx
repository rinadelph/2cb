import { GoogleMapsProvider } from '../../src/lib/contexts/GoogleMapsContext';
import { GoogleMap } from '@/components/map/GoogleMap';

export default function SearchPage() {
  return (
    <GoogleMapsProvider>
      <div className="h-screen">
        <GoogleMap />
      </div>
    </GoogleMapsProvider>
  );
} 