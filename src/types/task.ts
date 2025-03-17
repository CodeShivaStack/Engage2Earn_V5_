export interface Task {
    id: string;
    creatorAddress: string;
    title: string;
    description: string;
    tokenReward: number;
    startDate: Date;
    endDate: Date;
    platform: 'twitter' | 'instagram' | 'tiktok';
    requiredActions: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    status: 'active' | 'completed' | 'expired';
    participants: string[];
  }
  
  export interface TaskEngagement {
    taskId: string;
    userAddress: string;
    platform: string;
    postUrl: string;
    metrics: {
      likes: number;
      shares: number;
      comments: number;
    };
    status: 'pending' | 'verified' | 'failed';
    rewardClaimed: boolean;
  }