import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { ListingBase } from "@/types/listing";

const AVAILABLE_FEATURES = {
  pool: "Pool",
  garage: "Garage",
  garden: "Garden",
  fireplace: "Fireplace",
  security_system: "Security System",
  central_ac: "Central AC",
  // Add more as needed
};

const AVAILABLE_AMENITIES = {
  gym: "Gym",
  spa: "Spa",
  parking: "Parking",
  elevator: "Elevator",
  laundry: "Laundry",
  storage: "Storage",
  // Add more as needed
};

export function Features() {
  const { register, watch, setValue } = useFormContext<ListingBase>();
  const features = watch('features') || {};
  const amenities = watch('amenities') || {};

  const handleFeatureChange = (key: string, checked: boolean) => {
    setValue('features', { ...features, [key]: checked });
  };

  const handleAmenityChange = (key: string, checked: boolean) => {
    setValue('amenities', { ...amenities, [key]: checked });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {Object.entries(AVAILABLE_FEATURES).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${key}`}
                checked={features[key] || false}
                onCheckedChange={(checked) => handleFeatureChange(key, !!checked)}
              />
              <label htmlFor={`feature-${key}`}>{label}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {Object.entries(AVAILABLE_AMENITIES).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${key}`}
                checked={amenities[key] || false}
                onCheckedChange={(checked) => handleAmenityChange(key, !!checked)}
              />
              <label htmlFor={`amenity-${key}`}>{label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 