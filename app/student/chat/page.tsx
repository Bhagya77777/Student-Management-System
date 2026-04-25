"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  Send,
  Bot,
  User,
  BookOpen,
  Calendar,
  Award,
  Clock,
  HelpCircle,
  TrendingUp,
  FileText,
  Paperclip,
  X,
  CheckCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Volume2,
  ArrowRight,
  Rocket,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { studentSidebarItems } from "@/components/sidebar/studentSidebarItems";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
}

//implement student chatbot.

interface QuickAction {
  label: string;
  action: string;
  icon?: any;
}

// Student data interface - will be fetched from API
interface StudentData {
  gpa: number;
  attendance: number;
  leaveBalance: number;
  subjectSummaries: string[];
  upcomingExams: string[];
}

const faqs: Array<{ question: string; answer: string }> = [
  { question: "How is my GPA calculated?", answer: "Your GPA is calculated based on your marks in each subject, weighted by credit hours." },
  { question: "When is the exam schedule released?", answer: "Exam schedules are typically released 2-3 weeks before exams." },
  { question: "How do I apply for leave?", answer: "Go to the Leave section in your dashboard, click 'New Request'." },
  { question: "What's the minimum attendance requirement?", answer: "The minimum attendance requirement is 75% for all courses." },
];

// Dynamic responses based on actual user data
const getResponse = (message: string, studentData: StudentData): { content: string; quickActions?: QuickAction[] } => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes("gpa") || lowerMsg.includes("grade")) {
    return {
      content: `Your current GPA is ${studentData.gpa}/4.0. This is based on your performance across all subjects this semester. Would you like to see a detailed breakdown?`,
      quickActions: [
        { label: "View GPA Breakdown", action: "gpa_breakdown", icon: TrendingUp },
        { label: "How to improve GPA?", action: "improve_gpa", icon: HelpCircle },
      ],
    };
  }
  
  if (lowerMsg.includes("attendance")) {
    const subjectText = studentData.subjectSummaries.length > 0
      ? studentData.subjectSummaries.map((item) => `• ${item}`).join("\n")
      : "• No subject attendance records available yet";
    return {
      content: `Your current attendance is ${studentData.attendance}%. Here's the breakdown by subject:\n\n${subjectText}`,
    };
  }
  
  if (lowerMsg.includes("exam") || lowerMsg.includes("schedule")) {
    const examText = studentData.upcomingExams.length > 0
      ? studentData.upcomingExams.map((item) => `• ${item}`).join("\n")
      : "• Exam schedule is not available right now";
    return {
      content: `Here are your upcoming exams:\n\n${examText}\n\nWould you like me to set a reminder?`,
      quickActions: [
        { label: "Set Reminder", action: "set_reminder", icon: Clock },
      ],
    };
  }
  
  if (lowerMsg.includes("marks") || lowerMsg.includes("result")) {
    const marksText = studentData.subjectSummaries.length > 0
      ? studentData.subjectSummaries.map((item) => `• ${item}`).join("\n")
      : "• No marks available yet";
    return {
      content: `Here are your recent marks:\n\n${marksText}\n\nYour overall performance is excellent! Keep it up!`,
    };
  }
  
  if (lowerMsg.includes("leave") || lowerMsg.includes("balance")) {
    return {
      content: `You have ${studentData.leaveBalance} days of leave remaining for this semester. Would you like to submit a leave request?`,
      quickActions: [
        { label: "Submit Leave Request", action: "submit_leave", icon: FileText },
      ],
    };
  }
  
  return {
    content: "I'm here to help! You can ask me about your GPA, attendance, exam schedules, marks, leave balance, or how to contact your lecturer. What would you like to know?",
    quickActions: [
      { label: "My GPA", action: "gpa", icon: TrendingUp },
      { label: "Attendance", action: "attendance", icon: Calendar },
      { label: "Exam Schedule", action: "exams", icon: Clock },
      { label: "Recent Marks", action: "marks", icon: Award },
      { label: "Leave Balance", action: "leave", icon: FileText },
    ],
  };
};

// Introduction steps for new users
const introductionSteps = [
  {
    id: 1,
    title: "Welcome to UniBridge Assistant! 🎓",
    description: "I'm your AI-powered academic assistant. I can help you with:",
    features: [
      { icon: TrendingUp, text: "Check your GPA and academic performance" },
      { icon: Calendar, text: "View attendance and exam schedules" },
      { icon: Award, text: "Get your recent marks and grades" },
      { icon: FileText, text: "Submit leave requests" },
      { icon: MessageSquare, text: "Connect with your lecturers" },
    ],
    action: "get_started",
    buttonText: "Get Started"
  },
  {
    id: 2,
    title: "Quick Tips 💡",
    description: "Here are some tips to get the most out of me:",
    features: [
      { icon: MessageSquare, text: "Ask questions naturally, like 'What's my GPA?'" },
      { icon: Zap, text: "Use quick action buttons below my responses" },
      { icon: Lightbulb, text: "I can help with attendance, marks, exams, and more" },
      { icon: Target, text: "Get personalized study recommendations" },
    ],
    action: "try_example",
    buttonText: "Try an Example"
  },
  {
    id: 3,
    title: "Let's Get Started! 🚀",
    description: "Try asking me something like:",
    examples: [
      "What's my GPA?",
      "Show me my attendance",
      "When are my exams?",
      "How can I improve my grades?"
    ],
    action: "start_chat",
    buttonText: "Start Chatting"
  }
];

export default function StudentChatPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData>({ gpa: 0, attendance: 0, leaveBalance: 0, subjectSummaries: [], upcomingExams: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "👋 Hi! I'm UniBridge Assistant. I can help you with your academic queries. Ask me about your GPA, attendance, exam schedules, marks, or anything else!",
      timestamp: new Date(),
      quickActions: [
        { label: "Check GPA", action: "gpa", icon: TrendingUp },
        { label: "View Attendance", action: "attendance", icon: Calendar },
        { label: "Exam Schedule", action: "exams", icon: Clock },
        { label: "Recent Marks", action: "marks", icon: Award },
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch history and student data on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/chat", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            const formattedMessages: Message[] = data.messages.map((m: any, index: number) => ({
              id: `hist-${index}`,
              type: m.role,
              content: m.content,
              timestamp: new Date(), // We don't store individual timestamps yet, but could add them
            }));
            setMessages(prev => [...prev, ...formattedMessages]);
            setConversationId(data.conversationId);
            setShowIntroduction(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    const fetchStudentData = async () => {
      try {
        const [attendanceRes, marksRes, leaveRes] = await Promise.all([
          fetch("/api/attendance", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
        ]);

        const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { summary: { attendanceRate: 0 } };
        const marksData = marksRes.ok ? await marksRes.json() : { summary: { averageMarks: 0 } };
        const leaveData = leaveRes.ok ? await leaveRes.json() : { leaves: [] };
        const marksRecords = Array.isArray(marksData?.records) ? marksData.records : [];

        const subjectRows = marksRecords.slice(0, 5).map((record: { subject?: string; score?: number; maxScore?: number }) => {
          const subject = String(record.subject || "Subject");
          const maxScore = Number(record.maxScore || 100);
          const scorePct = maxScore > 0 ? Math.round((Number(record.score || 0) / maxScore) * 100) : 0;
          return `${subject}: ${scorePct}%`;
        });

        const upcomingExams = marksRecords
          .slice()
          .sort((a: { examDate?: string }, b: { examDate?: string }) => String(a.examDate || "").localeCompare(String(b.examDate || "")))
          .slice(0, 3)
          .map((record: { subject?: string; examDate?: string }) => {
            const subject = String(record.subject || "Subject");
            const examDate = String(record.examDate || "TBD");
            return `${subject}: ${examDate}`;
          });

        const averageMarks = Number(marksData?.summary?.averageMarks ?? 0);
        const gpa = Math.min(4, Number((averageMarks / 25).toFixed(2)));
        const leaveCount = Array.isArray(leaveData?.leaves) ? leaveData.leaves.length : 0;

        setStudentData({
          gpa,
          attendance: Number(attendanceData?.summary?.attendanceRate ?? 0),
          leaveBalance: Math.max(0, 10 - leaveCount),
          subjectSummaries: subjectRows,
          upcomingExams,
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchHistory();
    fetchStudentData();
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Hide introduction when user starts chatting
    if (showIntroduction) {
      setShowIntroduction(false);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          conversationId: conversationId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: String(data?.answer || "No answer returned."),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const fallback = getResponse(message, studentData);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: fallback.content,
          timestamp: new Date(),
          quickActions: fallback.quickActions,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch {
      const fallback = getResponse(message, studentData);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: fallback.content,
        timestamp: new Date(),
        quickActions: fallback.quickActions,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = "";
    switch (action) {
      case "gpa":
        message = "What's my GPA?";
        break;
      case "attendance":
        message = "Show me my attendance";
        break;
      case "exams":
        message = "When are my exams?";
        break;
      case "marks":
        message = "Show me my recent marks";
        break;
      case "leave":
        message = "What's my leave balance?";
        break;
      case "get_started":
        setCurrentStep(1);
        break;
      case "try_example":
        setCurrentStep(2);
        break;
      case "start_chat":
        setShowIntroduction(false);
        break;
      default:
        message = action;
    }
    if (message) sendMessage(message);
  };

  const handleIntroductionAction = (action: string, value?: string) => {
    if (action === "start_chat") {
      setShowIntroduction(false);
    } else if (value) {
      sendMessage(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const sidebarItems = studentSidebarItems;

  const currentIntro = introductionSteps[currentStep];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={sidebarItems} activeItem="chat" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Chat Assistant" />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden">
                    {/* Chat Header */}
                    <CardHeader className="border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">UniBridge Assistant</CardTitle>
                          <p className="text-xs text-gray-500">Online • Ready to help</p>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Introduction Overlay */}
                      <AnimatePresence>
                        {showIntroduction && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-4"
                          >
                            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                                  <Rocket className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900">{currentIntro.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{currentIntro.description}</p>
                                  
                                  <div className="mt-4 space-y-2">
                                    {currentIntro.features?.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <feature.icon className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-gray-700">{feature.text}</span>
                                      </div>
                                    ))}
                                    {currentIntro.examples?.map((example, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleIntroductionAction("example", example)}
                                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-blue-50 transition-colors border border-gray-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <MessageSquare className="h-3 w-3 text-blue-600" />
                                          <span className="text-sm text-gray-700">{example}</span>
                                          <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleQuickAction(currentIntro.action)}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 gap-2"
                                  >
                                    {currentIntro.buttonText}
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className={message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}>
                                {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`rounded-2xl px-4 py-2 ${
                                message.type === "user" 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-gray-100 text-gray-900"
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                                {message.type === "assistant" && (
                                  <div className="flex gap-1">
                                    <button className="p-0.5 hover:bg-gray-100 rounded">
                                      <ThumbsUp className="h-3 w-3 text-gray-400" />
                                    </button>
                                    <button className="p-0.5 hover:bg-gray-100 rounded">
                                      <ThumbsDown className="h-3 w-3 text-gray-400" />
                                    </button>
                                    <button className="p-0.5 hover:bg-gray-100 rounded">
                                      <Copy className="h-3 w-3 text-gray-400" />
                                    </button>
                                    <button className="p-0.5 hover:bg-gray-100 rounded">
                                      <Volume2 className="h-3 w-3 text-gray-400" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {message.quickActions && message.quickActions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {message.quickActions.map((action, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleQuickAction(action.action)}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                    >
                                      {action.icon && <action.icon className="h-3 w-3" />}
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-100">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                              <div className="flex gap-1">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="shrink-0">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your academics..."
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => sendMessage(inputMessage)}
                          disabled={!inputMessage.trim() || isTyping}
                          className="bg-blue-600 hover:bg-blue-700 shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-2">
                        AI-powered assistant • Get instant answers about your academics
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Right Sidebar - FAQ & Quick Actions */}
                <div className="flex flex-col gap-6">
                  {/* FAQ Section */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-semibold">Frequently Asked</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {faqs.map((faq, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(faq.question)}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <p className="text-sm text-gray-700 group-hover:text-blue-600">{faq.question}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => handleQuickAction("gpa")}
                      >
                        <TrendingUp className="h-4 w-4" />
                        Check My GPA
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => handleQuickAction("attendance")}
                      >
                        <Calendar className="h-4 w-4" />
                        View Attendance
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => handleQuickAction("marks")}
                      >
                        <Award className="h-4 w-4" />
                        Recent Marks
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => handleQuickAction("leave")}
                      >
                        <FileText className="h-4 w-4" />
                        Leave Balance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}