import { TwitterApi, TweetSearchRecentV2Paginator, TweetV2 } from 'twitter-api-v2';
import { supabase } from './supabase';

// Initialize API clients
const twitterClient = new TwitterApi({
  appKey: import.meta.env.VITE_TWITTER_API_KEY,
  appSecret: import.meta.env.VITE_TWITTER_API_SECRET,
  accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN,
  accessSecret: import.meta.env.VITE_TWITTER_ACCESS_SECRET,
});

export interface VerificationResult {
  success: boolean;
  message: string;
  postUrl?: string;
}


export async function verifyTwitterPost(username: string, hashtag: string): Promise<VerificationResult> {
  try {
    // Search for recent tweets from the user with the hashtag
    const response: TweetSearchRecentV2Paginator = await twitterClient.v2.search(`from:${username} ${hashtag}`);
    
    // Access the 'data' property, which contains the array of TweetV2 objects
    const tweets: TweetV2[] = response.data; // This is now an array of TweetV2 objects

    if (tweets && tweets.length > 0) {
      const latestTweet = tweets[0]; // Safely index into the array
      return {
        success: true,
        message: 'Twitter post verified successfully',
        postUrl: `https://twitter.com/${username}/status/${latestTweet.id}`,
      };
    }

    return {
      success: false,
      message: 'No matching tweet found. Please make sure you posted with the correct hashtag.',
    };
  } catch (error) {
    console.error('Twitter verification error:', error);
    return {
      success: false,
      message: 'Failed to verify Twitter post. Please try again.',
    };
  }
}


export async function verifyInstagramPost(username: string, hashtag: string): Promise<VerificationResult> {
  // Simulate Instagram API verification
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Instagram post verified successfully',
      postUrl: `https://instagram.com/p/123456789`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify Instagram post',
    };
  }
}

export async function verifyTikTokPost(username: string, hashtag: string): Promise<VerificationResult> {
  // Simulate TikTok API verification
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'TikTok post verified successfully',
      postUrl: `https://tiktok.com/@${username}/video/123456789`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify TikTok post',
    };
  }
}

export async function updateVerificationStatus(
  profileId: string,
  platform: string,
  postUrl: string
): Promise<void> {
  await supabase
    .from('social_accounts')
    .update({
      verified: true,
      verification_post_url: postUrl,
    })
    .eq('profile_id', profileId)
    .eq('platform', platform);
}