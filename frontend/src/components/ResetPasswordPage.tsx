import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';

interface ResetPasswordFormValues {
  new_password: string;
  new_password_confirm: string;
}

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<ResetPasswordFormValues>();

  const newPassword = watch('new_password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!uid || !token) {
      setServerError('Invalid reset link.');
      return;
    }

    try {
      setServerError('');
      await apiClient.post('reset-password/', {
        uid,
        token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      });

      navigate('/login', { state: { message: 'Password reset successful. Please sign in.' } });
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Reset link is invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-500 mt-2">Enter your new password</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              {...register('new_password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
            />
            {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              type="password"
              {...register('new_password_confirm', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match'
              })}
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
            />
            {errors.new_password_confirm && <p className="text-red-500 text-xs mt-1">{errors.new_password_confirm.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:bg-slate-300"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
