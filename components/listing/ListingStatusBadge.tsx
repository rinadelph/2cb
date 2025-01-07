'use client'

import { Badge } from "@/components/ui/badge";
import { ListingFormValues } from "@/schemas/listing";
import { BadgeProps } from "@/components/ui/badge";

interface ListingStatusBadgeProps {
  status: ListingFormValues['status'];
}

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const STATUS_VARIANTS: Record<ListingFormValues['status'], BadgeVariant> = {
  draft: 'secondary',
  pending: 'outline',
  active: 'default',
  inactive: 'secondary',
  expired: 'destructive',
  sold: 'outline'
};

const STATUS_LABELS: Record<ListingFormValues['status'], string> = {
  draft: 'Draft',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  sold: 'Sold'
};

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return (
    <Badge 
      variant={STATUS_VARIANTS[status]}
      className="capitalize"
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
} 