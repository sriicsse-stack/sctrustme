import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, MessageSquare, CheckCircle2, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { ConversationMemory, ConversationMessage } from "../utils/conversationMemory";
import { TaskQueue } from "../utils/taskQueue";
import { detectLanguage, getLanguageName } from "../utils/languageDetection";
import { generateThinkingMessage, getSriGreeting } from "../utils/sriAIEngine";

interface SriAICoreProps {
  googleAuthStatus?: 'connected' | 'pending' | 'failed';
  supabaseStatus?: 'connected' | 'pending' | 'failed';
  razorpayStatus?: 'connected' | 'pending' | 'failed';
}

export default function SriAICore({ 
  googleAuthStatus = 'connected',
  supabaseStatus = 'connected',
  razorpayStatus = 'pending'
}: SriAICoreProps) {
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn'>('en');
  const [showTaskQueue, setShowTaskQueue] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const memoryRef = useRef<ConversationMemory | null>(null);
  const taskQueueRef = useRef<TaskQueue | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize memory and task queue
  useEffect(() => {
    if (!memoryRef.current) memoryRef.current = new ConversationMemory();
    if (!taskQueueRef.current) taskQueueRef.current = new TaskQueue();

    const storedMessages = memoryRef.current.getMessages();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    } else {
      const greeting = getSriGreeting();
      const greetingMsg = memoryRef.current.addMessage('sri', greeting, 'en');
      setMessages([greetingMsg]);
    }

    memoryRef.current.updateContext({
      googleAuthStatus,
      supabaseStatus,
      razorpayStatus,
    });
  }, [googleAuthStatus, supabaseStatus, razorpayStatus]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognitionRef.current.onend = () => {
          if (recognitionRef.current?.shouldContinue) {
            recognitionRef.current.start();
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setErrorMessage(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onresult = async (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            interimTranscript += result[0].transcript;
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            }
          }
          if (interimTranscript) {
            setInputValue(interimTranscript);
          }
          if (finalTranscript) {
            setInputValue(finalTranscript);
            await handleSendMessage(finalTranscript);
          }
        };
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string, language: 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : language === 'ml' ? 'ml-IN' : language === 'kn' ? 'kn-IN' : 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    if (!memoryRef.current || !taskQueueRef.current) return;

    setErrorMessage(null);
    const lang = detectLanguage(text);
    setCurrentLanguage(lang);

    const userMsg = memoryRef.current.addMessage('user', text, lang);
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      const history = memoryRef.current.getMessages(20).map(msg => ({ role: msg.role, text: msg.content }));
      const response = await fetch('/api/sri-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          projectId: memoryRef.current.getContext().currentProject || undefined,
          history,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `AI provider error: ${response.statusText}`);
      }
      if (data.error) {
        throw new Error(data.error);
      }

      const reply = typeof data.reply === 'string' ? data.reply : '';
      const replyLang = detectLanguage(reply || text);
      const sriMsg = memoryRef.current.addMessage('sri', reply, replyLang);
      setMessages(prev => [...prev, sriMsg]);

      if (mode === 'voice' && reply) {
        speakText(reply, replyLang);
      }
    } catch (error: any) {
      const message = error?.message || 'Unknown AI provider error.';
      setErrorMessage(message);
      const errorMsg = memoryRef.current.addMessage('sri', `Error: ${message}`, 'en');
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleVoiceSend = () => {
    if (inputValue.trim()) {
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    if (memoryRef.current) {
      memoryRef.current.clear();
      const greeting = getSriGreeting();
      const greetingMsg = memoryRef.current.addMessage('sri', greeting, 'en');
      setMessages([greetingMsg]);
    }
  };

  const taskQueue = taskQueueRef.current;
  const summary = taskQueue ? taskQueue.getSummary() : { pending: 0, inProgress: 0, completed: 0 };
  const completion = taskQueue ? taskQueue.getCompletionPercentage() : 0;

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Sri AI Core System</h1>
            <p className="text-sm text-slate-400 mt-1">Your Human-Like AI Teammate & Co-Developer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Indicator */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
            {getLanguageName(currentLanguage)}
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 rounded-3xl border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                mode === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                mode === 'voice'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎤 Voice
            </button>
          </div>

          {/* Task Queue Toggle */}
          <button
            onClick={() => setShowTaskQueue(!showTaskQueue)}
            className="rounded-3xl border border-slate-800 bg-slate-950 hover:bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors"
          >
            📋 Tasks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main Chat Area */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl flex flex-col h-[600px]">
          {/* Status Bar */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${googleAuthStatus === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-slate-400">Google Auth: {googleAuthStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-slate-400">Supabase: {supabaseStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${razorpayStatus === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-slate-400">Razorpay: {razorpayStatus}</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-3">
            {errorMessage && (
              <div className="rounded-3xl border border-rose-500 bg-rose-950/80 px-4 py-3 text-sm text-rose-200">
                <strong className="font-semibold">AI provider error:</strong> {errorMessage}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-3xl text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span>{generateThinkingMessage()}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800/50 pt-4">
            {mode === 'chat' ? (
              // Chat Input
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything... (English, Tamil, Hindi, etc.)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isThinking}
                  className="rounded-3xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-4 py-3 text-white font-semibold transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : (
              // Voice Input
              <div className="flex gap-3 flex-col">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Listening... or type to override"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
                  />
                  <button
                    onClick={toggleVoiceRecognition}
                    className={`rounded-3xl px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-5 w-5 animate-pulse" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        Listen
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleVoiceSend}
                  disabled={!inputValue.trim() || isThinking}
                  className="rounded-3xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 px-4 py-3 text-white font-semibold transition-colors w-full"
                >
                  Send Voice Message
                </button>
              </div>
            )}

            <button
              onClick={clearConversation}
              className="mt-3 text-[11px] text-slate-400 hover:text-slate-300 font-semibold uppercase tracking-wider"
            >
              Clear Conversation
            </button>
          </div>
        </div>

        {/* Right Sidebar - Task Queue & Status */}
        {showTaskQueue && (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl flex flex-col gap-4 h-[600px]">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Project Progress</h2>
              <div className="bg-slate-900 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">Completion</span>
                  <span className="text-lg font-bold text-emerald-400">{completion}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <h3 className="text-sm font-bold text-white">Task Queue</h3>
              
              {/* Completed Tasks */}
              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">✓ Completed ({summary.completed})</span>
                {taskQueue?.getTasks('completed').map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="line-through">{task.name}</span>
                  </div>
                ))}
              </div>

              {/* In Progress Tasks */}
              <div className="space-y-2">
                <span className="text-[10px] text-blue-400 font-semibold uppercase">⏳ In Progress ({summary.inProgress})</span>
                {taskQueue?.getTasks('in-progress').map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-[11px] text-slate-200 font-semibold">
                    <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 animate-spin" />
                    <span>{task.name}</span>
                  </div>
                ))}
              </div>

              {/* Pending Tasks */}
              <div className="space-y-2">
                <span className="text-[10px] text-yellow-400 font-semibold uppercase">⏸ Pending ({summary.pending})</span>
                {taskQueue?.getTasks('pending').map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-[11px] text-slate-400">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{task.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Summary */}
            <div className="border-t border-slate-800/50 pt-3 text-[10px] text-slate-400 space-y-1">
              <p><strong>Project:</strong> {memoryRef.current?.getContext().currentProject}</p>
              <p><strong>Current Task:</strong> {memoryRef.current?.getContext().currentTask}</p>
              <p><strong>Messages:</strong> {messages.length}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
