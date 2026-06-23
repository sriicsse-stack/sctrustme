// Conversation memory system
export interface ConversationMessage {
  id: string;
  role: 'user' | 'sri';
  content: string;
  language: string;
  timestamp: number;
  taskMentioned?: string;
}

export interface ProjectContext {
  currentProject: string;
  currentTask: string;
  openIssues: string[];
  recentErrors: string[];
  googleAuthStatus: 'connected' | 'pending' | 'failed';
  supabaseStatus: 'connected' | 'pending' | 'failed';
  razorpayStatus: 'connected' | 'pending' | 'failed';
}

export class ConversationMemory {
  private messages: ConversationMessage[] = [];
  private context: ProjectContext = {
    currentProject: 'Trust Me AI Builder',
    currentTask: 'Building Sri AI Core System',
    openIssues: [],
    recentErrors: [],
    googleAuthStatus: 'connected',
    supabaseStatus: 'connected',
    razorpayStatus: 'pending',
  };

  constructor() {
    this.loadFromStorage();
  }

  addMessage(role: 'user' | 'sri', content: string, language: string, taskMentioned?: string): ConversationMessage {
    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      language,
      timestamp: Date.now(),
      taskMentioned,
    };
    
    this.messages.push(message);
    this.saveToStorage();
    return message;
  }

  getMessages(limit?: number): ConversationMessage[] {
    if (!limit) return this.messages;
    return this.messages.slice(-limit);
  }

  getContext(): ProjectContext {
    return this.context;
  }

  updateContext(updates: Partial<ProjectContext>): void {
    this.context = { ...this.context, ...updates };
    this.saveToStorage();
  }

  getRecentContext(messageCount: number = 5): ConversationMessage[] {
    return this.messages.slice(-messageCount);
  }

  clear(): void {
    this.messages = [];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sri_ai_memory', JSON.stringify({
          messages: this.messages,
          context: this.context,
        }));
      } catch (error) {
        console.warn('Failed to save conversation memory:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sri_ai_memory');
        if (stored) {
          const data = JSON.parse(stored);
          this.messages = data.messages || [];
          this.context = data.context || this.context;
        }
      } catch (error) {
        console.warn('Failed to load conversation memory:', error);
      }
    }
  }

  getSummary(): string {
    return `Project: ${this.context.currentProject} | Task: ${this.context.currentTask} | Messages: ${this.messages.length}`;
  }
}

export function extractProjectReferences(text: string): string[] {
  const keywords = ['Google Login', 'Referral', 'Razorpay', 'Supabase', 'OAuth', 'payment', 'voice'];
  return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
}
