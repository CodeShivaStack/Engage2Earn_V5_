import { create } from 'zustand';
import { Task, TaskEngagement } from '../types/task';

interface TaskStore {
  tasks: Task[];
  engagements: TaskEngagement[];
  addTask: (task: Task) => void;
  addEngagement: (engagement: TaskEngagement) => void;
  updateEngagement: (taskId: string, userAddress: string, updates: Partial<TaskEngagement>) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getUserEngagements: (userAddress: string) => TaskEngagement[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  engagements: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addEngagement: (engagement) => 
    set((state) => ({ engagements: [...state.engagements, engagement] })),
  updateEngagement: (taskId, userAddress, updates) => 
    set((state) => ({
      engagements: state.engagements.map(eng => 
        eng.taskId === taskId && eng.userAddress === userAddress
          ? { ...eng, ...updates }
          : eng
      )
    })),
  getTaskById: (taskId) => get().tasks.find(task => task.id === taskId),
  getUserEngagements: (userAddress) => 
    get().engagements.filter(eng => eng.userAddress === userAddress),
}));