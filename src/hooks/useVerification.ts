import { useState } from 'react';
import {
  verifyTwitterPost,
  verifyInstagramPost,
  verifyTikTokPost,
  updateVerificationStatus,
  VerificationResult
} from '../lib/social-verification';

export function useVerification() {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAccount = async (
    profileId: string,
    platform: string,
    username: string
  ): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      let result: VerificationResult;

      switch (platform) {
        case 'twitter':
          result = await verifyTwitterPost(username, '#engage2earn');
          break;
        case 'instagram':
          result = await verifyInstagramPost(username, '#engage2earn');
          break;
        case 'tiktok':
          result = await verifyTikTokPost(username, '#engage2earn');
          break;
        default:
          throw new Error('Unsupported platform');
      }

      if (result.success && result.postUrl) {
        await updateVerificationStatus(profileId, platform, result.postUrl);
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      return { success: false, message };
    } finally {
      setVerifying(false);
    }
  };

  return {
    verifyAccount,
    verifying,
    error,
  };
}