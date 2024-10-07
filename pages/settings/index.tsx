import { NextPage } from 'next';
import { Layout } from '../../components/Layout';
import SettingsLayout from '../../components/Settings/SettingsLayout';

const SettingsPage: NextPage = () => {
  return (
    <Layout>
      <SettingsLayout>
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Select a category from the sidebar to manage your settings.</p>
      </SettingsLayout>
    </Layout>
  );
};

export default SettingsPage;