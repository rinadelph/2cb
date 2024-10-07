import React from 'react';

const ProfilePicture: React.FC = () => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
        {/* TODO: Display current profile picture */}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="profile-picture-input"
        />
        <label
          htmlFor="profile-picture-input"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          Update Picture
        </label>
      </div>
    </div>
  );
};

export default ProfilePicture;