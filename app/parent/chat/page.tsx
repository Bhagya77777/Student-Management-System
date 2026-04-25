"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parentSidebarItems } from "@/components/sidebar/parentSidebarItems";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare,
  Send,
  Bot,
  User,
  Heart,
  Calendar,
  Award,
  Clock,
  HelpCircle,
  TrendingUp,
  FileText,
  Paperclip,
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
  DollarSign,
  GraduationCap,
  Users,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  icon?: any;
}

// Child data interface - will be fetched from API
interface ChildData {
  name: string;
  gpa: number;
  attendance: number;
  subjectSummaries: string[];
  feeStatus: {
    total: number;
    paid: number;
    due: number;
  };
  pendingLeaves: number;
}

const faqs: Array<{ question: string; answer: string }> = [
  { question: "How is my child's academic progress?", answer: "You can view your child's GPA, attendance, and marks in the dashboard." },
  { question: "How do I approve leave requests?", answer: "Go to the Leave section in your dashboard. You'll see pending requests." },
  { question: "What's the fee payment status?", answer: "Use the payments page to view paid and pending balances." },
  { question: "How can I contact the lecturer?", answer: "You can message the lecturer through this chat. Type 'Contact Lecturer'." },
];

// Dynamic responses based on actual child data
const getResponse = (message: string, childData: ChildData): { content: string; quickActions?: QuickAction[] } => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes("gpa") || lowerMsg.includes("grade") || lowerMsg.includes("academic")) {
    return {
      content: `Your child's current GPA is ${childData.gpa}/4.0. Their performance has been consistently improving. Would you like to see a detailed breakdown of subject-wise grades?`,
      quickActions: [
        { label: "View Subject Grades", action: "subject_grades", icon: Award },
        { label: "How to improve?", action: "improve_academic", icon: HelpCircle },
      ],
    };
  }
  
  if (lowerMsg.includes("attendance")) {
    const subjectText = childData.subjectSummaries.length > 0
      ? childData.subjectSummaries.map((item) => `• ${item}`).join("\n")
      : "• No subject-wise attendance records are available yet";
    return {
      content: `Your child's current attendance is ${childData.attendance}%. Here's the breakdown:\n\n${subjectText}`,
    };
  }

  if (lowerMsg.includes("marks") || lowerMsg.includes("performance") || lowerMsg.includes("result")) {
    const marksText = childData.subjectSummaries.length > 0
      ? childData.subjectSummaries.map((item) => `• ${item}`).join("\n")
      : "• No marks available yet";
    return {
      content: `Here is the latest subject-wise performance:\n\n${marksText}\n\nOverall GPA: ${childData.gpa}/4.0`,
    };
  }
  
  if (lowerMsg.includes("fee") || lowerMsg.includes("payment")) {
    return {
      content: `Fee Status for ${childData.name}:\n\n📊 Total Fee: ${childData.feeStatus.total.toLocaleString()} LKR\n✅ Paid: ${childData.feeStatus.paid.toLocaleString()} LKR\n⚠️ Due: ${childData.feeStatus.due.toLocaleString()} LKR\n\nWould you like to make a payment?`,
      quickActions: [
        { label: "Pay Now", action: "pay_fee", icon: DollarSign },
      ],
    };
  }
  
  if (lowerMsg.includes("leave") || lowerMsg.includes("request")) {
    return {
      content: `You have ${childData.pendingLeaves} pending leave request${childData.pendingLeaves !== 1 ? 's' : ''} to review. Would you like to review them now?`,
      quickActions: [
        { label: "Review Leave Requests", action: "review_leave", icon: Clock },
      ],
    };
  }
  
  return {
    content: "I'm here to help you monitor your child's academic progress! You can ask me about GPA, attendance, fees, exam schedules, marks, leave requests, or how to contact lecturers. What would you like to know?",
    quickActions: [
      { label: "Child's GPA", action: "gpa", icon: TrendingUp },
      { label: "Attendance", action: "attendance", icon: Calendar },
      { label: "Fee Status", action: "fee", icon: DollarSign },
      { label: "Leave Requests", action: "leave", icon: Clock },
      { label: "Contact Lecturer", action: "lecturer", icon: Users },
    ],
  };
};

// Introduction steps for new parents
const introductionSteps = [
  {
    id: 1,
    title: "Welcome to Parent Support! 👨‍👩‍👧",
    description: "I'm your AI-powered parent assistant. I can help you monitor your child's academic progress:",
    features: [
      { icon: TrendingUp, text: "Track your child's GPA and academic performance" },
      { icon: Calendar, text: "Monitor attendance and exam schedules" },
      { icon: Award, text: "View marks and grades" },
      { icon: Clock, text: "Review and approve leave requests" },
      { icon: DollarSign, text: "Check fee status and payments" },
    ],
    action: "get_started",
    buttonText: "Get Started"
  },
  {
    id: 2,
    title: "Quick Tips 💡",
    description: "Here's how to get the most out of your parent assistant:",
    features: [
      { icon: MessageSquare, text: "Ask about your child's progress naturally" },
      { icon: Zap, text: "Use quick action buttons for common tasks" },
      { icon: Lightbulb, text: "Get real-time updates on attendance and marks" },
      { icon: Target, text: "Receive alerts for pending approvals" },
    ],
    action: "try_example",
    buttonText: "Try an Example"
  },
  {
    id: 3,
    title: "Let's Get Started! 🚀",
    description: "Try asking me something like:",
    examples: [
      "What's my child's GPA?",
      "Show me attendance details",
      "What's the fee status?",
      "Any pending leave requests?"
    ],
    action: "start_chat",
    buttonText: "Start Chatting"
  }
];

export default function ParentChatPage() {
  const { user } = useAuth();
  const [childData, setChildData] = useState<ChildData>({ 
    name: user?.name || "Your Child",
    gpa: 0, 
    attendance: 0, 
    subjectSummaries: [],
    feeStatus: { total: 0, paid: 0, due: 0 },
    pendingLeaves: 0 
  });
  const [loadingData, setLoadingData] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "👋 Hello! I'm UniBridge Assistant for Parents. I can help you monitor your child's academic progress. Ask me about GPA, attendance, fees, exam schedules, or anything else!",
      timestamp: new Date(),
      quickActions: [
        { label: "Check GPA", action: "gpa", icon: TrendingUp },
        { label: "View Attendance", action: "attendance", icon: Calendar },
        { label: "Fee Status", action: "fee", icon: DollarSign },
        { label: "Leave Requests", action: "leave", icon: Clock },
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

  //implement parent chat.

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch history and child data on mount
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
              timestamp: new Date(),
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

    const fetchChildData = async () => {
      try {
        const [attendanceRes, marksRes, paymentRes, leaveRes] = await Promise.all([
          fetch("/api/attendance", { credentials: "include" }),
          fetch("/api/marks", { credentials: "include" }),
          fetch("/api/payments", { credentials: "include" }),
          fetch("/api/leaves", { credentials: "include" }),
        ]);

        const attendance = attendanceRes.ok ? await attendanceRes.json() : { summary: { attendanceRate: 0 } };
        const marks = marksRes.ok ? await marksRes.json() : { summary: { averageMarks: 0 } };
        const payments = paymentRes.ok ? await paymentRes.json() : { summary: { totalDue: 0, totalPaid: 0 } };
        const leaves = leaveRes.ok ? await leaveRes.json() : { leaves: [] };

        const averageMarks = Number(marks?.summary?.averageMarks ?? 0);
        const gpa = Math.min(4, Number((averageMarks / 25).toFixed(2)));
        const totalPaid = Number(payments?.summary?.totalPaid ?? 0);
        const totalDue = Number(payments?.summary?.totalDue ?? 0);
        const leavesList = Array.isArray(leaves?.leaves) ? leaves.leaves : [];
        const marksRecords = Array.isArray(marks?.records) ? marks.records : [];

        const subjectSummaries = marksRecords.slice(0, 5).map((record: { subject?: string; score?: number; maxScore?: number }) => {
          const subject = String(record.subject || "Subject");
          const maxScore = Number(record.maxScore || 100);
          const scorePct = maxScore > 0 ? Math.round((Number(record.score || 0) / maxScore) * 100) : 0;
          return `${subject}: ${scorePct}%`;
        });

        setChildData({
          name: "Your Child",
          gpa,
          attendance: Number(attendance?.summary?.attendanceRate ?? 0),
          subjectSummaries,
          feeStatus: { total: totalPaid + totalDue, paid: totalPaid, due: totalDue },
          pendingLeaves: leavesList.filter((leave: { status?: string }) => leave.status === "pending").length,
        });
      } catch (error) {
        console.error("Failed to fetch child data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchHistory();
    fetchChildData();
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    if (showIntroduction) {
      setShowIntroduction(false);
    }

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
        const fallback = getResponse(message, childData);
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
      const fallback = getResponse(message, childData);
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

//add parent chatbot ui.

  const handleQuickAction = (action: string) => {
    let message = "";
    switch (action) {
      case "gpa":
        message = "What's my child's GPA?";
        break;
      case "attendance":
        message = "Show me attendance details";
        break;
      case "fee":
        message = "What's the fee status?";
        break;
      case "leave":
        message = "Show me leave requests";
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

  //create parent role.

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

  //update page.tsx.

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const sidebarItems = parentSidebarItems;

  const currentIntro = introductionSteps[currentStep];
  const paidPercentage = (childData.feeStatus.paid / childData.feeStatus.total) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar items={sidebarItems} activeItem="chat" />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Parent Support" />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <Card className="flex-1 flex flex-col border-0 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">UniBridge Parent Support</CardTitle>
                          <p className="text-xs text-gray-500">Online • Ready to help</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      <AnimatePresence>
                        {showIntroduction && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-4"
                          >
                            <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 flex items-center justify-center shrink-0">
                                  <Rocket className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900">{currentIntro.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{currentIntro.description}</p>
                                  
                                  <div className="mt-4 space-y-2">
                                    {currentIntro.features?.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <feature.icon className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-gray-700">{feature.text}</span>
                                      </div>
                                    ))}
                                    {currentIntro.examples?.map((example, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleIntroductionAction("example", example)}
                                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-emerald-50 transition-colors border border-gray-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <MessageSquare className="h-3 w-3 text-emerald-600" />
                                          <span className="text-sm text-gray-700">{example}</span>
                                          <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                  
                                  <Button
                                    onClick={() => handleQuickAction(currentIntro.action)}
                                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2"
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
                              <AvatarFallback className={message.type === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}>
                                {message.type === "user" ? <User className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`rounded-2xl px-4 py-2 ${
                                message.type === "user" 
                                  ? "bg-emerald-600 text-white" 
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
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded-full hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
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
                                <Heart className="h-4 w-4" />
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
                          placeholder="Ask about your child's progress, fees, attendance..."
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => sendMessage(inputMessage)}
                          disabled={!inputMessage.trim() || isTyping}
                          className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-2">
                        AI-powered assistant • Get instant updates about your child's academics
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-emerald-600" />
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
                          <p className="text-sm text-gray-700 group-hover:text-emerald-600">{faq.question}</p>
                        </button>
                      ))}
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
//implement parent chat interface.