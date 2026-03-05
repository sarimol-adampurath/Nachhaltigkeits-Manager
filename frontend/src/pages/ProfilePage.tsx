import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('profile/');
        setFormData(response.data);
      } catch {
        setErrorMessage('Unable to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordData((previous) => ({ ...previous, [name]: value }));
    setPasswordSuccessMessage('');
    setPasswordErrorMessage('');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      const response = await apiClient.patch('profile/', payload);
      setFormData(response.data);
      setSuccessMessage('Profile updated successfully.');
    } catch {
      setErrorMessage('Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordErrorMessage('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordSuccessMessage('');
      setPasswordErrorMessage('');

      await apiClient.post('change-password/', passwordData);
      setPasswordSuccessMessage('Password updated successfully.');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (err: any) {
      setPasswordErrorMessage(err.response?.data?.detail || 'Unable to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 py-3 md:py-4 mb-6 md:mb-8">
        <div className="max-w-3xl mx-auto px-4 md:px-6 flex justify-between items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold text-emerald-600 tracking-tight">
            Eco<span className="text-slate-800">Track</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all text-sm md:text-base border border-slate-200"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-medium rounded-lg transition-all text-sm md:text-base border border-slate-200 hover:border-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-slate-200">
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-2">My Profile</h2>
          <p className="text-slate-500 mb-6">Update your account details below.</p>

          {loading ? (
            <p className="text-slate-500">Loading profile...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter email address"
                />
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-slate-200 mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-base md:text-xl font-bold text-slate-800 mb-1">Reset Password</h3>
              <p className="text-slate-500">Change your password from here.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordForm((previous) => !previous)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all text-sm border border-slate-200 inline-flex items-center gap-2"
            >
              {showPasswordForm ? 'Hide Reset Form' : 'Reset Password'}
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showPasswordForm ? 'rotate-180' : 'rotate-0'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showPasswordForm ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter current password"
                  required={showPasswordForm}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter new password"
                    required={showPasswordForm}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="new_password_confirm"
                    value={passwordData.new_password_confirm}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Confirm new password"
                    required={showPasswordForm}
                  />
                </div>
              </div>

              {passwordSuccessMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
                  {passwordSuccessMessage}
                </div>
              )}

              {passwordErrorMessage && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {passwordErrorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
