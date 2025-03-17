import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Target, Award, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tokenReward: z.number().min(1, 'Reward must be at least 1 token'),
  platform: z.enum(['twitter', 'instagram', 'tiktok']),
  startDate: z.string(),
  endDate: z.string(),
  requiredLikes: z.number().min(0),
  requiredShares: z.number().min(0),
  requiredComments: z.number().min(0),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const AssignPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      platform: 'twitter',
      requiredLikes: 0,
      requiredShares: 0,
      requiredComments: 0,
    },
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!publicKey) return;
    setLoading(true);

    try {
      // Get the profile ID for the creator
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', publicKey.toBase58())
        .single();

      if (profileError) throw profileError;

      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          creator_id: profile.id,
          title: data.title,
          description: data.description,
          token_reward: data.tokenReward,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          platform: data.platform,
          required_likes: data.requiredLikes,
          required_shares: data.requiredShares,
          required_comments: data.requiredComments,
          status: 'active'
        })
        .select()
        .single();

      if (taskError) throw taskError;

      showNotification('success', 'Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      showNotification('error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        <p className="text-gray-600">Please connect your wallet to create tasks</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Create New Task</h2>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p>{notification.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the task requirements"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  {...register('platform')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Reward
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('tokenReward', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter reward amount"
                />
                {errors.tokenReward && (
                  <p className="mt-1 text-sm text-red-600">{errors.tokenReward.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Likes
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('requiredLikes', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Shares
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('requiredShares', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Comments
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('requiredComments', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium
            hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};