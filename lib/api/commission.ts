import { CommissionStructure } from '@/types/commission';

export async function updateCommission(listingId: string, data: CommissionStructure): Promise<void> {
  const response = await fetch(`/api/listings/${listingId}/commission`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update commission');
  }
} 