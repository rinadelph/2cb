import { NextPage } from 'next';
import { Layout } from '../../components/Layout';
import SettingsLayout from '../../components/Settings/SettingsLayout';

const SettingsPage: NextPage = () => {
  return (
    <Layout>
      <SettingsLayout>
        <h1 className="text-2xl font-bold mb-4">Settings Overview</h1>
        <p>Welcome to your settings. Use the sidebar to navigate to specific settings pages.</p>
      </SettingsLayout>
    </Layout>
  );
};

export default SettingsPage;