import { requireAuth } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";


interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

//update route.ts. 

interface ChatContext {
  studentName: string;
  attendanceRate: number;
  attendanceTotal: number;
  attendancePresent: number;
  averageMark: number;
  gpa: number;
  markCount: number;
  subjectBreakdown: Array<{ subject: string; percent: number }>;
  upcomingExams: Array<{ subject: string; date: string }>;
  recentExams: Array<{ subject: string; date: string }>;
  leaveSummary: { total: number; pending: number; approved: number; rejected: number };
  paymentSummary: { total: number; paid: number; due: number };
}

// Chat history is now stored in the database.

async function getStudentDataForUser(user: Awaited<ReturnType<typeof requireAuth>>) {
  if (user.role === "student" && user.studentProfile) {
    return prisma.studentProfile.findUnique({
      where: { id: user.studentProfile.id },
      include: { 
        attendance: true, 
        marks: true, 
        leaves: true, 
        payments: true, 
        user: true 
      },
    });
  }

  if (user.role === "parent" && user.parentProfile) {
    return prisma.studentProfile.findUnique({
      where: { studentCode: user.parentProfile.childStudentCode },
      include: { 
        attendance: true, 
        marks: true, 
        leaves: true, 
        payments: true, 
        user: true 
      },
    });
  }

  return null;
}

function buildComprehensiveContext(studentData: NonNullable<Awaited<ReturnType<typeof getStudentDataForUser>>>, role: string) {
  const attendanceTotal = studentData.attendance.length;
  const attendancePresent = studentData.attendance.filter((row) => row.present).length;
  const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

  const markCount = studentData.marks.length;
  const averageMark = markCount > 0
    ? Math.round(studentData.marks.reduce((sum, row) => sum + (row.score / row.maxScore) * 100, 0) / markCount)
    : 0;
  const gpa = Math.min(4, Number((averageMark / 25).toFixed(2)));

  const grouped = new Map<string, number[]>();
  for (const row of studentData.marks) {
    const percent = row.maxScore > 0 ? (row.score / row.maxScore) * 100 : 0;
    const list = grouped.get(row.subject) ?? [];
    list.push(percent);
    grouped.set(row.subject, list);
  }

  const subjectBreakdown = Array.from(grouped.entries())
    .map(([subject, values]) => ({
      subject,
      percent: Math.round(values.reduce((sum, item) => sum + item, 0) / values.length),
    }))
    .sort((a, b) => b.percent - a.percent);

  const today = new Date().toISOString().split("T")[0];
  const upcomingExams = studentData.marks
    .filter((row) => row.examDate >= today)
    .sort((a, b) => a.examDate.localeCompare(b.examDate))
    .map((row) => ({ subject: row.subject, date: row.examDate, score: row.score, maxScore: row.maxScore }));

  const recentExams = studentData.marks
    .slice()
    .sort((a, b) => b.examDate.localeCompare(a.examDate))
    .slice(0, 10)
    .map((row) => ({ subject: row.subject, date: row.examDate, score: row.score, maxScore: row.maxScore }));

  const leaveSummary = {
    total: studentData.leaves.length,
    pending: studentData.leaves.filter((leave) => leave.status === "pending").length,
    approved: studentData.leaves.filter((leave) => leave.status === "approved").length,
    rejected: studentData.leaves.filter((leave) => leave.status === "rejected").length,
    recentLeaves: studentData.leaves.slice(0, 5).map(leave => ({
      type: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      reason: leave.reason
    }))
  };

  const paymentSummary = {
    total: studentData.payments.reduce((sum, row) => sum + row.amount, 0),
    paid: studentData.payments.filter((row) => row.status === "completed").reduce((sum, row) => sum + row.amount, 0),
    due: studentData.payments.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0),
    recentPayments: studentData.payments.slice(0, 5).map(payment => ({
      amount: payment.amount,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate,
      status: payment.status,
      description: payment.description
    }))
  };

  return {
    role,
    studentName: studentData.user.name,
    studentEmail: studentData.user.email,
    studentCode: studentData.studentCode,
    attendanceRate,
    attendanceTotal,
    attendancePresent,
    attendanceMissing: attendanceTotal - attendancePresent,
    averageMark,
    gpa,
    markCount,
    subjectBreakdown,
    topSubjects: subjectBreakdown.slice(0, 3),
    strugglingSubjects: subjectBreakdown.filter(s => s.percent < 60).slice(0, 3),
    upcomingExams,
    recentExams,
    leaveSummary,
    paymentSummary,
    lastUpdated: new Date().toISOString()
  };
}

function buildSystemPrompt(context: any) {
  const roleSpecificPrompt = context.role === "parent" 
    ? "You are an AI assistant helping a parent monitor their child's academic progress. Be supportive and provide clear, actionable insights."
    : "You are an AI academic advisor helping a student improve their performance. Be encouraging and provide practical advice.";

  return `${roleSpecificPrompt}

CONTEXT INFORMATION:
Student Name: ${context.studentName}
Student Code: ${context.studentCode}
Current GPA: ${context.gpa}/4.0
Average Mark: ${context.averageMark}%
Attendance Rate: ${context.attendanceRate}% (${context.attendancePresent}/${context.attendanceTotal} days present)

SUBJECT PERFORMANCE:
${context.subjectBreakdown.map((s: any) => `- ${s.subject}: ${s.percent}%`).join('\n')}

${context.topSubjects.length > 0 ? `TOP PERFORMING SUBJECTS:
${context.topSubjects.map((s: any) => `- ${s.subject}: ${s.percent}%`).join('\n')}` : ''}

${context.strugglingSubjects.length > 0 ? `AREAS NEEDING IMPROVEMENT:
${context.strugglingSubjects.map((s: any) => `- ${s.subject}: ${s.percent}% (Needs attention)`).join('\n')}` : ''}

${context.upcomingExams.length > 0 ? `UPCOMING EXAMS:
${context.upcomingExams.map((e: any) => `- ${e.subject}: ${e.date}`).join('\n')}` : 'No upcoming exams scheduled'}

${context.recentExams.length > 0 ? `RECENT EXAM RESULTS:
${context.recentExams.map((e: any) => `- ${e.subject}: ${(e.score/e.maxScore*100).toFixed(1)}% (${e.score}/${e.maxScore})`).join('\n')}` : ''}

LEAVE SUMMARY:
- Total Requests: ${context.leaveSummary.total}
- Pending: ${context.leaveSummary.pending}
- Approved: ${context.leaveSummary.approved}
- Rejected: ${context.leaveSummary.rejected}

${context.role === "parent" ? `PAYMENT SUMMARY:
- Total Fees: LKR ${context.paymentSummary.total.toLocaleString()}
- Paid: LKR ${context.paymentSummary.paid.toLocaleString()}
- Due: LKR ${context.paymentSummary.due.toLocaleString()}` : ''}

INSTRUCTIONS:
1. Always provide specific, data-driven answers based on the student context when relevant
2. If a user asks a general question outside their academic records, respond correctly and helpfully as a general-purpose AI
3. When discussing GPA, always mention the current ${context.gpa}/4.0
4. For attendance below 75%, express gentle concern and suggest improvement
5. For marks below 60% in any subject, offer study tips
6. Be conversational but professional
7. If asked about fees (parent only), provide the exact amounts
8. If asked about leave, explain the leave policy clearly
9. For exam questions, show upcoming dates and suggest preparation strategies
10. Never make up specific academic data - if information isn't in context and the query is academic, say so clearly
11. Keep responses concise but helpful

Current date: ${new Date().toLocaleDateString()}`;
}

async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  retries = 3
): Promise<string | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterKey) {
    console.warn("OPENROUTER_API_KEY not configured");
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Student Management System"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
        }),
      });

      if (completion.ok) {
        const json = await completion.json();
        const answer = json?.choices?.[0]?.message?.content as string | undefined;
        
        if (answer) {
          return answer.trim();
        }
      } else {
        const error = await completion.text();
        console.error(`OpenRouter API error (attempt ${attempt}):`, error);
        
        if (attempt === retries) {
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    } catch (error) {
      console.error(`OpenRouter request failed (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }

  return null;
}

function generateFallbackResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("gpa") || lowerMessage.includes("grade")) {
    return `Your current GPA is ${context.gpa}/4.0. This is based on ${context.markCount} assessment records. ${
      context.gpa < 2.5 ? "You might want to focus on improving your performance in core subjects." : 
      context.gpa < 3.0 ? "Good progress! With some additional effort, you can reach a higher GPA." :
      "Excellent work! Keep maintaining this high standard."
    }`;
  }
  
  if (lowerMessage.includes("attendance")) {
    return `Your attendance rate is ${context.attendanceRate}% (${context.attendancePresent} out of ${context.attendanceTotal} days). ${
      context.attendanceRate < 75 ? "This is below the recommended 75% threshold. Please try to improve your attendance." :
      context.attendanceRate < 85 ? "This is acceptable, but maintaining higher attendance would benefit your learning." :
      "Great job maintaining good attendance!"
    }`;
  }
  
  if (lowerMessage.includes("mark") || lowerMessage.includes("result") || lowerMessage.includes("performance")) {
    if (context.strugglingSubjects.length > 0) {
      return `Your average mark is ${context.averageMark}%. Subjects needing attention: ${context.strugglingSubjects.map((s: any) => s.subject).join(", ")}. Consider spending extra time on these subjects.`;
    }
    return `Your average mark is ${context.averageMark}%. You're performing well across all subjects! Keep up the good work.`;
  }
  
  if (lowerMessage.includes("exam")) {
    if (context.upcomingExams.length > 0) {
      return `You have ${context.upcomingExams.length} upcoming exams. Next: ${context.upcomingExams[0].subject} on ${context.upcomingExams[0].date}. Start preparing early and focus on your weaker areas.`;
    }
    return "No upcoming exams are currently scheduled. Use this time to review past materials and strengthen your fundamentals.";
  }
  
  if (lowerMessage.includes("leave")) {
    return `You have ${context.leaveSummary.pending} pending leave request(s), ${context.leaveSummary.approved} approved, and ${context.leaveSummary.rejected} rejected. Remember: leave requests can only be submitted for tomorrow's date.`;
  }
  
  if (context.role === "parent" && lowerMessage.includes("fee")) {
    return `Total fees: LKR ${context.paymentSummary.total.toLocaleString()}. Paid: LKR ${context.paymentSummary.paid.toLocaleString()}. Due: LKR ${context.paymentSummary.due.toLocaleString()}. ${
      context.paymentSummary.due > 0 ? "Please clear the due amount to avoid any interruptions." : "All fees are up to date."
    }`;
  }
  
  return `I can help you with information about GPA (${context.gpa}/4.0), attendance (${context.attendanceRate}%), marks (${context.averageMark}% average), exams, and leave requests. What specific information would you like?`;
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "student" && user.role !== "parent") {
      return apiError(403, "Unauthorized");
    }

    // Get the most recent conversation for this user
    const conversation = await prisma.chatConversation.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
        },
      },
    });

    if (!conversation) {
      return apiOk({ messages: [] });
    }

    return apiOk({ 
      conversationId: conversation.id,
      messages: conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });
  } catch (error) {
    console.error("Fetch chat history error:", error);
    return apiError(500, "Failed to fetch chat history");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return apiError(400, "Message is required");
    }

    const studentData = await getStudentDataForUser(user);

    if (!studentData || (user.role !== "student" && user.role !== "parent")) {
      return apiOk({ 
        answer: "I'm unable to access your academic data. Please ensure your account is properly configured as a student or parent.",
        source: "error" 
      });
    }

    const context = buildComprehensiveContext(studentData, user.role);
    const systemPrompt = buildSystemPrompt(context);
    
    // Fetch or create conversation
    let conversation;
    if (body.conversationId) {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: body.conversationId },
        include: { messages: true }
      });
    }

    if (!conversation) {
      // Try to find the most recent one or create new
      conversation = await prisma.chatConversation.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { messages: true }
      });

      if (!conversation) {
        conversation = await prisma.chatConversation.create({
          data: {
            userId: user.id,
            title: body.message.substring(0, 50),
          },
          include: { messages: true }
        });
      }
    }
    
    // Save user message to DB
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: body.message,
      }
    });

    // Prepare messages for OpenRouter
    const conversationHistory = conversation.messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: body.message }
    ];
    
    // Try OpenRouter first
    let aiResponse = await callOpenRouter(messages);
    let source = "openrouter";
    
    // Fallback to local responses if OpenRouter fails
    if (!aiResponse) {
      aiResponse = generateFallbackResponse(body.message, context);
      source = "local-fallback";
    }
    
    // Save assistant response to DB
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      }
    });

    // Update conversation timestamp
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });
    
    return apiOk({ 
      answer: aiResponse,
      source,
      conversationId: conversation.id,
      context: {
        gpa: context.gpa,
        attendanceRate: context.attendanceRate,
        averageMark: context.averageMark,
        hasUpcomingExams: context.upcomingExams.length > 0
      }
    });
    
  } catch (error) {
    console.error("Chat error:", error);
    return apiError(500, "Failed to process chat message. Please try again.");
  }
}