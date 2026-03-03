import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useState } from 'react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

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
            <input 
              type="password"
              {...register('password', { required: true })}
              className="mt-1 block w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 border"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};