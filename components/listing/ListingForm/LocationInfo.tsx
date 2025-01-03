import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingBase } from "@/types/listing";

export function LocationInfo() {
  const { register, formState: { errors } } = useFormContext<ListingBase>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Location</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address_street_number">Street Number</Label>
          <Input
            id="address_street_number"
            type="text"
            {...register('address_street_number')}
            placeholder="123"
          />
          {errors.address_street_number && (
            <p className="mt-1 text-sm text-red-500">{errors.address_street_number.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address_street_name">Street Name</Label>
          <Input
            id="address_street_name"
            {...register('address_street_name')}
            placeholder="Main St"
          />
          {errors.address_street_name && (
            <p className="mt-1 text-sm text-red-500">{errors.address_street_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address_unit">Unit (Optional)</Label>
        <Input
          id="address_unit"
          {...register('address_unit')}
          placeholder="Apt 4B"
        />
        {errors.address_unit && (
          <p className="mt-1 text-sm text-red-500">{errors.address_unit.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="City"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="State"
            maxLength={2}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zip_code">ZIP Code</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            placeholder="12345"
          />
          {errors.zip_code && (
            <p className="mt-1 text-sm text-red-500">{errors.zip_code.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register('country')}
            placeholder="US"
            maxLength={2}
            defaultValue="US"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>
      </div>
    </div>
  );
} 