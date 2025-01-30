"use client"

import * as React from "react"
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues, CommissionTypeValue } from '@/schemas/listing';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineLockClosed,
  HiOutlineEye,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';

interface CommissionStepProps {
  form: UseFormReturn<ListingFormValues>;
  onNext: () => void;
}

export function CommissionStep({ form, onNext }: CommissionStepProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const commissionType = watch('commission_type') as CommissionTypeValue;
  const commissionVisibility = watch('commission_visibility');

  const handleCommissionTypeChange = (value: CommissionTypeValue) => {
    setValue('commission_type', value, { shouldValidate: true });
    // Reset amount when type changes
    setValue('commission_amount', undefined, { shouldValidate: true });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setValue('commission_amount', value, { shouldValidate: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Commission Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Set your commission structure and visibility preferences
          </p>
        </div>

        {/* Commission Type */}
        <Card className="border border-muted/30">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HiOutlineCash className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">Commission Structure</Label>
            </div>
            
            <RadioGroup
              defaultValue={commissionType}
              onValueChange={(value) => handleCommissionTypeChange(value as CommissionTypeValue)}
              className="grid gap-3"
            >
              <Label
                htmlFor="percentage"
                className="flex items-center space-x-3 space-y-0 rounded-lg border border-muted/30 p-4 
                         hover:bg-muted/5 cursor-pointer transition-colors"
              >
                <RadioGroupItem value="percentage" id="percentage" />
                <div className="space-y-1">
                  <span className="font-medium">Percentage Based</span>
                  <p className="text-sm text-muted-foreground">
                    Commission as a percentage of the sale price
                  </p>
                </div>
              </Label>
              
              <Label
                htmlFor="fixed"
                className="flex items-center space-x-3 space-y-0 rounded-lg border border-muted/30 p-4 
                         hover:bg-muted/5 cursor-pointer transition-colors"
              >
                <RadioGroupItem value="fixed" id="fixed" />
                <div className="space-y-1">
                  <span className="font-medium">Fixed Amount</span>
                  <p className="text-sm text-muted-foreground">
                    Set a fixed commission amount
                  </p>
                </div>
              </Label>
            </RadioGroup>

            <div className="pt-2">
              <Label htmlFor="commission_amount">Commission Amount</Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  {commissionType === 'percentage' ? '%' : '$'}
                </div>
                <Input
                  type="number"
                  id="commission_amount"
                  onChange={handleAmountChange}
                  value={watch('commission_amount') || ''}
                  className={cn(
                    "pl-8 bg-background/50 border-muted/30 focus:border-primary/50",
                    errors.commission_amount && "border-destructive"
                  )}
                  placeholder={commissionType === 'percentage' ? '2.5' : '5000'}
                  step={commissionType === 'percentage' ? '0.1' : '100'}
                  min={0}
                  max={commissionType === 'percentage' ? 100 : undefined}
                />
              </div>
              {errors.commission_amount && (
                <p className="text-sm text-destructive mt-1">
                  {errors.commission_amount.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Commission Terms */}
        <Card className="border border-muted/30">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">Commission Terms</Label>
            </div>
            
            <Textarea
              {...register('commission_terms')}
              placeholder="Enter any specific terms or conditions for the commission..."
              className="min-h-[100px] resize-none bg-background/50 border-muted/30 focus:border-primary/50"
            />
          </div>
        </Card>

        {/* Visibility Settings */}
        <Card className="border border-muted/30">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HiOutlineEye className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">Visibility Settings</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Commission Details</Label>
                <p className="text-sm text-muted-foreground">
                  Make commission information visible to other agents
                </p>
              </div>
              <Switch
                checked={commissionVisibility === 'public'}
                onCheckedChange={(checked) => 
                  setValue('commission_visibility', checked ? 'public' : 'private')
                }
              />
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={onNext}
            className="border-muted/30 hover:bg-muted/5"
          >
            Skip
          </Button>
          <Button onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 