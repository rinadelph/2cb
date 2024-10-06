import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema } from '../../../lib/validation/listingSchema';
import { getListing, updateListing } from '../../../lib/api/listings';
import { useAuth } from '../../../hooks/useAuth';
import { Input, Textarea, Select, Button, Checkbox } from '../../../components/ui';
import { ListingFormData } from '../../../types/listing';

// ... rest of the file remains the same ...