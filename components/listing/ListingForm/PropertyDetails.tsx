import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingBase } from "@/types/listing";

export function PropertyDetails() {
  const { register, formState: { errors } } = useFormContext<ListingBase>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Details</h3>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="square_feet">Square Feet</Label>
          <Input
            id="square_feet"
            type="number"
            {...register('square_feet', { valueAsNumber: true })}
            placeholder="Enter square feet"
          />
          {errors.square_feet && (
            <p className="mt-1 text-sm text-red-500">{errors.square_feet.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            {...register('bedrooms', { valueAsNumber: true })}
            placeholder="Enter bedrooms"
          />
          {errors.bedrooms && (
            <p className="mt-1 text-sm text-red-500">{errors.bedrooms.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            step="0.5"
            {...register('bathrooms', { valueAsNumber: true })}
            placeholder="Enter bathrooms"
          />
          {errors.bathrooms && (
            <p className="mt-1 text-sm text-red-500">{errors.bathrooms.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="year_built">Year Built</Label>
          <Input
            id="year_built"
            type="number"
            {...register('year_built', { valueAsNumber: true })}
            placeholder="Enter year built"
          />
          {errors.year_built && (
            <p className="mt-1 text-sm text-red-500">{errors.year_built.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="lot_size">Lot Size (acres)</Label>
          <Input
            id="lot_size"
            type="number"
            step="0.01"
            {...register('lot_size', { valueAsNumber: true })}
            placeholder="Enter lot size"
          />
          {errors.lot_size && (
            <p className="mt-1 text-sm text-red-500">{errors.lot_size.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="parking_spaces">Parking Spaces</Label>
          <Input
            id="parking_spaces"
            type="number"
            {...register('parking_spaces', { valueAsNumber: true })}
            placeholder="Enter parking spaces"
          />
          {errors.parking_spaces && (
            <p className="mt-1 text-sm text-red-500">{errors.parking_spaces.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="stories">Stories</Label>
          <Input
            id="stories"
            type="number"
            {...register('stories', { valueAsNumber: true })}
            placeholder="Enter stories"
          />
          {errors.stories && (
            <p className="mt-1 text-sm text-red-500">{errors.stories.message}</p>
          )}
        </div>
      </div>
    </div>
  );
} 