import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Clock, Target, Award, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";

interface Task {
  id: string;
  title: string;
  description: string;
  token_reward: number;
  platform: string;
  start_date: string;
  end_date: string;
  required_likes: number;
  required_shares: number;
  required_comments: number;
  status: string;
  creator: {
    username: string;
  };
}

interface TaskEngagement {
  id: string;
  task_id: string;
  post_url: string;
  status: string;
  likes_count: number;
  shares_count: number;
  comments_count: number;
}

export const ExplorePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [engagements, setEngagements] = useState<
    Record<string, TaskEngagement>
  >({});

  useEffect(() => {
    loadTasks();
  }, [selectedPlatform]);

  const loadTasks = async () => {
    try {
      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          creator:profiles(username)
        `
        )
        .eq("status", "active")
        .gt("end_date", new Date().toISOString());

      if (selectedPlatform !== "all") {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);

      if (publicKey) {
        // Load user's engagements for these tasks
        const { data: engagementData } = await supabase
          .from("task_engagements")
          .select("*")
          .in("task_id", data?.map((t) => t.id) || [])
          .eq("user_id", publicKey.toBase58());

        const engagementMap = (engagementData || []).reduce(
          (acc, eng) => ({
            ...acc,
            [eng.task_id]: eng,
          }),
          {}
        );

        setEngagements(engagementMap);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEngagement = async (taskId: string, platform: string) => {
    if (!publicKey) return;

    try {
      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("wallet_address", publicKey.toBase58())
        .single();

      if (profileError) throw profileError;

      // Create engagement record
      const { data: engagement, error: engagementError } = await supabase
        .from("task_engagements")
        .insert({
          task_id: taskId,
          user_id: profile.id,
          post_url: "",
          status: "pending",
        })
        .select()
        .single();

      if (engagementError) throw engagementError;

      // Update local state
      setEngagements((prev) => ({
        ...prev,
        [taskId]: engagement,
      }));
    } catch (error) {
      console.error("Error creating engagement:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Explore Tasks</h2>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Platforms</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>

      <div className="grid gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  Created by {task.creator.username}
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {task.platform}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{task.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ends</p>
                  <p className="font-medium">
                    {format(new Date(task.end_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Required</p>
                  <p className="font-medium">
                    {/* {task.required_likes > 0 && `${task.required_likes} likes`  || 'Not Mentioned'}
                    {task.required_shares > 0 && `, ${task.required_shares} shares`}
                    {task.required_comments > 0 && `, ${task.required_comments} comments`} */}

                    <p className="font-medium">
                      {task.required_likes > 0 ||
                      task.required_shares > 0 ||
                      task.required_comments > 0
                        ? `${
                            task.required_likes > 0
                              ? `${task.required_likes} likes`
                              : ""
                          }${
                            task.required_shares > 0
                              ? `, ${task.required_shares} shares`
                              : ""
                          }${
                            task.required_comments > 0
                              ? `, ${task.required_comments} comments`
                              : ""
                          }`
                        : "Not Mentioned"}
                    </p>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Reward</p>
                  <p className="font-medium">{task.token_reward} ENGAGE</p>
                </div>
              </div>
            </div>

            {engagements[task.id] ? (
              <div
                className={`p-4 rounded-lg ${
                  engagements[task.id].status === "verified"
                    ? "bg-green-50 text-green-800"
                    : "bg-yellow-50 text-yellow-800"
                }`}
              >
                <p className="font-medium">
                  {engagements[task.id].status === "verified"
                    ? "Task completed successfully!"
                    : "Task engagement pending verification..."}
                </p>
              </div>
            ) : (
              <button
                onClick={() => handleEngagement(task.id, task.platform)}
                disabled={!publicKey}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium
                  hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors"
              >
                {!publicKey ? "Connect Wallet to Engage" : "Engage with Task"}
              </button>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">
              No tasks available for the selected platform
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
