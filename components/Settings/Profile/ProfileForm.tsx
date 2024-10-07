import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, logError, logInfo } from '../../../lib/supabaseClient';
import { useAuth } from '../../../hooks/useAuth';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    id: string;
    name: string;
    email: string;
    bio: string;
  };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  logInfo('ProfileForm rendered:', { user: !!user, initialData });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      bio: initialData.bio,
    },
  });

  const watchedFields = watch();

  useEffect(() => {
    logInfo('ProfileForm useEffect - initialData:', initialData);
    reset({
      name: initialData.name || '',
      email: initialData.email || '',
      bio: initialData.bio || '',
    });
  }, [initialData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      logInfo('Attempt to submit form without user');
      return;
    }

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .upsert({ id: initialData.id, ...data }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      logInfo('Profile updated successfully', updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      logError('Error updating profile', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="bio" className="block mb-1">Bio</label>
          <textarea
            id="bio"
            {...register('bio')}
            className="w-full p-2 border rounded"
            rows={4}
          ></textarea>
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Profile
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
        {showDebug && (
          <div className="mt-4 bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>User ID: {user?.id || 'Not logged in'}</p>
            <p>Initial Data: {JSON.stringify(initialData, null, 2)}</p>
            <p>Form Values: {JSON.stringify(watchedFields, null, 2)}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileForm;