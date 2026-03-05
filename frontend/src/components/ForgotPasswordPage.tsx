import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

interface ForgotPasswordFormValues {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setServerError('');
      setMessage('');
      setResetLink('');

      const response = await apiClient.post('forgot-password/', data);
      setMessage(response.data?.message || 'If that email exists, a reset link has been generated.');
      if (response.data?.reset_link) {
        setResetLink(response.data.reset_link);
      }
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Unable to process request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Forgot Password</h2>
          <p className="text-slate-500 mt-2">Enter your email to reset your password</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
            {serverError}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 text-center">
            {message}
          </div>
        )}

        {resetLink && (
          <div className="mb-4 p-3 bg-slate-50 text-slate-700 text-sm rounded-xl border border-slate-200 break-all">
            <p className="font-semibold mb-1">Development reset link:</p>
            <a href={resetLink} className="text-emerald-600 hover:text-emerald-700 underline">
              {resetLink}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
              })}
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
          >
            {isSubmitting ? 'Processing...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
