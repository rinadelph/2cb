import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { logInfo, logError } from '../../../lib/supabaseClient';

interface ProfilePictureProps {
  profilePictureUrl: string | null;
  userId: string;
  onUpdate: (url: string | null) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ profilePictureUrl, userId, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newProfilePictureUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: newProfilePictureUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onUpdate(newProfilePictureUrl);
      logInfo('Profile picture updated successfully', { userId, newProfilePictureUrl });
    } catch (error) {
      logError('Error updating profile picture:', error);
      console.error('Error updating profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onUpdate(null);
      logInfo('Profile picture deleted successfully', { userId });
    } catch (error) {
      logError('Error deleting profile picture:', error);
      console.error('Error deleting profile picture:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {profilePictureUrl ? (
        <div className="relative">
          <img 
            src={profilePictureUrl} 
            alt="Profile Picture"
            style={{ width: '100%', height: 'auto', maxWidth: '300px' }} // Adjust maxWidth as needed
          />
          <button
            onClick={handleDelete}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2"
            aria-label="Delete profile picture"
          >
            X
          </button>
        </div>
      ) : (
        <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-4"
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
};

export default ProfilePicture;