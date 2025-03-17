import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import {
  Twitter,
  Instagram,
  Video,
  Check,
  Loader2,
  AlertCircle,
  Edit3,
  Save,
} from "lucide-react";
import { VerificationModal } from "../components/VerificationModal";
import { useVerification } from "../hooks/useVerification";
// import toast from 'react-hot-toast';

const profileSchema = z.object({
  username: z.string().min(3).max(30),
  bio: z.string().max(160).optional(),
  twitter: z.string().min(1).optional(),
  instagram: z.string().min(1).optional(),
  tiktok: z.string().min(1).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  verified: boolean;
  verification_post_url: string | null;
}

export const ProfilePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);
  const [socialAccounts, setSocialAccounts] = React.useState<SocialAccount[]>(
    []
  );
  const [isEditing, setIsEditing] = useState(false);

  const [verificationPlatform, setVerificationPlatform] = React.useState<
    string | null
  >(null);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    verifyAccount,
    verifying,
    error: verificationError,
  } = useVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedSocials = {
    twitter: watch("twitter"),
    instagram: watch("instagram"),
    tiktok: watch("tiktok"),
  };

  React.useEffect(() => {
    if (publicKey) {
      loadProfile();
    }
  }, [publicKey]);

  const loadProfile = async () => {
    if (!publicKey) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", publicKey.toBase58())
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        const { data: accounts } = await supabase
          .from("social_accounts")
          .select("*")
          .eq("profile_id", profileData.id);
        setSocialAccounts(accounts || []);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showNotification("error", "Failed to load profile");
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!publicKey) return;
    setLoading(true);

    try {
      // First, check if the profile exists in the database
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", publicKey.toBase58())
        .single();

      if (profileError && profileError.code !== "PGRST100") {
        // Handle error when profile is not found
        throw profileError;
      }

      // If the profile exists, we will update it, otherwise, we will insert a new one
      const profileData = existingProfile
        ? await supabase
            .from("profiles")
            .update({
              username: data.username,
              bio: data.bio || null,
            })
            .eq("wallet_address", publicKey.toBase58())
            .select()
            .single()
        : await supabase
            .from("profiles")
            .insert({
              wallet_address: publicKey.toBase58(),
              username: data.username,
              bio: data.bio || null,
            })
            .select()
            .single();

      if (profileData.error) throw profileData.error;

      // Insert or update social accounts
      const platforms = ["twitter", "instagram", "tiktok"] as const;
      for (const platform of platforms) {
        if (data[platform]) {
          const existingSocial = socialAccounts.find(
            (account) => account.platform === platform
          );
          if (existingSocial) {
            // If the social account exists, update it
            await supabase
              .from("social_accounts")
              .update({
                username: data[platform],
                verified: false, // You can adjust this depending on your verification process
              })
              .eq("id", existingSocial.id);
          } else {
            // If the social account does not exist, insert a new record
            await supabase.from("social_accounts").insert({
              profile_id: profileData.data.id,
              platform,
              username: data[platform],
              verified: false,
            });
          }
        }
      }

      // Reload profile after the update
      await loadProfile();

      setIsEditing(false); // Switch to view mode after saving

      showNotification("success", "Profile updated successfully");
    } catch (error) {
      // console.error('Error updating profile:', error);
      // showNotification('error', 'Failed to update profile');

      // Handling upsert fallback if the first attempt fails
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .upsert({
            wallet_address: publicKey.toBase58(),
            username: data.username,
            bio: data.bio || null,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        const platforms = ["twitter", "instagram", "tiktok"] as const;
        for (const platform of platforms) {
          if (data[platform]) {
            await supabase.from("social_accounts").upsert({
              profile_id: profileData.id,
              platform,
              username: data[platform]!,
              verified: false,
            });
          }
        }

        await loadProfile();

        setIsEditing(false); // Switch to view mode after saving

        showNotification("success", "Profile updated successfully");
      } catch (error) {
        console.error("Error during upsert process:", error);
        showNotification("error", "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationPlatform || !profile?.id) return;

    const username =
      watchedSocials[verificationPlatform as keyof typeof watchedSocials];
    if (!username) return;

    const result = await verifyAccount(
      profile.id,
      verificationPlatform,
      username
    );

    if (result.success) {
      showNotification(
        "success",
        `${verificationPlatform} account verified successfully`
      );
      await loadProfile();
    } else {
      showNotification("error", result.message);
    }

    setVerificationPlatform(null);
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile Setup</h2>
        <p className="text-gray-600">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Profile Setup</h2>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          {isEditing ? "Edit Profile" : "View Profile"}
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700"
        >
          {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
        </button>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            notification.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                {...register("username")}
                defaultValue={profile?.username}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Choose a username"
                disabled={!isEditing} // Disable when not editing
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register("bio")}
                defaultValue={profile?.bio}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself"
                disabled={!isEditing} // Disable when not editing
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Accounts</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Twitter className="w-6 h-6 text-blue-400" />
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register("twitter")}
                      defaultValue={
                        socialAccounts.find((a) => a.platform === "twitter")
                          ?.username
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Twitter username"
                      disabled={!isEditing} // Disable when not editing
                    />
                  </div>
                  {socialAccounts.find((a) => a.platform === "twitter")
                    ?.verified ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVerificationPlatform("twitter")}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-blue-100  flex-shrink-0"
                    >
                      Verify
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Instagram className="w-6 h-6 text-pink-500" />
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register("instagram")}
                      defaultValue={
                        socialAccounts.find((a) => a.platform === "instagram")
                          ?.username
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Instagram username"
                      disabled={!isEditing} // Disable when not editing
                    />
                  </div>
                  {socialAccounts.find((a) => a.platform === "instagram")
                    ?.verified ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    watchedSocials.instagram && (
                      <button
                        type="button"
                        onClick={() => setVerificationPlatform("instagram")}
                        className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-pink-100"
                      >
                        Verify
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Video className="w-6 h-6 text-red-500" />
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register("tiktok")}
                      defaultValue={
                        socialAccounts.find((a) => a.platform === "tiktok")
                          ?.username
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="TikTok username"
                      disabled={!isEditing} // Disable when not editing
                    />
                  </div>
                  {socialAccounts.find((a) => a.platform === "tiktok")
                    ?.verified ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVerificationPlatform("tiktok")}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium
              hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Saving..." : "Save Profile"}
          </button>
        )}
        {/* <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium
            hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? 'Saving...' : 'Save Profile'}
        </button> */}
      </form>

      {verificationPlatform && (
        <VerificationModal
          platform={verificationPlatform}
          username={
            watchedSocials[
              verificationPlatform as keyof typeof watchedSocials
            ] || ""
          }
          onClose={() => setVerificationPlatform(null)}
          onVerify={handleVerification}
        />
      )}
    </div>
  );
};