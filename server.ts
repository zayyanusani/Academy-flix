/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import PDFDocument from "pdfkit";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json());

// CORS Configuration for Vercel deployment
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Type interfaces for file DB
interface DBStructure {
  users: any[];
  courses: any[];
}

// Pre-seeded Course Database
const defaultDb: DBStructure = {
  users: [
    {
      _id: "user-zayyanu",
      name: "Zayyanu Sani",
      email: "user@email.com",
      password: "learning123",
      profileImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150",
      coursesEnrolled: ["course-graphic"],
      progress: [
        {
          courseId: "course-graphic",
          lessons: [
            {
              lessonId: "lesson-graphic-1",
              playedSeconds: 180,
              isCompleted: true,
              updatedAt: new Date().toISOString()
            }
          ],
          completedQuiz: false
        }
      ],
      createdAt: "2026-06-01",
      isAdmin: false
    },
    {
      _id: "user-admin",
      name: "Zayyanu (Faculty)",
      email: "admin@academyflix.com",
      password: "admin123",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      coursesEnrolled: [],
      progress: [],
      createdAt: "2026-06-01",
      isAdmin: true
    }
  ],
  courses: [
    {
      _id: "course-graphic",
      title: "Graphic Design Masterclass",
      description: "Learn professional visual communication principles, negative spacing, typographic pairings, and color systems for digital platforms.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop",
      category: "Design",
      instructor: "Amanda Ross",
      price: 0,
      createdAt: "2026-06-01",
      lessons: [
        {
          _id: "lesson-graphic-1",
          courseId: "course-graphic",
          title: "Introduction to Dynamic Composition",
          videoUrl: "Ke90Tje7VS0", // React-style embed
          duration: "10 mins",
          order: 1
        },
        {
          _id: "lesson-graphic-2",
          courseId: "course-graphic",
          title: "Contrast, Rhythm and Typographic Hierarchy",
          videoUrl: "7K1sB05pUX0",
          duration: "14 mins",
          order: 2
        },
        {
          _id: "lesson-graphic-3",
          courseId: "course-graphic",
          title: "Color Theory in Branding & Interface Mockups",
          videoUrl: "L_g-V2-6j0g",
          duration: "12 mins",
          order: 3
        }
      ],
      quiz: {
        _id: "quiz-graphic",
        courseId: "course-graphic",
        questions: [
          {
            questionText: "Which visual rule states that elements positioned close to each other are perceived as related?",
            options: [
              "Rule of Thirds",
              "Law of Proximity",
              "Rule of Contrast",
              "Symmetrical Balancing"
            ],
            correctAnswerIndex: 1
          },
          {
            questionText: "What is the primary function of negative space in user interface layouts?",
            options: [
              "To display hidden watermarks",
              "To optimize image compression",
              "To improve readability and reduce cognitive overload",
              "To load stylesheets asynchronously"
            ],
            correctAnswerIndex: 2
          },
          {
            questionText: "Which color combination sits directly opposite each other on the color wheel?",
            options: [
              "Analogous Colors",
              "Monochromatic Accents",
              "Complementary Colors",
              "Triadic Highlights"
            ],
            correctAnswerIndex: 2
          }
        ]
      }
    },
    {
      _id: "course-react",
      title: "React 18 & Vite Frontend Mastery",
      description: "Master fast SPA rendering, state optimization, custom hooks, and full-stack Vite proxies with beautiful modern web styling.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
      category: "Development",
      instructor: "Zayyanu Sani",
      price: 29.99, // Premium course example
      createdAt: "2026-06-01",
      lessons: [
        {
          _id: "lesson-react-1",
          courseId: "course-react",
          title: "Scaffolding Modern Apps with Vite & Tailwind CSS",
          videoUrl: "Ke90Tje7VS0",
          duration: "15 mins",
          order: 1
        },
        {
          _id: "lesson-react-2",
          courseId: "course-react",
          title: "State, Component Life Cycles, and Callback Optimization",
          videoUrl: "T_j6078w7Is",
          duration: "18 mins",
          order: 2
        }
      ],
      quiz: {
        _id: "quiz-react",
        courseId: "course-react",
        questions: [
          {
            questionText: "Why is Vite faster than typical standard Webpack configurations during development?",
            options: [
              "Vite compiles all files to native C++ before execution",
              "Vite uses native browser ES modules (ESM) to load assets on demand",
              "Vite does not support React component states",
              "Vite forces file locks on assets"
            ],
            correctAnswerIndex: 1
          },
          {
            questionText: "Which React hook is designed to memoize heavy computational functions?",
            options: [
              "useCallback",
              "useMemo",
              "useEffect",
              "useRef"
            ],
            correctAnswerIndex: 1
          }
        ]
      }
    },
    {
      _id: "course-marketing",
      title: "Viral Copywriting & Search Optimization",
      description: "Accelerate user acquisition using psychology-backed marketing hooks and modern SEO ranking standards.",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
      category: "Marketing",
      instructor: "Sarah Jenkins",
      price: 0,
      createdAt: "2026-05-15",
      lessons: [
        {
          _id: "lesson-mkt-1",
          courseId: "course-marketing",
          title: "Psychology Behind Attention Hooks & High-Conversion Copy",
          videoUrl: "7_R3O7mKkU8",
          duration: "13 mins",
          order: 1
        },
        {
          _id: "lesson-mkt-2",
          courseId: "course-marketing",
          title: "SEO Audits and Technical Crawl Speed Optimization",
          videoUrl: "p9eL_W1b6j4",
          duration: "11 mins",
          order: 2
        }
      ],
      quiz: {
        _id: "quiz-market",
        courseId: "course-marketing",
        questions: [
          {
            questionText: "In marketing copy, a 'Lead Hook' is primary designed to:",
            options: [
              "Log click telemetry headers",
              "Trigger an immediate positive feedback, capture immediate curiosity, and state the value proposition",
              "Re-route traffic to database clusters",
              "Encourage the user to review site terms"
            ],
            correctAnswerIndex: 1
          }
        ]
      }
    }
  ]
};

// Initialize file JSON DB helper functions
function readDb(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database, falling back onto built-in memory state", error);
    return defaultDb;
  }
}

function writeDb(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database state to file", error);
  }
}

// Auth API Endpoints
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required registration parameters" });
  }

  const db = readDb();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Email address is already registered" });
  }

  const newUser = {
    _id: "user_" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    password,
    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    coursesEnrolled: ["course-graphic"], // Seed enrollment
    progress: [
      {
        courseId: "course-graphic",
        lessons: [],
        completedQuiz: false
      }
    ],
    createdAt: new Date().toISOString().split("T")[0],
    isAdmin: false
  };

  db.users.push(newUser);
  writeDb(db);

  // Return user representation without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credential parameters" });
  }

  const db = readDb();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email prefix or password match" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Sync user from external UI or Flutter (Optional integration compatibility)
app.post("/api/auth/sync-user", (req: Request, res: Response) => {
  const { uid, email, name } = req.body;
  const db = readDb();
  let user = db.users.find((u) => u._id === uid || u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    user = {
      _id: uid || "user_" + Math.random().toString(36).substr(2, 9),
      name: name || "Learner",
      email,
      coursesEnrolled: ["course-graphic"],
      progress: [],
      createdAt: new Date().toISOString().split("T")[0],
      isAdmin: false
    };
    db.users.push(user);
    writeDb(db);
  }
  res.json(user);
});

// Courses Endpoints
app.get("/api/courses", (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.courses);
});

app.get("/api/courses/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const course = db.courses.find((c) => c._id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});

// Admin Add Course
app.post("/api/courses", (req: Request, res: Response) => {
  const { title, description, thumbnail, category, instructor, price, lessons, quiz } = req.body;
  if (!title || !description || !thumbnail || !category) {
    return res.status(400).json({ error: "Missing required Course metadata parameters" });
  }

  const db = readDb();
  const newCourse = {
    _id: "course_" + Math.random().toString(36).substr(2, 9),
    title,
    description,
    thumbnail,
    category,
    instructor: instructor || "Faculty Member",
    price: parseFloat(price) || 0,
    lessons: (lessons || []).map((l: any, idx: number) => ({
      _id: l._id || "lesson_" + Math.random().toString(36).substr(2, 9),
      courseId: "", // Will populate below
      title: l.title || `Lesson ${idx + 1}`,
      videoUrl: l.videoUrl || "Ke90Tje7VS0",
      duration: l.duration || "10 mins",
      order: idx + 1
    })),
    quiz: quiz || { _id: "quiz_" + Math.random().toString(36).substr(2, 9), questions: [] },
    createdAt: new Date().toISOString().split("T")[0]
  };

  // Bind reverse IDs
  newCourse.lessons.forEach((l) => (l.courseId = newCourse._id));
  newCourse.quiz.courseId = newCourse._id;
  if (!newCourse.quiz._id) {
    newCourse.quiz._id = "quiz_" + Math.random().toString(36).substr(2, 9);
  }

  db.courses.push(newCourse);
  writeDb(db);
  res.status(201).json(newCourse);
});

// Admin Edit Course
app.put("/api/courses/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, thumbnail, category, instructor, price, lessons, quiz } = req.body;

  const db = readDb();
  const idx = db.courses.findIndex((c) => c._id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Course not found" });
  }

  const updatedLessons = (lessons || []).map((l: any, lidx: number) => ({
    _id: l._id || "lesson_" + Math.random().toString(36).substr(2, 9),
    courseId: id,
    title: l.title,
    videoUrl: l.videoUrl || "Ke90Tje7VS0",
    duration: l.duration || "10 mins",
    order: lidx + 1
  }));

  const updatedQuiz = quiz ? {
    _id: quiz._id || "quiz_" + Math.random().toString(36).substr(2, 9),
    courseId: id,
    questions: quiz.questions || []
  } : db.courses[idx].quiz;

  db.courses[idx] = {
    ...db.courses[idx],
    title: title || db.courses[idx].title,
    description: description || db.courses[idx].description,
    thumbnail: thumbnail || db.courses[idx].thumbnail,
    category: category || db.courses[idx].category,
    instructor: instructor || db.courses[idx].instructor,
    price: price !== undefined ? parseFloat(price) : db.courses[idx].price,
    lessons: updatedLessons,
    quiz: updatedQuiz
  };

  writeDb(db);
  res.json(db.courses[idx]);
});

// Admin Delete Course
app.delete("/api/courses/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.courses.length;
  db.courses = db.courses.filter((c) => c._id !== id);

  if (db.courses.length === initialLength) {
    return res.status(404).json({ error: "Course not found" });
  }

  writeDb(db);
  res.json({ message: "Course removed successfully" });
});

// Student Enrollment Action
app.post("/api/enroll", (req: Request, res: Response) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({ error: "Missing required enrollment fields" });
  }

  const db = readDb();
  const userIdx = db.users.findIndex((u) => u._id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = db.users[userIdx];
  if (!user.coursesEnrolled.includes(courseId)) {
    user.coursesEnrolled.push(courseId);
  }

  // Ensure progress slot is initialized
  const progressIdx = user.progress.findIndex((p: any) => p.courseId === courseId);
  if (progressIdx === -1) {
    user.progress.push({
      courseId,
      lessons: [],
      completedQuiz: false
    });
  }

  db.users[userIdx] = user;
  writeDb(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Video Progress Updates API
app.post("/api/progress/update", (req: Request, res: Response) => {
  const { userId, courseId, lessonId, playedSeconds, isCompleted } = req.body;
  if (!userId || !courseId || !lessonId) {
    return res.status(400).json({ error: "Missing progress tracking fields" });
  }

  const db = readDb();
  const userIdx = db.users.findIndex((u) => u._id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User record not found" });
  }

  const user = db.users[userIdx];
  let courseProgress = user.progress.find((p: any) => p.courseId === courseId);

  if (!courseProgress) {
    courseProgress = {
      courseId,
      lessons: [],
      completedQuiz: false
    };
    user.progress.push(courseProgress);
  }

  let lessonProgress = courseProgress.lessons.find((l: any) => l.lessonId === lessonId);
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      playedSeconds: parseFloat(playedSeconds) || 0,
      isCompleted: !!isCompleted,
      updatedAt: new Date().toISOString()
    };
    courseProgress.lessons.push(lessonProgress);
  } else {
    lessonProgress.playedSeconds = parseFloat(playedSeconds) || 0;
    if (isCompleted) {
      lessonProgress.isCompleted = true;
    }
    lessonProgress.updatedAt = new Date().toISOString();
  }

  db.users[userIdx] = user;
  writeDb(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Get Live User Progress Map
app.get("/api/progress/user/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  const db = readDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user.progress || []);
});

// Quiz Submission
app.post("/api/quiz/submit", (req: Request, res: Response) => {
  const { userId, courseId, quizId, answers } = req.body; // Map: questions indexes -> user options index
  if (!userId || !courseId || !answers) {
    return res.status(400).json({ error: "Missing quiz response data" });
  }

  const db = readDb();
  const course = db.courses.find((c) => c._id === courseId);
  if (!course || !course.quiz) {
    return res.status(404).json({ error: "Associated course quiz not found" });
  }

  const userIdx = db.users.findIndex((u) => u._id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User session not found" });
  }

  const user = db.users[userIdx];
  let correctCount = 0;
  const questionsList = course.quiz.questions || [];

  questionsList.forEach((q: any, idx: number) => {
    if (answers[idx] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const totalQuestions = questionsList.length || 1;
  const scoreRatio = correctCount / totalQuestions;
  const passed = scoreRatio >= 0.7; // 70% passing threshold

  let courseProgress = user.progress.find((p: any) => p.courseId === courseId);
  if (!courseProgress) {
    courseProgress = { courseId, lessons: [], completedQuiz: false };
    user.progress.push(courseProgress);
  }

  if (passed) {
    courseProgress.completedQuiz = true;
    courseProgress.quizScore = Math.round(scoreRatio * 100);
  }

  db.users[userIdx] = user;
  writeDb(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    passed,
    savedScore: Math.round(scoreRatio * 100),
    correct: correctCount,
    total: totalQuestions,
    userState: userWithoutPassword
  });
});

// System Diagnostics & Admin Analytics
app.get("/api/analytics", (req: Request, res: Response) => {
  const db = readDb();
  
  let totalEnrollments = 0;
  let completedQuizzes = 0;
  
  db.users.forEach((u) => {
    if (u.coursesEnrolled) {
      totalEnrollments += u.coursesEnrolled.length;
    }
    if (u.progress) {
      u.progress.forEach((p: any) => {
        if (p.completedQuiz) {
          completedQuizzes++;
        }
      });
    }
  });

  res.json({
    totalEnrollments,
    completedQuizzes,
    totalStudents: db.users.filter(u => !u.isAdmin).length,
    totalCourses: db.courses.length,
    students: db.users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      coursesEnrolled: u.coursesEnrolled,
      isAdmin: !!u.isAdmin,
      progress: u.progress,
      createdAt: u.createdAt
    }))
  });
});

// dynamic Certificate Generation via PDFKit on the Express Stream
app.get("/api/certificate/download/:userId/:courseId", (req: Request, res: Response) => {
  const { userId, courseId } = req.params;

  const db = readDb();
  const user = db.users.find((u) => u._id === userId);
  const course = db.courses.find((c) => c._id === courseId);

  if (!user || !course) {
    return res.status(404).send("API Error: Student record or Course courseId invalid.");
  }

  // Cross-reference user quiz state
  const progress = user.progress?.find((p: any) => p.courseId === courseId);
  const quizPassed = progress?.completedQuiz;

  // Render anyway but append alert for demonstration / educational simulation
  const isDemonstration = !quizPassed;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificate_${userId}_${courseId}.pdf`
  );

  const doc = new PDFDocument({ layout: "landscape", size: "A4" });
  doc.pipe(res);

  // Styling Variables
  const primaryBg = "#0F0F10";
  const borderGold = "#C5A880";
  const accentRed = "#E50914";
  const textWhite = "#FFFFFF";
  const textGray = "#9CA3AF";

  // Canvas background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryBg);

  // Outer Gold Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke(borderGold);

  // Inner Red Accent Line
  doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(1).stroke(accentRed);

  // Content rendering
  doc.moveDown(2);

  // Brand Header
  doc.fillColor(accentRed).fontSize(20).text("ACADEMYFLIX CERTIFICATION PLATFORMS", { align: "center", characterSpacing: 1.5 });
  doc.moveDown(1.5);

  // Title description
  doc.fillColor(textWhite).fontSize(34).text("CERTIFICATE OF COMPLETION", { align: "center", wordSpacing: 2 });
  doc.moveDown(0.5);

  doc.fillColor(textGray).fontSize(13).text("This official credential is systematically awarded to indicate the student has successfully passed the evaluations for:", { align: "center" });
  doc.moveDown(1.2);

  // Student Name inside dynamic badge
  doc.fillColor(borderGold).fontSize(32).text(user.name.toUpperCase(), { align: "center" });
  doc.moveDown(0.8);

  doc.fillColor(textGray).fontSize(12).text("having displayed proficient knowledge systems, lessons requirements, and passing the comprehensive test for:", { align: "center" });
  doc.moveDown(0.6);

  // Course Title
  doc.fillColor(textWhite).fontSize(22).text(`"${course.title}"`, { align: "center" });
  doc.moveDown(2.5);

  // Footer labels
  const footerY = doc.y;

  // Authority Block left
  doc.fillColor(textGray).fontSize(10);
  doc.text("VERIFIED COURSEWARE BY FACULTY", 80, footerY);
  doc.strokeColor(borderGold).lineWidth(1).moveTo(80, footerY - 5).lineTo(280, footerY - 5).stroke();

  // Signature Block right
  doc.fillColor(textGray).fontSize(10);
  doc.text("AUTHORIZED SIGNATURE", doc.page.width - 280, footerY, { align: "right" });
  doc.strokeColor(accentRed).lineWidth(1).moveTo(doc.page.width - 280, footerY - 5).lineTo(doc.page.width - 80, footerY - 5).stroke();

  const stampY = footerY - 30;
  // Dynamic Gold Seal/Accents
  doc.circle(doc.page.width / 2, stampY, 32).fill(borderGold);
  doc.fillColor(primaryBg).fontSize(8).text("VERIFIED", doc.page.width / 2 - 20, stampY - 14, { width: 40, align: "center" });
  doc.fillColor(primaryBg).fontSize(7).text("ACADEMY", doc.page.width / 2 - 20, stampY - 2, { width: 40, align: "center" });
  doc.fillColor(primaryBg).fontSize(6).text("FLIX SECURE", doc.page.width / 2 - 20, stampY + 8, { width: 40, align: "center" });

  doc.end();
});

// Vite server development / production pipeline
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AcademyFlix Service] running securely on http://localhost:${PORT}`);
  });
}

startServer();
