import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { useState } from 'react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const onSubmit = async (data: any) => {
    try {
      setServerError('');
      console.log('Attempting login with credentials...');
      // 1. Hit the Django SimpleJWT endpoint
      const response = await apiClient.post('token/', data);
      console.log('Login successful, tokens received:', response.data);
      
      // 2. Update AuthContext (which saves tokens to localStorage)
      login(response.data);
      console.log('AuthContext updated');
      
      // 3. Give state update time to propagate, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        navigate('/');
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setServerError(err.response?.data?.detail || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to track your carbon impact</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input 
              {...register('username', { required: true })}
              className="mt-1 block w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 border"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <input 
                type={showPassword ? "text" : "password"}
                {...register('password', { required: true })}
                className="block w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                Forgot password?
              </Link>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-bold hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};