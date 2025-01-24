import React from 'react';
import { useFormContext, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommissionStructure } from '@/types/commission';

interface CommissionProps {
  _listingId?: string;
  listingPrice: number;
  _onSubmit: (data: CommissionStructure) => Promise<void>;
  initialData?: Partial<CommissionStructure>;
}

interface CommissionFormData {
  commission: {
    type: 'percentage' | 'flat';
    amount: number;
    split_percentage?: number;
    terms?: string;
    verification_required: boolean;
    visibility: 'private' | 'public' | 'verified_only';
  };
}

export function Commission({
  _listingId,
  listingPrice,
  initialData,
  _onSubmit,
}: CommissionProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<CommissionFormData>();
  const commissionType = watch('commission.type') || 'percentage';
  const amount = watch('commission.amount') || 0;

  const handleSliderChange = (value: number[]) => {
    setValue('commission.amount', value[0], { shouldValidate: true });
  };

  const calculateCommissionAmount = () => {
    if (commissionType === 'percentage') {
      return (listingPrice * amount) / 100;
    }
    return amount;
  };

  const getErrorMessage = (error: FieldError | undefined) => {
    return error?.message as string | undefined;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Commission Type</Label>
          <Select 
            defaultValue={initialData?.type || 'percentage'}
            onValueChange={(value: 'percentage' | 'flat') => setValue('commission.type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select commission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="flat">Flat Rate</SelectItem>
            </SelectContent>
          </Select>
          {getErrorMessage(errors.commission?.type as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.type as FieldError)}</p>
          )}
        </div>

        <div>
          <Label>Commission Amount</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[amount]}
              onValueChange={handleSliderChange}
              max={commissionType === 'percentage' ? 100 : listingPrice}
              step={commissionType === 'percentage' ? 0.1 : 100}
              className="flex-1"
            />
            <Input
              type="number"
              {...register('commission.amount', { 
                valueAsNumber: true,
                min: 0,
                max: commissionType === 'percentage' ? 100 : listingPrice
              })}
              className="w-24"
            />
            <span>{commissionType === 'percentage' ? '%' : '$'}</span>
          </div>
          {getErrorMessage(errors.commission?.amount as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.amount as FieldError)}</p>
          )}
          {commissionType === 'percentage' && (
            <p className="text-sm text-gray-500 mt-1">
              Commission Amount: ${calculateCommissionAmount().toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <Label>Split Percentage</Label>
          <Input
            type="number"
            {...register('commission.split_percentage', { 
              valueAsNumber: true,
              min: 0,
              max: 100
            })}
            placeholder="50"
          />
          {getErrorMessage(errors.commission?.split_percentage as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.split_percentage as FieldError)}</p>
          )}
        </div>

        <div>
          <Label>Terms</Label>
          <Textarea
            {...register('commission.terms')}
            placeholder="Enter commission terms..."
          />
          {getErrorMessage(errors.commission?.terms as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.terms as FieldError)}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            checked={watch('commission.verification_required')}
            onCheckedChange={(checked) => setValue('commission.verification_required', checked)}
          />
          <Label>Require Verification</Label>
          {getErrorMessage(errors.commission?.verification_required as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.verification_required as FieldError)}</p>
          )}
        </div>

        <div>
          <Label>Visibility</Label>
          <Select 
            defaultValue={initialData?.visibility || 'private'}
            onValueChange={(value: 'private' | 'public' | 'verified_only') => setValue('commission.visibility', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="verified_only">Verified Only</SelectItem>
            </SelectContent>
          </Select>
          {getErrorMessage(errors.commission?.visibility as FieldError) && (
            <p className="text-sm text-red-500">{getErrorMessage(errors.commission?.visibility as FieldError)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 