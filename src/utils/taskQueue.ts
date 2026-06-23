// Task management system
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  description?: string;
  assignedTo?: string;
  attachedIssues?: string[];
}

export class TaskQueue {
  private tasks: Task[] = [];

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks(): void {
    this.tasks = [
      {
        id: 'task_1',
        name: 'Google OAuth Login',
        status: 'completed',
        priority: 'high',
        createdAt: Date.now() - 86400000 * 5,
        completedAt: Date.now() - 86400000 * 4,
      },
      {
        id: 'task_2',
        name: 'Referral System',
        status: 'completed',
        priority: 'high',
        createdAt: Date.now() - 86400000 * 3,
        completedAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'task_3',
        name: 'Razorpay Integration',
        status: 'in-progress',
        priority: 'high',
        createdAt: Date.now() - 86400000 * 2,
        startedAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'task_4',
        name: 'Sri AI Core System',
        status: 'in-progress',
        priority: 'high',
        createdAt: Date.now(),
        startedAt: Date.now(),
      },
      {
        id: 'task_5',
        name: 'Voice Assistant Setup',
        status: 'pending',
        priority: 'medium',
        createdAt: Date.now(),
      },
      {
        id: 'task_6',
        name: 'Supabase Integration',
        status: 'pending',
        priority: 'medium',
        createdAt: Date.now(),
      },
    ];
  }

  addTask(name: string, priority: 'low' | 'medium' | 'high', description?: string): Task {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      status: 'pending',
      priority,
      createdAt: Date.now(),
      description,
    };
    
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(taskId: string, status: TaskStatus): Task | null {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = status;
    if (status === 'in-progress' && !task.startedAt) {
      task.startedAt = Date.now();
    } else if (status === 'completed' && !task.completedAt) {
      task.completedAt = Date.now();
    }

    return task;
  }

  getTasks(status?: TaskStatus): Task[] {
    if (!status) return this.tasks;
    return this.tasks.filter(t => t.status === status);
  }

  getTaskByName(name: string): Task | undefined {
    return this.tasks.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
  }

  getCompletionPercentage(): number {
    if (this.tasks.length === 0) return 0;
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / this.tasks.length) * 100);
  }

  getSummary(): { pending: number; inProgress: number; completed: number } {
    return {
      pending: this.tasks.filter(t => t.status === 'pending').length,
      inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
    };
  }

  getNextTask(): Task | null {
    const pending = this.tasks.find(t => t.status === 'pending');
    if (pending) return pending;
    
    return this.tasks.find(t => t.status === 'in-progress') || null;
  }
}
