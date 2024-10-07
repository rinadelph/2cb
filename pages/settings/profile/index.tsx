import { NextPage } from 'next';
import { Layout } from '../../../components/Layout';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import ProfileForm from '../../../components/Settings/Profile/ProfileForm';
import ProfilePicture from '../../../components/Settings/Profile/ProfilePicture';
import ProfileTabs from '../../../components/Settings/Profile/ProfileTabs';
import { useAuth } from '../../../hooks/useAuth';
import { logInfo, logError } from '../../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

// Update the ProfileData type to include email and bio
type ProfileData = {
  id: string;
  name: string;
  email: string;
  bio: string;
};

const ProfileSettingsPage: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      logInfo('Fetching profile data', { user: user?.id });
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, email, bio') // Add email and bio here
            .eq('id', user.id)
            .single();

          if (error) {
            logError('Error fetching profile data:', error);
            setError('Failed to fetch profile data. Please try again.');
            throw error;
          }
          logInfo('Profile data fetched successfully', { data });
          setProfileData(data);
        } catch (error) {
          logError('Error in fetchProfileData:', error);
          setError('An unexpected error occurred. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        logInfo('No user found, skipping profile fetch');
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfileData();
    }
  }, [user, authLoading]);

  logInfo('Rendering ProfileSettingsPage', { authLoading, userId: user?.id, profileData, isLoading, error });

  if (authLoading || isLoading) {
    return (
      <Layout>
        <SettingsLayout>
          <div>Loading...</div>
        </SettingsLayout>
      </Layout>
    );
  }

  if (!user) {
    logInfo('No user found on ProfileSettingsPage');
    return (
      <Layout>
        <SettingsLayout>
          <div>Please log in to view this page.</div>
        </SettingsLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <SettingsLayout>
        <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
        <ProfileTabs />
        <div className="mt-6">
          <ProfilePicture />
        </div>
        <div className="mt-6">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {profileData ? (
            <ProfileForm initialData={profileData} />
          ) : (
            <div>Error: Profile data not found. Please try refreshing the page.</div>
          )}
        </div>
        <div className="mt-6">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
          {showDebug && (
            <div className="mt-4 bg-gray-100 p-4 rounded">
              <h2 className="font-bold mb-2">Debug Info:</h2>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({ user: user.id, profileData, isLoading, error }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SettingsLayout>
    </Layout>
  );
};

export default ProfileSettingsPage;