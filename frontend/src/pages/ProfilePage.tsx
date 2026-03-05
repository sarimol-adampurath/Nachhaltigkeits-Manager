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
      </main>
    </div>
  );
};
