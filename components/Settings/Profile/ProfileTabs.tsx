import React, { useState } from 'react';

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="border-b">
      <nav className="-mb-px flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;