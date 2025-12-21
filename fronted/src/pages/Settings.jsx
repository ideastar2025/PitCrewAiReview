import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Code,
  Mail,
  Save,
  CheckCircle2,
  Github,
  GitBranch,
  AlertTriangle
} from 'lucide-react';
// import { InlineLoader } from '../components/LoadingSpinner';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Code },
    { id: 'preferences', name: 'Preferences', icon: Palette },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSaving(false);
    setSaved(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'integrations' && <IntegrationSettings />}
            {activeTab === 'preferences' && <PreferenceSettings />}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              {saved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings saved successfully!</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <InlineLoader size="sm" className="text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings
const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    role: 'Senior Developer'
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Information</h2>
        <p className="text-sm text-gray-600">Update your personal information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Full Name"
          value={profile.name}
          onChange={(value) => setProfile({ ...profile, name: value })}
        />
        <FormField
          label="Email"
          type="email"
          value={profile.email}
          onChange={(value) => setProfile({ ...profile, email: value })}
        />
        <FormField
          label="Company"
          value={profile.company}
          onChange={(value) => setProfile({ ...profile, company: value })}
        />
        <FormField
          label="Role"
          value={profile.role}
          onChange={(value) => setProfile({ ...profile, role: value })}
        />
      </div>

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            Change Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Settings
const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    prCreated: true,
    prMerged: true,
    highRisk: true,
    weeklyReport: false,
    emailDigest: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
        <p className="text-sm text-gray-600">Manage how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <ToggleField
          label="PR Created"
          description="Get notified when a new PR is created"
          checked={notifications.prCreated}
          onChange={(checked) => setNotifications({ ...notifications, prCreated: checked })}
        />
        <ToggleField
          label="PR Merged"
          description="Get notified when a PR is merged"
          checked={notifications.prMerged}
          onChange={(checked) => setNotifications({ ...notifications, prMerged: checked })}
        />
        <ToggleField
          label="High Risk Detection"
          description="Immediate alerts for high-risk PRs"
          checked={notifications.highRisk}
          onChange={(checked) => setNotifications({ ...notifications, highRisk: checked })}
        />
        <ToggleField
          label="Weekly Report"
          description="Receive weekly analytics summary"
          checked={notifications.weeklyReport}
          onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
        />
        <ToggleField
          label="Email Digest"
          description="Daily email digest of activities"
          checked={notifications.emailDigest}
          onChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
        />
      </div>
    </div>
  );
};

// Security Settings
const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>
        <p className="text-sm text-gray-600">Manage your security settings</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white">
              Change Password
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Not enabled</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              Enable 2FA
            </button>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Active Sessions</p>
              <p className="text-sm text-yellow-700 mt-1">You have 2 active sessions</p>
              <button className="mt-3 text-sm text-yellow-900 hover:text-yellow-800 font-medium underline">
                View and manage sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Settings
const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState({
    github: true,
    bitbucket: false,
    slack: false,
    jira: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Integrations</h2>
        <p className="text-sm text-gray-600">Connect with external services</p>
      </div>

      <div className="space-y-4">
        <IntegrationCard
          icon={Github}
          name="GitHub"
          description="Connect your GitHub account"
          connected={integrations.github}
          onToggle={() => setIntegrations({ ...integrations, github: !integrations.github })}
        />
        <IntegrationCard
          icon={GitBranch}
          name="Bitbucket"
          description="Connect your Bitbucket account"
          connected={integrations.bitbucket}
          onToggle={() => setIntegrations({ ...integrations, bitbucket: !integrations.bitbucket })}
        />
        <IntegrationCard
          icon={Mail}
          name="Slack"
          description="Receive notifications in Slack"
          connected={integrations.slack}
          onToggle={() => setIntegrations({ ...integrations, slack: !integrations.slack })}
        />
        <IntegrationCard
          icon={Code}
          name="Jira"
          description="Sync with Jira issues"
          connected={integrations.jira}
          onToggle={() => setIntegrations({ ...integrations, jira: !integrations.jira })}
        />
      </div>
    </div>
  );
};

// Preference Settings
const PreferenceSettings = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Preferences</h2>
        <p className="text-sm text-gray-600">Customize your experience</p>
      </div>

      <div className="space-y-6">
        <SelectField
          label="Theme"
          value={preferences.theme}
          onChange={(value) => setPreferences({ ...preferences, theme: value })}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ]}
        />
        <SelectField
          label="Language"
          value={preferences.language}
          onChange={(value) => setPreferences({ ...preferences, language: value })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' }
          ]}
        />
        <SelectField
          label="Timezone"
          value={preferences.timezone}
          onChange={(value) => setPreferences({ ...preferences, timezone: value })}
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'EST', label: 'Eastern Time' },
            { value: 'PST', label: 'Pacific Time' }
          ]}
        />
      </div>
    </div>
  );
};

// Reusable Components
const FormField = ({ label, type = 'text', value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const ToggleField = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'transform translate-x-6' : ''
        }`}
      />
    </button>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const IntegrationCard = ({ icon: Icon, name, description, connected, onToggle }) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`px-4 py-2 font-medium rounded-lg ${
          connected
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  </div>
);

export default Settings;