import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser({
  email,
  name,
  role,
  password,
  profile,
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      passwordHash,
    },
    create: {
      email,
      name,
      role,
      passwordHash,
      ...profile,
    },
    include: {
      studentProfile: true,
    },
  });
}

async function main() {
  const student = await upsertUser({
    email: "kavita@university.edu",
    name: "Kavita Perera",
    role: "student",
    password: "password123",
    profile: {
      studentProfile: {
        create: {
          studentCode: "STU2024001",
          batch: "2024",
          department: "Computer Science",
          gpa: 3.75,
          credits: 60,
          totalCredits: 120,
        },
      },
    },
  });

  await upsertUser({
    email: "amara@email.com",
    name: "Amara Perera",
    role: "parent",
    password: "password123",
    profile: {
      parentProfile: {
        create: {
          relation: "Mother",
          childStudentCode: "STU2024001",
        },
      },
    },
  });

  const secondStudent = await upsertUser({
    email: "nimal@university.edu",
    name: "Nimal Fernando",
    role: "student",
    password: "password123",
    profile: {
      studentProfile: {
        create: {
          studentCode: "STU2024002",
          batch: "2024",
          department: "Information Technology",
          gpa: 3.42,
          credits: 54,
          totalCredits: 120,
        },
      },
    },
  });

  await upsertUser({
    email: "kamal@email.com",
    name: "Kamal Fernando",
    role: "parent",
    password: "password123",
    profile: {
      parentProfile: {
        create: {
          relation: "Father",
          childStudentCode: "STU2024002",
        },
      },
    },
  });

  await upsertUser({
    email: "prof.smith@university.edu",
    name: "Prof. John Smith",
    role: "lecturer",
    password: "Lecturer@123",
    profile: {
      lecturerProfile: {
        create: {
          employeeCode: "LEC2023001",
          department: "Computer Science",
          position: "Senior Lecturer",
          qualification: "Ph.D. in Computer Science",
          specialization: "Algorithms, Data Structures",
          office: "Room 304",
          officeHours: "Mon 2-4 PM",
        },
      },
    },
  });

  await upsertUser({
    email: "admin@unibridge.com",
    name: "Admin User",
    role: "admin",
    password: "Admin@123",
    profile: {
      adminProfile: {
        create: {
          employeeCode: "ADM2023001",
          department: "IT Services",
          position: "System Administrator",
        },
      },
    },
  });

  if (student.studentProfile) {
    const studentProfileId = student.studentProfile.id;

    await prisma.attendanceRecord.createMany({
      data: [
        { studentProfileId, date: "2026-04-01", present: true },
        { studentProfileId, date: "2026-04-02", present: true },
        { studentProfileId, date: "2026-04-03", present: false },
        { studentProfileId, date: "2026-04-04", present: true },
        { studentProfileId, date: "2026-04-05", present: true },
      ],
      skipDuplicates: true,
    });

    await prisma.markRecord.createMany({
      data: [
        { studentProfileId, subject: "Data Structures", assessment: "Mid-term", score: 82, maxScore: 100, examDate: "2026-03-12" },
        { studentProfileId, subject: "Algorithms", assessment: "Mid-term", score: 88, maxScore: 100, examDate: "2026-03-18" },
        { studentProfileId, subject: "Databases", assessment: "Quiz 1", score: 79, maxScore: 100, examDate: "2026-03-21" },
      ],
      skipDuplicates: true,
    });

    await prisma.notice.createMany({
      data: [
        {
          title: "Mid-Semester Examination Schedule",
          content: "The mid-semester examination schedule has been published. Please check your timetable.",
          category: "exam",
          priority: "high",
          targetAudience: ["student", "parent"],
          status: "published",
          publishedAt: new Date("2026-03-20"),
          expiresAt: "2026-04-15",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        },
        {
          title: "Library Extended Hours",
          content: "The university library will remain open until 11 PM during the examination period.",
          category: "general",
          priority: "medium",
          targetAudience: ["student"],
          status: "published",
          publishedAt: new Date("2026-03-18"),
          expiresAt: "2026-04-30",
          voiceUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
        {
          title: "Campus Closure Update",
          content: "The campus will close early on April 7 for maintenance. Please plan your travel accordingly.",
          category: "general",
          priority: "high",
          targetAudience: ["student", "parent", "lecturer", "admin"],
          status: "published",
          publishedAt: new Date("2026-04-07"),
          expiresAt: "2026-04-14",
          videoUrl: "https://www.w3schools.com/html/movie.mp4",
          voiceUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
        {
          title: "Lecturer Meeting Reminder",
          content: "All lecturers are invited to the curriculum review meeting this Friday.",
          category: "event",
          priority: "medium",
          targetAudience: ["lecturer"],
          status: "published",
          publishedAt: new Date("2026-04-07"),
          expiresAt: "2026-04-12",
        },
        {
          title: "Admin Policy Review",
          content: "Administrators should review the updated student support policy before Friday.",
          category: "general",
          priority: "low",
          targetAudience: ["admin"],
          status: "published",
          publishedAt: new Date("2026-04-06"),
          expiresAt: "2026-04-20",
        },
      ],
      skipDuplicates: true,
    });

    await prisma.payment.createMany({
      data: [
        {
          studentProfileId,
          category: "tuition",
          name: "Semester Tuition Fee",
          description: "Spring Semester 2026",
          amount: 250000,
          dueDate: "2026-04-15",
          status: "pending",
          method: "Bank Transfer",
          receiptNumber: "INV-2026-001",
        },
        {
          studentProfileId,
          category: "exam",
          name: "Final Examination Fee",
          description: "Semester 4 Final Exams",
          amount: 15000,
          dueDate: "2026-04-10",
          paidDate: "2026-03-22",
          status: "completed",
          method: "Credit Card",
          receiptNumber: "INV-2026-002",
        },
        {
          studentProfileId,
          category: "library",
          name: "Library Late Fine",
          description: "Overdue book return",
          amount: 2500,
          dueDate: "2026-03-30",
          status: "pending",
          method: "Digital Wallet",
          receiptNumber: "INV-2026-003",
        },
      ],
      skipDuplicates: true,
    });

    if (secondStudent.studentProfile) {
      const secondStudentProfileId = secondStudent.studentProfile.id;

      await prisma.attendanceRecord.createMany({
        data: [
          { studentProfileId: secondStudentProfileId, date: "2026-04-01", present: true },
          { studentProfileId: secondStudentProfileId, date: "2026-04-02", present: false },
          { studentProfileId: secondStudentProfileId, date: "2026-04-03", present: true },
          { studentProfileId: secondStudentProfileId, date: "2026-04-04", present: true },
          { studentProfileId: secondStudentProfileId, date: "2026-04-05", present: false },
        ],
        skipDuplicates: true,
      });

      await prisma.markRecord.createMany({
        data: [
          { studentProfileId: secondStudentProfileId, subject: "Programming", assessment: "Mid-term", score: 76, maxScore: 100, examDate: "2026-03-14" },
          { studentProfileId: secondStudentProfileId, subject: "Database Systems", assessment: "Quiz 1", score: 84, maxScore: 100, examDate: "2026-03-20" },
          { studentProfileId: secondStudentProfileId, subject: "Networking", assessment: "Assignment", score: 81, maxScore: 100, examDate: "2026-03-25" },
        ],
        skipDuplicates: true,
      });

      await prisma.payment.createMany({
        data: [
          {
            studentProfileId: secondStudentProfileId,
            category: "tuition",
            name: "Semester Tuition Fee",
            description: "Spring Semester 2026",
            amount: 240000,
            dueDate: "2026-04-15",
            status: "pending",
            method: "Bank Transfer",
            receiptNumber: "INV-2026-011",
          },
          {
            studentProfileId: secondStudentProfileId,
            category: "library",
            name: "Library Fine",
            description: "Book overdue charge",
            amount: 1800,
            dueDate: "2026-04-09",
            status: "completed",
            paidDate: "2026-04-03",
            method: "Cash",
            receiptNumber: "INV-2026-012",
          },
        ],
        skipDuplicates: true,
      });
    }

    const existingPoll = await prisma.poll.findFirst({ where: { title: "Which time slot do you prefer for lectures?" } });

    if (!existingPoll) {
      await prisma.poll.create({
        data: {
          title: "Which time slot do you prefer for lectures?",
          description: "Help us optimize the lecture schedule",
          totalVotes: 183,
          status: "active",
          startDate: "2026-04-01",
          endDate: "2026-04-10",
          targetAudience: ["students", "lecturers"],
          options: {
            create: [
              { text: "8:00 AM - 10:00 AM", votes: 45 },
              { text: "10:00 AM - 12:00 PM", votes: 78 },
              { text: "2:00 PM - 4:00 PM", votes: 32 },
              { text: "4:00 PM - 6:00 PM", votes: 28 },
            ],
          },
        },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
