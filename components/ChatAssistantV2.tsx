'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, X, MessageCircle, ArrowRight } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  visualization?: 'trend' | 'pie' | 'bar';
  data?: any[];
}

const performanceData = [
  { week: 'W1', score: 75 },
  { week: 'W2', score: 80 },
  { week: 'W3', score: 78 },
  { week: 'W4', score: 85 },
  { week: 'W5', score: 88 },
];

const attendanceData = [
  { name: 'Present', value: 94 },
  { name: 'Absent', value: 6 },
];

const COLORS = ['#0052CC', '#D32F2F'];

const quickActions = [
  'How to calculate GPA?',
  'My attendance details',
  'Recent marks',
  'Contact lecturer',
];

export function ChatAssistantV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm UniBridge Assistant. I can help you with your academic information, attendance, marks, and more.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || 'Chat request failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: json.answer || 'No answer returned.',
      };

      const lower = input.toLowerCase();
      if (lower.includes('attendance')) {
        assistantMessage.visualization = 'pie';
        assistantMessage.data = attendanceData;
      } else if (lower.includes('marks') || lower.includes('performance')) {
        assistantMessage.visualization = 'trend';
        assistantMessage.data = performanceData;
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            error instanceof Error
              ? `I could not reach the AI service: ${error.message}`
              : 'I could not reach the AI service right now.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
// implement ChatAssistantV2 with data.
  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-40"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-150 z-40">
          {/* Header */}
          <div className="bg-primary text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold">UniBridge Assistant</h3>
              <p className="text-sm text-blue-100">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-xs">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none px-4 py-2 max-w-xs">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                )}

                {/* Visualization */}
                {message.visualization && message.data && (
                  <div className="flex justify-start">
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                      {message.visualization === 'trend' && (
                        <ResponsiveContainer width={280} height={200}>
                          <LineChart data={message.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="week" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                            <Line type="monotone" dataKey="score" stroke="#0052CC" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      {message.visualization === 'pie' && (
                        <ResponsiveContainer width={280} height={200}>
                          <PieChart>
                            <Pie
                              data={message.data}
                              cx={140}
                              cy={100}
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-100 space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition flex items-center gap-2 text-gray-700"
                >
                  <ArrowRight className="h-3 w-3 text-primary" />
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 text-white px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <button className="w-full text-xs text-primary hover:text-primary/80 font-semibold">
              Talk to Support
            </button>
          </div>
        </div>
      )}
    </>
  );
}
//add version 2 with data visualization and quick actions.