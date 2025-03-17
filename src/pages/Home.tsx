import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTaskStore } from '../store/useTaskStore';
import { Wallet, Award, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa'; 
import { SiTiktok } from 'react-icons/si'; 

interface Profile {
  id: string;
  username: string;
  bio: string;
  wallet_address: string;
  token_balance: number;
  reputation: number;
}

interface SocialAccount {
  platform: string;
  username: string;
  verified: boolean;
}

// Mapping platforms to their icons
const platformIcons = {
  twitter: <FaTwitter className="w-6 h-6 text-blue-500" />,
  facebook: <FaFacebook className="w-6 h-6 text-blue-600" />,
  instagram: <FaInstagram className="w-6 h-6 text-gradient-to-r from-pink-500 via-yellow-500 to-teal-400" />,
  github: <FaGithub className="w-6 h-6 text-gray-700" />,
  linkedin: <FaLinkedin className="w-6 h-6 text-blue-700" />,
  tiktok: <SiTiktok className="w-6 h-6 text-black" />  // Adding TikTok icon here
};

export const HomePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const userEngagements = useTaskStore((state) =>
    state.getUserEngagements(publicKey?.toBase58() || '')
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;

      const walletAddress = publicKey.toBase58();

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);

        // Fetch social accounts
        const { data: socialData, error: socialError } = await supabase
          .from('social_accounts')
          .select('platform, username, verified')
          .eq('profile_id', profileData.id);

        if (socialError) {
          console.error('Error fetching social accounts:', socialError);
        } else {
          setSocialAccounts(socialData || []);
        }
      }
    };

    fetchUserData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Welcome to Engage2Earn</h2>
        <p className="text-gray-600">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Wallet className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.username || 'Loading...'}</h2>
            <p className="text-gray-600">{publicKey.toBase58()}</p>
            {profile?.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Token Balance</span>
            </div>
            <p className="text-2xl font-bold">{profile?.token_balance || 0} ENGAGE</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Reputation</span>
            </div>
            <p className="text-2xl font-bold">{profile?.reputation || 0}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Connected Social Accounts</h3>
          <div className="flex space-x-4">
            {socialAccounts.length > 0 ? (
              socialAccounts.map((account) => (
                <div key={account.platform} className="flex items-center gap-2">
                  {platformIcons[account.platform.toLowerCase()] || (
                    <span className="w-6 h-6 text-gray-500">?</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No social accounts connected</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Engagements</h3>
        {userEngagements.length > 0 ? (
          <div className="space-y-4">
            {userEngagements.map((engagement) => (
              <div key={engagement.taskId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{engagement.platform}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      engagement.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : engagement.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {engagement.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 break-all">{engagement.postUrl}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Metrics: {engagement.metrics.likes} likes, {engagement.metrics.shares} shares
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No engagements yet</p>
        )}
      </div>
    </div>
  );
};
